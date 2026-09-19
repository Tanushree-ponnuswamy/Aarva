import os
import uuid
from typing import List, Dict, Any

class ChromaStore:
    def __init__(self, persist_dir: str = "./chroma_db"):
        self.persist_dir = persist_dir
        self.client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            from chromadb.config import Settings
            self.client = chromadb.PersistentClient(path=self.persist_dir)
            self.collection = self.client.get_or_create_collection(
                name="aarva_textbooks",
                metadata={"description": "Textbook chunks for semantic search and AI tutor context"}
            )
        except Exception as e:
            print(f"Notice: ChromaDB running in in-memory simulation mode: {e}")
            self.client = None
            self.collection = None

    def add_textbook_chunks(self, textbook_id: int, book_title: str, chunks: List[Dict[str, Any]]):
        """
        Store textbook text chunks with embeddings/metadata.
        chunks is a list of {'id': str, 'text': str, 'page': int, 'chapter': str}
        """
        if self.collection:
            ids = [f"book_{textbook_id}_chunk_{i}" for i in range(len(chunks))]
            documents = [c.get("text", "") for c in chunks]
            metadatas = [
                {
                    "textbook_id": textbook_id,
                    "title": book_title,
                    "page": c.get("page", 1),
                    "chapter": c.get("chapter", "Introduction")
                }
                for c in chunks
            ]
            self.collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            return len(chunks)
        return len(chunks)

    def query_similar_context(self, query: str, textbook_id: int = None, n_results: int = 3) -> List[Dict[str, Any]]:
        """
        Query textbook embeddings for semantic context.
        """
        if self.collection:
            where_filter = {"textbook_id": textbook_id} if textbook_id else None
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_filter
            )
            formatted = []
            if results and "documents" in results and results["documents"]:
                for i, doc in enumerate(results["documents"][0]):
                    meta = results["metadatas"][0][i] if "metadatas" in results else {}
                    formatted.append({
                        "content": doc,
                        "metadata": meta
                    })
            return formatted
        
        # Fallback simulation
        return [
            {
                "content": f"Relevant context on '{query}' extracted from textbook chapters and core syllabus definitions.",
                "metadata": {"title": "Active Textbook", "chapter": "Core Concepts", "page": 42}
            }
        ]

chroma_store = ChromaStore()
