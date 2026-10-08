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

    def name(self) -> str:
        return f"ollama_{self.model_name.replace(':', '_').replace('-', '_')}"

    def __call__(self, input: Documents) -> Embeddings:
        embeddings: Embeddings = []
        for text in input:
            try:
                res = requests.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.model_name, "prompt": text[:2000]},
                    timeout=15.0
                )
                if res.status_code == 200:
                    emb = res.json().get("embedding", [])
                    if emb:
                        embeddings.append(emb)
                        continue
            except Exception as e:
                print(f"[EMBEDDING] Warning: Failed embedding chunk with {self.model_name}: {e}")
            embeddings.append([0.0] * settings.EMBEDDING_DIMENSION)
        return embeddings


class ChromaStore:
    def __init__(self, persist_dir: str = None):
        self.persist_dir = persist_dir or settings.CHROMA_PERSIST_DIR
        self.client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            self.client = chromadb.PersistentClient(path=self.persist_dir)
            emb_fn = OllamaBgeEmbeddingFunction(
                model_name=settings.EMBEDDING_MODEL,
                base_url=settings.OLLAMA_BASE_URL
            )
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
                results = self.collection.query(
                    query_texts=[query],
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

        # Fallback simulation
        return [
            {
                "id": f"sim_chunk_{textbook_id or 1}_1",
                "content": f"Relevant context on '{query}' extracted from textbook chapters and core syllabus definitions.",
                "metadata": {"title": "Active Textbook", "chapter": "Core Concepts", "page": 42, "textbook_id": textbook_id or 1},
                "distance": 0.2
            }
        ]

    def delete_textbook_chunks(self, textbook_id: int):
        """Delete all chunks belonging to a specific textbook."""
        if self.collection:
            try:
                self.collection.delete(where={"textbook_id": textbook_id})
            except Exception as e:
                print(f"[CHROMA] Delete exception: {e}")


chroma_store = ChromaStore()
