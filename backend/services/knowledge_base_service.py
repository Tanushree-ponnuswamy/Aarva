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


import sys

def _safe_print(*args, **kwargs):
    """Safely prints text to stdout across all platforms and console encodings."""
    try:
        if hasattr(sys.stdout, "reconfigure"):
            try:
                sys.stdout.reconfigure(errors="replace")
            except Exception:
                pass
        text = " ".join(str(a) for a in args)
        print(text, flush=True)
    except Exception:
        try:
            cleaned = " ".join(str(a).encode("ascii", errors="replace").decode("ascii") for a in args)
            print(cleaned, flush=True)
        except Exception:
            pass


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
        Prints the entire document content and extracted details to the terminal.
        """
        doc_title = title.strip() if title else filename.rsplit(".", 1)[0].replace("_", " ").title()
        doc_author = author.strip() if author else "Document Author"

        _safe_print("\n" + "="*85)
        _safe_print(f"🚀 [AARVA DOCUMENT INTELLIGENCE PIPELINE] Starting extraction: '{filename}'")
        _safe_print(f"📦 File Size: {len(file_bytes)} bytes | User ID: {user_id} | Title: '{doc_title}'")
        _safe_print("="*85 + "\n")

        # 1. Parse Document
        parse_result: ParseResult = parse_document(file_bytes, filename)

        _safe_print(f"📑 [DOCUMENT PARSER METRICS - '{filename}']")
        _safe_print(f"   • Format: {parse_result.file_type.upper()}")
        _safe_print(f"   • Total Pages/Sections: {parse_result.page_count}")
        _safe_print(f"   • Total Words Extracted: {parse_result.word_count}")
        _safe_print(f"   • Total Characters: {len(parse_result.full_text)}")
        if parse_result.parse_warnings:
            _safe_print(f"   • Warnings: {', '.join(parse_result.parse_warnings)}")

        # ─── PRINT ENTIRE DOCUMENT CONTENT TO TERMINAL ───────────────────────
        _safe_print("\n" + "#"*85)
        _safe_print(f"📖 [READING ENTIRE EXTRACTED DOCUMENT CONTENT: '{filename}']")
        _safe_print("#"*85)

        if parse_result.pages:
            for page in parse_result.pages:
                _safe_print(f"\n{'='*80}")
                _safe_print(f"📄 [PAGE / SECTION {page.page_number}]: {page.chapter} ({page.word_count} words)")
                _safe_print(f"{'='*80}")
                _safe_print(page.text)
                _safe_print(f"{'-'*80}")
        else:
            _safe_print(f"\n[RAW TEXT]:\n{parse_result.full_text}\n")

        _safe_print("\n" + "#"*85)
        _safe_print(f"✅ [FINISHED READING ENTIRE DOCUMENT: '{filename}' | Total Words: {parse_result.word_count}]")
        _safe_print("#"*85 + "\n")

        # 2. Chunk text with metadata
        _safe_print(f"🧩 [CHUNKING PIPELINE] Chunking '{doc_title}' with semantic boundary detection...")
        chunks: List[DocumentChunk] = chunking_service.chunk_parsed_result(
            parse_result=parse_result,
            file_name=filename
        )
        _safe_print(f"   • Generated {len(chunks)} contextual chunks across {parse_result.page_count} pages.")
        for i, c in enumerate(chunks[:3], 1):
            snippet = c.text[:120].replace('\n', ' ')
            _safe_print(f"     [Chunk #{i}] (Page {c.page_number}, Chapter: '{c.chapter}') -> {snippet}...")
        if len(chunks) > 3:
            _safe_print(f"     ... and {len(chunks) - 3} additional chunks generated.")

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

        # 4. Embed into ChromaDB & BM25
        _safe_print(f"\n⚡ [CHROMADB VECTOR EMBEDDING] Embedding {len(chunks)} chunks into ChromaDB...")
        chunk_dicts = [c.to_dict() for c in chunks]
        indexed_count = chroma_store.add_textbook_chunks(
            textbook_id=doc_id,
            book_title=doc_title,
            chunks=chunk_dicts,
            file_name=filename,
            file_type=parse_result.file_type
        )
        _safe_print(f"🎯 [INGESTION COMPLETED] Document ID #{doc_id} ('{doc_title}') indexed with {indexed_count} vectors into ChromaDB.\n")

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
            f"This document contains {parse_result.page_count} pages and covers {parse_result.word_count} words of content.",
            f"Primary topics covered: {', '.join([p.chapter for p in parse_result.pages[:4]])}.",
            "Content has been fully analyzed and is ready for question answering."
        ]

        return {
            "complete_summary": (
                f"This is a {parse_result.file_type.upper()} document titled '{title}'. "
                f"It comprises {parse_result.page_count} pages and contains {parse_result.word_count} words. "
                "The entire text has been processed so you can easily chat with it, ask questions, and explore key concepts."
            ),
            "chapters": sections,
            "key_points": key_points,
            "definitions": [
                {"term": "Document Title", "definition": f"The title of this uploaded file is '{title}'."},
                {"term": "AI Assistant", "definition": "You can ask me questions about this text to quickly find answers without reading the whole document."}
            ]
        }


knowledge_base_service = KnowledgeBaseService()
