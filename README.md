# GITBOOK – Interaktywny Kurs Git i GitHub

Gotowa paczka startowa zawierająca wypracowany układ wizualny oraz architekturę Dual-Mode.

## Uruchomienie:
1. Otwórz `src/index.html` bezpośrednio w przeglądarce (wersja Web poza Moodle).
2. Uruchom testy weryfikujące scenariusze Git:
   ```bash
   python tests/verify_scenarios.py
   ```
3. Zbuduj wersję produkcyjną i pakiet SCORM dla Moodle:
   ```bash
   python tools/build.py
   ```
