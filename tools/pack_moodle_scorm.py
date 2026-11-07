#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator profilowanych paczek Moodle SCORM 1.2 (Podstawowy / Rozszerzony / Zaawansowany).

Użycie:
  python tools/pack_moodle_scorm.py --profile basic      # Tworzy git_lab_scorm12_basic.zip
  python tools/pack_moodle_scorm.py --profile extended   # Tworzy git_lab_scorm12_extended.zip
  python tools/pack_moodle_scorm.py --profile advanced   # Tworzy git_lab_scorm12_advanced.zip
  python tools/pack_moodle_scorm.py --all-profiles       # Buduje wszystkie 3 paczki naraz!
"""
import os
import re
import sys
import zipfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROFILES_META = {
    "basic": "Git i GitHub – Kurs Podstawowy",
    "extended": "Git i GitHub – Kurs Rozszerzony",
    "advanced": "Git i GitHub – Kurs Zaawansowany (Pełny)"
}

def make_imsmanifest(title):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="GitLabSupervisedCourse" version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>{title}</title>
      <item identifier="ITEM-1" identifierref="RES-1">
        <title>{title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
"""

def build_scorm_for_profile(profile_id, lock_student=True):
    zip_name = f"git_lab_scorm12_{profile_id}.zip"
    title = PROFILES_META.get(profile_id, "Git i GitHub Lab")

    with open("curriculum/course-profiles.js", "r", encoding="utf-8") as f:
        prof_js = f.read()

    # Podmiana domyślnego profilu i założenie blokady dla studenta w paczce SCORM
    prof_js = re.sub(r'activeProfile:\s*"[^"]+"', f'activeProfile: "{profile_id}"', prof_js)
    if lock_student:
        prof_js = re.sub(r'lockProfileForStudent:\s*(true|false)', 'lockProfileForStudent: true', prof_js)

    include_dirs = ["css", "engine", "curriculum", "audio"]
    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("imsmanifest.xml", make_imsmanifest(title))
        zf.write("index.html")
        zf.writestr("curriculum/course-profiles.js", prof_js)

        for d in include_dirs:
            if not os.path.exists(d):
                continue
            for root, _, files in os.walk(d):
                for file in files:
                    full_path = os.path.join(root, file).replace("\\", "/")
                    if full_path == "curriculum/course-profiles.js":
                        continue
                    zf.write(full_path)

    print(f"  [SCORM 1.2 GOTOWY] {zip_name} (Profil: {profile_id}, Zablokowany dla studenta: {lock_student})")

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--all-profiles" in args:
        for pid in ["basic", "extended", "advanced"]:
            build_scorm_for_profile(pid, lock_student=True)
    else:
        prof = "advanced"
        if "--profile" in args:
            idx = args.index("--profile")
            if idx + 1 < len(args):
                prof = args[idx + 1]
        build_scorm_for_profile(prof, lock_student=True)
