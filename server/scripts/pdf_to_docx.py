"""Convert PDF to editable DOCX — deduplicates overlapping text layers first."""
from __future__ import annotations

import os
import sys
import tempfile
from typing import Iterable

import fitz  # PyMuPDF
from pdf2docx import Converter


def _area(bbox: Iterable[float]) -> float:
    x0, y0, x1, y1 = bbox
    return max(0.0, x1 - x0) * max(0.0, y1 - y0)


def _overlap_ratio(a: tuple[float, float, float, float], b: tuple[float, float, float, float]) -> float:
    x0 = max(a[0], b[0])
    y0 = max(a[1], b[1])
    x1 = min(a[2], b[2])
    y1 = min(a[3], b[3])
    inter = _area((x0, y0, x1, y1))
    if inter <= 0:
        return 0.0
    smaller = min(_area(a), _area(b))
    return inter / smaller if smaller else 0.0


def _normalize_text(text: str) -> str:
    return " ".join(text.split()).strip().lower()


def _span_score(span: dict) -> tuple:
    text = span.get("text", "").strip()
    size = span.get("size", 0)
    flags = span.get("flags", 0)
    # Prefer visible, non-hidden, longer, larger text
    hidden = bool(flags & 2)  # TEXT_HIDDEN
    return (hidden, -len(text), -size)


def dedupe_overlapping_text(pdf_path: str, out_path: str, overlap_threshold: float = 0.55) -> int:
    """Remove duplicate/hidden overlapping text spans. Returns redaction count."""
    doc = fitz.open(pdf_path)
    total_redactions = 0

    for page in doc:
        raw = page.get_text("dict", flags=fitz.TEXTFLAGS_TEXT)
        spans: list[dict] = []
        for block in raw.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    text = span.get("text", "")
                    if not text.strip():
                        continue
                    spans.append(
                        {
                            "bbox": tuple(span["bbox"]),
                            "text": text,
                            "size": span.get("size", 0),
                            "flags": span.get("flags", 0),
                        }
                    )

        remove: set[int] = set()
        for i, s1 in enumerate(spans):
            if i in remove:
                continue
            t1 = _normalize_text(s1["text"])
            for j in range(i + 1, len(spans)):
                if j in remove:
                    continue
                s2 = spans[j]
                ratio = _overlap_ratio(s1["bbox"], s2["bbox"])
                if ratio < overlap_threshold:
                    continue
                t2 = _normalize_text(s2["text"])
                # Exact or near-duplicate text at same position
                if t1 and t2 and (t1 == t2 or t1 in t2 or t2 in t1):
                    worse = j if _span_score(s1) <= _span_score(s2) else i
                    remove.add(worse)
                    continue
                # Hidden text overlapping visible text
                h1 = bool(s1["flags"] & 2)
                h2 = bool(s2["flags"] & 2)
                if h1 ^ h2:
                    remove.add(i if h1 else j)

        for idx in sorted(remove, reverse=True):
            rect = fitz.Rect(spans[idx]["bbox"])
            # Slightly inflate to catch anti-aliased edges
            rect = rect + (-0.5, -0.5, 0.5, 0.5)
            page.add_redact_annot(rect, fill=(1, 1, 1))
            total_redactions += 1

        if remove:
            page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    doc.save(out_path, garbage=4, deflate=True)
    doc.close()
    return total_redactions


def convert_pdf_to_docx(pdf_path: str, docx_path: str) -> None:
    cleaned_path = pdf_path
    temp_pdf = None
    redactions = 0

    try:
        fd, temp_pdf = tempfile.mkstemp(suffix=".pdf")
        os.close(fd)
        redactions = dedupe_overlapping_text(pdf_path, temp_pdf)
        if redactions > 0:
            cleaned_path = temp_pdf
        print(f"REDACTIONS:{redactions}", file=sys.stderr)
    except Exception:
        cleaned_path = pdf_path
        print("REDACTIONS:0", file=sys.stderr)

    converter = Converter(cleaned_path)
    try:
        converter.convert(
            docx_path,
            start=0,
            end=None,
            ocr=0,  # ignore hidden OCR layers (prevents double text)
            line_overlap_threshold=0.85,
            line_separate_threshold=3.0,
        )
    finally:
        converter.close()

    if temp_pdf and os.path.isfile(temp_pdf):
        os.remove(temp_pdf)


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: pdf_to_docx.py <input.pdf> <output.docx>", file=sys.stderr)
        sys.exit(1)

    pdf_path, docx_path = sys.argv[1], sys.argv[2]
    if not os.path.isfile(pdf_path):
        print(f"Input not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    convert_pdf_to_docx(pdf_path, docx_path)


if __name__ == "__main__":
    main()
