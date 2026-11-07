# PLAN PROJEKTU I INSTRUKCJA DLA AGENTA AI (Model Argon / Antigravity)
**Lokalizacja docelowa projektu:** `D:\PROJECTS\GITBOOK`

Ten dokument zawiera **kompletny kontekst architektoniczny, dydaktyczny i techniczny** wypracowany podczas projektowania interaktywnego kursu **Git i GitHub**. Przeczytaj go w całości przed rozpoczęciem modyfikacji plików.

---

## 1. Wizja i cel projektu
Budujemy nowoczesny, wielowarstwowy, interaktywny kurs **Git i GitHub** na poziomie akademickim (standard dydaktyczny Uniwersytetu Jagiellońskiego, kierunki informatyczne/fizyczne).
Kurs musi działać w architekturze **Dual-Mode (Dwa tryby pracy z jednej bazy kodu)**:
1. **Wersja Web „Dla Wszystkich” (Standalone Web App):**
   - Działa samodzielnie w każdej przeglądarce (zarówno po otwarciu bezpośrednio z dysku przez `file://`, jak i na dowolnym serwerze statycznym / GitHub Pages).
   - Przechowuje postępy w `localStorage`.
   - Posiada w interfejsie funkcje eksportu postępów do pliku `.json`, importu z pliku `.json` oraz resetu postępów.
2. **Wersja Moodle (SCORM 1.2 / SCORM 2004):**
   - Automatycznie wykrywa w runtime obecność obiektu `window.API` (SCORM 1.2) lub `window.API_1484_11` (SCORM 2004) w oknie nadrzędnym platformy Moodle (Pegaz).
   - Synchronizuje stan ukończenia modułów, wyniki quizów oraz `cmi.suspend_data` z LMS Moodle.
   - Ukrywa lub oznacza jako pomocnicze opcje lokalnego eksportu JSON, informując użytkownika o aktywnej synchronizacji z Moodle.

---

## 2. Fundamentalne zasady dydaktyczne i techniczne (ŻELAZNE REGUŁY)

### Reguła 1: Weryfikacja „Test-First” na żywym Gicie + Dokumentacja Źródłowa
- Materiały wykładowe (W01–W04) określają **zakres tematyczny**, który możesz rozszerzać, porządkować i ulepszać.
- **ZAKAZ powielania potocznych mitów o Gicie.** Cała wiedza musi być ściśle zgodna z oficjalną dokumentacją źródłową (`git-scm.com/doc`) oraz specyfikacją techniczną Gita.
- **ZANIM dodasz do kursu jakikolwiek scenariusz terminalowy, przykład lub pytanie quizowe**, musisz napisać i uruchomić test w katalogu `tests/` (np. `python tests/verify_scenarios.py`), który:
  1. Tworzy izolowane repozytorium tymczasowe (`tempfile.TemporaryDirectory()`).
  2. Wykonuje rzeczywiste polecenia `git` omawiane w lekcji.
  3. Weryfikuje za pomocą `assert` dokładne wyjścia (`stdout`, `stderr`, zawartość plików w `.git/`).

### Reguła 2: Trójpoziomowa architektura treści (3 Tiers)
Każdy temat (podrozdział) w kursie składa się z trzech warstw szczegółowości, przełączanych dynamicznie w górnym pasku nawigacyjnym bez przeładowania strony:
- **`basic` (Poziom Podstawowy):** Intuicyjny model mentalny, podstawowe komendy *porcelain* (`init`, `add`, `commit`, `status`, `switch`, `merge`, `push`, `pull`), bezpieczna praca codzienna.
- **`extended` (Poziom Rozszerzony):** Ważne flagi i opcje, przypadki brzegowe (edge cases), konfiguracja wielopoziomowa, współpraca w zespole, wprowadzenie do struktury `.git/`.
- **`advanced` (Poziom Zaawansowany – „Pod maską Gita”):** Komendy *plumbing* (`git cat-file -p/-t`, `git ls-files -s/-u`, `git rev-parse`, `git rev-list --parents`, `git update-ref`, `git check-ignore -v`), wewnętrzna architektura bazy obiektów (`blob`, `tree`, `commit`, `tag`), struktura pliku `.git/index`, referencje symboliczne, `packed-refs`, `refspec`, teoria grafów DAG.

### Reguła 3: Kompatybilność `file://` (Brak błędów CORS)
- Użytkownik lub student musi móc kliknąć dwukrotnie `src/index.html` lub `dist/web/index.html` bezpośrednio w Eksploratorze Windows (`D:\PROJECTS\GITBOOK\...`).
- Dlatego **nie używamy** dynamicznego `fetch('./data/...')` ani modułów ES6 `type="module"`, które są blokowane przez przeglądarki dla protokołu `file://`.
- Wszystkie pliki danych (`src/data/m01.js`, `m02.js` itd.) rejestrują swoje dane w globalnym obiekcie `window.GITBOOK_DATA` i są ładowane przez klasyczne znaczniki `<script src="..."></script>`.

---

## 3. Struktura katalogów w `D:\PROJECTS\GITBOOK`

```text
D:\PROJECTS\GITBOOK\
├── AGENT_PLAN.md              <-- Ten dokument (kompletny plan i wytyczne dla modelu Argon)
├── README.md                  <-- Instrukcja obsługi projektu dla autora kursu
├── reference_materials/       <-- Miejsce na oryginalne paczki wykładowe (np. W01-W04 .zip/.pdf/.pptx)
├── tools/
│   ├── build.py               <-- Buduje dist/web/ (aplikacja web) oraz dist/moodle_scorm.zip (SCORM 1.2)
│   └── extract_lectures.py    <-- Narzędzie do ekstrakcji czystego tekstu z plików PDF/PPTX/ZIP z wykładów
├── tests/
│   └── verify_scenarios.py    <-- Automatyczne testy weryfikujące scenariusze Git na żywym repozytorium
├── src/                       <-- Kod źródłowy aplikacji kursu
│   ├── index.html             <-- Główny szablon aplikacji (zatwierdzony układ wizualny)
│   ├── css/
│   │   └── style.css          <-- Zatwierdzony arkusz stylów (jasny, czytelny motyw akademicki + ciemny terminal)
│   ├── js/
│   │   ├── progress-adapter.js <-- Adapter Dual-Mode: Moodle SCORM (1.2/2004) <-> Standalone localStorage + JSON I/O
│   │   └── app.js             <-- Silnik renderujący moduły, 3 poziomy trudności, inspektory .git/ oraz quizy
│   └── data/
│       ├── manifest.js        <-- Rejestr wszystkich modułów kursu
│       ├── m01_init_snap.js   <-- Moduł 01 (W01): Architektura Gita, Snapshots, git init, Unborn Branch (GOTOWY WZORZEC)
│       ├── m02_index_diff.js  <-- Moduł 02 (W01/W02): Trzy drzewa, Indeks, status, diff, restore, .gitignore (SZKIELET + PRÓBKA)
│       ├── m03_dag_reset.js   <-- Moduł 03 (W02/W03): Graf DAG, log, reset (--soft/--mixed/--hard), revert, reflog
│       ├── m04_branch_merge.js<-- Moduł 04 (W03/W04): Gałęzie, switch, Fast-Forward vs 3-Way Merge, rebase, konflikty
│       └── m05_remotes_gh.js  <-- Moduł 05 (W03/W04): Zdalne repozytoria, fetch vs pull, push, refspec, GitHub PR
└── dist/                      <-- Artefakty generowane przez `python tools/build.py`
    ├── web/                   <-- Gotowa aplikacja webowa "dla wszystkich"
    └── moodle_scorm.zip       <-- Gotowa paczka SCORM do wgrania na Moodle (Pegaz)
```

---

## 4. Szczegółowy Plan Zawartości Merytorycznej (Sylabus W01–W04+)

Poniżej znajduje się docelowy zakres każdego modułu, który należy sukcesywnie rozbudowywać zgodnie z wzorcem z `m01_init_snap.js`:

### Moduł 01 (`m01_init_snap.js`) – W01: Architektura Gita, Migawki i `git init` [ZREALIZOWANY WZORZEC]
1. **1.1. Migawki (Snapshots), a nie różnice (Deltas):**
   - *Basic:* Różnica między systemami delta (SVN/CVS) a migawkami w Gicie.
   - *Extended:* Lokalność operacji (DVCS), integralność kryptograficzna SHA-1.
   - *Advanced:* Baza klucz-wartość (`.git/objects`), obiekty `blob` (brak nazwy pliku w blobie, deduplikacja identycznych treści), `tree` (uprawnienia POSIX + nazwa + wskaźnik), `commit`.
2. **1.2. Anatomia `git init` i „nienarodzona gałąź” (Unborn Branch):**
   - *Basic:* Tworzenie repozytorium `git init -b main`, stan przed pierwszym commitem.
   - *Extended:* Struktura katalogu `.git/` (`HEAD`, `config`, `objects/`, `refs/heads/`).
   - *Advanced:* Stan *unborn branch* (`.git/HEAD` wskazuje `ref: refs/heads/main`, ale plik `.git/refs/heads/main` nie istnieje do czasu utworzenia *root commita* bez pola `parent`).
3. **1.3. Kaskada konfiguracji (`git config`) i tożsamość autora:**
   - *Basic:* Ustawianie `user.name` i `user.email`, flaga `--global`.
   - *Extended:* Trzy poziomy konfiguracji (`--system`, `--global`, `--local`) i zasada nadpisywania (lokalny wygrywa z globalnym). `git config --list --show-origin`.
   - *Advanced:* Różnica między `GIT_AUTHOR_*` a `GIT_COMMITTER_*` w strukturze obiektu commit oraz zmienne środowiskowe nadpisujące pliki konfiguracyjne.

### Moduł 02 (`m02_index_diff.js`) – W01/W02: Trzy drzewa, Indeks, `diff`, `restore` i `.gitignore`
1. **2.1. Model Trzech Drzew (Working Tree, Index/Staging Area, HEAD):**
   - *Basic:* Dlaczego Git ma poczekalnię (Staging Area) zamiast od razu zapisywać zmiany z dysku do commita.
   - *Extended:* Cykl życia pliku (`untracked`, `unmodified`, `modified`, `staged`), `git status -s` (dwukolumnowy format `--porcelain`: kolumna 1 = Index, kolumna 2 = Working Tree).
   - *Advanced:* Fizyczny plik `.git/index` – binarna struktura przechowująca metadane `stat()` pliku, tryb oraz skrót SHA-1 obiektu `blob` (który powstaje już podczas `git add`, a nie dopiero podczas `git commit`!). Podgląd przez `git ls-files --stage`.
2. **2.2. Trójkąt `git diff` oraz precyzyjne przywracanie stanu (`git restore`):**
   - *Basic:* Jak sprawdzić, co zmieniliśmy (`git diff`) i jak wycofać zmiany w pliku (`git restore <plik>`).
   - *Extended:* Trzy strony trójkąta `diff`: `git diff` (Working Tree vs Index), `git diff --staged` (Index vs HEAD), `git diff HEAD` (Working Tree vs HEAD). Wycofanie pliku z poczekalni: `git restore --staged <plik>`.
   - *Advanced:* Użycie flag `--source=<commit>` oraz jednoczesne operowanie na drzewie roboczym i indeksie (`git restore --source=HEAD~1 --staged --worktree <plik>`).
3. **2.3. Ignorowanie plików (`.gitignore`) i pułapka plików już śledzonych:**
   - *Basic:* Tworzenie `.gitignore`, podstawowe maski (`*.log`, `build/`).
   - *Extended:* Dlaczego wpisanie pliku do `.gitignore` NIE działa, jeśli plik był już wcześniej śledzony (rozwiązanie: `git rm --cached <plik>`). Reguły negacji (`!ważny.log`).
   - *Advanced:* Diagnostyka reguł przez `git check-ignore -v <ścieżka>`, różnica między `.gitignore`, `.git/info/exclude` (lokalne dla repo, niecommitowane) oraz `core.excludesFile` (globalne).

### Moduł 03 (`m03_dag_reset.js`) – W02/W03: Graf DAG, `reset`, `revert`, `stash` i `reflog`
1. **3.1. Historia jako Skierowany Graf Acykliczny (DAG) i nawigacja (`HEAD~n` vs `HEAD^n`):**
   - *Basic:* Przeglądanie historii (`git log --oneline --graph --all`), podgląd commita (`git show`).
   - *Extended:* Referencje względne: `HEAD~1`, `HEAD~2`. Stan *Detached HEAD* (kiedy `HEAD` zawiera surowy SHA-1 zamiast `ref: refs/heads/...`).
   - *Advanced:* Różnica między tyldą `~` (ruch w dół pierwszego rodzica o N pokoleń) a daszkiem `^` (wybór N-tego rodzica w merge commicie, np. `HEAD^2` to drugi rodzic złączonej gałęzi!). Weryfikacja przez `git rev-parse`.
2. **3.2. Trzy oblicza `git reset` (`--soft`, `--mixed`, `--hard`) kontra `git revert`:**
   - *Basic:* Kiedy używać `git revert` (tworzy nowy commit odwrotny – bezpieczny przy pracy zespołowej), a kiedy `git reset`.
   - *Extended:* Dokładny wpływ `reset --soft` (tylko ruch gałęzi/HEAD), `reset --mixed` (ruch HEAD + aktualizacja Indeksu), `reset --hard` (ruch HEAD + Indeks + nadpisanie Working Tree).
   - *Advanced:* Resetowanie pojedynczej ścieżki (`git reset <commit> -- <plik>`) jako operacja kopiująca wpis z drzewa commita do Indeksu bez przesuwania `HEAD`.
3. **3.3. Dziennik referencji (`git reflog`) i mechanizm `git stash`:**
   - *Basic:* Odkładanie pracy na bok (`git stash`, `git stash pop`) oraz ratowanie „utraconych” commitów po `reset --hard` za pomocą `git reflog`.
   - *Extended:* Zapis `HEAD@{n}`, czas życia nieosiągalnych obiektów (Garbage Collection `gc.reflogExpire`), `git stash --include-untracked`.
   - *Advanced:* Jak `git stash` jest zbudowany w grafie DAG: to specjalny obiekt commit posiadający 2 rodziców (lub 3 przy `-u`: commit bazowy `HEAD`, commit stanu Indeksu oraz commit plików nieśledzonych). Weryfikacja przez `git log --graph --oneline refs/stash`.

### Moduł 04 (`m04_branch_merge.js`) – W03/W04: Gałęzie, `merge`, `rebase` i rozwiązywanie konfliktów
1. **4.1. Czym naprawdę jest gałąź? (`git branch`, `git switch`):**
   - *Basic:* Tworzenie i przełączanie gałęzi (`git switch -c feature`), dlaczego gałęzie w Gicie są błyskawiczne.
   - *Extended:* Zarządzanie gałęziami (`git branch -v`, `-d` vs `-D`, `--merged`).
   - *Advanced:* Pliki w `.git/refs/heads/` (40 znaków hex + `\n`) oraz optymalizacja wielu gałęzi w pliku `.git/packed-refs`.
2. **4.2. Łączenie gałęzi: `Fast-Forward` kontra `3-Way Merge`:**
   - *Basic:* Łączenie prac z gałęzi bocznej do `main` (`git merge feature`).
   - *Extended:* Kiedy dochodzi do *Fast-Forward* (brak nowego commita, przesunięcie wskaźnika), a kiedy do *3-Way Merge* (powstaje *merge commit*). Wymuszenie merge commita flagą `git merge --no-ff`.
   - *Advanced:* Algorytm 3-Way Merge (wyszukiwanie *Lowest Common Ancestor* poleceniem `git merge-base A B` i porównanie trzech drzew: Base, Ours, Theirs). Struktura merge commita z dwoma polami `parent`.
3. **4.3. Anatomia konfliktu oraz `git rebase`:**
   - *Basic:* Jak czytać znaczniki konfliktu (`<<<<<<<`, `=======`, `>>>>>>>`) i jak zatwierdzić rozwiązanie.
   - *Extended:* Przebazowanie (`git rebase main`) jako alternatywa dla `merge` dająca liniową historię. **Złota Zasada Rebase:** nigdy nie przebazowuj commitów opublikowanych na wspólnym serwerze.
   - *Advanced:* Co dzieje się w `.git/index` podczas konfliktu: dla skonfliktowanego pliku znikają wpisy ze `stage 0`, a pojawiają się 3 osobne wpisy (`stage 1` = wspólny przodek, `stage 2` = nasza wersja `HEAD`, `stage 3` = wersja łączona `MERGE_HEAD`). Podgląd przez `git ls-files -u` oraz ekstrakcja np. `git show :2:plik.txt`.

### Moduł 05 (`m05_remotes_gh.js`) – W03/W04: Zdalne repozytoria, `fetch`, `pull`, `push` i GitHub
1. **5.1. Architektura zdalnych repozytoriów (`remote`) i gałęzie śledzące (Remote-Tracking Branches):**
   - *Basic:* Klonowanie (`git clone`), sprawdzanie adresów (`git remote -v`), czym jest `origin/main`.
   - *Extended:* Różnica między lokalną gałęzią `main` (`refs/heads/main`) a zdalną gałęzią śledzącą `origin/main` (`refs/remotes/origin/main`), która jest tylko lokalnym, niemodyfikowalnym bezpośrednio wskaźnikiem ostatniego znanego stanu serwera.
   - *Advanced:* Magia `refspec` w `.git/config`: `fetch = +refs/heads/*:refs/remotes/origin/*` – jak Git mapuje przestrzeń nazw serwera na lokalne repozytorium.
2. **5.2. `git fetch` vs `git pull` oraz zasady `git push` (`--force-with-lease`):**
   - *Basic:* Pobieranie zmian (`git fetch`, `git pull`) i wysyłanie (`git push -u origin main`).
   - *Extended:* Dlaczego `git pull` to w rzeczywistości `git fetch` + `git merge` (lub `git rebase` przy `pull --rebase`). Dlaczego serwer odrzuca `git push` komunikatem *non-fast-forward*.
   - *Advanced:* Bezpieczne nadpisywanie historii po lokalnym rebase: dlaczego `git push --force` jest niebezpieczny w zespole i jak działa mechanizm atomowego porównania wskaźnika w `git push --force-with-lease`.
3. **5.3. Współpraca na GitHubie (Fork, Pull Request, Code Review):**
   - *Basic:* Obieg pracy na GitHubie: gałąź tematyczna -> Push -> Pull Request -> Merge.
   - *Extended:* Model *Shared Repository* vs *Fork & Pull* (Open Source), synchronizacja forka z repozytorium `upstream`.
   - *Advanced:* Pobieranie dowolnego Pull Requesta z GitHuba bezpośrednio przez specjalne referencje serwera: `git fetch origin pull/<ID>/head:pr-<ID>`.

---

## 5. Procedura Pracy dla Agenta AI (Krok po Kroku)

Gdy użytkownik poprosi Cię o rozbudowę kolejnego modułu (np. Modułu 02, 03, 04 lub 05):

1. **Krok 1 (Analiza materiałów referencyjnych):**
   - Jeśli w katalogu `reference_materials/` znajdują się paczki z wykładów (np. W03, W04), uruchom `python tools/extract_lectures.py`, aby wyodrębnić z nich tekst do analizy.
2. **Krok 2 (Testy na żywym Gicie – `tests/verify_scenarios.py`):**
   - Dopisz funkcję testującą wszystkie komendy i stany `.git/` dla nowego modułu w `tests/verify_scenarios.py`.
   - Uruchom `python tests/verify_scenarios.py` i upewnij się, że wszystkie testy przechodzą (`PASSED`).
3. **Krok 3 (Implementacja treści i interaktywnego inspektora w `src/data/mXX_*.js`):**
   - Wypełnij plik modułu w `src/data/` pełną treścią na 3 poziomach (`basic`, `extended`, `advanced`), dodaj wieloetapowy stan dla **Interaktywnego Inspektora `.git/`** (dokładne wyjścia z przetestowanego terminala) oraz pytania quizowe z wyjaśnieniami dla każdej opcji.
4. **Krok 4 (Budowanie obu wersji):**
   - Uruchom `python tools/build.py`, aby wygenerować zarówno `dist/web/` (aplikacja poza Moodle), jak i `dist/moodle_scorm.zip` (pakiet SCORM dla Moodle).
