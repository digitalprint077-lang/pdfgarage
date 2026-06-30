"""Convert DOCX to legacy .doc using LibreOffice or Microsoft Word (Windows)."""
import os
import subprocess
import sys


def find_soffice() -> str | None:
    if sys.platform == "win32":
        candidates = [
            os.environ.get("LIBRE_OFFICE_EXE", ""),
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        ]
    elif sys.platform == "darwin":
        candidates = ["/Applications/LibreOffice.app/Contents/MacOS/soffice"]
    else:
        candidates = [
            "/usr/bin/soffice",
            "/usr/bin/libreoffice",
            "/snap/bin/libreoffice",
        ]

    for path in candidates:
        if path and os.path.isfile(path):
            return path
    return None


def convert_with_soffice(docx_path: str, doc_path: str) -> bool:
    soffice = find_soffice()
    if not soffice:
        return False

    outdir = os.path.dirname(os.path.abspath(doc_path))
    os.makedirs(outdir, exist_ok=True)
    subprocess.run(
        [
            soffice,
            "--headless",
            "--convert-to",
            "doc",
            "--outdir",
            outdir,
            os.path.abspath(docx_path),
        ],
        check=True,
        capture_output=True,
        timeout=120,
    )

    expected = os.path.join(
        outdir, os.path.splitext(os.path.basename(docx_path))[0] + ".doc"
    )
    if os.path.isfile(expected):
        if os.path.abspath(expected) != os.path.abspath(doc_path):
            os.replace(expected, doc_path)
        return True
    return os.path.isfile(doc_path)


def convert_with_word(docx_path: str, doc_path: str) -> bool:
    if sys.platform != "win32":
        return False
    try:
        import win32com.client  # type: ignore
    except ImportError:
        return False

    word = None
    doc = None
    try:
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0
        doc = word.Documents.Open(os.path.abspath(docx_path), ReadOnly=True)
        doc.SaveAs2(os.path.abspath(doc_path), FileFormat=0)
        return os.path.isfile(doc_path)
    except Exception:
        return False
    finally:
        if doc is not None:
            doc.Close(False)
        if word is not None:
            word.Quit()


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: docx_to_doc.py <input.docx> <output.doc>", file=sys.stderr)
        sys.exit(1)

    docx_path, doc_path = sys.argv[1], sys.argv[2]
    if not os.path.isfile(docx_path):
        print(f"Input not found: {docx_path}", file=sys.stderr)
        sys.exit(1)

    if convert_with_soffice(docx_path, doc_path):
        sys.exit(0)
    if convert_with_word(docx_path, doc_path):
        sys.exit(0)

    print(
        "DOCX to DOC requires LibreOffice or Microsoft Word. "
        "Install LibreOffice from https://www.libreoffice.org/download/ "
        "or use DOCX output instead.",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    main()
