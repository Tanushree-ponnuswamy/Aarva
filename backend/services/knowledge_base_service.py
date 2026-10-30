"""
Knowledge Base Service for AARVA / Document Intelligence.

Orchestrates:
1. Document Parsing (PDF, DOCX, XLSX, TXT) via PyMuPDF / python-docx / openpyxl
2. Semantic & Boundary-aware Chunking with structured metadata
3. ChromaDB Vector Embedding & Ingestion
4. Initial Summary & Knowledge Graph Extraction
5. Session & Document tracking in relational database
"""

import re
from typing import Callable, Dict, Any, List, Optional
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


class UploadCancelled(Exception):
    """Raised when the user chose to delete a book while it was still being processed."""


_index_locks: Dict[int, Any] = {}


class KnowledgeBaseService:
    def ensure_indexed(self, book_id: int, db: Session) -> bool:
        """Rebuild a book's search index from its stored file if the vector store lost it (restart, redeploy, new disk)."""
        import threading
        from pathlib import Path
        coll = chroma_store.collection
        if coll is None:
            return False
        def has_vectors() -> bool:
            got = coll.get(where={"textbook_id": book_id}, limit=1, include=[])
            return bool(got and got.get("ids"))
        try:
            if has_vectors():
                return True
        except Exception:
            return False
        lock = _index_locks.setdefault(book_id, threading.Lock())
        with lock:
            if has_vectors():
                return True
            book = db.query(Textbook).filter(Textbook.id == book_id).first()
            if book is None or book.status != "processed":
                return False
            data = book.file_data
            if not data:
                disk = next(iter((Path(__file__).resolve().parent.parent / "uploads").glob(f"{book_id}_*")), None)
                data = disk.read_bytes() if disk else None
            if not data:
                return False
            _safe_print(f"[REINDEX] Rebuilding the search index for book {book_id} from its stored file")
            pr = parse_document(data, book.file_name)
            chunks = chunking_service.chunk_parsed_result(parse_result=pr, file_name=book.file_name)
            chroma_store.add_textbook_chunks(
                textbook_id=book_id, book_title=book.title, chunks=[c.to_dict() for c in chunks],
                file_name=book.file_name, file_type=pr.file_type,
            )
            return True

    def ingest_document(
        self,
        file_bytes: bytes,
        filename: str,
        user_id: int,
        title: Optional[str] = None,
        author: Optional[str] = None,
        db: Optional[Session] = None,
        should_cancel: Optional[Callable[[], bool]] = None,
        existing_id: Optional[int] = None
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

        def check_cancel():
            if should_cancel and should_cancel():
                raise UploadCancelled()

        check_cancel()

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

        check_cancel()

        # 3. Create or update Database Record
        size_mb = f"{max(0.1, round(len(file_bytes) / (1024 * 1024), 2))} MB"
        
        # Build initial summary from parsed chapters/sheets
        initial_summary = self._generate_initial_summary(parse_result, doc_title, chunks)
        check_cancel()

        def discard_record(doc_id_to_drop: int):
            """Remove the book row if it still exists (the user may already have deleted it)."""
            if not db:
                return
            try:
                db.rollback()
                row = db.get(Textbook, doc_id_to_drop)
                if row is not None:
                    db.delete(row)
                    db.commit()
            except Exception:
                db.rollback()

        new_doc = None
        if db and existing_id:
            new_doc = db.get(Textbook, existing_id)
            if new_doc is None:
                raise UploadCancelled()  # deleted while processing
            new_doc.total_pages = parse_result.page_count
            new_doc.file_size = size_mb
            new_doc.summary_data = initial_summary
            db.commit()
            doc_id = existing_id
        elif db:
            new_doc = Textbook(
                user_id=user_id,
                title=doc_title,
                author=doc_author,
                file_name=filename,
                file_size=size_mb,
                total_pages=parse_result.page_count,
                status="processing",  # hidden from the library until embedding finishes
                summary_data=initial_summary
            )
            db.add(new_doc)
            db.commit()
            db.refresh(new_doc)
            doc_id = new_doc.id
        else:
            doc_id = int(datetime.utcnow().timestamp())

        # 4. Embed into ChromaDB & BM25
        try:
            check_cancel()
        except UploadCancelled:
            discard_record(doc_id)
            raise
        _safe_print(f"\n⚡ [CHROMADB VECTOR EMBEDDING] Embedding {len(chunks)} chunks into ChromaDB...")
        chunk_dicts = [c.to_dict() for c in chunks]
        indexed_count = chroma_store.add_textbook_chunks(
            textbook_id=doc_id,
            book_title=doc_title,
            chunks=chunk_dicts,
            file_name=filename,
            file_type=parse_result.file_type
        )
        try:
            check_cancel()
        except UploadCancelled:
            chroma_store.delete_textbook_chunks(textbook_id=doc_id)
            discard_record(doc_id)
            raise
        if db and new_doc is not None:
            new_doc.status = "processed"
            db.commit()
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
            "summary": initial_summary,
            "_parse_result": parse_result,  # consumed by the background summariser; not sent to clients
        }

    def _extract_page_snippet(self, pages: list, start_p: int, end_p: int, fallback_title: str) -> str:
        """Extract a meaningful 2-3 sentence overview snippet from a range of pages, skipping boilerplate."""
        def is_bp(line: str) -> bool:
            l = line.lower().strip()
            bp = [
                "government of", "free textbook programme", "department of school education",
                "untouchability is", "not for sale", "first edition", "revised edition",
                "reprint", "published by", "printed by", "scert", "all rights reserved",
                "isbn", ".indd", "typeset", "content creation", "printing & publishing"
            ]
            return any(b in l for b in bp)

        collected = []
        for p in range(start_p, min(end_p + 1, start_p + 4)):
            if 1 <= p <= len(pages):
                for line in pages[p - 1].text.split("\n"):
                    cl = line.strip()
                    if len(cl) > 25 and not is_bp(cl) and not any(cl.startswith(x) for x in ['#', '*', '-', '•']):
                        collected.append(cl)
                        if len(collected) >= 3:
                            break
            if len(collected) >= 3:
                break
        if collected:
            s = " ".join(collected)
            return s[:260] + "..." if len(s) > 260 else s
        return f"Core curriculum concepts, analysis, and practice exercises for {fallback_title}."

    _FRONT_MATTER = re.compile(
        r"^\s*(first page|front ?matter|cover|title page|copyright|preface|foreword|acknowledg|about (this|the) book|how to use|"
        r"contents?|table of contents|introduction (&|and) front matter|index|bibliography|references)\b", re.IGNORECASE)

    def _is_front_matter(self, title: str) -> bool:
        return bool(self._FRONT_MATTER.match(title or ""))

    def _content_start_page(self, pages: list) -> int:
        """First page that looks like real lesson text (skips cover, copyright, preface, contents)."""
        boiler = ("all rights reserved", "first edition", "not for sale", "isbn", "printed by", "published by", "government of")
        for p in pages:
            t = (p.text or "").lower()
            if len(t.split()) >= 120 and not any(b in t for b in boiler) and "table of contents" not in t[:200] and not t.lstrip().startswith("contents"):
                return p.page_number
        return 1

    def _build_document_sections(self, parse_result: ParseResult, title: str) -> List[Dict[str, Any]]:
        sections = self._build_raw_sections(parse_result, title)
        # Lessons only: drop front matter, then number what is left from 1.
        kept = [s for s in sections if not self._is_front_matter(s.get("title", ""))]
        if kept and len(kept) != len(sections):
            sections = kept
        for idx, s in enumerate(sections):
            s["chapter"] = idx + 1
        return sections

    def _build_raw_sections(self, parse_result: ParseResult, title: str) -> List[Dict[str, Any]]:
        """Extract structured chapters and sections across the entire document (1 to total_pages)."""
        sections: List[Dict[str, Any]] = []
        pages = parse_result.pages or []
        total_p = parse_result.page_count or len(pages)
        if not pages or total_p == 0:
            return sections

        # 1. Check for embedded Table of Contents (TOC)
        toc = getattr(parse_result, "toc", [])
        if toc:
            # Prefer the top level of the outline (the lessons) over every sub-heading.
            top = min(e.get("level", 1) for e in toc)
            top_entries = [e for e in toc if e.get("level", 1) == top]
            if 3 <= len(top_entries) <= 80:
                toc = top_entries
        if toc:
            for idx, entry in enumerate(toc):
                start_p = entry["page"]
                end_p = toc[idx + 1]["page"] - 1 if idx + 1 < len(toc) else total_p
                snippet = self._extract_page_snippet(pages, start_p, end_p, entry["title"])
                sections.append({
                    "chapter": idx + 1,
                    "page": start_p,
                    "page_end": end_p,
                    "title": entry["title"],
                    "summary": snippet
                })
            if sections:
                return sections

        # 2. Check for distinct chapter headings detected on pages
        detected_chapters = []
        last_chap = None
        for p in pages:
            chap_name = p.chapter.strip() if p.chapter else ""
            if chap_name and not chap_name.lower().startswith("page ") and chap_name != "Unknown Chapter" and not self._is_front_matter(chap_name):
                if chap_name != last_chap:
                    detected_chapters.append((p.page_number, chap_name))
                    last_chap = chap_name

        if len(detected_chapters) >= 3:
            for idx, (p_num, c_name) in enumerate(detected_chapters):
                end_p = detected_chapters[idx + 1][0] - 1 if idx + 1 < len(detected_chapters) else total_p
                snippet = self._extract_page_snippet(pages, p_num, end_p, c_name)
                sections.append({
                    "chapter": idx + 1,
                    "page": p_num,
                    "page_end": end_p,
                    "title": c_name,
                    "summary": snippet
                })
            return sections

        # 3. Document has generic page titles: evenly partition across all pages
        if total_p <= 10:
            target_count = total_p
        elif total_p <= 40:
            target_count = 8
        else:
            target_count = min(15, max(8, total_p // 15))

        first_content = self._content_start_page(pages)
        span = max(1, total_p - first_content + 1)
        step = max(1, span // target_count)
        for idx in range(target_count):
            start_p = first_content + idx * step
            end_p = total_p if idx == target_count - 1 else min(total_p, first_content + (idx + 1) * step - 1)
            sec_title = f"Section {idx + 1} (Pages {start_p}–{end_p})"
            # Search for best substantive heading within range
            for p in range(start_p, min(end_p + 1, start_p + 3)):
                if 1 <= p <= len(pages):
                    first_line = pages[p - 1].text.strip().split("\n")[0].strip()
                    if 4 <= len(first_line) <= 60 and not first_line.endswith(('.', ':', ';')):
                        sec_title = first_line
                        break

            snippet = self._extract_page_snippet(pages, start_p, end_p, sec_title)
            sections.append({
                "chapter": idx + 1,
                "page": start_p,
                "page_end": end_p,
                "title": sec_title,
                "summary": snippet
            })

        return sections

    def _generate_initial_summary(
        self,
        parse_result: ParseResult,
        title: str,
        chunks: List[DocumentChunk]
    ) -> Dict[str, Any]:
        """Generates an initial structured knowledge summary using the AI service."""
        from services.llama_service import llama_service

        sections = self._build_document_sections(parse_result, title)

        # Quick, extractive first summary so the book is usable immediately; the deep summariser
        # (services/deep_summary.py) then reads every page with the LLM in the background and replaces it.
        lesson_text = parse_result.full_text
        if sections:
            a, b = sections[0]["page"], sections[-1].get("page_end", sections[-1]["page"])
            lesson_text = "\n\n".join((p.text or "") for p in parse_result.pages if a <= p.page_number <= b) or lesson_text
        initial = llama_service._rule_based_summary_extraction(lesson_text, title, sections)
        initial["summary_state"] = "running"
        initial["summary_progress"] = {"done": 0, "total": 0}
        return initial



knowledge_base_service = KnowledgeBaseService()
