#!/usr/bin/env python3
"""
Buduje wszystkie wersje kursu Git & GitHub Supervised Lab Engine:
1. Synchronizuje główny interfejs Lab Engine (index.html, css/, curriculum/, engine/) z katalogiem src/
2. dist/web/             -> Samodzielna aplikacja webowa (poza Moodle)
3. dist/moodle_scorm.zip -> Pakiet SCORM 1.2 gotowy do osadzenia w Moodle (Pegaz)
"""
import shutil
import sys
import zipfile
import pathlib

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "src"
DIST_DIR = ROOT / "dist"
DIST_WEB = DIST_DIR / "web"
DIST_SCORM_ZIP = DIST_DIR / "moodle_scorm.zip"

LAB_DIRS = ["css", "curriculum", "engine", "audio"]

IMS_MANIFEST_TEMPLATE = """<?xml version="1.0" standalone="no" ?>
<manifest identifier="pl.edu.uj.gitbook.course" version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-GITBOOK">
    <organization identifier="ORG-GITBOOK">
      <title>Git &amp; GitHub — Interaktywne Laboratorium (Podstawowy / Rozszerzony / Zaawansowany)</title>
      <item identifier="ITEM-MAIN" identifierref="RES-MAIN">
        <title>Git &amp; GitHub Supervised Lab Engine</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-MAIN" type="webcontent" adlcp:scormtype="sco" href="index.html">
{file_entries}
    </resource>
  </resources>
</manifest>
"""

def sync_root_to_src():
    SRC_DIR.mkdir(parents=True, exist_ok=True)
    root_index = ROOT / "index.html"
    if root_index.exists():
        shutil.copy2(root_index, SRC_DIR / "index.html")
    for d in LAB_DIRS:
        src_sub = ROOT / d
        dst_sub = SRC_DIR / d
        if src_sub.exists():
            if dst_sub.exists():
                shutil.rmtree(dst_sub)
            shutil.copytree(src_sub, dst_sub)

def build():
    sync_root_to_src()
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    if DIST_WEB.exists():
        shutil.rmtree(DIST_WEB)
    shutil.copytree(SRC_DIR, DIST_WEB)
    print(f"[OK] Zsynchronizowano src/ i zbudowano wersję Web App: {DIST_WEB}")

    file_entries = []
    for path in sorted(DIST_WEB.rglob("*")):
        if path.is_file():
            rel = path.relative_to(DIST_WEB).as_posix()
            file_entries.append(f'      <file href="{rel}"/>')

    manifest_xml = IMS_MANIFEST_TEMPLATE.format(file_entries="\n".join(file_entries))

    with zipfile.ZipFile(DIST_SCORM_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(DIST_WEB.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(DIST_WEB).as_posix())
        zf.writestr("imsmanifest.xml", manifest_xml)

    print(f"[OK] Zbudowano pakiet Moodle SCORM 1.2:                {DIST_SCORM_ZIP}")

if __name__ == "__main__":
    build()
