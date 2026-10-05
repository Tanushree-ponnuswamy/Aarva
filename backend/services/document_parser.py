"""
Document Parser Service for AARVA.

Handles extraction of raw text from:
  - PDF   (.pdf)  — PyMuPDF (primary) + pdfplumber (fallback for scanned/columnar)
  - DOCX  (.docx) — python-docx (paragraphs + tables)
  - DOC   (.doc)  — mammoth (converts legacy Word to plain text)
  - TXT   (.txt, .md, .rst, .csv) — chardet-aware plain text read
  - Image (.png, .jpg, .jpeg, .bmp, .tiff, .webp) — EasyOCR (primary) + pytesseract (fallback)

Returns a structured ParseResult with:
  - full_text      : str           — complete extracted text
  - pages          : List[PageChunk] — per-page/section text with metadata
  - page_count     : int
  - file_type      : str
  - word_count     : int
  - parse_warnings : List[str]     — non-fatal issues (e.g. OCR confidence)
"""

from __future__ import annotations

import io
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

# ─── Data Structures ─────────────────────────────────────────────────────────

@dataclass
class PageChunk:
    """A single page or logical section of a parsed document."""
    page_number: int
    text: str
    chapter: str = "Unknown Chapter"
    word_count: int = 0

    def __post_init__(self):
        self.word_count = len(self.text.split())


@dataclass
class ParseResult:
    """Structured output from the document parser."""
    full_text: str
    pages: List[PageChunk]
    page_count: int
    file_type: str
    word_count: int
    parse_warnings: List[str] = field(default_factory=list)

    @property
    def is_empty(self) -> bool:
        return len(self.full_text.strip()) < 20


# ─── Helpers ─────────────────────────────────────────────────────────────────

SUPPORTED_TYPES = {
    "pdf":  [".pdf"],
    "docx": [".docx"],
    "doc":  [".doc"],
    "excel":[".xlsx", ".xls"],
    "text": [".txt", ".md", ".rst", ".csv", ".log"],
    "image":[".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp"],
}

def _detect_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    for ftype, exts in SUPPORTED_TYPES.items():
        if ext in exts:
            return ftype
    return "unknown"

def _clean_text(text: str) -> str:
    """Normalise whitespace and remove control characters."""
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def _guess_chapter(text: str, page_num: int) -> str:
    """Heuristically detect chapter headings from extracted text."""
    for line in text.split('\n')[:8]:
        line = line.strip()
        if re.match(r'^(chapter|ch\.?|unit|section|part)\s+\d+', line, re.IGNORECASE):
            return line[:80]
        if re.match(r'^\d+\.\s+[A-Z]', line) and len(line) < 100:
            return line[:80]
    return f"Page {page_num}"


# ─── PDF Parser ──────────────────────────────────────────────────────────────

def _parse_pdf(data: bytes, filename: str) -> ParseResult:
    warnings: List[str] = []
    pages: List[PageChunk] = []

    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=data, filetype="pdf")
        total = doc.page_count

        for i, page in enumerate(doc, start=1):
            raw = page.get_text("text")  # type: ignore[attr-defined]
            cleaned = _clean_text(raw)

            # Scanned page fallback — very little text extracted
            if len(cleaned.split()) < 15 and total <= 300:
                warnings.append(f"Page {i}: low text yield — may be scanned; consider image OCR.")

            pages.append(PageChunk(
                page_number=i,
                text=cleaned,
                chapter=_guess_chapter(cleaned, i),
            ))

        doc.close()

        # If primary extraction is poor, try pdfplumber on whole doc
        full = "\n\n".join(p.text for p in pages)
        if len(full.split()) < 100:
            warnings.append("PyMuPDF yield low — retrying with pdfplumber.")
            return _parse_pdf_plumber(data, filename, warnings)

        return ParseResult(
            full_text=full,
            pages=pages,
            page_count=total,
            file_type="pdf",
            word_count=len(full.split()),
            parse_warnings=warnings,
        )

    except ImportError:
        warnings.append("PyMuPDF not installed — falling back to pdfplumber.")
        return _parse_pdf_plumber(data, filename, warnings)
    except Exception as e:
        warnings.append(f"PyMuPDF error: {e} — falling back to pdfplumber.")
        return _parse_pdf_plumber(data, filename, warnings)


def _parse_pdf_plumber(data: bytes, filename: str, warnings: List[str]) -> ParseResult:
    try:
        import pdfplumber
        pages: List[PageChunk] = []

        with pdfplumber.open(io.BytesIO(data)) as pdf:
            total = len(pdf.pages)
            for i, page in enumerate(pdf.pages, start=1):
                raw = page.extract_text() or ""
                cleaned = _clean_text(raw)
                pages.append(PageChunk(
                    page_number=i,
                    text=cleaned,
                    chapter=_guess_chapter(cleaned, i),
                ))

        full = "\n\n".join(p.text for p in pages)
        return ParseResult(
            full_text=full,
            pages=pages,
            page_count=total,
            file_type="pdf",
            word_count=len(full.split()),
            parse_warnings=warnings,
        )
    except Exception as e:
        return _empty_result("pdf", f"pdfplumber also failed: {e}")


# ─── DOCX Parser ─────────────────────────────────────────────────────────────

def _parse_docx(data: bytes, filename: str) -> ParseResult:
    warnings: List[str] = []
    try:
        from docx import Document
        doc = Document(io.BytesIO(data))

        sections: List[str] = []
        pages: List[PageChunk] = []
        current_chapter = "Introduction"
        current_lines: List[str] = []
        page_num = 1

        for para in doc.paragraphs:
            style = (para.style.name or "").lower()
            text  = para.text.strip()
            if not text:
                continue

            # Detect headings as chapter boundaries
            if "heading" in style or re.match(r'^(Chapter|Section|Unit|Part)\s+\d+', text, re.IGNORECASE):
                if current_lines:
                    block = _clean_text("\n".join(current_lines))
                    pages.append(PageChunk(page_number=page_num, text=block, chapter=current_chapter))
                    sections.append(block)
                    page_num += 1
                    current_lines = []
                current_chapter = text[:80]
            else:
                current_lines.append(text)

        # Extract table text
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    current_lines.append(row_text)

        # Flush remaining
        if current_lines:
            block = _clean_text("\n".join(current_lines))
            pages.append(PageChunk(page_number=page_num, text=block, chapter=current_chapter))
            sections.append(block)

        full = "\n\n".join(sections)
        return ParseResult(
            full_text=full,
            pages=pages,
            page_count=len(pages),
            file_type="docx",
            word_count=len(full.split()),
            parse_warnings=warnings,
        )

    except ImportError:
        return _empty_result("docx", "python-docx not installed.")
    except Exception as e:
        return _empty_result("docx", f"DOCX parse error: {e}")


# ─── DOC Parser (legacy Word) ─────────────────────────────────────────────────

def _parse_doc(data: bytes, filename: str) -> ParseResult:
    """Uses mammoth to convert .doc → plain text."""
    warnings: List[str] = []
    try:
        import mammoth
        result = mammoth.extract_raw_text(io.BytesIO(data))
        raw = result.value or ""
        if result.messages:
            warnings += [str(m) for m in result.messages[:5]]

        cleaned = _clean_text(raw)
        # Split into pseudo-pages by double newlines (~300 words each)
        paragraphs = [p.strip() for p in cleaned.split('\n\n') if p.strip()]
        pages: List[PageChunk] = []
        WORDS_PER_PAGE = 300
        current_words: List[str] = []
        page_num = 1

        for para in paragraphs:
            current_words.extend(para.split())
            if len(current_words) >= WORDS_PER_PAGE:
                block = " ".join(current_words)
                pages.append(PageChunk(page_number=page_num, text=block, chapter=f"Section {page_num}"))
                current_words = []
                page_num += 1

        if current_words:
            pages.append(PageChunk(page_number=page_num, text=" ".join(current_words), chapter=f"Section {page_num}"))

        full = "\n\n".join(p.text for p in pages)
        return ParseResult(
            full_text=full,
            pages=pages,
            page_count=len(pages),
            file_type="doc",
            word_count=len(full.split()),
            parse_warnings=warnings,
        )

    except ImportError:
        return _empty_result("doc", "mammoth not installed.")
    except Exception as e:
        return _empty_result("doc", f"DOC parse error: {e}")


# ─── Plain Text Parser ────────────────────────────────────────────────────────

def _parse_text(data: bytes, filename: str) -> ParseResult:
    warnings: List[str] = []
    try:
        # Auto-detect encoding
        try:
            import chardet
            enc_result = chardet.detect(data)
            encoding = enc_result.get("encoding") or "utf-8"
            if (enc_result.get("confidence") or 0) < 0.7:
                warnings.append(f"Low encoding confidence ({enc_result.get('confidence'):.0%}); using {encoding}.")
        except ImportError:
            encoding = "utf-8"

        raw = data.decode(encoding, errors="replace")
        cleaned = _clean_text(raw)

        # Split into pseudo-pages of ~400 words
        words = cleaned.split()
        WORDS_PER_PAGE = 400
        pages: List[PageChunk] = []
        for i in range(0, len(words), WORDS_PER_PAGE):
            chunk_words = words[i: i + WORDS_PER_PAGE]
            block = " ".join(chunk_words)
            page_num = i // WORDS_PER_PAGE + 1
            pages.append(PageChunk(page_number=page_num, text=block, chapter=f"Section {page_num}"))

        if not pages:
            return _empty_result("text", "File appears empty.")

        full = "\n\n".join(p.text for p in pages)
        return ParseResult(
            full_text=full,
            pages=pages,
            page_count=len(pages),
            file_type="text",
            word_count=len(words),
            parse_warnings=warnings,
        )

    except Exception as e:
        return _empty_result("text", f"Text parse error: {e}")


# ─── Excel (.xlsx / .xls) Parser ─────────────────────────────────────────────

def _parse_excel(data: bytes, filename: str) -> ParseResult:
    """
    Parses Excel workbooks (.xlsx, .xls) using openpyxl.
    Each worksheet is treated as a distinct page/section chunk with sheet metadata,
    row/column tabular structure, and cell content formatting.
    """
    warnings: List[str] = []
    pages: List[PageChunk] = []

    try:
        import openpyxl

        wb = openpyxl.load_workbook(io.BytesIO(data), data_only=True)
        sheet_names = wb.sheetnames

        if not sheet_names:
            warnings.append("Excel workbook contains no sheets.")
            return _empty_result("excel", "Empty workbook with no sheets.")

        for idx, sheet_name in enumerate(sheet_names, start=1):
            sheet = wb[sheet_name]
            rows_data = []

            for row in sheet.iter_rows(values_only=True):
                # Filter out all-None rows
                non_empty_cells = [str(cell).strip() if cell is not None else "" for cell in row]
                if any(cell for cell in non_empty_cells):
                    rows_data.append(non_empty_cells)

            if not rows_data:
                continue

            # Format rows as markdown/structured text
            sheet_lines: List[str] = [f"=== Sheet: {sheet_name} (Page {idx}) ==="]
            
            # Check if first row is header
            headers = rows_data[0]
            if len(rows_data) > 1:
                header_str = " | ".join(h if h else f"Col{c_idx+1}" for c_idx, h in enumerate(headers))
                sheet_lines.append(f"Headers: {header_str}")
                sheet_lines.append("-" * min(80, max(20, len(header_str))))

                for r in rows_data[1:]:
                    row_pairs = []
                    for h, val in zip(headers, r):
                        if val:
                            col_name = h if h else "Column"
                            row_pairs.append(f"{col_name}: {val}")
                    if row_pairs:
                        sheet_lines.append(" | ".join(row_pairs))
            else:
                # Single row
                sheet_lines.append(" | ".join([c for c in headers if c]))

            sheet_text = "\n".join(sheet_lines)
            pages.append(
                PageChunk(
                    page_number=idx,
                    text=sheet_text,
                    chapter=f"Sheet: {sheet_name}",
                    word_count=len(sheet_text.split()),
                )
            )

        if not pages:
            return _empty_result("excel", "Excel workbook contains only blank cells.")

        full_text = "\n\n".join(p.text for p in pages)
        return ParseResult(
            full_text=full_text,
            pages=pages,
            page_count=len(pages),
            file_type="excel",
            word_count=len(full_text.split()),
            parse_warnings=warnings,
        )

    except ImportError:
        return _empty_result("excel", "openpyxl not installed — cannot process Excel files.")
    except Exception as e:
        return _empty_result("excel", f"Excel parse error: {e}")


# ─── Image OCR Parser ─────────────────────────────────────────────────────────

def _parse_image(data: bytes, filename: str) -> ParseResult:
    """
    Primary: EasyOCR (deep learning, no system deps, supports 80+ languages).
    Fallback: pytesseract (requires Tesseract-OCR binary installed on the system).
    """
    warnings: List[str] = []
    try:
        from PIL import Image
        import numpy as np

        img = Image.open(io.BytesIO(data))
        # Preprocess: convert to RGB, enhance contrast for better OCR accuracy
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        # Upscale small images for better OCR
        w, h = img.size
        if w < 800 or h < 800:
            scale = max(800 / w, 800 / h)
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)  # type: ignore[attr-defined]
            warnings.append(f"Image upscaled {scale:.1f}× for better OCR accuracy.")

        img_array = np.array(img)

        # ── Try EasyOCR first ────────────────────────────────────────────────
        try:
            import easyocr
            reader = easyocr.Reader(["en"], gpu=False, verbose=False)
            results = reader.readtext(img_array, detail=1, paragraph=True)
            lines = []
            for (_, text, confidence) in results:
                if confidence > 0.35:
                    lines.append(text.strip())
                elif confidence > 0.15:
                    lines.append(text.strip())
                    warnings.append(f"Low OCR confidence ({confidence:.0%}) on some text — results may be imperfect.")

            raw = " ".join(lines)

        except ImportError:
            warnings.append("EasyOCR not installed — falling back to pytesseract.")
            raw = _tesseract_ocr(img, warnings)

        except Exception as e:
            warnings.append(f"EasyOCR error: {e} — falling back to pytesseract.")
            raw = _tesseract_ocr(img, warnings)

        cleaned = _clean_text(raw)
        if not cleaned:
            return _empty_result("image", "OCR produced no text. Image may be blank or non-textual.")

        pages = [PageChunk(page_number=1, text=cleaned, chapter="Image OCR Content")]
        return ParseResult(
            full_text=cleaned,
            pages=pages,
            page_count=1,
            file_type="image",
            word_count=len(cleaned.split()),
            parse_warnings=warnings,
        )

    except ImportError:
        return _empty_result("image", "Pillow not installed — cannot process image files.")
    except Exception as e:
        return _empty_result("image", f"Image parse error: {e}")


def _tesseract_ocr(img, warnings: List[str]) -> str:
    try:
        import pytesseract
        config = "--oem 3 --psm 6"  # LSTM engine, assume uniform text block
        return pytesseract.image_to_string(img, config=config)
    except ImportError:
        warnings.append("pytesseract not installed — OCR unavailable.")
        return ""
    except Exception as e:
        warnings.append(f"pytesseract error: {e}")
        return ""


# ─── Empty / Error Result ────────────────────────────────────────────────────

def _empty_result(file_type: str, warning: str) -> ParseResult:
    return ParseResult(
        full_text="",
        pages=[],
        page_count=0,
        file_type=file_type,
        word_count=0,
        parse_warnings=[warning],
    )


# ─── Public API ──────────────────────────────────────────────────────────────

def parse_document(file_data: bytes, filename: str) -> ParseResult:
    """
    Main entry point. Auto-detects file type from extension and
    routes to the appropriate parser.

    Args:
        file_data : Raw bytes of the uploaded file.
        filename  : Original filename (used for extension detection).

    Returns:
        ParseResult with extracted text, per-page chunks, and metadata.

    Raises:
        ValueError if the file type is not supported.
    """
    file_type = _detect_file_type(filename)

    if file_type == "pdf":
        return _parse_pdf(file_data, filename)
    elif file_type == "docx":
        return _parse_docx(file_data, filename)
    elif file_type == "doc":
        return _parse_doc(file_data, filename)
    elif file_type == "excel":
        return _parse_excel(file_data, filename)
    elif file_type == "text":
        return _parse_text(file_data, filename)
    elif file_type == "image":
        return _parse_image(file_data, filename)
    else:
        ext = Path(filename).suffix.lower()
        supported = ", ".join(
            ext for exts in SUPPORTED_TYPES.values() for ext in exts
        )
        raise ValueError(
            f"Unsupported file type '{ext}'. "
            f"Supported formats: {supported}"
        )


def supported_extensions() -> List[str]:
    """Returns a flat list of all accepted file extensions."""
    return [ext for exts in SUPPORTED_TYPES.values() for ext in exts]
