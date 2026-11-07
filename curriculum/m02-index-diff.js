window.CURRICULUM.push({
  id: "m02",
  title: "Moduł 02: Trzy Drzewa Gita, Indeks, Diff, Restore i .gitignore",
  steps: [
    {
      id: "m02_s01",
      tier: "basic",
      title: "2.1 Trzy drzewa Gita i stan MM (Wersje A, B, C)",
      heading: "Architektura 3 obszarów: Kiedy jeden plik ma 3 różne wersje jednocześnie?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz kolejno: git status -s, następnie git show HEAD:plan.txt oraz git show :plan.txt",
      guidedCommands: ["git status -s", "git show HEAD:plan.txt", "git show :plan.txt"],
      taskTitle: "Zbadaj trzy różne wersje pliku plan.txt (HEAD vs Indeks vs Dysk) w stanie MM",
      initialRepo: {
        repoName: "gitbook-core",
        branch: "main",
        headCommit: {
          id: "a101b00",
          msg: "C1: Wersja A planu",
          files: { "plan.txt": "Wersja A (w HEAD)" }
        },
        index: { "plan.txt": "Wersja B (w Index)" },
        worktree: { "plan.txt": "Wersja C (w Working Dir)" }
      },
      cards: [
        {
          id: "trees",
          title: "📦 1. Trzy Drzewa Gita i dwukolumnowy kod XY",
          html: `<p>W Gicie ten sam plik może mieć <b>trzy różne wersje naraz</b>. Polecenie <span class="cmd-pill">git status --short</span> (lub <span class="cmd-pill">-s</span>) prezentuje dwukolumnowy kod <code>XY</code>:</p>
          <table class="tech-table">
            <thead><tr><th>Kolumna / Obszar</th><th>Co porównuje?</th><th>Jak podejrzeć zawartość?</th></tr></thead>
            <tbody>
              <tr id="m02s01-r1" class="row-focus"><td><b>1. HEAD</b> (Repozytorium)</td><td>Ostatni commit na gałęzi</td><td><code>git show HEAD:plan.txt</code></td></tr>
              <tr id="m02s01-r2"><td><b>2. Indeks</b> (<code>X</code> = lewa kolumna)</td><td>HEAD ↔ Indeks (Staged)</td><td><code>git show :plan.txt</code></td></tr>
              <tr id="m02s01-r3"><td><b>3. Dysk</b> (<code>Y</code> = prawa kolumna)</td><td>Indeks ↔ Dysk (Unstaged)</td><td><code>cat plan.txt</code></td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Inspekcja trzech wersji pliku (A, B, C)",
          html: `<p>Gdy plik ma status <code>MM plan.txt</code>, oznacza to zmianę zarówno w poczekalni (<code>X=M</code>), jak i kolejną edycję na dysku po wykonaniu <code>git add</code> (<code>Y=M</code>):</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m02s01-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">status</span> <span class="ps-f">-s</span> <span class="ps-cm"># Zwróci: MM plan.txt</span></span>
              <span class="laser-tag">▶ STATUS XY</span>
            </div>
            <div class="code-line" id="m02s01-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">show</span> <span class="ps-s">HEAD:plan.txt</span> <span class="ps-cm"># Wersja A (z ostatniego commita)</span></span>
              <span class="laser-tag">▶ Z HEAD</span>
            </div>
            <div class="code-line" id="m02s01-l3">
              <span><span class="ps-c">git</span> <span class="ps-sub">show</span> <span class="ps-s">:plan.txt</span> <span class="ps-cm"># Wersja B (z poczekalni .git/index)</span></span>
              <span class="laser-tag">▶ Z INDEKSU</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m02_s01_b01",
          card: "trees",
          focusRow: "m02s01-r1",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Spójrz na prawy górny panel Trzy Obszary. Plik plan.txt występuje jednocześnie w trzech różnych wersjach: Wersja A w commicie HEAD, Wersja B w Indeksie oraz Wersja C na dysku roboczym."
        },
        {
          audioId: "m02_s01_b02",
          card: "trees",
          focusRow: "m02s01-r2",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Kiedy wykonujesz git status z flagą -s, pierwsza kolumna X porównuje HEAD z Indeksem, a druga kolumna Y porównuje Indeks z dyskiem roboczym. Dlatego widzimy dwie litery M obok siebie."
        },
        {
          audioId: "m02_s01_b03",
          card: "cli",
          focusLine: "m02s01-l2",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Polecenie git show pozwala podejrzeć dowolną wersję pliku bez dotykania dysku roboczego: składnia HEAD:plan.txt odczytuje wersję z ostatniego commita, a sam dwukropek :plan.txt pobiera wersję prosto z Indeksu."
        }
      ],
      assertions: [
        {
          label: "1. Sprawdzono skrócony status dwukolumnowy (git status -s)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git status"))
        },
        {
          label: "2. Odczytano wersję pliku z commita HEAD (git show HEAD:plan.txt)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("show HEAD:plan.txt"))
        },
        {
          label: "3. Odczytano wersję pliku z Indeksu (git show :plan.txt)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("show :plan.txt"))
        }
      ]
    },
    {
      id: "m02_s02",
      tier: "basic",
      title: "2.2 Z czego powstaje commit? (Indeks vs Dysk)",
      heading: "Złota zasada Gita: git commit fotografuje wyłącznie zawartość Indeksu!",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git commit -m \"C2: Zapis wersji B\", a potem: git add plan.txt",
      guidedCommands: ["git commit -m \"C2: Zapis wersji B\"", "git add plan.txt"],
      taskTitle: "Utwórz commit ze stanu MM i zobacz, co stanie się z Wersją C z dysku, a następnie dodaj ją do Indeksu",
      initialRepo: {
        repoName: "gitbook-core",
        branch: "main",
        headCommit: {
          id: "a101b00",
          msg: "C1: Wersja A planu",
          files: { "plan.txt": "Wersja A (w HEAD)" }
        },
        index: { "plan.txt": "Wersja B (w Index)" },
        worktree: { "plan.txt": "Wersja C (w Working Dir)" }
      },
      cards: [
        {
          id: "rule",
          title: "📸 1. Dlaczego git commit ignoruje katalog roboczy?",
          html: `<p>Początkujący często dziwią się: <i>„Zapisałem plik w edytorze, zrobiłem <code>git commit</code>, a mojej poprawki nie ma w commicie!”</i>. Dzieje się tak, ponieważ <b>commit buduje drzewo wyłącznie z pliku <code>.git/index</code></b>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m02s02-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">commit</span> <span class="ps-f">-m</span> <span class="ps-s">"C2: Zapis wersji B"</span> <span class="ps-cm"># Zapisze Wersję B z Indeksu!</span></span>
              <span class="laser-tag">▶ KROK 1</span>
            </div>
            <div class="code-line" id="m02s02-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">add</span> <span class="ps-s">plan.txt</span> <span class="ps-cm"># Kopiuje Wersję C z dysku do Indeksu</span></span>
              <span class="laser-tag">▶ KROK 2</span>
            </div>
          </div>`
        },
        {
          id: "flow",
          title: "🔄 2. Przejście stanu MM -> _M -> M_",
          html: `<table class="tech-table">
            <thead><tr><th>Etap</th><th>HEAD</th><th>Indeks</th><th>Dysk</th><th>Status</th></tr></thead>
            <tbody>
              <tr id="m02s02-r1" class="row-focus"><td>Przed commitem</td><td>Wersja A</td><td>Wersja B</td><td>Wersja C</td><td><code>MM</code></td></tr>
              <tr id="m02s02-r2"><td>Po <code>git commit</code></td><td><b>Wersja B</b></td><td><b>Wersja B</b></td><td>Wersja C</td><td><code> M</code></td></tr>
              <tr id="m02s02-r3"><td>Po <code>git add plan.txt</code></td><td>Wersja B</td><td><b>Wersja C</b></td><td><b>Wersja C</b></td><td><code>M </code></td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m02_s02_b01",
          card: "rule",
          focusLine: "m02s02-l1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "W Gicie polecenie git commit w ogóle nie zagląda na dysk roboczy. Tworzy ono nową migawkę wyłącznie z tego, co w danej chwili znajduje się w środkowym obszarze, czyli w Indeksie."
        },
        {
          audioId: "m02_s02_b02",
          card: "flow",
          focusRow: "m02s02-r2",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Kiedy wykonasz git commit, Wersja B z Indeksu trafi do nowego commita HEAD, a Wersja C nadal będzie czekać na dysku roboczym."
        },
        {
          audioId: "m02_s02_b03",
          card: "rule",
          focusLine: "m02s02-l2",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Dlatego każdą nową edycję z dysku roboczego musimy najpierw jawnie skopiować do poczekalni poleceniem git add, zanim trafi ona do kolejnej migawki."
        }
      ],
      assertions: [
        {
          label: "1. Utworzono nowy commit z zawartości Indeksu (git commit -m ...)",
          check: (vfs) => vfs.commits.length >= 2 && vfs.commits.some(c => (c.files["plan.txt"] || "").includes("Wersja B"))
        },
        {
          label: "2. Dodano Wersję C z dysku do Indeksu (git add plan.txt)",
          check: (vfs) => (vfs.index["plan.txt"] || "").includes("Wersja C")
        }
      ]
    },
    {
      id: "m02_s03",
      tier: "basic",
      title: "2.3 Trójkąt porównań: git diff vs --staged vs HEAD",
      heading: "Trzy pytania git diff: Co porównujemy, gdy plik ma 3 wersje?",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wykonaj kolejno: git diff, następnie git diff --staged oraz git diff HEAD",
      guidedCommands: ["git diff", "git diff --staged", "git diff HEAD"],
      taskTitle: "Porównaj wszystkie trzy boki trójkąta zmian (git diff, git diff --staged, git diff HEAD)",
      initialRepo: {
        repoName: "gitbook-core",
        branch: "main",
        headCommit: {
          id: "a101b00",
          msg: "C1: Wersja A planu",
          files: { "plan.txt": "Wersja A (w HEAD)" }
        },
        index: { "plan.txt": "Wersja B (w Index)" },
        worktree: { "plan.txt": "Wersja C (w Working Dir)" }
      },
      cards: [
        {
          id: "triangle",
          title: "📐 1. Trójkąt polecenia git diff",
          html: `<p>Samo <span class="cmd-pill">git diff</span> bez argumentów <b>nie</b> porównuje dysku z ostatnim commitem, lecz z Indeksem! Jeśli wcześniej wykonałeś <code>git add</code>, zwykłe <code>git diff</code> nic nie pokaże:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m02s03-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">diff</span> <span class="ps-cm"># 1. Indeks (B) ↔ Dysk (C) [Unstaged]</span></span>
              <span class="laser-tag">▶ B ↔ C</span>
            </div>
            <div class="code-line" id="m02s03-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">diff</span> <span class="ps-f">--staged</span> <span class="ps-cm"># 2. HEAD (A) ↔ Indeks (B) [Staged / --cached]</span></span>
              <span class="laser-tag">▶ A ↔ B</span>
            </div>
            <div class="code-line" id="m02s03-l3">
              <span><span class="ps-c">git</span> <span class="ps-sub">diff</span> <span class="ps-s">HEAD</span> <span class="ps-cm"># 3. HEAD (A) ↔ Dysk (C) [Wszystko od commita]</span></span>
              <span class="laser-tag">▶ A ↔ C</span>
            </div>
          </div>`
        },
        {
          id: "hunk",
          title: "🔍 2. Anatomia łatki (Unified Diff)",
          html: `<table class="tech-table">
            <thead><tr><th>Element wyjścia</th><th>Znaczenie techniczne</th></tr></thead>
            <tbody>
              <tr id="m02s03-r1" class="row-focus"><td><code>--- a/plan.txt</code></td><td>Plik źródłowy („stary” punkt odniesienia: <code>a/</code>)</td></tr>
              <tr id="m02s03-r2"><td><code>+++ b/plan.txt</code></td><td>Plik docelowy („nowy” porównywany stan: <code>b/</code>)</td></tr>
              <tr id="m02s03-r3"><td><code>@@ -1,1 +1,1 @@</code></td><td>Nagłówek odcinka (hunka): numer linii i liczba wierszy</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m02_s03_b01",
          card: "triangle",
          focusLine: "m02s03-l1",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Zwykłe polecenie git diff bez flag porównuje wyłącznie poczekalnię z katalogiem roboczym, czyli pokazuje różnicę między Wersją B a Wersją C."
        },
        {
          audioId: "m02_s03_b02",
          card: "triangle",
          focusLine: "m02s03-l2",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Flaga --staged (lub jej synonim --cached) porównuje ostatni commit HEAD z Indeksem, czyli Wersję A z Wersją B."
        },
        {
          audioId: "m02_s03_b03",
          card: "triangle",
          focusLine: "m02s03-l3",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Natomiast git diff HEAD pokazuje łączną różnicę między commitem HEAD a dyskiem roboczym, czyli od Wersji A prosto do Wersji C."
        }
      ],
      assertions: [
        {
          label: "1. Porównano Indeks z Dyskiem (git diff)",
          check: (vfs) => vfs.lastCommands.some(c => c === "git diff")
        },
        {
          label: "2. Porównano HEAD z Indeksem (git diff --staged / --cached)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("git diff") && (c.includes("--staged") || c.includes("--cached")))
        },
        {
          label: "3. Porównano HEAD bezpośrednio z Dyskiem (git diff HEAD)",
          check: (vfs) => vfs.lastCommands.some(c => c === "git diff HEAD")
        }
      ]
    },
    {
      id: "m02_s04",
      tier: "extended",
      title: "2.4 Cztery warianty git restore (Macierz Źródło -> Cel)",
      heading: "Chirurgiczne cofanie zmian w plikach bez przesuwania historii gałęzi",
      badge: "🛠️ Zadanie",
      primaryFile: "plan.txt",
      hint: "Wpisz: git restore plan.txt (kopiuje B z Indeksu na Dysk), a następnie: git restore --source=HEAD --staged --worktree plan.txt",
      guidedCommands: ["git restore plan.txt", "git restore --source=HEAD --staged --worktree plan.txt"],
      taskTitle: "Przywróć najpierw plik na dysku do wersji z Indeksu (B), a następnie zresetuj oba obszary do wersji z HEAD (A)",
      initialRepo: {
        repoName: "gitbook-core",
        branch: "main",
        headCommit: {
          id: "a101b00",
          msg: "C1: Wersja A planu",
          files: { "plan.txt": "Wersja A (w HEAD)" }
        },
        index: { "plan.txt": "Wersja B (w Index)" },
        worktree: { "plan.txt": "Wersja C (w Working Dir)" }
      },
      cards: [
        {
          id: "matrix",
          title: "🧭 1. Pełna macierz 4 wariantów git restore",
          html: `<table class="tech-table">
            <thead><tr><th>Polecenie</th><th>Źródło (Skąd?)</th><th>Cel (Dokąd?)</th><th>Wynik (H / I / W)</th></tr></thead>
            <tbody>
              <tr id="m02s04-r1" class="row-focus"><td><code>git restore plan.txt</code></td><td>Indeks (B)</td><td>Dysk roboczy</td><td><code>A / B / B</code></td></tr>
              <tr id="m02s04-r2"><td><code>git restore --staged plan.txt</code></td><td>HEAD (A)</td><td>Indeks</td><td><code>A / A / C</code></td></tr>
              <tr id="m02s04-r3"><td><code>git restore --source=HEAD plan.txt</code></td><td>HEAD (A)</td><td>Dysk roboczy</td><td><code>A / B / A</code></td></tr>
              <tr id="m02s04-r4"><td><code>git restore -s HEAD -S -W plan.txt</code></td><td>HEAD (A)</td><td>Indeks + Dysk</td><td><code>A / A / A</code></td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Ćwiczenie dwuetapowego przywracania",
          html: `<p>W przeciwieństwie do <code>git reset --hard</code>, polecenie <span class="cmd-pill">git restore</span> działa na wskazanych ścieżkach i nigdy nie przesuwa wskaźnika gałęzi:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m02s04-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">restore</span> <span class="ps-s">plan.txt</span> <span class="ps-cm"># 1. Indeks (B) -> Dysk (kasuje Wersję C!)</span></span>
              <span class="laser-tag">▶ ETAP 1</span>
            </div>
            <div class="code-line" id="m02s04-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">restore</span> <span class="ps-f">--source=HEAD --staged --worktree</span> <span class="ps-s">plan.txt</span> <span class="ps-cm"># 2. HEAD (A) -> Indeks + Dysk</span></span>
              <span class="laser-tag">▶ ETAP 2</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m02_s04_b01",
          card: "matrix",
          focusRow: "m02s04-r1",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Domyślne wywołanie git restore plan.txt bierze wersję z Indeksu i nadpisuje nią plik na dysku roboczym. Wersja C znika, a na dysku pojawia się Wersja B."
        },
        {
          audioId: "m02_s04_b02",
          card: "cli",
          focusLine: "m02s04-l2",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Połączenie flag --source=HEAD, --staged oraz --worktree kopiuje Wersję A z commita HEAD jednocześnie do Indeksu oraz na dysk roboczy."
        }
      ],
      assertions: [
        {
          label: "1. Wywołano git restore plan.txt (Indeks -> Dysk)",
          check: (vfs) => vfs.lastCommands.some(c => c === "git restore plan.txt")
        },
        {
          label: "2. Przywrócono Wersję A zarówno do Indeksu, jak i na Dysk (--source=HEAD --staged --worktree)",
          check: (vfs) => (vfs.index["plan.txt"] || "").includes("Wersja A") && (vfs.worktree["plan.txt"] || "").includes("Wersja A")
        }
      ]
    },
    {
      id: "m02_s05",
      tier: "extended",
      title: "2.5 Zakresy git add (-u vs -A) i pułapka git commit -a",
      heading: "Dlaczego git add -u oraz git commit -a ignorują nowe pliki (Untracked)?",
      badge: "🛠️ Zadanie",
      primaryFile: "tracked.txt",
      hint: "Wpisz najpierw: git add -u (zobacz, że untracked.txt ma nadal ??), a następnie: git add -A",
      guidedCommands: ["git add -u", "git add -A"],
      taskTitle: "Zaktualizuj w Indeksie tylko pliki śledzone (git add -u), a potem dodaj wszystkie pliki (git add -A)",
      initialRepo: {
        repoName: "gitbook-core",
        branch: "main",
        headCommit: {
          id: "b202c00",
          msg: "C1: Plik śledzony",
          files: { "tracked.txt": "Wersja 1.0\n" }
        },
        index: { "tracked.txt": "Wersja 1.0\n" },
        worktree: {
          "tracked.txt": "Wersja 2.0 (zmodyfikowana)\n",
          "untracked.txt": "Nowy moduł pomocniczy\n"
        }
      },
      cards: [
        {
          id: "scopes",
          title: "🎯 1. Porównanie zakresów git add",
          html: `<table class="tech-table">
            <thead><tr><th>Komenda</th><th>Modyfikacje i usunięcia</th><th>Nowe pliki (<code>??</code> Untracked)</th></tr></thead>
            <tbody>
              <tr id="m02s05-r1" class="row-focus"><td><code>git add -u</code> (<code>--update</code>)</td><td>✅ Aktualizuje w Indeksie</td><td>❌ <b>Ignoruje!</b></td></tr>
              <tr id="m02s05-r2"><td><code>git commit -a -m "..."</code></td><td>✅ Zleca w locie</td><td>❌ <b>Ignoruje!</b> (częsty błąd CI!)</td></tr>
              <tr id="m02s05-r3"><td><code>git add -A</code> (<code>--all</code>)</td><td>✅ Aktualizuje w całym repo</td><td>✅ Dodaje nowe pliki</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "cli",
          title: "💻 2. Sprawdź różnicę między -u a -A w praktyce",
          html: `<p>W katalogu roboczym masz zmodyfikowany plik <code>tracked.txt</code> oraz zupełnie nowy plik <code>untracked.txt</code>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m02s05-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">add</span> <span class="ps-f">-u</span> <span class="ps-cm"># Doda tracked.txt, ale pominie untracked.txt!</span></span>
              <span class="laser-tag">▶ TYLKO ŚLEDZONE</span>
            </div>
            <div class="code-line" id="m02s05-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">add</span> <span class="ps-f">-A</span> <span class="ps-cm"># Doda również nowy plik untracked.txt</span></span>
              <span class="laser-tag">▶ WSZYSTKIE</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m02_s05_b01",
          card: "scopes",
          focusRow: "m02s05-r1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Flaga git add -u oraz skrót git commit -a działają wyłącznie na plikach, które Git już wcześniej śledził. Nowo utworzone pliki ze statusem dwóch znaków zapytania zostaną całkowicie pominięte!"
        },
        {
          audioId: "m02_s05_b02",
          card: "cli",
          focusLine: "m02s05-l2",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Wykonaj najpierw git add -u, a następnie git add -A, aby włączyć do Indeksu również nowy plik untracked.txt."
        }
      ],
      assertions: [
        {
          label: "1. Wywołano aktualizację wyłącznie śledzonych plików (git add -u)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("git add -u") || c.includes("git add --update"))
        },
        {
          label: "2. Dodano wszystkie pliki wraz z nowym plikiem (git add -A / .)",
          check: (vfs) => vfs.index["tracked.txt"] !== undefined && vfs.index["untracked.txt"] !== undefined
        }
      ]
    },
    {
      id: "m02_s06",
      tier: "extended",
      title: "2.6 Higiena commita: git diff --staged --check",
      heading: "Automatyczna kontrola jakości przed commitem: wykrywanie trailing whitespace i markerów",
      badge: "🛠️ Zadanie",
      primaryFile: "script.py",
      hint: "Wpisz: git diff --staged --check",
      guidedCommands: ["git diff --staged --check"],
      taskTitle: "Wykryj błędy białych znaków na końcu linii za pomocą git diff --staged --check",
      initialRepo: {
        repoName: "gitbook-core",
        branch: "main",
        headCommit: {
          id: "c303d00",
          msg: "C1: Czysty skrypt",
          files: { "script.py": "def run():\n    return True" }
        },
        index: { "script.py": "def run():   \n    return True" },
        worktree: { "script.py": "def run():   \n    return True" }
      },
      cards: [
        {
          id: "check",
          title: "🧹 1. Strażnik czystości: git diff --staged --check",
          html: `<p>Przed wykonaniem <code>git commit</code> warto uruchomić wbudowany analizator higieny zmian:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m02s06-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">diff</span> <span class="ps-f">--staged --check</span> <span class="ps-cm"># Wykrywa spacje na końcu linii i markery &lt;&lt;&lt;&lt;&lt;&lt;&lt;</span></span>
              <span class="laser-tag">▶ KONTROLA</span>
            </div>
          </div>
          <p>Jeśli w Indeksie znajdują się nadmiarowe spacje na końcu wiersza (<i>trailing whitespace</i>) lub pozostawione znaczniki konfliktu <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, Git wskaże dokładny numer linii i zwróci kod wyjścia różny od zera (przydatne w hookach <code>pre-commit</code>).</p>`
        },
        {
          id: "table",
          title: "📋 2. Co wykrywa flaga --check?",
          html: `<table class="tech-table">
            <thead><tr><th>Zjawisko</th><th>Komunikat diagnostyczny</th></tr></thead>
            <tbody>
              <tr id="m02s06-r1" class="row-focus"><td>Spacje / tabulatory na końcu wiersza</td><td><code>script.py:1: trailing whitespace.</code></td></tr>
              <tr id="m02s06-r2"><td>Nierozwiązane znaczniki konfliktu</td><td><code>script.py:4: leftover conflict marker</code></td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m02_s06_b01",
          card: "check",
          focusLine: "m02s06-l1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "W pliku script.py w pierwszym wierszu po dwukropku zostawiono przypadkowo trzy spacje na końcu linii. Uruchom w terminalu git diff --staged --check, aby zobaczyć dokładny komunikat ostrzegawczy."
        }
      ],
      assertions: [
        {
          label: "1. Uruchomiono inspekcję higieny poczekalni (git diff --staged --check)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("git diff") && c.includes("--check"))
        }
      ]
    },
    {
      id: "m02_s07",
      tier: "basic",
      title: "2.7 Reguły .gitignore i ratowanie wycieku (git rm --cached)",
      heading: "Dlaczego dopisanie pliku do .gitignore nie działa na pliki już śledzone w Indeksie?",
      badge: "🛠️ Zadanie",
      primaryFile: ".env",
      hint: "Wpisz: git rm --cached .env, a następnie: git commit -m \"Stop tracking .env\"",
      guidedCommands: ["git rm --cached .env", "git commit -m \"Stop tracking .env\""],
      taskTitle: "Usuń omyłkowo śledzony plik .env z Indeksu zachowując go fizycznie na dysku (git rm --cached .env) i zatwierdź zmianę",
      initialRepo: {
        repoName: "gitbook-core",
        branch: "main",
        headCommit: {
          id: "d404e00",
          msg: "C1: Inicjalizacja z wyciekiem .env!",
          files: {
            "app.py": "import os\n",
            ".env": "API_SECRET=tajny_klucz_123\n",
            ".gitignore": ".env\n*.log\nbuild/\n"
          }
        },
        index: {
          "app.py": "import os\n",
          ".env": "API_SECRET=tajny_klucz_123\n",
          ".gitignore": ".env\n*.log\nbuild/\n"
        },
        worktree: {
          "app.py": "import os\n",
          ".env": "API_SECRET=tajny_klucz_123\n",
          ".gitignore": ".env\n*.log\nbuild/\n"
        }
      },
      cards: [
        {
          id: "ignore",
          title: "🛡️ 1. Pułapka: .gitignore filtruje tylko pliki Untracked!",
          html: `<p>Plik <code>.env</code> z kluczem API został omyłkowo zatwierdzony w pierwszym commicie. Mimo że dopisaliśmy <code>.env</code> do <code>.gitignore</code>, Git nadal śledzi ten plik! Aby przestać go śledzić <b>bez kasowania pliku z dysku</b>, musisz wypisać go z Indeksu:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m02s07-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">rm</span> <span class="ps-f">--cached</span> <span class="ps-s">.env</span> <span class="ps-cm"># Usuwa z .git/index, zostawia plik na dysku!</span></span>
              <span class="laser-tag">▶ KROK 1</span>
            </div>
            <div class="code-line" id="m02s07-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">commit</span> <span class="ps-f">-m</span> <span class="ps-s">"Stop tracking .env"</span> <span class="ps-cm"># Zapisuje usunięcie w nowym commicie</span></span>
              <span class="laser-tag">▶ KROK 2</span>
            </div>
          </div>`
        },
        {
          id: "security",
          title: "⚠️ 2. Uwaga bezpieczeństwa: Historia się nie kasuje!",
          html: `<table class="tech-table">
            <thead><tr><th>Polecenie</th><th>Indeks (.git/index)</th><th>Dysk roboczy</th><th>Stare commity (HEAD~1)</th></tr></thead>
            <tbody>
              <tr id="m02s07-r1"><td><code>git rm .env</code></td><td>Usuwa wpis</td><td>❌ Kasuje z dysku!</td><td>Nadal zawiera <code>blob</code></td></tr>
              <tr id="m02s07-r2" class="row-focus"><td><code>git rm --cached .env</code></td><td>Usuwa wpis</td><td>✅ Zostawia na dysku</td><td>Nadal zawiera <code>blob</code> (wymaga rotacji klucza!)</td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m02_s07_b01",
          card: "ignore",
          focusLine: "m02s07-l1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Plik .gitignore działa wyłącznie na pliki nieśledzone. Jeśli plik .env trafił już wcześniej do Indeksu, musisz usunąć go z samej poczekalni poleceniem git rm --cached .env."
        },
        {
          audioId: "m02_s07_b02",
          card: "security",
          focusRow: "m02s07-r2",
          inspectorTab: "trees",
          flashBox: "boxHead",
          voiceText: "Po usunięciu wpisu z Indeksu zatwierdź zmianę poleceniem git commit. Pamiętaj jednak, że w starszym commicie obiekt blob z kluczem wciąż istnieje, więc skompromitowany klucz należy unieważnić!"
        }
      ],
      assertions: [
        {
          label: "1. Usunięto plik .env z Indeksu zachowując go na dysku (git rm --cached .env)",
          check: (vfs) => vfs.index[".env"] === undefined && (vfs.worktree[".env"] || "").includes("API_SECRET")
        },
        {
          label: "2. Zatwierdzono wycofanie śledzenia w nowym commicie (git commit)",
          check: (vfs) => vfs.headCommit.files[".env"] === undefined && (vfs.worktree[".env"] || "").includes("API_SECRET")
        }
      ]
    },
    {
      id: "m02_s08",
      tier: "advanced",
      title: "2.8 Wnętrze .git/index (ls-files -s), git mv i check-ignore",
      heading: "Plumbing Indeksu: Jak git mv przenosi plik bez tworzenia nowego obiektu blob?",
      badge: "🛠️ Zadanie",
      primaryFile: "app.py",
      hint: "Wpisz: git ls-files --stage, następnie: git mv app.py main.py oraz: git check-ignore -v debug.log",
      guidedCommands: ["git ls-files --stage", "git mv app.py main.py", "git check-ignore -v debug.log"],
      taskTitle: "Zbadaj wpisy w .git/index (ls-files --stage), zmień nazwę pliku (git mv app.py main.py) i zdiagnozuj regułę ignorowania (check-ignore -v)",
      initialRepo: {
        repoName: "gitbook-core",
        branch: "main",
        headCommit: {
          id: "e505f00",
          msg: "C1: Moduł główny",
          files: {
            "app.py": "print('Git Internals')\n",
            ".gitignore": "*.log\n!important.log\n"
          }
        },
        index: {
          "app.py": "print('Git Internals')\n",
          ".gitignore": "*.log\n!important.log\n"
        },
        worktree: {
          "app.py": "print('Git Internals')\n",
          ".gitignore": "*.log\n!important.log\n",
          "debug.log": "trace=1\n"
        }
      },
      cards: [
        {
          id: "index_bin",
          title: "🔬 1. Anatomia binarnego pliku .git/index (git ls-files --stage)",
          html: `<p>Plik <code>.git/index</code> to posortowana binarna tablica wpisów. Każdy wiersz z <span class="cmd-pill">git ls-files --stage</span> ma 4 pola: <code>&lt;tryb&gt; &lt;SHA-1 blob&gt; &lt;slot 0-3&gt; &lt;ścieżka&gt;</code>:</p>
          <div class="ps-codeblock">
            <div class="code-line laser-focus" id="m02s08-l1">
              <span><span class="ps-c">git</span> <span class="ps-sub">ls-files</span> <span class="ps-f">--stage</span> <span class="ps-cm"># Pokazuje 100644 &lt;oid&gt; 0 app.py</span></span>
              <span class="laser-tag">▶ INSPEKCJA</span>
            </div>
            <div class="code-line" id="m02s08-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">mv</span> <span class="ps-s">app.py main.py</span> <span class="ps-cm"># Ten sam SHA-1 blob pod nową ścieżką!</span></span>
              <span class="laser-tag">▶ PRZEMIANOWANIE</span>
            </div>
            <div class="code-line" id="m02s08-l3">
              <span><span class="ps-c">git</span> <span class="ps-sub">check-ignore</span> <span class="ps-f">-v</span> <span class="ps-s">debug.log</span> <span class="ps-cm"># Wskazuje .gitignore:1:*.log</span></span>
              <span class="laser-tag">▶ DIAGNOSTYKA</span>
            </div>
          </div>`
        },
        {
          id: "mv_theory",
          title: "🧬 2. Dlaczego git mv nie tworzy nowego obiektu blob?",
          html: `<table class="tech-table">
            <thead><tr><th>Pole w .git/index</th><th>Wartość przed <code>git mv</code></th><th>Wartość po <code>git mv app.py main.py</code></th></tr></thead>
            <tbody>
              <tr id="m02s08-r1"><td>Uprawnienia (Mode)</td><td><code>100644</code> (zwykły plik)</td><td><code>100644</code> (bez zmian)</td></tr>
              <tr id="m02s08-r2" class="row-focus"><td>Skrót SHA-1 obiektu <code>blob</code></td><td>Identyczny 40-znakowy OID</td><td><b>Identyczny 40-znakowy OID!</b> (0 nowych bajtów w <code>.git/objects</code>)</td></tr>
              <tr id="m02s08-r3"><td>Ścieżka pliku</td><td><code>app.py</code></td><td><code>main.py</code></td></tr>
            </tbody>
          </table>`
        }
      ],
      beats: [
        {
          audioId: "m02_s08_b01",
          card: "index_bin",
          focusLine: "m02s08-l1",
          inspectorTab: "trees",
          flashBox: "boxIdx",
          voiceText: "Obiekt blob nie przechowuje nazwy pliku. Wywołaj git ls-files --stage, a następnie zmień nazwę pliku poleceniem git mv app.py main.py. Zauważysz, że skrót SHA-1 obiektu blob pozostaje w stu procentach identyczny!"
        },
        {
          audioId: "m02_s08_b02",
          card: "index_bin",
          focusLine: "m02s08-l3",
          inspectorTab: "trees",
          flashBox: "boxWork",
          voiceText: "Na koniec przetestuj diagnostykę reguł ignorowania poleceniem git check-ignore -v debug.log, które wskaże dokładny numer linii w pliku .gitignore."
        }
      ],
      assertions: [
        {
          label: "1. Wyświetlono zawartość tabeli .git/index (git ls-files --stage / -s)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git ls-files"))
        },
        {
          label: "2. Zmieniono nazwę pliku w Indeksie i na dysku (git mv app.py main.py)",
          check: (vfs) => vfs.index["main.py"] !== undefined && vfs.index["app.py"] === undefined
        },
        {
          label: "3. Zdiagnozowano regułę ignorowania (git check-ignore -v debug.log)",
          check: (vfs) => vfs.lastCommands.some(c => c.includes("check-ignore") && c.includes("debug.log"))
        }
      ]
    }
  ]
});
