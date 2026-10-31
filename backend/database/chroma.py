import os
import sys
import unittest.mock
import uuid
import requests
from typing import List, Dict, Any

# Bypass Windows Application Control policy blocking cygrpc C-extension DLL
os.environ["ANONYMIZED_TELEMETRY"] = "False"
if "opentelemetry.exporter.otlp.proto.grpc.trace_exporter" not in sys.modules:
    sys.modules["opentelemetry.exporter.otlp.proto.grpc.trace_exporter"] = unittest.mock.MagicMock()

from chromadb.api.types import EmbeddingFunction, Documents, Embeddings
from config import settings

class OllamaBgeEmbeddingFunction(EmbeddingFunction[Documents]):
    """Uses locally running Ollama with configured embedding model (e.g. bge-large:latest or nomic-embed-text)."""
    def __init__(self, model_name: str = None, base_url: str = None):
        super().__init__()
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self.base_url = base_url or settings.OLLAMA_BASE_URL
        self._down_until = 0.0  # circuit breaker: skip the embedding server briefly after a failure

    def name(self) -> str:
        return f"ollama_{self.model_name.replace(':', '_').replace('-', '_')}"

    def __call__(self, input: Documents) -> Embeddings:
        embeddings: Embeddings = []
        import time as _time
        for text in input:
            if _time.time() < self._down_until:
                embeddings.append([0.0] * settings.EMBEDDING_DIMENSION)
                continue
            emb = None
            # A slow answer is not a dead server: a busy GPU can take 10+ s. Retry slow calls instead of storing an
            # all-zero vector (which makes that passage invisible to meaning-based search). Only a refused
            # connection (server not running) trips the 60 s breaker.
            for attempt in range(3):
                try:
                    # /api/embed truncates text that is longer than the model's window (bge-large: 512 tokens).
                    # The older /api/embeddings rejects it with HTTP 500, which used to leave ~16% of a textbook's
                    # passages with an all-zero vector, invisible to meaning-based search.
                    res = requests.post(
                        f"{self.base_url}/api/embed",
                        json={"model": self.model_name, "input": text, "truncate": True},
                        timeout=60.0
                    )
                    if res.status_code == 200:
                        vecs = res.json().get("embeddings") or []
                        emb = vecs[0] if vecs and vecs[0] else None
                    elif res.status_code == 404:
                        # Ollama older than /api/embed: use the old endpoint with a conservative cut
                        res = requests.post(
                            f"{self.base_url}/api/embeddings",
                            json={"model": self.model_name, "prompt": text[:1200]},
                            timeout=60.0
                        )
                        if res.status_code == 200:
                            emb = res.json().get("embedding", []) or None
                    if emb:
                        break
                except requests.exceptions.ConnectionError as e:
                    self._down_until = _time.time() + 60
                    print(f"[EMBEDDING] Warning: embedding server unavailable ({type(e).__name__}); skipping it for 60s")
                    break
                except Exception as e:
                    print(f"[EMBEDDING] Slow or failed embedding (attempt {attempt + 1}/3): {type(e).__name__}")
                    _time.sleep(1)
            embeddings.append(emb if emb else [0.0] * settings.EMBEDDING_DIMENSION)
        return embeddings


class ChromaStore:
    def __init__(self, persist_dir: str = None):
        self.persist_dir = persist_dir or settings.CHROMA_PERSIST_DIR
        self.client = None
        self.collection = None
        self.emb_fn = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            self.client = chromadb.PersistentClient(path=self.persist_dir)
            emb_fn = OllamaBgeEmbeddingFunction(
                model_name=settings.EMBEDDING_MODEL,
                base_url=settings.OLLAMA_BASE_URL
            )
            self.emb_fn = emb_fn
            # Configure collection with distance metric (e.g. cosine)
            metadata = {
                "description": "Textbook and Tender chunks for hybrid semantic search",
                "hnsw:space": settings.CHROMA_DISTANCE_FUNCTION
            }
            self.collection = self.client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                embedding_function=emb_fn,
                metadata=metadata
            )

        except Exception as e:
            try:
                # Fallback to default without explicit embedding function
                self.collection = self.client.get_or_create_collection(name="aarva_knowledge_base")
            except Exception as e2:
                print(f"Notice: ChromaDB running in fallback mode: {e2}")
                self.client = None
                self.collection = None



    def add_textbook_chunks(self, textbook_id: int, book_title: str, chunks: List[Dict[str, Any]], file_name: str = None, file_type: str = "pdf"):
        """
        Store text chunks with rich metadata into ChromaDB.
        chunks is a list of {'id'/'chunk_id', 'text', 'page'/'page_number', 'sheet_name', 'chapter'}
        """
        if not chunks:
            return 0

        if self.collection:
            ids = [
                str(c.get("chunk_id") or c.get("id") or f"book_{textbook_id}_chunk_{i}_{uuid.uuid4().hex[:6]}")
                for i, c in enumerate(chunks)
            ]
            documents = [c.get("text", "") for c in chunks]
            metadatas = [
                {
                    "textbook_id": textbook_id,
                    "title": book_title,
                    "file_name": file_name or c.get("file_name") or book_title,
                    "file_type": file_type or c.get("file_type") or "pdf",
                    "page": int(c.get("page") or c.get("page_number") or 1),
                    "sheet_name": str(c.get("sheet_name") or ""),
                    "chapter": str(c.get("chapter") or "General")
                }
                for c in chunks
            ]
            
            # Chroma limits batch additions to 5461 elements, add in safe chunks
            batch_size = 200
            for i in range(0, len(ids), batch_size):
                self.collection.add(
                    ids=ids[i:i + batch_size],
                    documents=documents[i:i + batch_size],
                    metadatas=metadatas[i:i + batch_size]
                )
            return len(chunks)
        return len(chunks)

    def query_similar_context(self, query: str, textbook_id: int = None, n_results: int = 3) -> List[Dict[str, Any]]:
        """
        Query textbook embeddings for semantic context.
        """
        if self.collection:
            where_filter = {"textbook_id": textbook_id} if textbook_id else None
            try:
                query_vec = None
                if self.emb_fn is not None:
                    query_vec = self.emb_fn([query])[0]
                    if not any(query_vec):
                        return []  # embedding server unavailable: let keyword (BM25) search answer instead
                results = self.collection.query(
                    **({"query_embeddings": [query_vec]} if query_vec is not None else {"query_texts": [query]}),
                    n_results=min(n_results, max(1, self.collection.count() or 1)),
                    where=where_filter
                )
                formatted = []
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    metas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []
                    ids = results.get("ids", [[]])[0] if results.get("ids") else []
                    dists = results.get("distances", [[]])[0] if results.get("distances") else []

                    for i, doc in enumerate(docs):
                        meta = metas[i] if i < len(metas) else {}
                        cid = ids[i] if i < len(ids) else f"chunk_{i}"
                        dist = dists[i] if i < len(dists) else 0.5
                        formatted.append({
                            "id": cid,
                            "content": doc,
                            "metadata": meta,
                            "distance": dist
                        })
                return formatted
            except Exception as e:
                print(f"[CHROMA] Query exception: {e}")

        # Never invent context: no results means the tutor must say it could not find the answer.
        return []

    def repair_zero_vectors(self, textbook_id: int) -> int:
        """Re-embed passages whose vector is all zeros (the embedding server was unreachable when they were indexed)."""
        if not self.collection or self.emb_fn is None:
            return 0
        got = self.collection.get(where={"textbook_id": textbook_id}, include=["documents", "embeddings"])
        ids, docs, vecs = got.get("ids", []), got.get("documents", []), got.get("embeddings")
        if vecs is None or len(ids) == 0:
            return 0
        fixed = 0
        for cid, doc, vec in zip(ids, docs, vecs):
            if any(vec):
                continue
            new = self.emb_fn([doc])[0]
            if any(new):
                self.collection.update(ids=[cid], embeddings=[new])
                fixed += 1
        return fixed

    def delete_textbook_chunks(self, textbook_id: int):
        """Delete all chunks belonging to a specific textbook."""
        if self.collection:
            try:
                self.collection.delete(where={"textbook_id": textbook_id})
            except Exception as e:
                print(f"[CHROMA] Delete exception: {e}")


chroma_store = ChromaStore()
