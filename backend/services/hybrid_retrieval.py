"""
Hybrid Retrieval Engine for AARVA / Knowledge Base.

Combines:
1. Dense Vector Search (ChromaDB cosine/distance embeddings)
2. Sparse Keyword Search (BM25 Okapi lexical matching)
3. Reciprocal Rank Fusion (RRF) to merge, rank, and score chunks.
"""

from typing import List, Dict, Any, Optional
import re
from rank_bm25 import BM25Okapi
from database.chroma import chroma_store


from config import settings


def _tokenize(text: str) -> List[str]:
    """Simple alphanumeric tokenizer for BM25 keyword matching."""
    return re.findall(r'\b\w+\b', text.lower())


class HybridRetrievalEngine:
    def __init__(
        self,
        rrf_k: Optional[int] = None,
        dense_weight: Optional[float] = None,
        sparse_weight: Optional[float] = None,
        similarity_threshold: Optional[float] = None
    ):
        self.rrf_k = rrf_k if rrf_k is not None else settings.RRF_K
        self.dense_weight = dense_weight if dense_weight is not None else settings.RRF_DENSE_WEIGHT
        self.sparse_weight = sparse_weight if sparse_weight is not None else settings.RRF_SPARSE_WEIGHT
        self.similarity_threshold = (
            similarity_threshold if similarity_threshold is not None
            else settings.COSINE_SIMILARITY_THRESHOLD
        )

    def retrieve(
        self,
        query: str,
        textbook_id: Optional[int] = None,
        top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Execute hybrid retrieval across vector store and BM25 index.
        Returns top_k enriched chunks with citation metadata, cosine similarity, and hybrid score.
        """
        target_top_k = top_k if top_k is not None else settings.RETRIEVAL_TOP_K
        query_clean = query.strip()
        if not query_clean:
            return []


        # ── 1. Dense Semantic Vector Search ──────────────────────────────
        dense_results = chroma_store.query_similar_context(
            query=query_clean,
            textbook_id=textbook_id,
            n_results=max(10, target_top_k * 2)
        )

        dense_ranked_ids: List[str] = []
        chunk_map: Dict[str, Dict[str, Any]] = {}

        for idx, item in enumerate(dense_results):
            cid = item.get("id") or item.get("metadata", {}).get("chunk_id") or f"dense_chunk_{idx}"
            dense_ranked_ids.append(cid)
            dist = float(item.get("distance", 0.3))
            cos_sim = round(max(0.0, min(1.0, 1.0 - dist)), 4)
            chunk_map[cid] = {
                "id": cid,
                "content": item.get("content", ""),
                "metadata": item.get("metadata", {}),
                "dense_rank": idx + 1,
                "distance": dist,
                "cosine_similarity": cos_sim
            }


        # ── 2. Sparse Lexical Search (BM25) ─────────────────────────────
        # Fetch corpus chunks from collection or active set
        all_chunks = self._get_corpus_chunks(textbook_id)
        sparse_ranked_ids: List[str] = []

        if all_chunks:
            tokenized_corpus = [_tokenize(c["content"]) for c in all_chunks]
            tokenized_query = _tokenize(query_clean)

            if tokenized_corpus and tokenized_query:
                try:
                    bm25 = BM25Okapi(tokenized_corpus)
                    scores = bm25.get_scores(tokenized_query)
                    ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)

                    for rank_idx, corpus_idx in enumerate(ranked_indices[:max(10, top_k * 2)]):
                        c = all_chunks[corpus_idx]
                        cid = c.get("id") or c.get("metadata", {}).get("chunk_id") or f"sparse_chunk_{corpus_idx}"
                        sparse_ranked_ids.append(cid)

                        if cid not in chunk_map:
                            chunk_map[cid] = {
                                "id": cid,
                                "content": c.get("content", ""),
                                "metadata": c.get("metadata", {}),
                                "dense_rank": None
                            }
                        chunk_map[cid]["sparse_rank"] = rank_idx + 1
                        chunk_map[cid]["bm25_score"] = float(scores[corpus_idx])
                except Exception as e:
                    print(f"[HYBRID] BM25 indexing error: {e}")

        # If BM25 didn't find extra documents, fallback to dense ranking
        if not sparse_ranked_ids:
            for idx, cid in enumerate(dense_ranked_ids):
                chunk_map[cid]["sparse_rank"] = idx + 1

        # ── 3. Reciprocal Rank Fusion (RRF) ─────────────────────────────
        rrf_scores: Dict[str, float] = {}

        for cid, data in chunk_map.items():
            dense_r = data.get("dense_rank")
            sparse_r = data.get("sparse_rank")

            score = 0.0
            if dense_r is not None:
                score += self.dense_weight * (1.0 / (self.rrf_k + dense_r))
            if sparse_r is not None:
                score += self.sparse_weight * (1.0 / (self.rrf_k + sparse_r))

            rrf_scores[cid] = score

        # Sort by RRF score descending
        sorted_ids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)

        # ── 4. Format and normalize top_k results ───────────────────────
        max_possible_score = (self.dense_weight + self.sparse_weight) / (self.rrf_k + 1)
        results: List[Dict[str, Any]] = []

        for cid in sorted_ids[:top_k]:
            data = chunk_map[cid]
            meta = data.get("metadata", {})
            raw_score = rrf_scores[cid]
            normalized_pct = min(100.0, max(15.0, (raw_score / max_possible_score) * 100.0))

            results.append({
                "chunk_id": cid,
                "content": data["content"],
                "metadata": {
                    "title": meta.get("title") or meta.get("file_name") or "Active Document",
                    "file_name": meta.get("file_name") or meta.get("title") or "Document",
                    "file_type": meta.get("file_type") or "pdf",
                    "page": meta.get("page") or meta.get("page_number") or 1,
                    "sheet_name": meta.get("sheet_name"),
                    "chapter": meta.get("chapter") or "General",
                    "textbook_id": meta.get("textbook_id")
                },
                "score": round(normalized_pct, 1),
                "dense_rank": data.get("dense_rank"),
                "sparse_rank": data.get("sparse_rank"),
                "retrieval_type": "hybrid_rrf"
            })

        return results

    def _get_corpus_chunks(self, textbook_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetch all chunks from ChromaDB for sparse BM25 indexing."""
        if not chroma_store.collection:
            return []

        try:
            where_filter = {"textbook_id": textbook_id} if textbook_id else None
            # Retrieve documents from Chroma
            data = chroma_store.collection.get(
                where=where_filter,
                include=["documents", "metadatas"]
            )
            chunks = []
            if data and "documents" in data and data["documents"]:
                for i, doc in enumerate(data["documents"]):
                    meta = data["metadatas"][i] if "metadatas" in data else {}
                    cid = data["ids"][i] if "ids" in data else f"chunk_{i}"
                    chunks.append({
                        "id": cid,
                        "content": doc,
                        "metadata": meta
                    })
            return chunks
        except Exception as e:
            print(f"[HYBRID] Error retrieving corpus from ChromaDB: {e}")
            return []


hybrid_retrieval_engine = HybridRetrievalEngine()
