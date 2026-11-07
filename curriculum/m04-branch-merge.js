window.CURRICULUM.push({
  id: "m04",
  title: "Moduł 04: Praca na Gałęziach, Merge, Rebase i Konflikty",
  steps: [
    {
      id: "m04_s01",
      tier: "basic",
      title: "4.1 Czym naprawdę jest gałąź? (git switch -c feature)",
      heading: "Dlaczego utworzenie nowej gałęzi w Gicie trwa ułamek milisekundy i nie kopiuje plików?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: git switch -c feature, a następnie: git branch -v",
      guidedCommands: ["git switch -c feature", "git branch -v"],
      taskTitle: "Utwórz i przełącz się na nową gałąź feature (git switch -c feature) oraz sprawdź listę gałęzi (git branch -v)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "d101a00",
          msg: "C1: Inicjalizacja app.py v1.0",
          files: { "app.py": "def main():\n    print('v1.0')\n" }
        },
        commits: [
          { id: "d101a00", msg: "C1: Inicjalizacja app.py v1.0", files: { "app.py": "def main():\n    print('v1.0')\n" } }
        ],
        branches: { "main": "d101a00" },
        index: { "app.py": "def main():\n    print('v1.0')\n" },
        worktree: { "app.py": "def main():\n    print('v1.0')\n" }
      },
      cards: [
        {
          id: "branch_anatomy",
          title: "🌿 1. Gałąź to 41-bajtowy plik ze skrótem SHA-1!",
          html: `<p>W wielu starych systemach utworzenie gałęzi oznaczało kopiowanie całego katalogu projektu na serwerze. W Gicie gałąź to po prostu <b>40-znakowy skrót SHA-1 commita</b> zapisany w pliku <code>.git/refs/heads/&lt;nazwa&gt;</code>:</p>
          <table class="tech-table">
            <thead><tr><th>Polecenie</th><th>Co robi w katalogu <code>.git/</code>?</th></tr></thead>
            <tbody>
              <tr id="m04s01-r1" class="row-focus"><td><code>git branch feature</code></td><td>Tworzy plik <code>.git/refs/heads/feature</code> z hashem bieżącego commita (nie przełącza <code>HEAD</code>)</td></tr>
              <tr id="m04s01-r2"><td><code>git switch feature</code></td><td>Przestawia <code>.git/HEAD</code> na <code>ref: refs/heads/feature</code> i aktualizuje pliki</td></tr>
              <tr id="m04s01-r3"><td><code>git switch -c feature</code></td><td>Tworzy gałąź <code>feature</code> i od razu na nią przełącza!</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Tworzenie i inspekcja gałęzi",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m04s01-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">switch</span> <span class="ps-f">-c</span> <span class="ps-s">feature</span> <span class="ps-cm"># Tworzy gałąź feature i przepina HEAD</span></span>
              <span class="laser-tag">▶ NOWA GAŁĄŹ</span>
            </div>
            <div class="code-line" id="m04s01-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">branch</span> <span class="ps-f">-v</span> <span class="ps-cm"># Pokazuje wszystkie lokalne gałęzie (z gwiazdką przy aktywnej)</span></span>
              <span class="laser-tag">▶ LISTA GAŁĘZI</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m04_s01_b01",
          card: "branch_anatomy",
          focusRow: "m04s01-r3",
          inspectorTab: "git",
          flashBox: "boxHead",
          voiceText: "W Module Czwartym przechodzimy do pracy wielotorowej. Utworzenie nowej gałęzi w Gicie nie kopiuje żadnych plików roboczych — Git jedynie zapisuje czterdziestoznakowy identyfikator bieżącego commita do nowego pliku w katalogu .git/refs/heads."
        },
        {
          audioId: "m04_s01_b02",
          card: "cli",
          focusLine: "m04s01-l1",
          inspectorTab: "git",
          flashBox: "boxHead",
          voiceText: "Wykonaj w terminalu git switch -c feature, a następnie sprawdź listę gałęzi poleceniem git branch -v."
        }
      ],
      assertions: [
        {
          label: "1. Utworzono i przełączono na gałąź feature (git switch -c feature)",
          check: (vfs) => vfs.branch === "feature" && vfs.branches["feature"] !== undefined
        },
        {
          label: "2. Wyświetlono listę gałęzi (git branch -v)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git branch"))
        }
      ]
    },
    {
      id: "m04_s02",
      tier: "basic",
      title: "4.2 Łączenie Fast-Forward (git merge feature)",
      heading: "Szybkie przewinięcie wskaźnika: Kiedy złączenie gałęzi nie tworzy nowego commita?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: git merge feature, a następnie: git log --oneline",
      guidedCommands: ["git merge feature", "git log --oneline"],
      taskTitle: "Połącz gałąź feature z gałęzią main w trybie Fast-Forward (git merge feature)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "d101a00",
          msg: "C1: Inicjalizacja app.py v1.0",
          files: { "app.py": "def main():\n    print('v1.0')\n" }
        },
        commits: [
          {
            id: "f202b00",
            msg: "C2: Nowa funkcja autoryzacji (feature)",
            parent: "d101a00",
            files: { "app.py": "def main():\n    print('v1.0 + Auth')\n" }
          },
          {
            id: "d101a00",
            msg: "C1: Inicjalizacja app.py v1.0",
            files: { "app.py": "def main():\n    print('v1.0')\n" }
          }
        ],
        branches: {
          "main": "d101a00",
          "feature": "f202b00"
        },
        index: { "app.py": "def main():\n    print('v1.0')\n" },
        worktree: { "app.py": "def main():\n    print('v1.0')\n" }
      },
      cards: [
        {
          id: "ff_theory",
          title: "⏩ 1. Mechanizm Fast-Forward (Szybkie przewinięcie)",
          html: `<p>Na gałęzi <code>feature</code> powstał nowy commit <code>f202b00</code>, podczas gdy gałąź <code>main</code> została na swoim miejscu (<code>d101a00</code>). Ponieważ <code>main</code> jest bezpośrednim przodkiem <code>feature</code>, Git nie musi tworzyć nowego commita — po prostu przesuwa wskaźnik <code>main</code> do przodu:</p>
          <table class="tech-table">
            <thead><tr><th>Stan</th><th>Wskaźnik <code>main</code></th><th>Wskaźnik <code>feature</code></th><th>Liczba rodziców</th></tr></thead>
            <tbody>
              <tr id="m04s02-r1"><td>Przed <code>git merge feature</code></td><td><code>d101a00</code> (C1)</td><td><code>f202b00</code> (C2)</td><td>1 rodzic</td></tr>
              <tr id="m04s02-r2" class="row-focus"><td>Po <code>git merge feature</code></td><td><b><code>f202b00</code> (C2)</b></td><td><code>f202b00</code> (C2)</td><td><b>Nadal 1 rodzic!</b> (Brak Merge Commita)</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Wykonanie złączenia Fast-Forward",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m04s02-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">merge</span> <span class="ps-s">feature</span> <span class="ps-cm"># Przesuwa main z d101a00 na f202b00 (Fast-forward)</span></span>
              <span class="laser-tag">▶ MERGE FF</span>
            </div>
            <div class="code-line" id="m04s02-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">log</span> <span class="ps-f">--oneline</span> <span class="ps-cm"># Historia pozostaje idealnie płaska i liniowa</span></span>
              <span class="laser-tag">▶ LOG</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m04_s02_b01",
          card: "ff_theory",
          focusRow: "m04s02-r2",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Stoimy na gałęzi main, która wskazuje na commit d101a00, a gałąź feature posunęła się o jeden commit do przodu na f202b00. Ponieważ historia się nie rozwidliła, Git wykona szybkie przewinięcie wskaźnika, czyli Fast-Forward."
        },
        {
          audioId: "m04_s02_b02",
          card: "cli",
          focusLine: "m04s02-l1",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Wykonaj git merge feature oraz git log --oneline. Zobaczysz w Inspektorze, że main wskazuje teraz bezpośrednio na f202b00."
        }
      ],
      assertions: [
        {
          label: "1. Przewinięto gałąź main do f202b00 (git merge feature)",
          check: (vfs) => vfs.headCommit.id === "f202b00" && (vfs.worktree["app.py"] || "").includes("Auth")
        },
        {
          label: "2. Sprawdzono liniową historię (git log --oneline)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git log"))
        }
      ]
    },
    {
      id: "m04_s03",
      tier: "basic",
      title: "4.3 Łączenie 3-Way Merge i powstanie Merge Commita",
      heading: "Co robi Git, gdy obie gałęzie rozeszły się w różnych kierunkach (diverged history)?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: git merge feature, a następnie: git cat-file -p HEAD",
      guidedCommands: ["git merge feature", "git cat-file -p HEAD"],
      taskTitle: "Połącz rozwidloną gałąź feature z main (git merge feature) i sprawdź dwa wpisy parent w nowym Merge Commicie (git cat-file -p HEAD)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "m303c00",
          msg: "M2: Poprawka bezpieczeństwa na main",
          parent: "d101a00",
          files: {
            "app.py": "def main():\n    print('v1.1 Security Patch')\n",
            "security.txt": "TLS=1.3\n"
          }
        },
        commits: [
          {
            id: "m303c00",
            msg: "M2: Poprawka bezpieczeństwa na main",
            parent: "d101a00",
            files: { "app.py": "def main():\n    print('v1.1 Security Patch')\n", "security.txt": "TLS=1.3\n" }
          },
          {
            id: "f202b00",
            msg: "F2: Moduł raportów na feature",
            parent: "d101a00",
            files: { "app.py": "def main():\n    print('v1.1 Security Patch')\n", "reports.py": "def report(): pass\n" }
          },
          {
            id: "d101a00",
            msg: "C1: Wspólny przodek (Merge Base)",
            files: { "app.py": "def main():\n    print('v1.0')\n" }
          }
        ],
        branches: {
          "main": "m303c00",
          "feature": "f202b00"
        },
        index: { "app.py": "def main():\n    print('v1.1 Security Patch')\n", "security.txt": "TLS=1.3\n" },
        worktree: { "app.py": "def main():\n    print('v1.1 Security Patch')\n", "security.txt": "TLS=1.3\n" }
      },
      cards: [
        {
          id: "three_way",
          title: "🔀 1. Algorytm trójstronnego łączenia (3-Way Merge)",
          html: `<p>Gdy zarówno na <code>main</code>, jak i na <code>feature</code> pojawiły się nowe commity, proste przewinięcie wskaźnika nie jest możliwe. Git znajduje <b>wspólnego przodka (Merge Base)</b> i zestawia ze sobą <b>3 migawki</b>:</p>
          <table class="tech-table">
            <thead><tr><th>Punkt odniesienia</th><th>Commit</th><th>Rola w 3-Way Merge</th></tr></thead>
            <tbody>
              <tr id="m04s03-r1"><td><b>1. Base (Przodek)</b></td><td><code>d101a00</code></td><td>Punkt wyjścia, od którego gałęzie się rozeszły</td></tr>
              <tr id="m04s03-r2"><td><b>2. Ours (HEAD)</b></td><td><code>m303c00</code></td><td>Nasza bieżąca gałąź <code>main</code> (Rodzic #1)</td></tr>
              <tr id="m04s03-r3" class="row-focus"><td><b>3. Theirs (Merge)</b></td><td><code>f202b00</code></td><td>Dołączana gałąź <code>feature</code> (Rodzic #2 w Merge Commicie!)</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Utworzenie i inspekcja Merge Commita",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m04s03-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">merge</span> <span class="ps-s">feature</span> <span class="ps-cm"># Tworzy nowy Merge Commit łączący zmiany z obu gałęzi</span></span>
              <span class="laser-tag">▶ 3-WAY MERGE</span>
            </div>
            <div class="code-line" id="m04s03-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">cat-file</span> <span class="ps-f">-p</span> <span class="ps-s">HEAD</span> <span class="ps-cm"># Zobaczysz dwa wiersze: parent m303c00 oraz parent f202b00!</span></span>
              <span class="laser-tag">▶ 2 RODZICÓW</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m04_s03_b01",
          card: "three_way",
          focusRow: "m04s03-r3",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "Kiedy obie gałęzie rozwinęły się niezależnie, Git porównuje trzy punkty: wspólnego przodka oraz oba końce gałęzi. Wynikiem jest nowy obiekt Merge Commit, który posiada w swoim nagłówku dwóch rodziców!"
        },
        {
          audioId: "m04_s03_b02",
          card: "cli",
          focusLine: "m04s03-l2",
          inspectorTab: "git",
          flashBox: "boxHead",
          voiceText: "Wykonaj git merge feature, a następnie podejrzyj utworzony commit poleceniem git cat-file -p HEAD, aby zobaczyć oba pola parent."
        }
      ],
      assertions: [
        {
          label: "1. Połączono rozwidlone gałęzie (git merge feature)",
          check: (vfs) => !!vfs.headCommit.parent2
        },
        {
          label: "2. Zweryfikowano dwa pola parent w Merge Commicie (git cat-file -p HEAD)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("cat-file -p HEAD"))
        }
      ]
    },
    {
      id: "m04_s04",
      tier: "basic",
      title: "4.4 Rozwiązywanie konfliktu złączenia (<<<<<<<, =======, >>>>>>>)",
      heading: "Co zrobić, gdy dwie gałęzie zmodyfikowały tę samą linię w tym samym pliku?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: echo \"PORT = 8080\" > app.py, następnie: git add app.py oraz: git commit -m \"Rozwiazanie konfliktu\"",
      guidedCommands: ["echo \"PORT = 8080\" > app.py", "git add app.py", "git commit -m \"Rozwiazanie konfliktu\""],
      taskTitle: "Usuń znaczniki konfliktu z pliku app.py, oznacz konflikt jako rozwiązany (git add app.py) i sfinalizuj merge (git commit)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        merging: true,
        headCommit: {
          id: "m303c00",
          msg: "Zmiana portu na 8080 (main)",
          files: { "app.py": "PORT = 8080\n" }
        },
        commits: [
          { id: "m303c00", msg: "Zmiana portu na 8080 (main)", files: { "app.py": "PORT = 8080\n" } }
        ],
        conflictStages: {
          "app.py": {
            "1": "PORT = 8000\n",
            "2": "PORT = 8080\n",
            "3": "PORT = 9090\n"
          }
        },
        index: { "app.py": "PORT = 8080\n" },
        worktree: {
          "app.py": "<<<<<<< HEAD\nPORT = 8080\n=======\nPORT = 9090\n>>>>>>> feature\n"
        }
      },
      cards: [
        {
          id: "markers",
          title: "⚔️ 1. Anatomia znaczników konfliktu w pliku roboczym",
          html: `<p>Gdy algorytm 3-Way Merge napotka sprzeczne zmiany w tej samej linii, zatrzymuje łączenie (status <code>UU app.py</code>) i wstawia do pliku na dysku znaczniki konfliktu:</p>
          <table class="tech-table">
            <thead><tr><th>Znacznik</th><th>Co oznacza?</th></tr></thead>
            <tbody>
              <tr id="m04s04-r1" class="row-focus"><td><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code></td><td>Początek Twojej wersji na bieżącej gałęzi (<code>PORT = 8080</code>)</td></tr>
              <tr id="m04s04-r2"><td><code>=======</code></td><td>Separator oddzielający obie wersje</td></tr>
              <tr id="m04s04-r3"><td><code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature</code></td><td>Koniec wersji przychodzącej z łączonej gałęzi (<code>PORT = 9090</code>)</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Trzy kroki rozwiązania konfliktu",
          html: `<p>Rozwiązanie konfliktu polega na wyborze docelowej treści (bez znaczników <code>&lt;&lt;&lt; === &gt;&gt;&gt;</code>), a następnie poinformowaniu Gita przez <code>git add</code>, że plik jest gotowy:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m04s04-l1">
              <span><span class="ps-c">echo</span> <span class="ps-s">"PORT = 8080"</span> &gt; <span class="ps-s">app.py</span> <span class="ps-cm"># 1. Zapisz czystą treść (lub użyj Edytora VFS)</span></span>
              <span class="laser-tag">▶ EDYCJA</span>
            </div>
            <div class="code-line" id="m04s04-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">add</span> <span class="ps-s">app.py</span> <span class="ps-cm"># 2. Oznacz konflikt jako rozwiązany w Indeksie!</span></span>
              <span class="laser-tag">▶ ROZWIĄŻ</span>
            </div>
            <div class="code-line" id="m04s04-l3">
              <span><span class="ps-c">git</span> <span class="ps-sub">commit</span> <span class="ps-f">-m</span> <span class="ps-s">"Rozwiazanie konfliktu"</span> <span class="ps-cm"># 3. Zapisz Merge Commit</span></span>
              <span class="laser-tag">▶ ZATWIERDŹ</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m04_s04_b01",
          card: "markers",
          focusRow: "m04s04-r1",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Spójrz na prawy boks Dysk w Inspektorze: plik app.py ma status UU, czyli Unmerged, i zawiera znaczniki konfliktu pokazujące wersję z HEAD oraz wersję z gałęzi feature."
        },
        {
          audioId: "m04_s04_b02",
          card: "cli",
          focusLine: "m04s04-l2",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Zapisz w pliku czystą docelową wersję bez znaczników konfliktu, wywołaj git add app.py, aby wyczyścić stan konfliktu w Indeksie, i zakończ łączenie poleceniem git commit."
        }
      ],
      assertions: [
        {
          label: "1. Usunięto znaczniki konfliktu (<<<<<<< / ======= / >>>>>>>) z pliku app.py",
          check: (vfs) => !(vfs.worktree["app.py"] || "").includes("<<<<<<<")
        },
        {
          label: "2. Oznaczono plik jako rozwiązany w Indeksie (git add app.py)",
          check: (vfs) => !vfs.conflictStages
        },
        {
          label: "3. Sfinalizowano złączenie nowym commitem (git commit)",
          check: (vfs) => !vfs.merging && vfs.commits.length >= 2
        }
      ]
    },
    {
      id: "m04_s05",
      tier: "extended",
      title: "4.5 Wymuszanie śladu gałęzi (git merge --no-ff) i git branch -d",
      heading: "Dlaczego zespoły często wyłączają Fast-Forward flagą --no-ff przy łączeniu funkcji?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: git merge --no-ff feature, a następnie: git branch -d feature",
      guidedCommands: ["git merge --no-ff feature", "git branch -d feature"],
      taskTitle: "Połącz gałąź feature wymuszając utworzenie Merge Commita (git merge --no-ff feature) i usuń złączoną gałąź (git branch -d feature)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "d101a00",
          msg: "C1: Wersja bazowa",
          files: { "app.py": "def main():\n    print('v1.0')\n" }
        },
        commits: [
          {
            id: "f202b00",
            msg: "C2: Funkcja płatności",
            parent: "d101a00",
            files: { "app.py": "def main():\n    print('v1.0 + Payments')\n" }
          },
          {
            id: "d101a00",
            msg: "C1: Wersja bazowa",
            files: { "app.py": "def main():\n    print('v1.0')\n" }
          }
        ],
        branches: {
          "main": "d101a00",
          "feature": "f202b00"
        },
        index: { "app.py": "def main():\n    print('v1.0')\n" },
        worktree: { "app.py": "def main():\n    print('v1.0')\n" }
      },
      cards: [
        {
          id: "noff",
          title: "📐 1. Po co wymuszać Merge Commit flagą --no-ff?",
          html: `<p>Mimo że możliwe jest szybkie przewinięcie (Fast-Forward), w profesjonalnych projektach często stosuje się <span class="cmd-pill">git merge --no-ff</span>, aby zachować w historii <b>wyraźną klamrę (łuk) gałęzi tematycznej</b> oraz móc wycofać całe zadanie jednym <code>git revert -m 1</code>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m04s05-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">merge</span> <span class="ps-f">--no-ff</span> <span class="ps-s">feature</span> <span class="ps-cm"># Tworzy jawny Merge Commit z 2 rodzicami</span></span>
              <span class="laser-tag">▶ NO-FF</span>
            </div>
            <div class="code-line" id="m04s05-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">branch</span> <span class="ps-f">-d</span> <span class="ps-s">feature</span> <span class="ps-cm"># Bezpiecznie usuwa wskaźnik złączonej gałęzi</span></span>
              <span class="laser-tag">▶ PORZĄDEK</span>
            </div>
          </div>`
        },
        {
          id: "del_branch",
          title: "🧹 2. Bezpieczne (-d) vs wymuszone (-D) usuwanie gałęzi",
          html: `<table class="tech-table">
            <thead><tr><th>Flaga</th><th>Działanie</th></tr></thead>
            <tbody>
              <tr id="m04s05-r1" class="row-focus"><td><code>git branch -d nazwa</code></td><td>Usuwa gałąź <b>tylko wtedy, gdy jest już złączona</b> (chroni przed utratą commitów!)</td></tr>
              <tr id="m04s05-r2"><td><code>git branch -D nazwa</code></td><td>Wymusza usunięcie nawet niezłączonej gałęzi</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m04_s05_b01",
          card: "noff",
          focusLine: "m04s05-l1",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "Flaga --no-ff wyłącza szybkie przewijanie i zawsze tworzy prawdziwy commit złączeniowy z dwoma rodzicami. Dzięki temu w grafie historii dokładnie widać, które commity wchodziły w skład danego zadania."
        },
        {
          audioId: "m04_s05_b02",
          card: "noff",
          focusLine: "m04s05-l2",
          inspectorTab: "git",
          flashBox: "boxHead",
          voiceText: "Po złączeniu gałęzi wykonaj git branch -d feature, aby posprzątać niepotrzebny już wskaźnik gałęzi bocznej."
        }
      ],
      assertions: [
        {
          label: "1. Wykonano złączenie z wymuszeniem Merge Commita (git merge --no-ff feature)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("merge") && c.includes("--no-ff"))
        },
        {
          label: "2. Usunięto złączoną gałąź boczną (git branch -d feature)",
          check: (vfs) => vfs.branches["feature"] === undefined
        }
      ]
    },
    {
      id: "m04_s06",
      tier: "extended",
      title: "4.6 Przebazowanie (git rebase main) i Złota Zasada Rebase",
      heading: "Jak uzyskać idealnie prostą, liniową historię przez przepisanie commitów na nowy czubek gałęzi main?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: git rebase main, a następnie: git log --oneline",
      guidedCommands: ["git rebase main", "git log --oneline"],
      taskTitle: "Przebazuj bieżącą gałąź feature na aktualny wierzchołek gałęzi main (git rebase main)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "feature",
        headCommit: {
          id: "f202b00",
          msg: "F2: Nowy ekran logowania",
          parent: "d101a00",
          files: { "app.py": "def main():\n    print('Login UI')\n" }
        },
        commits: [
          {
            id: "f202b00",
            msg: "F2: Nowy ekran logowania",
            parent: "d101a00",
            files: { "app.py": "def main():\n    print('Login UI')\n" }
          },
          {
            id: "m303c00",
            msg: "M2: Aktualizacja bibliotek na main",
            parent: "d101a00",
            files: { "app.py": "def main():\n    print('v1.1')\n", "deps.txt": "requests==2.32\n" }
          },
          {
            id: "d101a00",
            msg: "C1: Wspólny przodek",
            files: { "app.py": "def main():\n    print('v1.0')\n" }
          }
        ],
        branches: {
          "main": "m303c00",
          "feature": "f202b00"
        },
        index: { "app.py": "def main():\n    print('Login UI')\n" },
        worktree: { "app.py": "def main():\n    print('Login UI')\n" }
      },
      cards: [
        {
          id: "rebase_mech",
          title: "🧬 1. Jak działa git rebase pod maską?",
          html: `<p>Stojąc na gałęzi <code>feature</code>, wywołujemy <span class="cmd-pill">git rebase main</span>. Git bierze nasze commity z <code>feature</code>, odtwarza je jeden po drugim na nowym czubku gałęzi <code>main</code> (<code>m303c00</code>) jako <b>nowe obiekty commit o nowych skrótach SHA-1</b>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m04s06-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">rebase</span> <span class="ps-s">main</span> <span class="ps-cm"># Przepisuje F2 tak, by jego rodzicem stał się m303c00 (M2)!</span></span>
              <span class="laser-tag">▶ REBASE</span>
            </div>
            <div class="code-line" id="m04s06-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">log</span> <span class="ps-f">--oneline</span> <span class="ps-cm"># Historia wygląda tak, jakby feature powstało po M2</span></span>
              <span class="laser-tag">▶ LINIOWO</span>
            </div>
          </div>`
        },
        {
          id: "golden_rule",
          title: "⚠️ 2. Złota Zasada Rebase",
          html: `<table class="tech-table">
            <thead><tr><th>Zastosowanie</th><th>Czy wolno użyć <code>git rebase</code>?</th></tr></thead>
            <tbody>
              <tr id="m04s06-r1" class="row-focus"><td>Porządkowanie własnej lokalnej gałęzi przed utworzeniem PR</td><td>✅ <b>Tak!</b> Daje czystą, liniową historię bez zbędnych węzłów merge</td></tr>
              <tr id="m04s06-r2"><td>Przebazowanie publicznej gałęzi (np. <code>main</code>), na której pracują inni</td><td>❌ <b>NIGDY!</b> Tworzy duplikaty commitów o innych SHA-1 u całego zespołu</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m04_s06_b01",
          card: "rebase_mech",
          focusLine: "m04s06-l1",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "Przebazowanie, czyli git rebase main, przenosi punkt startowy Twojej gałęzi feature na aktualny czubek gałęzi main. Pod maską Git tworzy nowy obiekt commit o nowym skrócie SHA-1."
        },
        {
          audioId: "m04_s06_b02",
          card: "golden_rule",
          focusRow: "m04s06-r2",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Pamiętaj o Złotej Zasadzie Rebase: przebazowujemy wyłącznie swoje własne gałęzie robocze, nigdy wspólną gałąź publiczną! Wykonaj teraz git rebase main oraz git log --oneline."
        }
      ],
      assertions: [
        {
          label: "1. Przebazowano gałąź feature na wierzchołek main (git rebase main)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git rebase")) && vfs.headCommit.parent === "m303c00"
        },
        {
          label: "2. Zweryfikowano zaktualizowaną historię (git log --oneline)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git log"))
        }
      ]
    },
    {
      id: "m04_s07",
      tier: "extended",
      title: "4.7 Selektywne przenoszenie poprawki (git cherry-pick)",
      heading: "Jak skopiować pojedynczy commit z innej gałęzi bez łączenia całej gałęzi?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: git cherry-pick h777f00, a następnie: git log --oneline",
      guidedCommands: ["git cherry-pick h777f00", "git log --oneline"],
      taskTitle: "Przenieś pojedynczą poprawkę bezpieczeństwa h777f00 na gałąź main za pomocą git cherry-pick",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "d101a00",
          msg: "C1: Wersja produkcyjna 1.0",
          files: { "app.py": "def main():\n    print('v1.0')\n" }
        },
        commits: [
          {
            id: "d101a00",
            msg: "C1: Wersja produkcyjna 1.0",
            files: { "app.py": "def main():\n    print('v1.0')\n" }
          },
          {
            id: "h777f00",
            msg: "Hotfix: Łata podatności CVE-2026",
            files: { "app.py": "def main():\n    print('v1.0 + CVE Patch')\n", "patch.txt": "CVE-2026-OK\n" }
          }
        ],
        branches: {
          "main": "d101a00",
          "experimental": "h777f00"
        },
        index: { "app.py": "def main():\n    print('v1.0')\n" },
        worktree: { "app.py": "def main():\n    print('v1.0')\n" }
      },
      cards: [
        {
          id: "cherry",
          title: "🍒 1. Kiedy stosujemy git cherry-pick?",
          html: `<p>Na gałęzi eksperymentalnej powstał ważny commit <code>h777f00</code> z łatą bezpieczeństwa. Nie chcemy jeszcze łączyć całej gałęzi eksperymentalnej z produkcją — chcemy wyłuskać <b>tylko ten jeden commit</b> i nałożyć go na <code>main</code>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m04s07-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">cherry-pick</span> <span class="ps-s">h777f00</span> <span class="ps-cm"># Kopiuje zmianę z h777f00 jako nowy commit na main</span></span>
              <span class="laser-tag">▶ CHERRY-PICK</span>
            </div>
            <div class="code-line" id="m04s07-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">log</span> <span class="ps-f">--oneline</span> <span class="ps-cm"># Widać nowy commit z tym samym opisem, ale nowym SHA-1</span></span>
              <span class="laser-tag">▶ LOG</span>
            </div>
          </div>`
        },
        {
          id: "cherry_note",
          title: "💡 2. Dlaczego cherry-pick zmienia skrót SHA-1?",
          html: `<p>Chociaż treść łatki i opis są takie same jak w <code>h777f00</code>, nowy commit na gałęzi <code>main</code> ma <b>innego rodzica (<code>parent d101a00</code>) oraz nową datę utworzenia</b>, dlatego otrzymuje nowy identyfikator SHA-1.</p>`
        }
      ],
      beats: [
        {
          audioId: "m04_s07_b01",
          card: "cherry",
          focusLine: "m04s07-l1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Polecenie git cherry-pick pozwala wyłuskać pojedynczy commit z dowolnej innej gałęzi i zaaplikować jego zmiany na naszej bieżącej gałęzi."
        },
        {
          audioId: "m04_s07_b02",
          card: "cherry",
          focusLine: "m04s07-l2",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Wykonaj git cherry-pick h777f00 oraz sprawdź historię przez git log --oneline."
        }
      ],
      assertions: [
        {
          label: "1. Przeniesiono poprawkę h777f00 na bieżącą gałąź (git cherry-pick h777f00)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("cherry-pick")) && (vfs.worktree["app.py"] || "").includes("CVE Patch")
        },
        {
          label: "2. Sprawdzono historię po operacji (git log --oneline)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git log"))
        }
      ]
    },
    {
      id: "m04_s08",
      tier: "advanced",
      title: "4.8 Sloty konfliktu w .git/index (stage 1/2/3, ls-files -u i merge-base)",
      heading: "Co naprawdę dzieje się w binarnym pliku .git/index podczas konfliktu 3-Way Merge?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: git ls-files -u, następnie: git show :2:app.py oraz: git show :3:app.py",
      guidedCommands: ["git ls-files -u", "git show :2:app.py", "git show :3:app.py"],
      taskTitle: "Wyświetl niescalone sloty konfliktu w Indeksie (git ls-files -u) oraz odczytaj bezpośrednio slot :2: (Ours) i :3: (Theirs)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        merging: true,
        headCommit: {
          id: "m303c00",
          msg: "Zmiana portu na 8080 (main)",
          files: { "app.py": "PORT = 8080\n" }
        },
        commits: [
          { id: "m303c00", msg: "Zmiana portu na 8080 (main)", files: { "app.py": "PORT = 8080\n" } },
          { id: "d101a00", msg: "Base commit (PORT = 8000)", files: { "app.py": "PORT = 8000\n" } }
        ],
        conflictStages: {
          "app.py": {
            "1": "PORT = 8000\n",
            "2": "PORT = 8080\n",
            "3": "PORT = 9090\n"
          }
        },
        index: { "app.py": "PORT = 8080\n" },
        worktree: {
          "app.py": "<<<<<<< HEAD\nPORT = 8080\n=======\nPORT = 9090\n>>>>>>> feature\n"
        }
      },
      cards: [
        {
          id: "stages",
          title: "🔬 1. Cztery sloty (Stage 0–3) w pliku .git/index",
          html: `<p>W normalnym stanie każdy plik w <code>.git/index</code> ma numer slotu <b><code>0</code></b>. Gdy wybucha konflikt dla pliku <code>app.py</code>, wpis ze slotu <code>0</code> znika, a w jego miejsce w Indeksie pojawiają się <b>trzy osobne wpisy</b>:</p>
          <table class="tech-table">
            <thead><tr><th>Slot w Indeksie</th><th>Nazwa roli</th><th>Jak podejrzeć czystą zawartość?</th></tr></thead>
            <tbody>
              <tr id="m04s08-r1"><td><b>Stage 1</b></td><td>Wspólny przodek (<code>Merge Base</code> / LCA)</td><td><code>git show :1:app.py</code> (8000)</td></tr>
              <tr id="m04s08-r2" class="row-focus"><td><b>Stage 2</b></td><td>Nasza wersja bieżąca (<code>Ours / HEAD</code>)</td><td><code>git show :2:app.py</code> (8080)</td></tr>
              <tr id="m04s08-r3"><td><b>Stage 3</b></td><td>Wersja dołączana (<code>Theirs / MERGE_HEAD</code>)</td><td><code>git show :3:app.py</code> (9090)</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Inspekcja slotów konfliktu (git ls-files -u)",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m04s08-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">ls-files</span> <span class="ps-f">-u</span> <span class="ps-cm"># Pokazuje 3 wpisy (sloty 1, 2, 3) dla skonfliktowanego pliku</span></span>
              <span class="laser-tag">▶ UNMERGED</span>
            </div>
            <div class="code-line" id="m04s08-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">show</span> <span class="ps-s">:2:app.py</span> <span class="ps-cm"># Wypisuje czystą wersję Ours (HEAD) z Indeksu</span></span>
              <span class="laser-tag">▶ SLOT 2</span>
            </div>
            <div class="code-line" id="m04s08-l3">
              <span><span class="ps-c">git</span> <span class="ps-sub">show</span> <span class="ps-s">:3:app.py</span> <span class="ps-cm"># Wypisuje czystą wersję Theirs (feature) z Indeksu</span></span>
              <span class="laser-tag">▶ SLOT 3</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m04_s08_b01",
          card: "stages",
          focusRow: "m04s08-r2",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Zajrzyjmy pod maskę Indeksu w trakcie konfliktu! Dla skonfliktowanego pliku znika normalny wpis ze slotu zero, a w pliku .git/index pojawiają się trzy równoległe wpisy: slot pierwszy ze wspólnym przodkiem, slot drugi z naszą wersją HEAD oraz slot trzeci z wersją z dołączanej gałęzi."
        },
        {
          audioId: "m04_s08_b02",
          card: "cli",
          focusLine: "m04s08-l1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Dopóki w Indeksie istnieją sloty jeden, dwa lub trzy, Git nie pozwoli wykonać git commit. Dopiero git add kasuje sloty 1, 2 i 3 i wpisuje rozwiązany plik do slotu zero! Wywołaj teraz git ls-files -u oraz podejrzyj sloty :2:app.py i :3:app.py."
        }
      ],
      assertions: [
        {
          label: "1. Wyświetlono niescalone sloty 1/2/3 w Indeksie (git ls-files -u)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("ls-files -u") || c.includes("ls-files --unmerged"))
        },
        {
          label: "2. Odczytano naszą wersję ze slotu 2 (git show :2:app.py)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("show :2:app.py"))
        },
        {
          label: "3. Odczytano dołączaną wersję ze slotu 3 (git show :3:app.py)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("show :3:app.py"))
        }
      ]
    }
  ]
});
