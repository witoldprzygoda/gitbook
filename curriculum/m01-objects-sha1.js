window.CURRICULUM.push({
  id: "m01",
  title: "Moduł 01: Architektura Gita, Migawki, git init i Obiekty .git",
  steps: [
    {
      id: "m01_s01",
      tier: "basic",
      title: "1.1 Migawki (Snapshots), a nie różnice (Deltas)",
      heading: "Fundamentalna różnica: Dlaczego Git przechowuje pełne migawki stanu projektu zamiast przyrostowych łatek?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git status -s, a następnie: git log --oneline",
      guidedCommands: ["git status -s", "git log --oneline"],
      taskTitle: "Sprawdź stan repozytorium pracownia-git (git status -s) oraz historię migawek (git log --oneline)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "47d539d",
          msg: "A: Inicjalny plan projektu",
          files: {
            "README.md": "# Pracownia Git\nProjekt demonstracyjny W01-W04.\n",
            "plan.txt": "Etap 1: Fundamenty i lokalne repozytorium\n"
          }
        },
        commits: [
          {
            id: "47d539d",
            msg: "A: Inicjalny plan projektu",
            files: {
              "README.md": "# Pracownia Git\nProjekt demonstracyjny W01-W04.\n",
              "plan.txt": "Etap 1: Fundamenty i lokalne repozytorium\n"
            }
          }
        ],
        index: {
          "README.md": "# Pracownia Git\nProjekt demonstracyjny W01-W04.\n",
          "plan.txt": "Etap 1: Fundamenty i lokalne repozytorium\n"
        },
        worktree: {
          "README.md": "# Pracownia Git\nProjekt demonstracyjny W01-W04.\n",
          "plan.txt": "Etap 1: Fundamenty i lokalne repozytorium\n"
        }
      },
      cards: [
        {
          id: "snapshots",
          title: "📸 1. Migawki (Git) kontra Różnice (SVN / CVS)",
          html: `<p>Starsze systemy kontroli wersji (CVS, Subversion) pamiętają plik początkowy i listę różnic (<i>deltas</i>) dla każdej kolejnej wersji. <b>Git działa zupełnie inaczej</b> — traktuje historię jako strumień pełnych migawek (<i>snapshots</i>) całego drzewa projektu:</p>
          <table class="tech-table">
            <thead><tr><th>Cecha</th><th>Systemy Delta (SVN/CVS)</th><th>System Migawek (Git - DVCS)</th></tr></thead>
            <tbody>
              <tr id="m01s01-r1" class="row-focus"><td><b>Co zapisuje commit?</b></td><td>Różnicę wiersz po wierszu względem poprzedniej wersji</td><td>Pełne drzewo wszystkich plików projektu w danej chwili</td></tr>
              <tr id="m01s01-r2"><td><b>Co z niezmienionymi plikami?</b></td><td>Przeszukiwane przy rekonstrukcji wersji</td><td>Git nie kopiuje ich ponownie — tworzy lekki wskaźnik do istniejącego obiektu <code>blob</code>!</td></tr>
              <tr id="m01s01-r3"><td><b>Praca lokalna (Offline)</b></td><td>Wymaga połączenia z centralnym serwerem</td><td>Pełna historia znajduje się lokalnie na dysku w <code>.git/</code></td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Pierwsze spojrzenie na repozytorium pracownia-git",
          html: `<p>Przez cały kurs towarzyszy nam projekt <code>pracownia-git</code>. Sprawdźmy jego stan oraz historię za pomocą dwóch podstawowych poleceń:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m01s01-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">status</span> <span class="ps-f">-s</span> <span class="ps-cm"># Zwięzły stan trzech obszarów (brak wyjścia = czysto)</span></span>
              <span class="laser-tag">▶ STATUS</span>
            </div>
            <div class="code-line" id="m01s01-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">log</span> <span class="ps-f">--oneline</span> <span class="ps-cm"># Lista zapisanych migawek (commitów)</span></span>
              <span class="laser-tag">▶ HISTORIA</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m01_s01_b01",
          card: "snapshots",
          focusRow: "m01s01-r1",
          inspectorTab: "trees",
          voiceText: "Witaj w kursie Git i GitHub! Zaczynamy od najważniejszej koncepcji architektonicznej: Git nie zapisuje historii jako przyrostowych łatek, lecz jako pełne migawki, czyli fotografie całego projektu w danym momencie."
        },
        {
          audioId: "m01_s01_b02",
          card: "snapshots",
          focusRow: "m01s01-r2",
          inspectorTab: "trees",
          voiceText: "Jeśli w kolejnym commicie plik się nie zmienił, Git nie marnuje miejsca na dysku — zapisuje jedynie wskaźnik do identycznego obiektu z poprzedniej migawki. Dzięki temu przełączanie wersji i gałęzi jest błyskawiczne."
        },
        {
          audioId: "m01_s01_b03",
          card: "cli",
          focusLine: "m01s01-l1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Spójrz na trzy obszary po prawej stronie: HEAD, Indeks i Dysk zawierają dokładnie tę samą treść. Na karcie widzisz dwa podstawowe polecenia diagnostyczne: git status -s zwięźle podsumowuje stan obszarów, a git log --oneline wyświetla listę zapisanych migawek."
        }
      ],
      assertions: [
        {
          label: "1. Sprawdzono stan repozytorium (git status -s)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git status"))
        },
        {
          label: "2. Wyświetlono historię migawek (git log --oneline)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git log"))
        }
      ]
    },
    {
      id: "m01_s02",
      tier: "basic",
      title: "1.2 Anatomia git init i „nienarodzona gałąź” (Unborn Branch)",
      heading: "Co dzieje się w katalogu .git/ zaraz po git init -b main, zanim powstanie pierwszy commit?",
      badge: "🛠️ Zadanie",
      primaryFile: "README.md",
      hint: "Wpisz: git init -b main, a następnie: cat .git/HEAD",
      guidedCommands: ["git init -b main", "cat .git/HEAD"],
      taskTitle: "Zainicjalizuj nowe repozytorium z gałęzią main (git init -b main) i sprawdź zawartość pliku .git/HEAD",
      initialRepo: {
        repoName: "nowy-projekt",
        branch: "main",
        initialized: false,
        unborn: true,
        headCommit: {
          id: "(unborn)",
          msg: "Brak commitów",
          files: {}
        },
        commits: [],
        index: {},
        worktree: {
          "README.md": "# Nowy Projekt\nInicjalizacja repozytorium.\n"
        }
      },
      cards: [
        {
          id: "unborn",
          title: "🌱 1. Stan Unborn Branch (Nienarodzona gałąź)",
          html: `<p>Kiedy wykonujesz <span class="cmd-pill">git init -b main</span>, Git tworzy ukryty podkatalog <code>.git/</code>. Zanim jednak utworzysz pierwszy commit, gałąź <code>main</code> znajduje się w specjalnym stanie <b>Unborn Branch</b> (nienarodzona gałąź):</p>
          <table class="tech-table">
            <thead><tr><th>Ścieżka w .git/</th><th>Stan zaraz po <code>git init -b main</code></th></tr></thead>
            <tbody>
              <tr id="m01s02-r1" class="row-focus"><td><code>.git/HEAD</code></td><td>Istnieje i zawiera tekst: <code>ref: refs/heads/main</code></td></tr>
              <tr id="m01s02-r2"><td><code>.git/refs/heads/main</code></td><td><b>Jeszcze fizycznie NIE istnieje!</b> Powstanie dopiero przy pierwszym <code>git commit</code></td></tr>
              <tr id="m01s02-r3"><td><code>.git/objects/</code></td><td>Pusta baza obiektów (brak blobów, drzew i commitów)</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Inicjalizacja i inspekcja wskaźnika .git/HEAD",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m01s02-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">init</span> <span class="ps-f">-b</span> <span class="ps-s">main</span> <span class="ps-cm"># Tworzy .git/ i ustawia domyślną gałąź main</span></span>
              <span class="laser-tag">▶ INICJALIZACJA</span>
            </div>
            <div class="code-line" id="m01s02-l2">
              <span><span class="ps-c">cat</span> <span class="ps-s">.git/HEAD</span> <span class="ps-cm"># Zwróci: ref: refs/heads/main</span></span>
              <span class="laser-tag">▶ WSKAŹNIK HEAD</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m01_s02_b01",
          card: "unborn",
          focusRow: "m01s02-r1",
          inspectorTab: "git",
          flashBox: "boxHead",
          voiceText: "Polecenie git init -b main tworzy szkielet repozytorium w katalogu .git. Plik .git/HEAD wskazuje już symbolicznie na ścieżkę refs/heads/main, ale sam plik gałęzi main jeszcze na dysku nie istnieje!"
        },
        {
          audioId: "m01_s02_b02",
          card: "cli",
          focusLine: "m01s02-l1",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Ten stan nazywamy nienarodzoną gałęzią — Unborn Branch. Dopiero pierwszy commit utworzy fizyczny plik gałęzi w katalogu .git/refs/heads."
        }
      ],
      assertions: [
        {
          label: "1. Zainicjalizowano repozytorium (git init -b main)",
          check: (vfs) => vfs.initialized && vfs.lastCommands.some(c => c.startsWith("git init"))
        },
        {
          label: "2. Odczytano referencję symboliczną w .git/HEAD (cat .git/HEAD)",
          check: (vfs) => vfs.initialized && vfs.lastCommands.some(c => c.includes("cat .git/HEAD"))
        }
      ]
    },
    {
      id: "m01_s03",
      tier: "basic",
      title: "1.3 Kaskada konfiguracji (git config) i tożsamość autora",
      heading: "Trzy poziomy konfiguracji (--system, --global, --local) i dlaczego każdy commit wymaga tożsamości?",
      badge: "🛠️ Zadanie",
      primaryFile: "README.md",
      hint: "Wpisz: git config user.name \"Jan Kowalski\", a następnie: git config --list --show-origin",
      guidedCommands: ["git config user.name \"Jan Kowalski\"", "git config --list --show-origin"],
      taskTitle: "Ustaw nazwę autora w konfiguracji lokalnej (git config user.name) i wyświetl listę ustawień ze źródłem (--show-origin)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        unborn: true,
        headCommit: {
          id: "(unborn)",
          msg: "Brak commitów",
          files: {}
        },
        commits: [],
        index: {},
        worktree: {
          "README.md": "# Pracownia Git\n"
        }
      },
      cards: [
        {
          id: "cascade",
          title: "⚙️ 1. Trzy poziomy konfiguracji (Kaskada nadpisywania)",
          html: `<p>Każdy obiekt <code>commit</code> ma trwale wbudowane pole <code>author</code> oraz <code>committer</code>. Git pobiera te dane z trzech poziomów konfiguracji (bardziej szczegółowy poziom nadpisuje ogólny):</p>
          <table class="tech-table">
            <thead><tr><th>Flaga</th><th>Plik na dysku</th><th>Priorytet i zasięg</th></tr></thead>
            <tbody>
              <tr id="m01s03-r1"><td><code>--system</code></td><td><code>/etc/gitconfig</code></td><td>1 (Najniższy) — wszyscy użytkownicy systemu</td></tr>
              <tr id="m01s03-r2"><td><code>--global</code></td><td><code>~/.gitconfig</code></td><td>2 (Średni) — wszystkie Twoje repozytoria</td></tr>
              <tr id="m01s03-r3" class="row-focus"><td><code>--local</code> (domyślny)</td><td><code>.git/config</code></td><td><b>3 (Najwyższy — wygrywa!)</b> — tylko bieżące repozytorium</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Ustawianie i audyt konfiguracji (--show-origin)",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m01s03-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">config</span> <span class="ps-s">user.name "Jan Kowalski"</span> <span class="ps-cm"># Zapis do .git/config (--local)</span></span>
              <span class="laser-tag">▶ TOŻSAMOŚĆ</span>
            </div>
            <div class="code-line" id="m01s03-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">config</span> <span class="ps-f">--list --show-origin</span> <span class="ps-cm"># Pokazuje plik źródłowy każdej opcji</span></span>
              <span class="laser-tag">▶ AUDYT</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m01_s03_b01",
          card: "cascade",
          focusRow: "m01s03-r3",
          inspectorTab: "git",
          flashBox: "boxIdx",
          voiceText: "Zanim utworzysz pierwszy commit, Git musi wiedzieć, kim jesteś. Ustawienia w pliku lokalnym .git/config mają najwyższy priorytet i nadpisują ustawienia globalne z katalogu domowego."
        },
        {
          audioId: "m01_s03_b02",
          card: "cli",
          focusLine: "m01s03-l2",
          inspectorTab: "git",
          flashBox: "boxIdx",
          voiceText: "Na karcie widzisz polecenie git config z flagą --show-origin, które pozwala dokładnie sprawdzić, z którego pliku na dysku pochodzi każda aktywna reguła konfiguracji."
        }
      ],
      assertions: [
        {
          label: "1. Zaktualizowano nazwę użytkownika w .git/config (git config user.name ...)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("git config") && c.includes("user.name"))
        },
        {
          label: "2. Wyświetlono konfigurację wraz ze ścieżkami plików (--list --show-origin)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("git config") && c.includes("--list"))
        }
      ]
    },
    {
      id: "m01_s04",
      tier: "basic",
      title: "1.4 Pierwszy commit (Root Commit): git add i git commit",
      heading: "Narodziny gałęzi main: Jak plik przechodzi z dysku przez Indeks do pierwszego commita?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git add plan.txt README.md, a następnie: git commit -m \"A: Pierwsza migawka\"",
      guidedCommands: ["git add plan.txt README.md", "git commit -m \"A: Pierwsza migawka\""],
      taskTitle: "Dodaj pliki do poczekalni (git add) i utwórz pierwszy commit w historii (Root Commit)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        unborn: true,
        headCommit: {
          id: "(unborn)",
          msg: "Brak commitów",
          files: {}
        },
        commits: [],
        index: {},
        worktree: {
          "README.md": "# Pracownia Git\n",
          "plan.txt": "Wersja A planu\n"
        }
      },
      cards: [
        {
          id: "root_commit",
          title: "🌳 1. Dwustopniowy zapis: Dlaczego najpierw git add, a potem git commit?",
          html: `<p>W Gicie zapis migawki odbywa się w dwóch krokach, co daje Ci pełną kontrolę nad kształtem każdego commita:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m01s04-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">add</span> <span class="ps-s">plan.txt README.md</span> <span class="ps-cm"># 1. Dysk -> Indeks (Tworzy obiekty blob!)</span></span>
              <span class="laser-tag">▶ DO POCZEKALNI</span>
            </div>
            <div class="code-line" id="m01s04-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">commit</span> <span class="ps-f">-m</span> <span class="ps-s">"A: Pierwsza migawka"</span> <span class="ps-cm"># 2. Indeks -> HEAD (Root Commit)</span></span>
              <span class="laser-tag">▶ MIGAWKA</span>
            </div>
          </div>`
        },
        {
          id: "anatomy",
          title: "🧬 2. Co wyróżnia Root Commit?",
          html: `<table class="tech-table">
            <thead><tr><th>Właściwość</th><th>Pierwszy commit (Root Commit)</th><th>Kolejne commity</th></tr></thead>
            <tbody>
              <tr id="m01s04-r1" class="row-focus"><td>Pole <code>parent</code> w obiekcie</td><td><b>Brak pola parent!</b> (korzeń grafu DAG)</td><td>Wskazuje 40-znakowy SHA-1 poprzednika</td></tr>
              <tr id="m01s04-r2"><td>Plik <code>.git/refs/heads/main</code></td><td>Zostaje fizycznie utworzony na dysku</td><td>Zostaje nadpisany nowym skrótem SHA-1</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m01_s04_b01",
          card: "root_commit",
          focusLine: "m01s04-l1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Spójrz na prawy górny panel: w tej chwili pliki istnieją wyłącznie na dysku roboczym, a Indeks oraz HEAD są puste. Polecenie git add kopiuje zawartość plików do Indeksu i już w tym momencie zapisuje obiekty blob w bazie .git/objects."
        },
        {
          audioId: "m01_s04_b02",
          card: "anatomy",
          focusRow: "m01s04-r1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Dopiero polecenie git commit buduje z Indeksu obiekt drzewa oraz pierwszy obiekt commit, nazywany Root Commitem, ponieważ nie posiada żadnego rodzica."
        }
      ],
      assertions: [
        {
          label: "1. Dodano pliki do Indeksu (git add plan.txt README.md)",
          check: (vfs) => vfs.index["plan.txt"] !== undefined && vfs.index["README.md"] !== undefined
        },
        {
          label: "2. Utworzono pierwszy Root Commit z dodanymi plikami (git commit -m ...)",
          check: (vfs) => !vfs.unborn && vfs.commits.length >= 1 && vfs.headCommit.files["plan.txt"] !== undefined && vfs.headCommit.files["README.md"] !== undefined
        }
      ]
    },
    {
      id: "m01_s05",
      tier: "extended",
      title: "1.5 Druga migawka i powiązanie rodzica (Commit B -> Commit A)",
      heading: "Jak powstaje łańcuch historii: modyfikacja śledzonego pliku i aktualizacja wskaźnika gałęzi",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git add plan.txt, a następnie: git commit -m \"B: Rozbudowa planu\"",
      guidedCommands: ["git add plan.txt", "git commit -m \"B: Rozbudowa planu\""],
      taskTitle: "Przygotuj zmodyfikowany plik plan.txt w Indeksie i zapisz drugą migawkę (Commit B)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "47d539d",
          msg: "A: Pierwsza migawka",
          files: {
            "README.md": "# Pracownia Git\n",
            "plan.txt": "Wersja A planu\n"
          }
        },
        commits: [
          {
            id: "47d539d",
            msg: "A: Pierwsza migawka",
            files: {
              "README.md": "# Pracownia Git\n",
              "plan.txt": "Wersja A planu\n"
            }
          }
        ],
        index: {
          "README.md": "# Pracownia Git\n",
          "plan.txt": "Wersja A planu\n"
        },
        worktree: {
          "README.md": "# Pracownia Git\n",
          "plan.txt": "Wersja A planu\nWersja B: Dodano opis indeksowania\n"
        }
      },
      cards: [
        {
          id: "chain",
          title: "🔗 1. Łańcuch migawek: Commit B wskazuje na Commit A",
          html: `<p>Na dysku roboczym zmodyfikowaliśmy plik <code>plan.txt</code> (status <code> M plan.txt</code>). Zobacz, co dzieje się podczas tworzenia drugiego commita:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m01s05-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">add</span> <span class="ps-s">plan.txt</span> <span class="ps-cm"># Aktualizuje wpis plan.txt w .git/index</span></span>
              <span class="laser-tag">▶ STAGE</span>
            </div>
            <div class="code-line" id="m01s05-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">commit</span> <span class="ps-f">-m</span> <span class="ps-s">"B: Rozbudowa planu"</span> <span class="ps-cm"># Tworzy commit B z parent 47d539d</span></span>
              <span class="laser-tag">▶ COMMIT B</span>
            </div>
          </div>`
        },
        {
          id: "reuse",
          title: "♻️ 2. Deduplikacja niezmienionych plików między commitami",
          html: `<table class="tech-table">
            <thead><tr><th>Plik</th><th>Commit A (47d539d)</th><th>Commit B (nowy)</th></tr></thead>
            <tbody>
              <tr id="m01s05-r1" class="row-focus"><td><code>README.md</code> (niezmieniony)</td><td>Wskazuje na <code>blob</code> nr 1</td><td><b>Wskazuje na ten sam <code>blob</code> nr 1!</b></td></tr>
              <tr id="m01s05-r2"><td><code>plan.txt</code> (zmodyfikowany)</td><td>Wskazuje na <code>blob</code> wersji A</td><td>Wskazuje na nowy <code>blob</code> wersji B</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m01_s05_b01",
          card: "chain",
          focusLine: "m01s05-l1",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "W katalogu roboczym dopisaliśmy drugi wiersz do pliku plan.txt, podczas gdy plik README.md pozostał nietknięty."
        },
        {
          audioId: "m01_s05_b02",
          card: "reuse",
          focusRow: "m01s05-r1",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "Kiedy dodasz plan.txt do Indeksu i utworzysz Commit B, nowe drzewo wykorzysta ponownie istniejący obiekt blob dla pliku README.md, a nowy commit zapisze identyfikator 47d539d jako swojego rodzica."
        }
      ],
      assertions: [
        {
          label: "1. Zaktualizowano plik plan.txt w Indeksie (git add plan.txt)",
          check: (vfs) => (vfs.index["plan.txt"] || "").includes("Wersja B")
        },
        {
          label: "2. Zapisano drugi commit w historii (git commit -m ...)",
          check: (vfs) => vfs.commits.length >= 2 && (vfs.headCommit.files["plan.txt"] || "").includes("Wersja B")
        }
      ]
    },
    {
      id: "m01_s06",
      tier: "extended",
      title: "1.6 Precyzyjne wycofywanie z poczekalni (git restore --staged)",
      heading: "Mechanika git restore: Skąd (--source) i dokąd (--staged / --worktree) płyną bajty?",
      badge: "🛠️ Zadanie",
      primaryFile: "analyzer.py",
      hint: "Wpisz: git restore --staged analyzer.py",
      guidedCommands: ["git restore --staged analyzer.py"],
      taskTitle: "Wycofaj błędny limit (50) z Indeksu, zachowując nowy kod (10) na dysku roboczym",
      initialRepo: {
        repoName: "log-guard",
        branch: "main",
        headCommit: {
          id: "8a4f19c",
          msg: "Inicjalny parser logów",
          files: { "analyzer.py": "def parse_stream(lines):\n  MAX_ERRORS = 100\n  return lines[:MAX_ERRORS]" }
        },
        index: { "analyzer.py": "def parse_stream(lines):\n  MAX_ERRORS = 50\n  return lines[:MAX_ERRORS]" },
        worktree: { "analyzer.py": "def parse_stream(lines):\n  MAX_ERRORS = 10\n  enable_strict_audit = True\n  return lines[:MAX_ERRORS]" }
      },
      cards: [
        {
          id: "cli",
          title: "💻 1. Składnia i kierunki przepływu w git restore",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m01s06-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">restore</span> <span class="ps-f">--staged</span> <span class="ps-f">--</span> <span class="ps-s">analyzer.py</span> <span class="ps-cm"># 1. HEAD -> Indeks (Odznacza add)</span></span>
              <span class="laser-tag">▶ OMAWIANE</span>
            </div>
            <div class="code-line" id="m01s06-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">restore</span> <span class="ps-f">--</span> <span class="ps-s">analyzer.py</span> <span class="ps-cm"># 2. Indeks -> Dysk (Kasuje edycję!)</span></span>
              <span class="laser-tag">▶ OMAWIANE</span>
            </div>
          </div>`
        },
        {
          id: "matrix",
          title: "📊 2. Matryca stanów (HEAD / Indeks / Dysk)",
          html: `<table class="tech-table">
            <thead><tr><th>Polecenie CLI</th><th>Źródło</th><th>Cel</th></tr></thead>
            <tbody>
              <tr id="m01s06-r1" class="row-focus"><td><code>git restore --staged plik</code></td><td>HEAD (100)</td><td>Indeks</td></tr>
              <tr id="m01s06-r2"><td><code>git restore plik</code></td><td>Indeks (50)</td><td>Dysk roboczy</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m01_s06_b01",
          card: "cli",
          focusLine: "m01s06-l1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Wariant z flagą --staged kopiuje wersję z commita HEAD z powrotem do Indeksu, pozostawiając Twoje poprawki na dysku roboczym całkowicie bezpieczne."
        },
        {
          audioId: "m01_s06_b02",
          card: "matrix",
          focusRow: "m01s06-r2",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Zwykłe git restore bez flagi --staged kopiuje zawartość z Indeksu na dysk roboczy, bezpowrotnie nadpisując niezapisane zmiany."
        }
      ],
      assertions: [
        {
          label: "1. Wycofano wersję 50 z Indeksu do stanu HEAD zachowując MAX_ERRORS = 10 na dysku (git restore --staged analyzer.py)",
          check: (vfs) => (vfs.index["analyzer.py"] || "").includes("MAX_ERRORS = 100") && (vfs.worktree["analyzer.py"] || "").includes("MAX_ERRORS = 10")
        }
      ]
    },
    {
      id: "m01_s07",
      tier: "advanced",
      title: "1.7 Obliczanie OID obiektu blob (git hash-object --stdin)",
      heading: "Adresowanie treścią (CAS): Jak Git wylicza 160-bitowy identyfikator SHA-1?",
      badge: "🛠️ Zadanie",
      primaryFile: "analyzer.py",
      hint: "Wpisz w terminalu: printf 'A\\n' | git hash-object --stdin",
      guidedCommands: ["printf 'A\\n' | git hash-object --stdin"],
      taskTitle: "Oblicz identyfikator OID dla ciągu 'A\\n' za pomocą git hash-object --stdin",
      initialRepo: {
        repoName: "log-guard",
        branch: "main",
        headCommit: {
          id: "8a4f19c",
          msg: "Inicjalny parser logów",
          files: { "analyzer.py": "def parse_stream(lines):\n  MAX_ERRORS = 100\n  return lines[:MAX_ERRORS]" }
        },
        index: { "analyzer.py": "def parse_stream(lines):\n  MAX_ERRORS = 100\n  return lines[:MAX_ERRORS]" },
        worktree: { "analyzer.py": "def parse_stream(lines):\n  MAX_ERRORS = 100\n  return lines[:MAX_ERRORS]" }
      },
      cards: [
        {
          id: "cas",
          title: "🔑 1. Nagłówek obiektu w SHA-1 (Plumbing)",
          html: `<p>Identyfikator obiektu (OID) w bazie <code>.git/objects</code> to <b>nie</b> jest surowy skrót SHA-1 z samej treści pliku. Git dokleja na początku nagłówek z typem i rozmiarem w bajtach:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m01s07-l1">
              <span>OID = SHA1(<span class="ps-s">"blob "</span> + rozmiar + <span class="ps-f">"\\0"</span> + bajty_pliku)</span>
              <span class="laser-tag">▶ WZÓR OID</span>
            </div>
            <div class="code-line" id="m01s07-l2">
              <span><span class="ps-c">printf</span> <span class="ps-s">'A\\n'</span> | <span class="ps-c">git</span> <span class="ps-sub">hash-object</span> <span class="ps-f">--stdin</span> <span class="ps-cm"># Zwróci: f70f10e4...</span></span>
              <span class="laser-tag">▶ POLECENIE</span>
            </div>
          </div>`
        },
        {
          id: "merkle",
          title: "🌳 2. Cztery typy obiektów w .git/objects",
          html: `<table class="tech-table">
            <thead><tr><th>Typ obiektu</th><th>Co przechowuje?</th></tr></thead>
            <tbody>
              <tr id="m01s07-r1"><td><code>blob</code></td><td>Wyłącznie surowe bajty zawartości pliku (nie zna nazwy pliku!).</td></tr>
              <tr id="m01s07-r2"><td><code>tree</code></td><td>Wiąże nazwy plików i uprawnienia (<code>100644</code>) ze skrótami <code>blob</code>.</td></tr>
              <tr id="m01s07-r3"><td><code>commit</code></td><td>Wskazuje główne <code>tree</code>, rodzica (<code>parent</code>) oraz autora i opis.</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m01_s07_b01",
          card: "cas",
          focusLine: "m01s07-l1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Git jest magazynem adresowanym treścią. Identyfikator każdego obiektu blob powstaje przez wyliczenie funkcji skrótu SHA-1 z nagłówka zawierającego słowo blob, rozmiar w bajtach, bajt zerowy oraz zawartość pliku."
        },
        {
          audioId: "m01_s07_b02",
          card: "cas",
          focusLine: "m01s07-l2",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Wykonaj teraz w terminalu po prawej stronie polecenie git hash-object z flagą --stdin, aby samodzielnie wyliczyć identyfikator OID bez zapisywania obiektu w bazie."
        }
      ],
      assertions: [
        {
          label: "1. Wywołano w terminalu polecenie git hash-object --stdin",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("hash-object") && c.includes("--stdin"))
        }
      ]
    },
    {
      id: "m01_s08",
      tier: "advanced",
      title: "1.8 Inspekcja obiektów pod maską (git cat-file -t oraz -p)",
      heading: "Drzewo Merkle'a w praktyce: Jak obiekt commit wskazuje na tree, a tree na obiekty blob?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git cat-file -t HEAD, następnie: git cat-file -p HEAD oraz: git cat-file -p HEAD^{tree}",
      guidedCommands: ["git cat-file -t HEAD", "git cat-file -p HEAD", "git cat-file -p HEAD^{tree}"],
      taskTitle: "Zbadaj typ i wnętrze obiektu commit (git cat-file -t/-p HEAD) oraz powiązanego z nim obiektu drzewa (HEAD^{tree})",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "6714130",
          msg: "C: Finalny plan W01",
          parent: "d46ad65",
          files: {
            "README.md": "A\n",
            "plan.txt": "A\n"
          }
        },
        commits: [
          { id: "6714130", msg: "C: Finalny plan W01", parent: "d46ad65", files: { "README.md": "A\n", "plan.txt": "A\n" } },
          { id: "d46ad65", msg: "B: Etap drugi", parent: "47d539d", files: { "README.md": "A\n", "plan.txt": "A\n" } }
        ],
        index: { "README.md": "A\n", "plan.txt": "A\n" },
        worktree: { "README.md": "A\n", "plan.txt": "A\n" }
      },
      cards: [
        {
          id: "catfile",
          title: "🔬 1. Polecenie niskopoziomowe git cat-file (-t oraz -p)",
          html: `<p>Wszystkie obiekty w <code>.git/objects/</code> są skompresowane biblioteką <i>zlib</i>. Do ich odczytu służy polecenie plumbingowe <span class="cmd-pill">git cat-file</span>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m01s08-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">cat-file</span> <span class="ps-f">-t</span> <span class="ps-s">HEAD</span> <span class="ps-cm"># Zwraca typ obiektu: commit</span></span>
              <span class="laser-tag">▶ TYP (-t)</span>
            </div>
            <div class="code-line" id="m01s08-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">cat-file</span> <span class="ps-f">-p</span> <span class="ps-s">HEAD</span> <span class="ps-cm"># Wypisuje treść commita (tree, parent, author)</span></span>
              <span class="laser-tag">▶ COMMIT (-p)</span>
            </div>
            <div class="code-line" id="m01s08-l3">
              <span><span class="ps-c">git</span> <span class="ps-sub">cat-file</span> <span class="ps-f">-p</span> <span class="ps-s">HEAD^{tree}</span> <span class="ps-cm"># Wypisuje wpisy drzewa (100644 blob ...)</span></span>
              <span class="laser-tag">▶ DRZEWO</span>
            </div>
          </div>`
        },
        {
          id: "dedup",
          title: "💎 2. Dowód deduplikacji w obiekcie tree",
          html: `<p>W naszym repozytorium zarówno <code>README.md</code>, jak i <code>plan.txt</code> mają identyczną zawartość (<code>A\\n</code>). Gdy wyświetlisz drzewo <code>HEAD^{tree}</code>, zobaczysz, że oba pliki wskazują na <b>dokładnie ten sam obiekt blob</b> (<code>f70f10e4...</code>)!</p>`
        }
      ],
      beats: [
        {
          audioId: "m01_s08_b01",
          card: "catfile",
          focusLine: "m01s08-l1",
          inspectorTab: "git",
          flashBox: "boxHead",
          voiceText: "Zajrzyjmy teraz bezpośrednio do bazy obiektów .git/objects. Flaga -t polecenia git cat-file ujawnia typ obiektu, natomiast flaga -p dekompresuje i czytelnie wypisuje jego zawartość."
        },
        {
          audioId: "m01_s08_b02",
          card: "catfile",
          focusLine: "m01s08-l3",
          inspectorTab: "git",
          flashBox: "boxWork",
          voiceText: "Wywołaj kolejno git cat-file -t HEAD, git cat-file -p HEAD oraz git cat-file -p HEAD^{tree}. Zobaczysz na własne oczy, że dwa pliki o tej samej treści wskazują na ten sam czterdziestoznakowy identyfikator blob!"
        }
      ],
      assertions: [
        {
          label: "1. Sprawdzono typ obiektu HEAD (git cat-file -t HEAD)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("cat-file -t"))
        },
        {
          label: "2. Wyświetlono zawartość obiektu commit (git cat-file -p HEAD)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("cat-file -p HEAD"))
        },
        {
          label: "3. Wyświetlono zawartość drzewa commita (git cat-file -p HEAD^{tree})",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("HEAD^{tree}"))
        }
      ]
    }
  ]
});
