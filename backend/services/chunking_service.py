"""
Chunking & Metadata Service for AARVA / Knowledge Base.

Splits parsed documents (PDF, Word, Excel, Text) into overlapping semantic chunks
with rich metadata preservation (file_name, page_number, sheet_name, section, chunk_id).
"""

from typing import List, Dict, Any, Optional
import re
import uuid
from dataclasses import dataclass, asdict
from services.document_parser import ParseResult, PageChunk


from config import settings


@dataclass
class DocumentChunk:
    chunk_id: str
    text: str
    file_name: str
    file_type: str
    page_number: int
    sheet_name: Optional[str] = None
    chapter: Optional[str] = None
    chunk_index: int = 0
    char_count: int = 0
    word_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ChunkingService:
    def __init__(
        self,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
        min_chunk_size: Optional[int] = None
    ):
        self.chunk_size = chunk_size if chunk_size is not None else settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap if chunk_overlap is not None else settings.CHUNK_OVERLAP
        self.min_chunk_size = min_chunk_size if min_chunk_size is not None else settings.MIN_CHUNK_SIZE


    def chunk_parsed_result(
        self,
        parse_result: ParseResult,
        file_name: str,
        document_id: Optional[str] = None
    ) -> List[DocumentChunk]:
        """
        Takes a ParseResult and yields a list of DocumentChunks with structured metadata.
        """
        doc_prefix = document_id or str(uuid.uuid4())[:8]
        chunks: List[DocumentChunk] = []
        global_idx = 0

        for page in parse_result.pages:
            page_text = page.text.strip()
            if not page_text:
                continue

            sheet_name = None
            if parse_result.file_type == "excel" and page.chapter.startswith("Sheet: "):
                sheet_name = page.chapter.replace("Sheet: ", "").strip()

            page_chunks = self._split_text_into_chunks(page_text)

            for local_idx, chunk_text in enumerate(page_chunks):
                clean_chunk = chunk_text.strip()
                if len(clean_chunk) < self.min_chunk_size:
                    continue

                chunk_id = f"doc_{doc_prefix}_p{page.page_number}_c{local_idx}_{uuid.uuid4().hex[:6]}"
                words = len(clean_chunk.split())

                chunk_obj = DocumentChunk(
                    chunk_id=chunk_id,
                    text=clean_chunk,
                    file_name=file_name,
                    file_type=parse_result.file_type,
                    page_number=page.page_number,
                    sheet_name=sheet_name,
                    chapter=page.chapter,
                    chunk_index=global_idx,
                    char_count=len(clean_chunk),
                    word_count=words
                )
                chunks.append(chunk_obj)
                global_idx += 1

        return chunks

    def _split_text_into_chunks(self, text: str) -> List[str]:
        """
        Splits text into chunks preserving sentence and paragraph boundaries where possible.
        """
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [text]

        raw_chunks: List[str] = []
        current = ""

        for para in paragraphs:
            if len(para) > self.chunk_size:
                sub_parts = re.split(r'(?<=[.!?\n])\s+', para)
                for part in sub_parts:
                    if len(current) + len(part) + 1 <= self.chunk_size:
                        current = f"{current} {part}".strip()
                    else:
                        if current:
                            raw_chunks.append(current)
                        current = part
            else:
                if len(current) + len(para) + 2 <= self.chunk_size:
                    current = f"{current}\n\n{para}".strip()
                else:
                    if current:
                        raw_chunks.append(current)
                    current = para

        if current:
            raw_chunks.append(current)

        if self.chunk_overlap <= 0 or len(raw_chunks) <= 1:
            return raw_chunks

        overlapped_chunks: List[str] = []
        for i, c in enumerate(raw_chunks):
            if i == 0:
                overlapped_chunks.append(c)
            else:
                prev_text = raw_chunks[i - 1]
                overlap_text = prev_text[-self.chunk_overlap:] if len(prev_text) > self.chunk_overlap else prev_text
                space_idx = overlap_text.find(" ")
                if space_idx != -1:
                    overlap_text = overlap_text[space_idx + 1:]
                merged = f"...{overlap_text} {c}" if overlap_text else c
                overlapped_chunks.append(merged)

        return overlapped_chunks


chunking_service = ChunkingService()
