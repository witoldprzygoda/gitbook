window.CURRICULUM.push({
  id: "m03",
  title: "Moduł 03: Graf DAG, Reset, Revert, Stash i Reflog",
  steps: [
    {
      id: "m03_s01",
      tier: "basic",
      title: "3.1 Graf skierowany acykliczny (DAG) i wskaźnik HEAD",
      heading: "Strzałki w Gicie wskazują w przeszłość: Dlaczego każdy commit pamięta swojego rodzica (parent)?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git log --oneline, a następnie: cat .git/HEAD",
      guidedCommands: ["git log --oneline", "cat .git/HEAD"],
      taskTitle: "Wyświetl historię commitów (git log --oneline) oraz sprawdź na co wskazuje plik .git/HEAD",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "6714130",
          msg: "C: Trzecia migawka planu",
          parent: "d46ad65",
          files: { "plan.txt": "Etap A\nEtap B\nEtap C\n" }
        },
        commits: [
          { id: "6714130", msg: "C: Trzecia migawka planu", parent: "d46ad65", files: { "plan.txt": "Etap A\nEtap B\nEtap C\n" } },
          { id: "d46ad65", msg: "B: Druga migawka planu", parent: "47d539d", files: { "plan.txt": "Etap A\nEtap B\n" } },
          { id: "47d539d", msg: "A: Pierwsza migawka planu", files: { "plan.txt": "Etap A\n" } }
        ],
        index: { "plan.txt": "Etap A\nEtap B\nEtap C\n" },
        worktree: { "plan.txt": "Etap A\nEtap B\nEtap C\n" }
      },
      cards: [
        {
          id: "dag",
          title: "🌿 1. Historia jako graf DAG (A ← B ← C)",
          html: `<p>W Gicie historia tworzy <b>DAG (Directed Acyclic Graph)</b> — skierowany graf bez cykli. Ponieważ obiekt <code>commit</code> jest niemutowalny (jego nazwa to skrót SHA-1 z treści), rodzic nigdy nie zna swoich przyszłych dzieci. To <b>dziecko przechowuje skrót SHA-1 rodzica</b> w polu <code>parent</code>:</p>
          <table class="tech-table">
            <thead><tr><th>Element</th><th>Czym jest fizycznie w .git/?</th></tr></thead>
            <tbody>
              <tr id="m03s01-r1" class="row-focus"><td><code>Commit (6714130)</code></td><td>Obiekt w <code>.git/objects/</code> ze wskaźnikiem <code>parent d46ad65</code></td></tr>
              <tr id="m03s01-r2"><td><code>Gałąź (main)</code></td><td>41-bajtowy plik <code>.git/refs/heads/main</code> zawierający hash <code>6714130</code></td></tr>
              <tr id="m03s01-r3"><td><code>HEAD</code></td><td>Plik <code>.git/HEAD</code> zawierający <code>ref: refs/heads/main</code></td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Wędrowanie od HEAD po wskaźnikach parent",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m03s01-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">log</span> <span class="ps-f">--oneline</span> <span class="ps-cm"># Idzie od HEAD (C) -> parent (B) -> parent (A)</span></span>
              <span class="laser-tag">▶ HISTORIA</span>
            </div>
            <div class="code-line" id="m03s01-l2">
              <span><span class="ps-c">cat</span> <span class="ps-s">.git/HEAD</span> <span class="ps-cm"># Sprawdza aktywną referencję symboliczną</span></span>
              <span class="laser-tag">▶ HEAD</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m03_s01_b01",
          card: "dag",
          focusRow: "m03s01-r1",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "W Module Trzecim badamy strukturę historii Gita. Spójrz na zakładkę Graf DAG w prawym górnym panelu: każdy commit wskazuje strzałką parent wstecz na swojego poprzednika."
        },
        {
          audioId: "m03_s01_b02",
          card: "cli",
          focusLine: "m03s01-l1",
          inspectorTab: "git",
          flashBox: "boxHead",
          voiceText: "Polecenie git log --oneline wędruje po tych wskaźnikach parent od bieżącego commita HEAD aż do samego początku historii repozytorium."
        }
      ],
      assertions: [
        {
          label: "1. Wyświetlono historię grafu (git log --oneline)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git log"))
        },
        {
          label: "2. Sprawdzono wskaźnik .git/HEAD (cat .git/HEAD)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("cat .git/HEAD"))
        }
      ]
    },
    {
      id: "m03_s02",
      tier: "basic",
      title: "3.2 Bezpieczne odwracanie zmian (git revert HEAD)",
      heading: "Dlaczego w pracy zespołowej używamy git revert zamiast kasowania historii przez git reset?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git revert HEAD, a następnie: git log --oneline",
      guidedCommands: ["git revert HEAD", "git log --oneline"],
      taskTitle: "Wycofaj wadliwy commit C za pomocą nowego commita odwrotnego (git revert HEAD) i sprawdź historię",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "6714130",
          msg: "C: Wadliwa zmiana konfiguracji",
          parent: "d46ad65",
          files: { "plan.txt": "Etap A\nEtap B\nBŁĄD KRYTYCZNY\n" }
        },
        commits: [
          { id: "6714130", msg: "C: Wadliwa zmiana konfiguracji", parent: "d46ad65", files: { "plan.txt": "Etap A\nEtap B\nBŁĄD KRYTYCZNY\n" } },
          { id: "d46ad65", msg: "B: Stabilna wersja 2.0", parent: "47d539d", files: { "plan.txt": "Etap A\nEtap B\n" } }
        ],
        index: { "plan.txt": "Etap A\nEtap B\nBŁĄD KRYTYCZNY\n" },
        worktree: { "plan.txt": "Etap A\nEtap B\nBŁĄD KRYTYCZNY\n" }
      },
      cards: [
        {
          id: "revert_vs_reset",
          title: "🛡️ 1. git revert (Dopisz łatkę odwrotną) vs git reset (Przepisz historię)",
          html: `<p>Gdy błędny commit został już wysłany na wspólny serwer (<code>git push</code>), <b>nie wolno</b> go usuwać za pomocą <code>git reset</code>. Zamiast tego używamy <span class="cmd-pill">git revert</span>:</p>
          <table class="tech-table">
            <thead><tr><th>Cecha</th><th><code>git revert HEAD</code></th><th><code>git reset --hard HEAD~1</code></th></tr></thead>
            <tbody>
              <tr id="m03s02-r1" class="row-focus"><td><b>Co robi z grafem DAG?</b></td><td>Tworzy <b>nowy commit</b> będący lustrzaną odwrotnością zmian</td><td>Usuwa commit z gałęzi (przepisuje historię!)</td></tr>
              <tr id="m03s02-r2"><td><b>Bezpieczeństwo w zespole</b></td><td>✅ W 100% bezpieczny dla opublikowanych gałęzi</td><td>❌ Psuje historię innym członkom zespołu</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Wykonanie odwrócenia commita",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m03s02-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">revert</span> <span class="ps-s">HEAD</span> <span class="ps-cm"># Tworzy nowy commit przywracający stan z commita B</span></span>
              <span class="laser-tag">▶ REVERT</span>
            </div>
            <div class="code-line" id="m03s02-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">log</span> <span class="ps-f">--oneline</span> <span class="ps-cm"># W historii widać zarówno błędny commit, jak i jego Revert</span></span>
              <span class="laser-tag">▶ AUDYT</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m03_s02_b01",
          card: "revert_vs_reset",
          focusRow: "m03s02-r1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "W commicie C wprowadzono błąd krytyczny w pliku plan.txt. Ponieważ commit został już opublikowany, nie możemy go wymazać z historii. Polecenie git revert HEAD wylicza łatkę odwrotną i zapisuje ją jako zupełnie nowy commit!"
        },
        {
          audioId: "m03_s02_b02",
          card: "cli",
          focusLine: "m03s02-l1",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "Dzięki git revert historia projektu pozostaje spójna i bezpieczna dla całego zespołu: w dzienniku git log widoczny jest zarówno pierwotny commit, jak i nowy commit naprawczy."
        }
      ],
      assertions: [
        {
          label: "1. Odwrócono ostatni commit (git revert HEAD)",
          check: (vfs) => vfs.commits.length >= 3 && !(vfs.worktree["plan.txt"] || "").includes("BŁĄD")
        },
        {
          label: "2. Zweryfikowano historię po odwróceniu (git log --oneline)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git log"))
        }
      ]
    },
    {
      id: "m03_s03",
      tier: "basic",
      title: "3.3 Schowek roboczy (git stash i git stash pop)",
      heading: "Nagła zmiana kontekstu: Jak bezpiecznie odłożyć rozgrzebaną pracę na półkę bez robienia commita?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git stash, następnie: git stash list oraz: git stash pop",
      guidedCommands: ["git stash", "git stash list", "git stash pop"],
      taskTitle: "Odłóż niezakończone zmiany do schowka (git stash), sprawdź listę (git stash list) i przywróć je z powrotem (git stash pop)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "d46ad65",
          msg: "B: Stabilna wersja",
          files: { "plan.txt": "Etap A\nEtap B\n" }
        },
        commits: [
          { id: "d46ad65", msg: "B: Stabilna wersja", files: { "plan.txt": "Etap A\nEtap B\n" } }
        ],
        index: { "plan.txt": "Etap A\nEtap B\n" },
        worktree: { "plan.txt": "Etap A\nEtap B\nW trakcie pisania nowej funkcji (WIP)...\n" }
      },
      cards: [
        {
          id: "stash_flow",
          title: "📦 1. Jak działa stos schowka (git stash)?",
          html: `<p>Jesteś w połowie pisania kodu, który jeszcze się nie kompiluje, a musisz pilnie przełączyć gałąź. Zamiast tworzyć niechlujny commit, odkładasz pracę na stos schowka:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m03s03-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">stash</span> <span class="ps-cm"># 1. Zapisuje zmiany na stosie i czyści katalog roboczy do HEAD</span></span>
              <span class="laser-tag">▶ SCHOWAJ</span>
            </div>
            <div class="code-line" id="m03s03-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">stash</span> <span class="ps-sub">list</span> <span class="ps-cm"># 2. Pokazuje zapisane pozycje (stash@{0})</span></span>
              <span class="laser-tag">▶ LISTA</span>
            </div>
            <div class="code-line" id="m03s03-l3">
              <span><span class="ps-c">git</span> <span class="ps-sub">stash</span> <span class="ps-sub">pop</span> <span class="ps-cm"># 3. Przywraca zmiany na dysk i zdejmuje ze stosu</span></span>
              <span class="laser-tag">▶ PRZYWRÓĆ</span>
            </div>
          </div>`
        },
        {
          id: "stash_table",
          title: "🔍 2. Ważne warianty polecenia git stash",
          html: `<table class="tech-table">
            <thead><tr><th>Komenda</th><th>Działanie</th></tr></thead>
            <tbody>
              <tr id="m03s03-r1" class="row-focus"><td><code>git stash</code> (<code>push</code>)</td><td>Chowa zmodyfikowane pliki śledzone (Dysk + Indeks)</td></tr>
              <tr id="m03s03-r2"><td><code>git stash -u</code></td><td>Chowa również nowe pliki nieśledzone (<code>Untracked</code>)</td></tr>
              <tr id="m03s03-r3"><td><code>git stash apply</code> vs <code>pop</code></td><td><code>apply</code> przywraca zmiany i zostawia kopię w schowku; <code>pop</code> przywraca i usuwa ze schowka</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m03_s03_b01",
          card: "stash_flow",
          focusLine: "m03s03-l1",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "W katalogu roboczym masz niedokończoną edycję pliku plan.txt. Kiedy wykonasz git stash, Git odłoży Twoje zmiany do bezpiecznego schowka i przywróci czysty stan z commita HEAD."
        },
        {
          audioId: "m03_s03_b02",
          card: "stash_flow",
          focusLine: "m03s03-l3",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Zawartość schowka możesz w każdej chwili przejrzeć poleceniem git stash list, a gdy będziesz gotowy wrócić do przerwanej pracy, polecenie git stash pop przywróci zmiany na dysk i zdejmie je ze stosu."
        }
      ],
      assertions: [
        {
          label: "1. Odłożono zmiany do schowka (git stash)",
          check: (vfs) => vfs.lastCommands.some(c => c === "git stash" || c.startsWith("git stash push"))
        },
        {
          label: "2. Sprawdzono listę schowków (git stash list)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("stash list"))
        },
        {
          label: "3. Przywrócono zmiany ze schowka na dysk (git stash pop)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("stash pop")) && (vfs.worktree["plan.txt"] || "").includes("WIP")
        }
      ]
    },
    {
      id: "m03_s04",
      tier: "extended",
      title: "3.4 Trzy tryby git reset: --soft vs --mixed (domyślny)",
      heading: "Jak git reset przesuwa wskaźnik gałęzi i na którym z trzech drzew się zatrzymuje?",
      badge: "🛠️ Zadanie",
      primaryFile: "README.md",
      hint: "Wpisz: git reset --soft HEAD~1, a następnie: git commit -m \"C2+C3: Skonsolidowane wydanie\"",
      guidedCommands: ["git reset --soft HEAD~1", "git commit -m \"C2+C3: Skonsolidowane wydanie\""],
      taskTitle: "Cofnij ostatni commit C3 do poczekalni (git reset --soft HEAD~1) i zatwierdź go ponownie z nowym opisem",
      initialRepo: {
        repoName: "dag-engine",
        branch: "main",
        headCommit: {
          id: "c303c00",
          msg: "C3: Drobna poprawka literówki",
          parent: "c202b00",
          files: { "README.md": "# Projekt DAG\nWersja 3.0 (kompletna)\n" }
        },
        commits: [
          { id: "c303c00", msg: "C3: Drobna poprawka literówki", parent: "c202b00", files: { "README.md": "# Projekt DAG\nWersja 3.0 (kompletna)\n" } },
          { id: "c202b00", msg: "C2: Wydanie wersji 2.0", parent: "c101a00", files: { "README.md": "# Projekt DAG\nWersja 2.0\n" } }
        ],
        index: { "README.md": "# Projekt DAG\nWersja 3.0 (kompletna)\n" },
        worktree: { "README.md": "# Projekt DAG\nWersja 3.0 (kompletna)\n" }
      },
      cards: [
        {
          id: "modes",
          title: "🎛️ 1. Tabela zasięgu trzech trybów git reset",
          html: `<table class="tech-table">
            <thead><tr><th>Tryb</th><th>1. HEAD &amp; gałąź</th><th>2. Indeks</th><th>3. Dysk roboczy</th></tr></thead>
            <tbody>
              <tr id="m03s04-r1" class="row-focus"><td><code>--soft</code></td><td>Przesuwa na cel</td><td><b>Bez zmian (Staged!)</b></td><td>Bez zmian</td></tr>
              <tr id="m03s04-r2"><td><code>--mixed</code> (domyślny)</td><td>Przesuwa na cel</td><td>Nadpisuje z nowego HEAD</td><td><b>Bez zmian (Unstaged)</b></td></tr>
              <tr id="m03s04-r3"><td><code>--hard</code></td><td>Przesuwa na cel</td><td>Nadpisuje z nowego HEAD</td><td>❌ Nadpisuje na dysku!</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Miękki reset (--soft) jako sposób na łączenie commitów",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m03s04-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">reset</span> <span class="ps-f">--soft</span> <span class="ps-s">HEAD~1</span> <span class="ps-cm"># Cofa HEAD na C2, ale zostawia Wersję 3.0 w Indeksie!</span></span>
              <span class="laser-tag">▶ SOFT RESET</span>
            </div>
            <div class="code-line" id="m03s04-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">commit</span> <span class="ps-f">-m</span> <span class="ps-s">"C2+C3: Skonsolidowane wydanie"</span> <span class="ps-cm"># Tworzy czysty commit z Indeksu</span></span>
              <span class="laser-tag">▶ NOWY COMMIT</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m03_s04_b01",
          card: "modes",
          focusRow: "m03s04-r1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Polecenie git reset --soft HEAD~1 przesuwa wskaźnik bieżącej gałęzi o jeden commit wstecz, ale zatrzymuje się na pierwszym drzewie! Zarówno Indeks, jak i katalog roboczy zachowują pełną zawartość Wersji 3.0 gotową do natychmiastowego zatwierdzenia."
        },
        {
          audioId: "m03_s04_b02",
          card: "cli",
          focusLine: "m03s04-l1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Wykonaj git reset --soft HEAD~1, zobacz jak zmienił się pierwszy boks HEAD w Inspektorze, a następnie utwórz nowy skonsolidowany commit."
        }
      ],
      assertions: [
        {
          label: "1. Cofnięto gałąź miękkim resetem (git reset --soft HEAD~1)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("reset --soft"))
        },
        {
          label: "2. Utworzono nowy skonsolidowany commit (git commit -m ...)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git commit")) && (vfs.headCommit.files["README.md"] || "").includes("3.0")
        }
      ]
    },
    {
      id: "m03_s05",
      tier: "extended",
      title: "3.5 Twardy reset (git reset --hard) i ratunek z git reflog",
      heading: "Skasowałeś commit przez git reset --hard? Zobacz, jak odzyskać go w 10 sekund dzięki dziennikowi reflog!",
      badge: "🛠️ Zadanie",
      primaryFile: "README.md",
      hint: "Wpisz: git reflog, a następnie przywróć utracony commit: git reset --hard c303c00",
      guidedCommands: ["git reflog", "git reset --hard c303c00"],
      taskTitle: "Znajdź skrót „skasowanego” commita C3 w dzienniku git reflog i przywróć go poleceniem git reset --hard c303c00",
      initialRepo: {
        repoName: "dag-engine",
        branch: "main",
        headCommit: {
          id: "c202b00",
          msg: "C2: Wydanie wersji 2.0",
          files: { "README.md": "# Projekt DAG\nWersja 2.0\n" }
        },
        commits: [
          { id: "c202b00", msg: "C2: Wydanie wersji 2.0", files: { "README.md": "# Projekt DAG\nWersja 2.0\n" } },
          { id: "c303c00", msg: "C3: Cenny moduł raportowania", files: { "README.md": "# Projekt DAG\nWersja 3.0 (Cenny moduł raportowania)\n" } }
        ],
        reflogEntries: [
          "c202b00 HEAD@{0}: reset: moving to HEAD~1",
          "c303c00 HEAD@{1}: commit: C3: Cenny moduł raportowania",
          "c202b00 HEAD@{2}: commit: C2: Wydanie wersji 2.0"
        ],
        index: { "README.md": "# Projekt DAG\nWersja 2.0\n" },
        worktree: { "README.md": "# Projekt DAG\nWersja 2.0\n" }
      },
      cards: [
        {
          id: "reflog_rescue",
          title: "🛟 1. Koło ratunkowe Gita: lokalny dziennik .git/logs/HEAD (git reflog)",
          html: `<p>Przed chwilą ktoś wykonał destrukcyjny <code>git reset --hard HEAD~1</code> i commit <code>c303c00</code> zniknął z <code>git log</code>! Czy został skasowany z dysku? <b>Nie!</b> Obiekt wciąż leży w <code>.git/objects/</code>, a każdy ruch wskaźnika <code>HEAD</code> jest rejestrowany w lokalnym dzienniku <b>reflog</b>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m03s05-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">reflog</span> <span class="ps-cm"># 1. Odczytaj historię ruchów HEAD (widać c303c00 pod HEAD@{1})</span></span>
              <span class="laser-tag">▶ ZNAJDŹ HASH</span>
            </div>
            <div class="code-line" id="m03s05-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">reset</span> <span class="ps-f">--hard</span> <span class="ps-s">c303c00</span> <span class="ps-cm"># 2. Przestaw gałąź z powrotem na odnaleziony commit!</span></span>
              <span class="laser-tag">▶ ODZYSKAJ</span>
            </div>
          </div>`
        },
        {
          id: "gc_info",
          title: "⏳ 2. Jak długo reflog pamięta osierocone commity?",
          html: `<table class="tech-table">
            <thead><tr><th>Parametr</th><th>Domyślny czas w Gicie</th><th>Uwaga</th></tr></thead>
            <tbody>
              <tr id="m03s05-r1" class="row-focus"><td><code>gc.reflogExpireUnreachable</code></td><td><b>30 dni</b></td><td>Przez miesiąc osierocone commity nie są usuwane przez <code>git gc</code></td></tr>
              <tr id="m03s05-r2"><td>Zasięg <code>git reflog</code></td><td><b>Wyłącznie lokalny!</b></td><td>Dziennik <code>.git/logs/</code> nigdy nie jest wysyłany przez <code>git push</code> na serwer</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m03_s05_b01",
          card: "reflog_rescue",
          focusLine: "m03s05-l1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "W tym scenariuszu po omyłkowym wykonaniu git reset --hard zniknął commit c303c00 z cennym modułem raportowania. Na szczęście Git nie usuwa od razu osieroconych obiektów z bazy."
        },
        {
          audioId: "m03_s05_b02",
          card: "reflog_rescue",
          focusLine: "m03s05-l2",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Wpisz git reflog, odczytaj identyfikator c303c00 z pozycji HEAD małpa jeden, a następnie odzyskaj cały kod poleceniem git reset --hard c303c00!"
        }
      ],
      assertions: [
        {
          label: "1. Sprawdzono dziennik ruchów wskaźnika HEAD (git reflog)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git reflog"))
        },
        {
          label: "2. Przywrócono utracony commit C3 (git reset --hard c303c00)",
          check: (vfs) => vfs.headCommit.id === "c303c00" && (vfs.worktree["README.md"] || "").includes("Cenny moduł")
        }
      ]
    },
    {
      id: "m03_s06",
      tier: "extended",
      title: "3.6 Korekta ostatniego commita (git commit --amend)",
      heading: "Jak poprawić opis lub dorzucić zapomniany plik do ostatniego commita bez tworzenia nowej pozycji w logu?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git add plan.txt, a następnie: git commit --amend -m \"C: Kompletny plan bez literowek\"",
      guidedCommands: ["git add plan.txt", "git commit --amend -m \"C: Kompletny plan bez literowek\""],
      taskTitle: "Dodaj poprawiony plik plan.txt do Indeksu i podmień ostatni commit za pomocą git commit --amend",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "6714130",
          msg: "C: Niepelny opis z literowka",
          parent: "d46ad65",
          files: { "plan.txt": "Etap A\nEtap B\n" }
        },
        commits: [
          { id: "6714130", msg: "C: Niepelny opis z literowka", parent: "d46ad65", files: { "plan.txt": "Etap A\nEtap B\n" } },
          { id: "d46ad65", msg: "B: Drugi etap", files: { "plan.txt": "Etap A\n" } }
        ],
        index: { "plan.txt": "Etap A\nEtap B\n" },
        worktree: { "plan.txt": "Etap A\nEtap B\nEtap C (dopisany po czasie)\n" }
      },
      cards: [
        {
          id: "amend",
          title: "✏️ 1. Jak działa git commit --amend pod maską?",
          html: `<p>Obiekty w Gicie są niemutowalne — nie da się „wyedytować” istniejącego commita <code>6714130</code>. Zamiast tego flaga <span class="cmd-pill">--amend</span> tworzy <b>zupełnie nowy obiekt commit o nowym skrócie SHA-1</b>, który wskazuje na tego samego rodzica (<code>d46ad65</code>), i przepina na niego gałąź <code>main</code>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m03s06-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">add</span> <span class="ps-s">plan.txt</span> <span class="ps-cm"># 1. Dorzuć zapomnianą zmianę do Indeksu</span></span>
              <span class="laser-tag">▶ STAGE</span>
            </div>
            <div class="code-line" id="m03s06-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">commit</span> <span class="ps-f">--amend -m</span> <span class="ps-s">"C: Kompletny plan bez literowek"</span> <span class="ps-cm"># 2. Zastąp ostatni commit!</span></span>
              <span class="laser-tag">▶ AMEND</span>
            </div>
          </div>`
        },
        {
          id: "amend_warn",
          title: "⚠️ 2. Złota zasada --amend",
          html: `<table class="tech-table">
            <thead><tr><th>Sytuacja</th><th>Czy używać <code>--amend</code>?</th></tr></thead>
            <tbody>
              <tr id="m03s06-r1" class="row-focus"><td>Commit jest tylko lokalny (przed <code>git push</code>)</td><td>✅ <b>Tak!</b> Świetny sposób na utrzymanie czystej historii</td></tr>
              <tr id="m03s06-r2"><td>Commit został już wypchnięty na serwer</td><td>❌ <b>Unikaj!</b> Zmienia SHA-1 commita i wymusza przepisanie historii</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m03_s06_b01",
          card: "amend",
          focusLine: "m03s06-l1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Zauważyłeś literówkę w opisie ostatniego commita albo zapomniałeś dodać jednego pliku? Dopóki nie wysłałeś zmian na serwer, możesz zastąpić ostatni commit nowym obiektem za pomocą git commit --amend."
        },
        {
          audioId: "m03_s06_b02",
          card: "amend",
          focusLine: "m03s06-l2",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Dodaj zmodyfikowany plik plan.txt do Indeksu, a następnie wykonaj git commit --amend z nowym opisem. Zwróć uwagę, że liczba commitów w historii się nie zwiększy, ale skrót SHA-1 commita HEAD ulegnie zmianie!"
        }
      ],
      assertions: [
        {
          label: "1. Dodano poprawiony plik do poczekalni (git add plan.txt)",
          check: (vfs) => (vfs.index["plan.txt"] || "").includes("Etap C")
        },
        {
          label: "2. Zastąpiono ostatni commit przez git commit --amend",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("--amend")) && vfs.headCommit.id !== "6714130"
        }
      ]
    },
    {
      id: "m03_s07",
      tier: "advanced",
      title: "3.7 Nawigacja w grafie DAG: HEAD~n kontra HEAD^n (git rev-parse)",
      heading: "Zaawansowana arytmetyka przodków: Czym różni się tylda (~) od daszka (^) na commicie złączeniowym?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git rev-parse HEAD~1, a następnie: git rev-parse HEAD^2",
      guidedCommands: ["git rev-parse HEAD~1", "git rev-parse HEAD^2"],
      taskTitle: "Rozwiąż referencje pierwszego rodzica (git rev-parse HEAD~1) oraz drugiego rodzica złączonej gałęzi (git rev-parse HEAD^2)",
      initialRepo: {
        repoName: "dag-engine",
        branch: "main",
        headCommit: {
          id: "m900f00",
          msg: "Merge branch 'feature' into main",
          parent: "m111a00",
          parent2: "f222b00",
          files: { "plan.txt": "Scalona wersja\n" }
        },
        commits: [
          { id: "m900f00", msg: "Merge branch 'feature' into main", parent: "m111a00", parent2: "f222b00", files: { "plan.txt": "Scalona wersja\n" } },
          { id: "m111a00", msg: "Commit na gałęzi main (Rodzic #1)", files: { "plan.txt": "Main\n" } },
          { id: "f222b00", msg: "Commit na gałęzi feature (Rodzic #2)", files: { "plan.txt": "Feature\n" } }
        ],
        index: { "plan.txt": "Scalona wersja\n" },
        worktree: { "plan.txt": "Scalona wersja\n" }
      },
      cards: [
        {
          id: "tilde_caret",
          title: "🧭 1. Różnica między tyldą (~n) a daszkiem (^n)",
          html: `<p>W zwykłej liniowej historii <code>HEAD~1</code> i <code>HEAD^1</code> dają ten sam wynik. Różnica ujawnia się na <b>Merge Commicie</b>, który posiada dwóch rodziców:</p>
          <table class="tech-table">
            <thead><tr><th>Zapis</th><th>Znaczenie w grafie DAG</th><th>Wynik dla <code>m900f00</code></th></tr></thead>
            <tbody>
              <tr id="m03s07-r1" class="row-focus"><td><code>HEAD~1</code> (lub <code>HEAD^1</code>)</td><td>Pierwszy rodzic (gałąź docelowa <code>main</code>, na której staliśmy podczas merge)</td><td><code>m111a00</code></td></tr>
              <tr id="m03s07-r2"><td><code>HEAD^2</code></td><td><b>Drugi rodzic!</b> (wierzchołek dołączanej gałęzi bocznej <code>feature</code>)</td><td><code>f222b00</code></td></tr>
              <tr id="m03s07-r3"><td><code>HEAD~2</code></td><td>Dwa pokolenia wstecz wzdłuż linii pierwszego rodzica (dziadek)</td><td>Przodek <code>m111a00</code></td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Tłumaczenie referencji przez git rev-parse",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m03s07-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">rev-parse</span> <span class="ps-s">HEAD~1</span> <span class="ps-cm"># Zwróci m111a00 (pierwszy rodzic z main)</span></span>
              <span class="laser-tag">▶ RODZIC 1</span>
            </div>
            <div class="code-line" id="m03s07-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">rev-parse</span> <span class="ps-s">HEAD^2</span> <span class="ps-cm"># Zwróci f222b00 (drugi rodzic z feature!)</span></span>
              <span class="laser-tag">▶ RODZIC 2</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m03_s07_b01",
          card: "tilde_caret",
          focusRow: "m03s07-r2",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "Tylda oznacza poruszanie się w głąb pokoleń zawsze po pierwszym rodzicu. Natomiast daszek z numerem pozwala wybrać konkretnego rodzica w commicie złączeniowym: HEAD daszek dwa wskazuje bezpośrednio na dołączoną gałąź boczną!"
        },
        {
          audioId: "m03_s07_b02",
          card: "cli",
          focusLine: "m03s07-l2",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "Sprawdź to narzędziem plumbingowym git rev-parse: wywołaj git rev-parse HEAD~1 oraz git rev-parse HEAD^2."
        }
      ],
      assertions: [
        {
          label: "1. Rozwiązano identyfikator pierwszego rodzica (git rev-parse HEAD~1)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("rev-parse HEAD~1"))
        },
        {
          label: "2. Rozwiązano identyfikator drugiego rodzica złączenia (git rev-parse HEAD^2)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("rev-parse HEAD^2"))
        }
      ]
    },
    {
      id: "m03_s08",
      tier: "advanced",
      title: "3.8 Pod maską git stash: wielorodzicowy commit w refs/stash",
      heading: "Jak Git przechowuje schowek w bazie obiektów? Sekret specjalnego commita z 2 lub 3 rodzicami!",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git stash, a następnie: git log --graph --oneline refs/stash",
      guidedCommands: ["git stash", "git log --graph --oneline refs/stash"],
      taskTitle: "Utwórz wpis w schowku (git stash) i podejrzyj wewnętrzny graf commitów schowka (git log --graph --oneline refs/stash)",
      initialRepo: {
        repoName: "pracownia-git",
        branch: "main",
        headCommit: {
          id: "d46ad65",
          msg: "B: Stabilna baza",
          files: { "plan.txt": "Wersja bazowa\n" }
        },
        commits: [
          { id: "d46ad65", msg: "B: Stabilna baza", files: { "plan.txt": "Wersja bazowa\n" } }
        ],
        index: { "plan.txt": "Wersja w Indeksie\n" },
        worktree: { "plan.txt": "Wersja na Dysku\n" }
      },
      cards: [
        {
          id: "stash_dag",
          title: "🔬 1. Struktura obiektowa refs/stash w grafie DAG",
          html: `<p>Schowek <code>git stash</code> nie korzysta z żadnego osobnego formatu plików — tworzy pod referencją <code>.git/refs/stash</code> <b>specjalny obiekt commit z dwoma (lub trzema przy <code>-u</code>) rodzicami</b>:</p>
          <table class="tech-table">
            <thead><tr><th>Węzeł w grafie <code>refs/stash</code></th><th>Co przechowuje?</th></tr></thead>
            <tbody>
              <tr id="m03s08-r1" class="row-focus"><td>Główny commit <code>WIP on main</code></td><td>Drzewo katalogu roboczego (Dysk) w chwili schowania</td></tr>
              <tr id="m03s08-r2"><td>Rodzic #1 (<code>refs/stash^1</code>)</td><td>Commit bazowy <code>HEAD</code>, na którym staliśmy</td></tr>
              <tr id="m03s08-r3"><td>Rodzic #2 (<code>refs/stash^2</code>)</td><td>Osobny commit przechowujący stan <b>Indeksu (Stage)</b>!</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Inspekcja grafu refs/stash",
          html: `<div class="ps-codeblock">
            <div class="code-line laser-focus" id="m03s08-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">stash</span> <span class="ps-cm"># Tworzy strukturę commitów pod .git/refs/stash</span></span>
              <span class="laser-tag">▶ STASH</span>
            </div>
            <div class="code-line" id="m03s08-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">log</span> <span class="ps-f">--graph --oneline</span> <span class="ps-s">refs/stash</span> <span class="ps-cm"># Ujawnia ukryte commity schowka!</span></span>
              <span class="laser-tag">▶ GRAF STASH</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m03_s08_b01",
          card: "stash_dag",
          focusRow: "m03s08-r1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Czy zastanawiałeś się, jak git stash pamięta osobno stan dysku roboczego i osobno stan Indeksu? Pod maską Git tworzy pod referencją refs/stash commit złączeniowy, którego pierwszym rodzicem jest HEAD, a drugim rodzicem specjalny commit zapisujący stan Indeksu!"
        },
        {
          audioId: "m03_s08_b02",
          card: "cli",
          focusLine: "m03s08-l2",
          inspectorTab: "dag",
          flashBox: "boxHead",
          voiceText: "Wykonaj git stash, a następnie wyświetl ukryty graf schowka poleceniem git log --graph --oneline refs/stash."
        }
      ],
      assertions: [
        {
          label: "1. Zapisano stan w schowku (git stash)",
          check: (vfs) => vfs.lastCommands.some(c => c === "git stash" || c.startsWith("git stash push"))
        },
        {
          label: "2. Wyświetlono wewnętrzny graf obiektów schowka (git log --graph --oneline refs/stash)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("refs/stash"))
        }
      ]
    }
  ]
});
