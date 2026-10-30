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


_WORD_NUMS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
              "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15, "first": 1, "second": 2, "third": 3,
              "fourth": 4, "fifth": 5, "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9, "tenth": 10}
_ROMAN = {"i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5, "vi": 6, "vii": 7, "viii": 8, "ix": 9, "x": 10, "xi": 11, "xii": 12}
_SECTION_WORDS = "lesson|chapter|unit|module|section|topic|part|prose|poem|supplementary"


def _requested_section(query: str):
    """'explain lesson 2' -> ('lesson', 2); None when the question does not name a section."""
    m = re.search(rf"\b({_SECTION_WORDS})\s*(?:no\.?|number|#)?\s*[-:.]?\s*(\d+|[ivx]+|{'|'.join(_WORD_NUMS)})\b", query, re.IGNORECASE)
    if not m:
        m = re.search(rf"\b(\d+|{'|'.join(k for k in _WORD_NUMS if k.endswith(('st', 'nd', 'rd', 'th')))})\s+({_SECTION_WORDS})\b", query, re.IGNORECASE)
        if not m:
            return None
        num_raw, kind = m.group(1), m.group(2)
    else:
        kind, num_raw = m.group(1), m.group(2)
    low = num_raw.lower()
    num = int(low) if low.isdigit() else _WORD_NUMS.get(low) or _ROMAN.get(low)
    return (kind.lower(), num) if num else None


def _heading_pattern(kind: str, num: int):
    roman = next((k for k, v in _ROMAN.items() if v == num), None)
    alts = [str(num), f"0{num}" if num < 10 else str(num)] + ([roman] if roman else [])
    return re.compile(rf"(?im)^\s*{kind}\s*[-:.]?\s*(?:{'|'.join(alts)})\b")


def _section_page_range(chunks: List[Dict[str, Any]], kind: str, num: int):
    """Page span of 'kind num' (from its heading to the next numbered heading of the same kind)."""
    def page_of(c):
        m = c.get("metadata", {})
        return int(m.get("page") or m.get("page_number") or 0)

    ordered = sorted(chunks, key=page_of)
    kinds = [kind] + [k for k in _SECTION_WORDS.split("|") if k != kind]
    for k in kinds:
        pat, nxt = _heading_pattern(k, num), _heading_pattern(k, num + 1)
        start = next((page_of(c) for c in ordered if pat.search(c.get("content", "")) or pat.search(str(c.get("metadata", {}).get("chapter", "")))), None)
        if start is None:
            continue
        end = next((page_of(c) - 1 for c in ordered if page_of(c) > start and nxt.search(c.get("content", ""))), None)
        return (start, end if end and end >= start else start + 40)
    return None


_QUERY_STOP = set('the a an and or but if of to in on at for with by from as is are was were be it this that these those what which who whom how why when where do does did can could should would will about me my tell explain give please lesson chapter unit section'.split())


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


        # A question naming a lesson/chapter/unit is answered from that part of the book only.
        all_chunks = self._get_corpus_chunks(textbook_id)
        page_range = None
        wanted = _requested_section(query_clean)
        if wanted and all_chunks:
            page_range = _section_page_range(all_chunks, wanted[0], wanted[1])

        def in_range(item):
            if not page_range:
                return True
            meta = item.get('metadata', {})
            pg = int(meta.get('page') or meta.get('page_number') or 0)
            return page_range[0] <= pg <= page_range[1]

        # ── 1. Dense Semantic Vector Search ──────────────────────────────
        dense_results = chroma_store.query_similar_context(
            query=query_clean,
            textbook_id=textbook_id,
            n_results=max(10, target_top_k * 2) * (4 if page_range else 1)
        )
        dense_results = [d for d in dense_results if in_range(d)]

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
        all_chunks = [c for c in all_chunks if in_range(c)]
        sparse_ranked_ids: List[str] = []

        if all_chunks:
            tokenized_corpus = [_tokenize(c["content"]) for c in all_chunks]
            tokenized_query = [t for t in _tokenize(query_clean) if t not in _QUERY_STOP] or _tokenize(query_clean)

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

        for cid in sorted_ids:
            if len(results) >= top_k:
                break
            data = chunk_map[cid]
            relevant = (data.get('bm25_score') or 0) > 0 or (data.get('cosine_similarity') or 0) >= self.similarity_threshold or bool(page_range)
            if not relevant:
                continue
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
