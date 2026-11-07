#!/usr/bin/env python3
"""
Skrypt pomocniczy dla Agenta AI (Argon):
Wyodrębnia czysty tekst ze wszystkich plików .zip, .pptx, .pdf, .txt, .py
umieszczonych w katalogu reference_materials/ i zapisuje wynik w reference_materials/EXTRACTED_ALL.md.
"""
import sys
import zipfile
import io
import pathlib
import xml.etree.ElementTree as ET

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

REF_DIR = pathlib.Path(__file__).resolve().parent.parent / "reference_materials"
OUT_FILE = REF_DIR / "EXTRACTED_ALL.md"

def extract_pptx_bytes(data: bytes) -> str:
    out = []
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        slides = sorted([f for f in z.namelist() if f.startswith("ppt/slides/slide") and f.endswith(".xml")])
        for s in slides:
            tree = ET.fromstring(z.read(s))
            texts = [node.text for node in tree.iter() if node.tag.endswith("}t") and node.text]
            out.append(f"#### {s}\n" + " ".join(texts))
    return "\n\n".join(out)

def extract_pdf_bytes(data: bytes) -> str:
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(data))
        return "\n\n".join(f"#### Strona {i+1}\n" + (p.extract_text() or "") for i, p in enumerate(reader.pages))
    except ImportError:
        return "[Wskazówka: zainstaluj 'pip install pypdf', aby wyodrębnić tekst z plików PDF]"

def process_zip_bytes(data: bytes, prefix="") -> list[str]:
    chunks = []
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        for name in sorted(z.namelist()):
            if name.endswith("/"):
                continue
            raw = z.read(name)
            label = f"{prefix}{name}"
            if name.endswith((".txt", ".py", ".md")):
                chunks.append(f"## Plik: {label}\n```\n{raw.decode('utf-8', errors='replace')}\n```")
            elif name.endswith(".pptx"):
                chunks.append(f"## Prezentacja: {label}\n{extract_pptx_bytes(raw)}")
            elif name.endswith(".pdf"):
                chunks.append(f"## Dokument PDF: {label}\n{extract_pdf_bytes(raw)}")
            elif name.endswith(".zip"):
                chunks.extend(process_zip_bytes(raw, prefix=f"{label} -> "))
    return chunks

def main():
    REF_DIR.mkdir(parents=True, exist_ok=True)
    all_chunks = []
    for path in sorted(REF_DIR.rglob("*")):
        if path == OUT_FILE or path.is_dir():
            continue
        rel_name = path.relative_to(REF_DIR).as_posix()
        suffix = path.suffix.lower()
        if suffix == ".zip":
            all_chunks.extend(process_zip_bytes(path.read_bytes(), prefix=f"[{rel_name}] "))
        elif suffix == ".pptx":
            all_chunks.append(f"## Prezentacja: {rel_name}\n{extract_pptx_bytes(path.read_bytes())}")
        elif suffix == ".pdf":
            all_chunks.append(f"## Dokument PDF: {rel_name}\n{extract_pdf_bytes(path.read_bytes())}")
        elif suffix in (".txt", ".md", ".py", ".sh"):
            all_chunks.append(f"## Plik: {rel_name}\n```\n{path.read_text(encoding='utf-8', errors='replace')}\n```")

    if not all_chunks:
        print(f"Brak plików wejściowych w {REF_DIR}. Wrzuć tam paczki W01-W04 (.zip/.pdf/.pptx) i uruchom skrypt ponownie.")
        return

    OUT_FILE.write_text("# Wyekstrahowana treść materiałów wykładowych\n\n" + "\n\n".join(all_chunks), encoding="utf-8")
    print(f"[OK] Zapisano wyekstrahowaną treść w: {OUT_FILE}")

if __name__ == "__main__":
    main()
