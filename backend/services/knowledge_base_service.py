"""
Knowledge Base Service for AARVA / Document Intelligence.

Orchestrates:
1. Document Parsing (PDF, DOCX, XLSX, TXT) via PyMuPDF / python-docx / openpyxl
2. Semantic & Boundary-aware Chunking with structured metadata
3. ChromaDB Vector Embedding & Ingestion
4. Initial Summary & Knowledge Graph Extraction
5. Session & Document tracking in relational database
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from services.document_parser import parse_document, ParseResult
from services.chunking_service import chunking_service, DocumentChunk
from database.chroma import chroma_store
from models.models import Textbook, User


class KnowledgeBaseService:
    def ingest_document(
        self,
        file_bytes: bytes,
        filename: str,
        user_id: int,
        title: Optional[str] = None,
        author: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Full ingestion pipeline: Parse -> Chunk -> Embed into ChromaDB -> Record in DB.
        """
        # 1. Parse Document
        parse_result: ParseResult = parse_document(file_bytes, filename)
        doc_title = title.strip() if title else filename.rsplit(".", 1)[0].replace("_", " ").title()
        doc_author = author.strip() if author else "Document Author"

        # 2. Chunk text with metadata
        chunks: List[DocumentChunk] = chunking_service.chunk_parsed_result(
            parse_result=parse_result,
            file_name=filename
        )

        # 3. Create or update Database Record
        size_mb = f"{max(0.1, round(len(file_bytes) / (1024 * 1024), 2))} MB"
        
        # Build initial summary from parsed chapters/sheets
        initial_summary = self._generate_initial_summary(parse_result, doc_title, chunks)

        new_doc = None
        if db:
            new_doc = Textbook(
                user_id=user_id,
                title=doc_title,
                author=doc_author,
                file_name=filename,
                file_size=size_mb,
                total_pages=parse_result.page_count,
                status="processed",
                summary_data=initial_summary
            )
            db.add(new_doc)
            db.commit()
            db.refresh(new_doc)
            doc_id = new_doc.id
        else:
            doc_id = int(datetime.utcnow().timestamp())

        # 4. Embed into ChromaDB
        chunk_dicts = [c.to_dict() for c in chunks]
        indexed_count = chroma_store.add_textbook_chunks(
            textbook_id=doc_id,
            book_title=doc_title,
            chunks=chunk_dicts,
            file_name=filename,
            file_type=parse_result.file_type
        )

        return {
            "success": True,
            "document_id": doc_id,
            "title": doc_title,
            "author": doc_author,
            "file_name": filename,
            "file_type": parse_result.file_type,
            "file_size": size_mb,
            "total_pages": parse_result.page_count,
            "total_chunks": len(chunks),
            "indexed_chunks": indexed_count,
            "word_count": parse_result.word_count,
            "warnings": parse_result.parse_warnings,
            "summary": initial_summary
        }

    def _generate_initial_summary(
        self,
        parse_result: ParseResult,
        title: str,
        chunks: List[DocumentChunk]
    ) -> Dict[str, Any]:
        """Generates an initial structured knowledge summary from document chunks."""
        sections = []
        for p in parse_result.pages[:10]: # First 10 sections/pages
            snippet = p.text[:220].strip().replace("\n", " ") + "..."
            sections.append({
                "page": p.page_number,
                "title": p.chapter,
                "summary": snippet
            })

        # Key points extraction from first few chunks
        sample_texts = [c.text for c in chunks[:5]]
        key_points = [
            f"Parsed content from {parse_result.page_count} pages/sheets across {len(chunks)} contextual chunks.",
            f"Primary topics covered: {', '.join([p.chapter for p in parse_result.pages[:4]])}.",
            "Indexed into ChromaDB with vector embeddings and BM25 lexical keywords for hybrid search."
        ]

        return {
            "complete_summary": (
                f"Knowledge document '{title}' ({parse_result.file_type.upper()}). "
                f"Comprises {parse_result.page_count} pages/sheets and {parse_result.word_count} words. "
                "Indexed for conversational querying, concept exploration, and targeted hybrid retrieval."
            ),
            "chapters": sections,
            "key_points": key_points,
            "definitions": [
                {"term": "Knowledge Source", "definition": f"Verified document '{title}' ingested into vector store."},
                {"term": "Retrieval Precision", "definition": "BM25 keyword matching fused with ChromaDB dense semantic vectors."}
            ]
        }


knowledge_base_service = KnowledgeBaseService()
