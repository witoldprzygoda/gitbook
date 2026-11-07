window.CURRICULUM.push({
  id: "m05",
  title: "Moduł 05: Repozytoria Zdalne, Fetch vs Pull i GitHub Flow",
  steps: [
    // =========================================================================
    // POZIOM PODSTAWOWY (BASIC) — 4 kroki
    // =========================================================================
    {
      id: "m05_s01",
      tier: "basic",
      title: "5.1 Zdalne repozytoria (origin) i gałęzie śledzące (origin/main)",
      heading: "Czym jest origin/main w katalogu .git/refs/remotes/origin/main?",
      badge: "🛠️ Zadanie",
      primaryFile: "README.md",
      hint: "Kliknij kolejno: git remote -v oraz git branch -a",
      guidedCommands: [
        "git remote -v",
        "git branch -a"
      ],
      taskTitle: "Sprawdź skonfigurowane adresy zdalnego serwera (origin) oraz listę gałęzi lokalnych i zdalnych",
      initialRepo: {
        repoName: "remote-sync",
        branch: "main",
        remotes: {
          origin: "https://github.com/dev-user/remote-sync.git"
        },
        branches: {
          main: "e101a00",
          "origin/main": "e101a00"
        },
        headCommit: {
          id: "e101a00",
          msg: "Initial remote commit",
          files: { "README.md": "# GitBook Remote Lab\n" }
        },
        commits: [
          { id: "e101a00", msg: "Initial remote commit", files: { "README.md": "# GitBook Remote Lab\n" } }
        ],
        index: { "README.md": "# GitBook Remote Lab\n" },
        worktree: { "README.md": "# GitBook Remote Lab\n" }
      },
      cards: [
        {
          id: "remotes",
          title: "🌐 1. Alias origin i wskaźniki zdalne (Remote-Tracking Branches)",
          html: `<table class="tech-table">
            <thead><tr><th>Pojęcie w Git</th><th>Gdzie mieszka w .git/?</th><th>Charakterystyka</th></tr></thead>
            <tbody>
              <tr id="m05s01-r1" class="row-focus"><td><code>origin</code></td><td>Sekcja <code>[remote "origin"]</code> w <code>.git/config</code></td><td>Domyślny skrót (alias) do pełnego adresu URL serwera GitHub/GitLab</td></tr>
              <tr id="m05s01-r2"><td><code>origin/main</code></td><td><code>.git/refs/remotes/origin/main</code></td><td>Lokalna zakładka (<b>tylko do odczytu!</b>) pamiętająca ostatni znany stan serwera</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Inspekcja połączeń zdalnych",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m05s01-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">remote</span> <span class="ps-f">-v</span> <span class="ps-cm"># Wyświetl URL dla fetch i push</span></span>
              <span class="laser-tag">▶ REMOTE -V</span>
            </div>
            <div class="code-line" id="m05s01-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">branch</span> <span class="ps-f">-a</span> <span class="ps-cm"># Pokaż gałęzie lokalne oraz zdalne (remotes/origin/*)</span></span>
              <span class="laser-tag">▶ BRANCH -A</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m05_s01_b01",
          card: "remotes",
          focusRow: "m05s01-r1",
          flashBox: "boxHead",
          inspectorTab: "config",
          voiceText: "W rozproszonym systemie Git każde repozytorium jest pełną kopią historii. Słówko origin to nie żadna magia, lecz zwykły skrót do adresu URL serwera zapisany w pliku .git/config."
        },
        {
          audioId: "m05_s01_b02",
          card: "remotes",
          focusRow: "m05s01-r2",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Gałąź origin/main znajduje się na Twoim dysku w katalogu .git/refs/remotes/origin/main. Jest to lokalny wskaźnik tylko do odczytu, który pamięta, gdzie znajdował się serwer podczas ostatniej komunikacji sieciowej."
        },
        {
          audioId: "m05_s01_b03",
          card: "cli",
          focusLine: "m05s01-l1",
          flashBox: "boxWork",
          inspectorTab: "config",
          voiceText: "Sprawdźmy teraz skonfigurowane połączenie poleceniem git remote -v oraz listę wszystkich wskaźników poleceniem git branch -a."
        }
      ],
      assertions: [
        {
          label: "1. Sprawdzono adresy zdalnych serwerów (git remote -v)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git remote"))
        },
        {
          label: "2. Wyświetlono wszystkie gałęzie wraz ze zdalnymi (git branch -a)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("git branch -a"))
        }
      ]
    },

    {
      id: "m05_s02",
      tier: "basic",
      title: "5.2 Bezpieczna synchronizacja: git fetch vs git pull",
      heading: "Dlaczego git fetch nigdy nie psuje Twojej niezapisanej pracy na dysku?",
      badge: "🛠️ Zadanie",
      primaryFile: "README.md",
      hint: "Kliknij kolejno: git fetch origin, git log --oneline, a następnie git merge origin/main",
      guidedCommands: [
        "git fetch origin",
        "git log --oneline",
        "git merge origin/main"
      ],
      taskTitle: "Pobierz nowe obiekty z serwera przez git fetch origin, obejrzyj log i połącz zmiany z lokalną gałęzią main",
      initialRepo: {
        repoName: "remote-sync",
        branch: "main",
        remotes: {
          origin: "https://github.com/dev-user/remote-sync.git"
        },
        branches: {
          main: "e101a00",
          "origin/main": "e101a00"
        },
        headCommit: {
          id: "e101a00",
          msg: "Initial remote commit",
          files: { "README.md": "# GitBook Remote Lab\n" }
        },
        commits: [
          {
            id: "e202b00",
            msg: "Teammate update on GitHub",
            parent: "e101a00",
            files: { "README.md": "# GitBook Remote Lab\n## Sekcja dodana przez zespół na GitHubie\n" }
          },
          {
            id: "e101a00",
            msg: "Initial remote commit",
            files: { "README.md": "# GitBook Remote Lab\n" }
          }
        ],
        index: { "README.md": "# GitBook Remote Lab\n" },
        worktree: { "README.md": "# GitBook Remote Lab\n" }
      },
      cards: [
        {
          id: "fetchpull",
          title: "🛡️ 1. Różnica między git fetch a git pull",
          html: `<table class="tech-table">
            <thead><tr><th>Polecenie</th><th>Baza .git/objects i origin/main</th><th>Katalog roboczy (Dysk)</th></tr></thead>
            <tbody>
              <tr id="m05s02-r1" class="row-focus"><td><code>git fetch origin</code></td><td>Pobiera nowe obiekty i przesuwa <code>origin/main</code></td><td>✅ <b>Nietknięty!</b> (100% bezpieczne)</td></tr>
              <tr id="m05s02-r2"><td><code>git pull</code></td><td>Wykonuje <code>git fetch</code></td><td>⚠️ Od razu łączy (<code>git merge</code> lub <code>rebase</code>) z dyskiem</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Dwuetapowa synchronizacja (Fetch + Merge)",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m05s02-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">fetch</span> <span class="ps-p">origin</span> <span class="ps-cm"># Pobierz obiekty z serwera i przesuń origin/main</span></span>
              <span class="laser-tag">▶ 1. FETCH</span>
            </div>
            <div class="code-line" id="m05s02-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">merge</span> <span class="ps-p">origin/main</span> <span class="ps-cm"># Dopiero po inspekcji zaktualizuj swój katalog roboczy</span></span>
              <span class="laser-tag">▶ 2. MERGE</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m05_s02_b01",
          card: "fetchpull",
          focusRow: "m05s02-r1",
          flashBox: "boxHead",
          inspectorTab: "objects",
          voiceText: "Początkujący często boją się polecenia git fetch, sądząc że nadpisze ono ich pliki na dysku. Tymczasem git fetch pobiera wyłącznie brakujące obiekty do .git/objects i aktualizuje wskaźnik origin/main."
        },
        {
          audioId: "m05_s02_b02",
          card: "fetchpull",
          focusRow: "m05s02-r2",
          flashBox: "boxWork",
          inspectorTab: "head",
          voiceText: "Dopiero polecenie git pull, będące skrótem dla git fetch oraz git merge, dotyka Twojego katalogu roboczego. Dzieląc ten proces na fetch i merge, masz pełną kontrolę nad tym, co wchodzi do Twojego kodu."
        },
        {
          audioId: "m05_s02_b03",
          card: "cli",
          focusLine: "m05s02-l1",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Wykonaj git fetch origin, zobacz nowe rewizje w logu, a następnie połącz je ze swoją gałęzią poleceniem git merge origin/main."
        }
      ],
      assertions: [
        {
          label: "1. Pobrano dane ze zdalnego repozytorium (git fetch origin)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git fetch"))
        },
        {
          label: "2. Sprawdzono nowe rewizje w dzienniku (git log --oneline)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git log"))
        },
        {
          label: "3. Zaktualizowano lokalną gałąź main do commita e202b00 (git merge origin/main)",
          check: (vfs) => vfs.headCommit.id === "e202b00"
        }
      ]
    },

    {
      id: "m05_s03",
      tier: "basic",
      title: "5.3 Publikacja gałęzi roboczej: git push -u origin feature-api",
      heading: "Co dokładnie zapisuje flaga -u (--set-upstream) w pliku .git/config?",
      badge: "🛠️ Zadanie",
      primaryFile: "api.py",
      hint: "Kliknij kolejno: git switch -c feature-api, a następnie git push -u origin feature-api",
      guidedCommands: [
        "git switch -c feature-api",
        "git push -u origin feature-api"
      ],
      taskTitle: "Utwórz nową gałąź feature-api i opublikuj ją na serwerze z ustawieniem śledzenia (-u)",
      initialRepo: {
        repoName: "remote-sync",
        branch: "main",
        remotes: {
          origin: "https://github.com/dev-user/remote-sync.git"
        },
        branches: {
          main: "e202b00",
          "origin/main": "e202b00"
        },
        headCommit: {
          id: "e202b00",
          msg: "Add API endpoint stub",
          files: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" }
        },
        commits: [
          { id: "e202b00", msg: "Add API endpoint stub", files: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" } }
        ],
        index: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" },
        worktree: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" }
      },
      cards: [
        {
          id: "upstream",
          title: "🚀 1. Powiązanie gałęzi lokalnej ze zdalną (--set-upstream)",
          html: `<table class="tech-table">
            <thead><tr><th>Polecenie / Wpis w .git/config</th><th>Skutek działania</th></tr></thead>
            <tbody>
              <tr id="m05s03-r1" class="row-focus"><td><code>git push -u origin feature-api</code></td><td>Wysyła obiekty na serwer i tworzy powiązanie śledzące (Upstream)</td></tr>
              <tr id="m05s03-r2"><td><code>branch.feature-api.remote = origin</code></td><td>Od tej chwili zwykłe <code>git push</code> i <code>git status</code> wiedzą, z którą gałęzią rozmawiać</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Publikacja nowej gałęzi na GitHubie",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m05s03-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">switch</span> <span class="ps-f">-c</span> <span class="ps-p">feature-api</span> <span class="ps-cm"># Utwórz lokalną gałąź tematyczną</span></span>
              <span class="laser-tag">▶ 1. SWITCH -C</span>
            </div>
            <div class="code-line" id="m05s03-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">push</span> <span class="ps-f">-u</span> <span class="ps-p">origin feature-api</span> <span class="ps-cm"># Opublikuj i zapisz upstream w .git/config</span></span>
              <span class="laser-tag">▶ 2. PUSH -U</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m05_s03_b01",
          card: "upstream",
          focusRow: "m05s03-r1",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Gdy tworzysz nową gałąź poleceniem git switch -c feature-api, istnieje ona wyłącznie na Twoim komputerze. Serwer GitHub nic o niej jeszcze nie wie."
        },
        {
          audioId: "m05_s03_b02",
          card: "upstream",
          focusRow: "m05s03-r2",
          flashBox: "boxHead",
          inspectorTab: "config",
          voiceText: "Dodając flagę -u podczas pierwszego git push, prosisz Gita o dopisanie w pliku .git/config sekcji wiążącej lokalną gałąź feature-api ze zdalnym odpowiednikiem origin/feature-api."
        },
        {
          audioId: "m05_s03_b03",
          card: "cli",
          focusLine: "m05s03-l2",
          flashBox: "boxHead",
          inspectorTab: "config",
          voiceText: "Utwórz gałąź feature-api i wypchnij ją z flagą -u, obserwując w Inspektorze .git/ na karcie config pojawiające się wpisy śledzenia."
        }
      ],
      assertions: [
        {
          label: "1. Przełączono na gałąź feature-api",
          check: (vfs) => vfs.branch === "feature-api"
        },
        {
          label: "2. Wypchnięto gałąź z ustawieniem upstream (git push -u origin feature-api)",
          check: (vfs) => vfs.config["branch.feature-api.remote"] === "origin" && Boolean(vfs.branches["origin/feature-api"])
        }
      ]
    },

    {
      id: "m05_s04",
      tier: "basic",
      title: "5.4 GitHub Flow (Pull Request) i wersjonowanie wydań (git tag -a)",
      heading: "Jak oznaczyć stabilne wydanie produkcyjne po scaleniu Pull Requesta?",
      badge: "🛠️ Zadanie",
      primaryFile: "api.py",
      hint: "Kliknij kolejno: git tag -a v1.0.0 -m \"First stable release\", a następnie git tag -l",
      guidedCommands: [
        "git tag -a v1.0.0 -m \"First stable release\"",
        "git tag -l"
      ],
      taskTitle: "Utwórz opisowy tag wydania v1.0.0 na gałęzi main i zweryfikuj listę tagów",
      initialRepo: {
        repoName: "remote-sync",
        branch: "main",
        remotes: {
          origin: "https://github.com/dev-user/remote-sync.git"
        },
        branches: {
          main: "e303c00",
          "origin/main": "e303c00"
        },
        headCommit: {
          id: "e303c00",
          msg: "Merge pull request #1 from dev-user/feature-api",
          parent: "e202b00",
          files: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" }
        },
        commits: [
          { id: "e303c00", msg: "Merge pull request #1 from dev-user/feature-api", parent: "e202b00", files: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" } }
        ],
        index: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" },
        worktree: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" }
      },
      cards: [
        {
          id: "ghflow",
          title: "🏷️ 1. GitHub Flow i Tagi w .git/refs/tags/",
          html: `<table class="tech-table">
            <thead><tr><th>Element</th><th>Rola w cyklu wydawniczym</th></tr></thead>
            <tbody>
              <tr id="m05s04-r1" class="row-focus"><td><b>Pull Request (PR)</b></td><td>Dyskusja, automatyczne testy CI/CD oraz Code Review przed wejściem kodu do <code>main</code></td></tr>
              <tr id="m05s04-r2"><td><code>git tag -a v1.0.0 -m "..."</code></td><td>Nieruchoma etykieta (Annotated Tag) w <code>.git/refs/tags/v1.0.0</code> oznaczająca wersję wydania</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Tworzenie tagu wydania (Semantic Versioning)",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m05s04-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">tag</span> <span class="ps-f">-a</span> <span class="ps-p">v1.0.0</span> <span class="ps-f">-m</span> <span class="ps-s">"First stable release"</span> <span class="ps-cm"># Utwórz tag opisowy</span></span>
              <span class="laser-tag">▶ 1. TAG -A</span>
            </div>
            <div class="code-line" id="m05s04-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">tag</span> <span class="ps-f">-l</span> <span class="ps-cm"># Wyświetl wszystkie tagi w repozytorium</span></span>
              <span class="laser-tag">▶ 2. TAG -L</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m05_s04_b01",
          card: "ghflow",
          focusRow: "m05s04-r1",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "W metodyce GitHub Flow gałąź main jest zawsze stabilna. Nowe funkcje trafiają na nią przez Pull Request po przejściu automatycznych testów i przeglądu kodu przez zespół."
        },
        {
          audioId: "m05_s04_b02",
          card: "ghflow",
          focusRow: "m05s04-r2",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "W przeciwieństwie do gałęzi, tag w katalogu .git/refs/tags nigdy nie przesuwa się wraz z kolejnymi commitami. Na zawsze wskazuje dokładnie tę wersję, którą wdrożono na produkcję."
        },
        {
          audioId: "m05_s04_b03",
          card: "cli",
          focusLine: "m05s04-l1",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Oznacz bieżący commit wydania tagiem v1.0.0 i sprawdź jego obecność w Inspektorze .git/."
        }
      ],
      assertions: [
        {
          label: "1. Utworzono tag v1.0.0 (git tag -a v1.0.0 ...)",
          check: (vfs) => vfs.tags["v1.0.0"] === "e303c00"
        },
        {
          label: "2. Wyświetlono listę tagów (git tag -l)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("git tag -l"))
        }
      ]
    },

    // =========================================================================
    // POZIOM ROZSZERZONY (EXTENDED) — 3 kroki
    // =========================================================================
    {
      id: "m05_s05",
      tier: "extended",
      title: "5.5 Odrzucony push (non-fast-forward) i git pull --rebase",
      heading: "Co zrobić, gdy ktoś inny wypchnął commity na serwer przed Tobą?",
      badge: "🔵 Rozszerzony",
      primaryFile: "README.md",
      hint: "Kliknij kolejno: git pull --rebase origin main, a następnie git push origin main",
      guidedCommands: [
        "git pull --rebase origin main",
        "git push origin main"
      ],
      taskTitle: "Zsynchronizuj rozwidloną historię bez zbędnego merge-commita przez git pull --rebase i wypchnij zmiany",
      initialRepo: {
        repoName: "remote-sync",
        branch: "main",
        remotes: {
          origin: "https://github.com/dev-user/remote-sync.git"
        },
        branches: {
          main: "e404d00",
          "origin/main": "e505e00"
        },
        headCommit: {
          id: "e404d00",
          msg: "Local docs improvement",
          parent: "e303c00",
          files: { "README.md": "# GitBook Remote Lab\nLocal docs\n", "api.py": "def status():\n    return 200\n" }
        },
        commits: [
          { id: "e505e00", msg: "Remote hotfix on main", parent: "e303c00", files: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 201\n" } },
          { id: "e404d00", msg: "Local docs improvement", parent: "e303c00", files: { "README.md": "# GitBook Remote Lab\nLocal docs\n", "api.py": "def status():\n    return 200\n" } }
        ],
        index: { "README.md": "# GitBook Remote Lab\nLocal docs\n", "api.py": "def status():\n    return 200\n" },
        worktree: { "README.md": "# GitBook Remote Lab\nLocal docs\n", "api.py": "def status():\n    return 200\n" }
      },
      cards: [
        {
          id: "nonff",
          title: "🛑 1. Dlaczego serwer odrzuca git push błędem non-fast-forward?",
          html: `<table class="tech-table">
            <thead><tr><th>Zjawisko</th><th>Wyjaśnienie techniczne</th></tr></thead>
            <tbody>
              <tr id="m05s05-r1" class="row-focus"><td><code>! [rejected] main -> main (non-fast-forward)</code></td><td>Na serwerze (<code>origin/main</code>) pojawił się commit, którego nie ma w Twojej lokalnej historii</td></tr>
              <tr id="m05s05-r2"><td><code>git pull --rebase origin main</code></td><td>Pobiera zmiany z serwera i układa Twoje lokalne commity na samym czubku zdalnej historii</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Liniowa synchronizacja i publikacja",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m05s05-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">pull</span> <span class="ps-f">--rebase</span> <span class="ps-p">origin main</span> <span class="ps-cm"># Ułóż lokalne zmiany na czubku origin/main</span></span>
              <span class="laser-tag">▶ 1. PULL --REBASE</span>
            </div>
            <div class="code-line" id="m05s05-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">push</span> <span class="ps-p">origin main</span> <span class="ps-cm"># Teraz push jest czystym Fast-Forward!</span></span>
              <span class="laser-tag">▶ 2. PUSH</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m05_s05_b01",
          card: "nonff",
          focusRow: "m05s05-r1",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Gdy próbujesz wypchnąć zmiany, a w międzyczasie kolega z zespołu zaktualizował gałąź na serwerze, GitHub odrzuci operację komunikatem non-fast-forward, chroniąc cudzą pracę przed nadpisaniem."
        },
        {
          audioId: "m05_s05_b02",
          card: "nonff",
          focusRow: "m05s05-r2",
          flashBox: "boxHead",
          inspectorTab: "objects",
          voiceText: "Zamiast zaśmiecać historię przypadkowymi commitami scalającymi, profesjonaliści używają git pull --rebase. Git pobiera zdalne zmiany i przepisuje Twój lokalny commit na ich szczyt."
        },
        {
          audioId: "m05_s05_b03",
          card: "cli",
          focusLine: "m05s05-l1",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Wykonaj git pull --rebase origin main, a następnie wypchnij czystą, liniową historię poleceniem git push origin main."
        }
      ],
      assertions: [
        {
          label: "1. Zsynchronizowano gałąź z przebazowaniem (git pull --rebase origin main)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("git pull --rebase"))
        },
        {
          label: "2. Wypchnięto zmiany na serwer (git push origin main)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git push"))
        }
      ]
    },

    {
      id: "m05_s06",
      tier: "extended",
      title: "5.6 Bezpieczne nadpisywanie: git push --force-with-lease vs --force",
      heading: "Jak zaktualizować własną gałąź Pull Requesta po rebase bez ryzyka skasowania cudzych commitów?",
      badge: "🔵 Rozszerzony",
      primaryFile: "api.py",
      hint: "Kliknij: git push --force-with-lease origin feature-api",
      guidedCommands: [
        "git push --force-with-lease origin feature-api"
      ],
      taskTitle: "Zaktualizuj zdalną gałąź feature-api po lokalnym rebase za pomocą bezpiecznej flagi --force-with-lease",
      initialRepo: {
        repoName: "remote-sync",
        branch: "feature-api",
        remotes: {
          origin: "https://github.com/dev-user/remote-sync.git"
        },
        branches: {
          main: "e505e00",
          "feature-api": "f707a11",
          "origin/feature-api": "f606old"
        },
        headCommit: {
          id: "f707a11",
          msg: "Rebased feature-api onto latest main",
          parent: "e505e00",
          files: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" }
        },
        commits: [
          { id: "f707a11", msg: "Rebased feature-api onto latest main", parent: "e505e00", files: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" } }
        ],
        index: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" },
        worktree: { "README.md": "# GitBook Remote Lab\n", "api.py": "def status():\n    return 200\n" }
      },
      cards: [
        {
          id: "lease",
          title: "🔒 1. Dlaczego --force jest groźne, a --force-with-lease bezpieczne?",
          html: `<table class="tech-table">
            <thead><tr><th>Flaga git push</th><th>Mechanizm sprawdzania na serwerze</th></tr></thead>
            <tbody>
              <tr id="m05s06-r1"><td><code>git push --force</code></td><td>❌ Ślepo nadpisuje gałąź na serwerze, nawet jeśli ktoś przed chwilą dopisał tam commit</td></tr>
              <tr id="m05s06-r2" class="row-focus"><td><code>git push --force-with-lease</code></td><td>✅ Sprawdza, czy serwer nadal wskazuje dokładnie na znane Ci <code>origin/feature-api</code> (operacja Compare-And-Swap)</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Aktualizacja gałęzi po rebase",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m05s06-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">push</span> <span class="ps-f">--force-with-lease</span> <span class="ps-p">origin feature-api</span></span>
              <span class="laser-tag">▶ SAFE FORCE PUSH</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m05_s06_b01",
          card: "lease",
          focusRow: "m05s06-r1",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Gdy wykonasz rebase swojej gałęzi roboczej lub poprawisz commit przez amend, jej historia ma nowe identyfikatory SHA-1. Zwykły push zostanie odrzucony, ale użycie brutalnego --force może przypadkowo skasować poprawki dopisane przez współpracownika."
        },
        {
          audioId: "m05_s06_b02",
          card: "lease",
          focusRow: "m05s06-r2",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Flaga --force-with-lease działa jak blokada optymistyczna: pozwala nadpisać zdalną gałąź tylko wtedy, gdy na serwerze nie pojawił się żaden nieznany Ci commit od czasu Twojego ostatniego fetcha."
        }
      ],
      assertions: [
        {
          label: "1. Bezpiecznie zaktualizowano zdalną gałąź (git push --force-with-lease origin feature-api)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("--force-with-lease")) && vfs.branches["origin/feature-api"] === "f707a11"
        }
      ]
    },

    {
      id: "m05_s07",
      tier: "extended",
      title: "5.7 Architektura Open Source: Fork, origin vs upstream",
      heading: "Jak synchronizować własnego forka (origin) z oficjalnym projektem (upstream)?",
      badge: "🔵 Rozszerzony",
      primaryFile: "README.md",
      hint: "Kliknij kolejno: git remote add upstream https://github.com/org/project.git, git fetch upstream oraz git remote -v",
      guidedCommands: [
        "git remote add upstream https://github.com/org/project.git",
        "git fetch upstream",
        "git remote -v"
      ],
      taskTitle: "Dodaj oficjalne repozytorium jako zdalny serwer upstream i pobierz z niego najnowsze obiekty",
      initialRepo: {
        repoName: "oss-fork",
        branch: "main",
        remotes: {
          origin: "https://github.com/dev-user/project.git"
        },
        branches: {
          main: "e505e00",
          "origin/main": "e505e00"
        },
        headCommit: {
          id: "e505e00",
          msg: "Forked initial state",
          files: { "README.md": "# Open Source Project\n" }
        },
        commits: [
          { id: "u909f00", msg: "Official upstream security patch", parent: "e505e00", files: { "README.md": "# Open Source Project (Patched)\n" } },
          { id: "e505e00", msg: "Forked initial state", files: { "README.md": "# Open Source Project\n" } }
        ],
        index: { "README.md": "# Open Source Project\n" },
        worktree: { "README.md": "# Open Source Project\n" }
      },
      cards: [
        {
          id: "fork",
          title: "🌍 1. Trójkąt współpracy w Open Source (Lokalne ↔ Origin ↔ Upstream)",
          html: `<table class="tech-table">
            <thead><tr><th>Alias zdalny</th><th>Do kogo należy?</th><th>Uprawnienia</th></tr></thead>
            <tbody>
              <tr id="m05s07-r1" class="row-focus"><td><code>origin</code></td><td>Twój prywatny <b>Fork</b> na GitHubie</td><td>Pełny odczyt i zapis (<code>fetch</code> + <code>push</code>)</td></tr>
              <tr id="m05s07-r2"><td><code>upstream</code></td><td>Oficjalne repozytorium projektu</td><td>Pobieranie oficjalnych aktualizacji (<code>git fetch upstream</code>)</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Konfiguracja połączenia z upstream",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m05s07-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">remote</span> <span class="ps-p">add upstream https://github.com/org/project.git</span></span>
              <span class="laser-tag">▶ 1. ADD UPSTREAM</span>
            </div>
            <div class="code-line" id="m05s07-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">fetch</span> <span class="ps-p">upstream</span> <span class="ps-cm"># Pobierz commity z oficjalnego repozytorium do upstream/main</span></span>
              <span class="laser-tag">▶ 2. FETCH UPSTREAM</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m05_s07_b01",
          card: "fork",
          focusRow: "m05s07-r1",
          flashBox: "boxHead",
          inspectorTab: "config",
          voiceText: "W projektach Open Source nie masz uprawnień do bezpośredniego zapisu w głównym repozytorium. Tworzysz więc na GitHubie własną kopię zwaną Forkiem, która po sklonowaniu nosi nazwę origin."
        },
        {
          audioId: "m05_s07_b02",
          card: "fork",
          focusRow: "m05s07-r2",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Aby Twój fork nie zestarzał się względem oryginału, dodajesz drugie połączenie zdalne o nazwie upstream, wskazujące na oficjalne repozytorium projektu."
        },
        {
          audioId: "m05_s07_b03",
          card: "cli",
          focusLine: "m05s07-l1",
          flashBox: "boxHead",
          inspectorTab: "config",
          voiceText: "Dodaj zdalne repozytorium upstream, pobierz z niego aktualizacje poleceniem git fetch upstream i sprawdź w Inspektorze pojawienie się wskaźnika upstream/main."
        }
      ],
      assertions: [
        {
          label: "1. Dodano zdalne repozytorium upstream (git remote add upstream ...)",
          check: (vfs) => Boolean(vfs.remotes.upstream)
        },
        {
          label: "2. Pobrano wskaźnik upstream/main (git fetch upstream)",
          check: (vfs) => Boolean(vfs.branches["upstream/main"])
        },
        {
          label: "3. Zweryfikowano skonfigurowane serwery (git remote -v)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git remote -v"))
        }
      ]
    },

    // =========================================================================
    // POZIOM ZAAWANSOWANY (ADVANCED) — 1 krok
    // =========================================================================
    {
      id: "m05_s08",
      tier: "advanced",
      title: "5.8 Anatomia refspec w .git/config i pobieranie Pull Requestów (refs/pull/*/head)",
      heading: "Jak przetestować cudzy Pull Request lokalnie jedną komendą bez dodawania jego forka?",
      badge: "🟣 Zaawansowany",
      primaryFile: "api.py",
      hint: "Kliknij kolejno: git fetch origin pull/42/head:pr-42, a następnie git switch pr-42",
      guidedCommands: [
        "git fetch origin pull/42/head:pr-42",
        "git switch pr-42"
      ],
      taskTitle: "Użyj niestandardowego refspeca, aby pobrać Pull Request #42 bezpośrednio do lokalnej gałęzi pr-42 i przełącz się na nią",
      initialRepo: {
        repoName: "oss-fork",
        branch: "main",
        remotes: {
          origin: "https://github.com/org/project.git"
        },
        branches: {
          main: "u909f00",
          "origin/main": "u909f00"
        },
        headCommit: {
          id: "u909f00",
          msg: "Official upstream security patch",
          files: { "README.md": "# Open Source Project\n", "api.py": "def status():\n    return 200\n" }
        },
        commits: [
          { id: "u909f00", msg: "Official upstream security patch", files: { "README.md": "# Open Source Project\n", "api.py": "def status():\n    return 200\n" } }
        ],
        index: { "README.md": "# Open Source Project\n", "api.py": "def status():\n    return 200\n" },
        worktree: { "README.md": "# Open Source Project\n", "api.py": "def status():\n    return 200\n" }
      },
      cards: [
        {
          id: "refspec",
          title: "🔬 1. Jak działa mapowanie refspec (+<src>:<dst>) w .git/config?",
          html: `<table class="tech-table">
            <thead><tr><th>Wzór refspec</th><th>Źródło na serwerze (src)</th><th>Cel na Twoim dysku (dst)</th></tr></thead>
            <tbody>
              <tr id="m05s08-r1" class="row-focus"><td><code>+refs/heads/*:refs/remotes/origin/*</code></td><td>Wszystkie gałęzie na serwerze</td><td>Lokalna przestrzeń <code>.git/refs/remotes/origin/*</code></td></tr>
              <tr id="m05s08-r2"><td><code>pull/42/head:pr-42</code></td><td>Ukryta referencja PR #42 na GitHubie (<code>refs/pull/42/head</code>)</td><td>Nowa lokalna gałąź <code>refs/heads/pr-42</code> gotowa do testów</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Pobieranie Pull Requesta przez niestandardowy refspec",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m05s08-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">fetch</span> <span class="ps-p">origin pull/42/head:pr-42</span> <span class="ps-cm"># Pobierz PR #42 bezpośrednio do gałęzi pr-42</span></span>
              <span class="laser-tag">▶ 1. FETCH REFSPEC</span>
            </div>
            <div class="code-line" id="m05s08-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">switch</span> <span class="ps-p">pr-42</span> <span class="ps-cm"># Przełącz się na pobrany Pull Request</span></span>
              <span class="laser-tag">▶ 2. SWITCH PR-42</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m05_s08_b01",
          card: "refspec",
          focusRow: "m05s08-r1",
          flashBox: "boxHead",
          inspectorTab: "config",
          voiceText: "Zajrzyj na kartę config w Inspektorze .git/. Wpis fetch = +refs/heads/*:refs/remotes/origin/* nazywa się refspec. To on tłumaczy Gitowi, że gałęzie z serwera mają lądować w odizolowanym katalogu refs/remotes/origin."
        },
        {
          audioId: "m05_s08_b02",
          card: "refspec",
          focusRow: "m05s08-r2",
          flashBox: "boxHead",
          inspectorTab: "head",
          voiceText: "Znając składnię źródło dwukropek cel, możesz w locie pobierać specjalne referencje serwera GitHub, takie jak refs/pull/42/head, bezpośrednio do lokalnej gałęzi pr-42 bez dodawania cudzego forka."
        }
      ],
      assertions: [
        {
          label: "1. Pobrano Pull Request #42 do lokalnej gałęzi pr-42 (git fetch origin pull/42/head:pr-42)",
          check: (vfs) => Boolean(vfs.branches["pr-42"])
        },
        {
          label: "2. Przełączono na gałąź pr-42 (git switch pr-42)",
          check: (vfs) => vfs.branch === "pr-42"
        }
      ]
    }
  ]
});
