window.CURRICULUM.push({
  id: "m00",
  title: "Moduł 00: Zanim zaczniemy — Przewodnik po Aplikacji i Nauce Nadzorowanej",
  steps: [
    {
      id: "m00_s01",
      tier: "basic",
      title: "0.1 Jak uczyć się efektywnie w tym laboratorium? (Przewodnik UI)",
      heading: "Poznaj 4 strefy laboratorium, interaktywny obchód z kursorem oraz zasady zaliczania zadań",
      badge: "🧭 Samouczek UI",
      primaryFile: "README.md",
      hint: "Kliknij przycisk: help lub git status -s (albo uruchom 🎯 Interaktywny Obchód po Aplikacji)",
      guidedCommands: [
        "help",
        "git status -s"
      ],
      taskTitle: "Rozgrzewka: uruchom w terminalu polecenie help oraz git status -s (lub kliknij gotowe przyciski powyżej)",
      initialRepo: {
        repoName: "witaj-w-git",
        branch: "main",
        headCommit: {
          id: "100a000",
          msg: "Inicjalny stan samouczka",
          files: {
            "README.md": "# Witaj w Interaktywnym Laboratorium Git & GitHub!\n# Kliknij '🎯 Uruchom pokaz z kursorem' na Scenie Wiedzy,\n# aby zobaczyć jak działa każdy element ekranu.\n"
          }
        },
        commits: [
          {
            id: "100a000",
            msg: "Inicjalny stan samouczka",
            files: {
              "README.md": "# Witaj w Interaktywnym Laboratorium Git & GitHub!\n# Kliknij '🎯 Uruchom pokaz z kursorem' na Scenie Wiedzy,\n# aby zobaczyć jak działa każdy element ekranu.\n"
            }
          }
        ],
        index: {
          "README.md": "# Witaj w Interaktywnym Laboratorium Git & GitHub!\n# Kliknij '🎯 Uruchom pokaz z kursorem' na Scenie Wiedzy,\n# aby zobaczyć jak działa każdy element ekranu.\n"
        },
        worktree: {
          "README.md": "# Witaj w Interaktywnym Laboratorium Git & GitHub!\n# Kliknij '🎯 Uruchom pokaz z kursorem' na Scenie Wiedzy,\n# aby zobaczyć jak działa każdy element ekranu.\n"
        }
      },
      cards: [
        {
          id: "tour_card",
          title: "🎯 1. Interaktywny pokaz aplikacji (Wskaźnik-kursor krok po kroku)",
          html: `<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe); border:1.5px solid #60a5fa; border-radius:8px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
            <div style="flex:1; min-width:220px;">
              <b style="color:#1e3a8a; font-size:14px;">✨ Pierwszy raz w laboratorium?</b>
              <p style="font-size:12.5px; color:#1e40af; margin-top:4px;">Uruchom interaktywny pokaz: animowany kursor objedzie po kolei wszystkie panele aplikacji i wytłumaczy, gdzie klikać i jak efektywnie pracować.</p>
            </div>
            <button id="btnStartTourCard" class="btn-top btn-director" style="font-size:13px; padding:8px 14px;" onclick="App.startTour()">🎯 Uruchom pokaz z kursorem (12 kroków)</button>
          </div>
          <table class="tech-table" style="margin-top:6px;">
            <thead><tr><th>Strefa ekranu</th><th>Do czego służy i jak z niej korzystać?</th></tr></thead>
            <tbody>
              <tr id="m00s01-r1" class="row-focus"><td><b>1. Scena Wiedzy</b> (Lewa góra)</td><td>Pigułka teorii i składni. Możesz maksymalizować okienka (<code>⤢ 100%</code>) lub włączyć przycisk <b>START</b>, który odtwarza narrację i podświetla omawiane wiersze.</td></tr>
              <tr id="m00s01-r2"><td><b>2. Zadanie Praktyczne</b> (Lewy dół)</td><td>Pasek pełnej treści zadania pod nagłówkiem prowadzi Cię krok po kroku. Możesz wpisać komendę w terminalu lub kliknąć gotowy przycisk <code>▶ 1. ...</code>.</td></tr>
              <tr id="m00s01-r3"><td><b>3. Inspektor .git/</b> (Prawa góra)</td><td>Pokazuje na żywo z kolorowaniem składni <b>3 Obszary Gita</b> (HEAD, Indeks, Dysk), <b>Graf DAG</b> oraz pliki wewnątrz <code>.git/</code>.</td></tr>
              <tr id="m00s01-r4"><td><b>4. Terminal i Edytor VFS</b> (Prawy dół)</td><td>Bezpieczny symulator Git Bash (wpisz <code>help</code>, aby poznać komendy) oraz edytor plików roboczych. Nic nie popsujesz na swoim komputerze!</td></tr>
            </tbody>
          </table>`
        },
        {
          id: "tips_card",
          title: "🚀 2. Zanim zaczniesz: Jak zachować swój postęp (Prywatny vs Wspólny PC)",
          html: `<div style="background:linear-gradient(135deg,#fffbeb,#fef3c7); border:1.5px solid #f59e0b; border-radius:8px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:6px;">
            <div style="flex:1; min-width:210px;">
              <b style="color:#92400e; font-size:13px;">🔑 Brak tradycyjnych kont i haseł — Ty kontrolujesz swój postęp!</b>
              <p style="font-size:12px; color:#78350f; margin-top:3px;">Pracujesz w pracowni lub na wspólnym komputerze? Ustaw tryb <b>Wspólny PC</b> i skopiuj swój <b>Kod Postępu (GLAB-...)</b> lub pobierz plik <code>.json</code>.</p>
            </div>
            <button class="btn-top" style="background:#d97706; border-color:#b45309; color:#fff; font-size:12px; padding:7px 12px;" onclick="App.openUserSessionModal()">🔑 Twój Kod Postępu i Ustawienia Sesji</button>
          </div>
          <table class="tech-table">
            <thead><tr><th>Funkcja na górnym pasku</th><th>Jak działa i co jest gwarantowane?</th></tr></thead>
            <tbody>
              <tr><td><b>☰ Mapa Kursu &amp; Poziomy</b></td><td>Spis wszystkich modułów (z przyciskami <b><code>✓ Zalicz</code></b> oraz <b><code>↺ Resetuj</code></b>) i lista poziomów (<b>┌ Podstawowy</b>, <b>├ Rozszerzony</b>, <b>├ Zaawansowany</b>, <b>└─▸ Wszystkie</b>).</td></tr>
              <tr><td><b>◀ Moduł XY ▸ Krok ▶</b></td><td>Rozwijana ramka bieżącej lekcji otoczona niebieskimi strzałkami <b>◀</b> (poprzedni krok) oraz <b>▶</b> (następny krok).</td></tr>
              <tr><td><b>💬 Feedback (z mikro-diodą)</b></td><td>Anonimowe zgłaszanie błędów i sugestii zapisywane w historii kursu, z mikro-diodą stanu (<b>Zgłoszone</b> / <b>Odczytane</b> / <b>Przyszła odpowiedź Admina</b>).</td></tr>
              <tr><td><b>Zapisz / Wczytaj / Sesja / Kod</b></td><td>Zapis i odczyt pełnego pliku <code>.json</code> oraz osobisty <b>Kod Postępu (<code>GLAB-...</code>)</b> działający bez logowania na każdym komputerze.</td></tr>
            </tbody>
          </table>
          <div class="ps-codeblock" style="margin-top:6px;">
            <div class="code-line laser-focus" id="m00s01-l1">
              <span><span class="ps-c">help</span> <span class="ps-cm"># Wyświetl listę obsługiwanych komend w terminalu</span></span>
              <span class="laser-tag">▶ 1. WPISZ HELP</span>
            </div>
            <div class="code-line" id="m00s01-l2">
              <span><span class="ps-c">git</span> <span class="ps-sub">status</span> <span class="ps-f">-s</span> <span class="ps-cm"># Sprawdź stan wirtualnego repozytorium</span></span>
              <span class="laser-tag">▶ 2. STATUS</span>
            </div>
          </div>`
        }
      ],
      beats: [
        {
          audioId: "m00_s01_b01",
          card: "tour_card",
          focusRow: "m00s01-r1",
          flashBox: "leftTop",
          inspectorTab: "trees",
          voiceText: "Witaj w interaktywnym laboratorium Git i GitHub! Ekran podzielony jest na cztery współpracujące strefy. W lewym górnym rogu widzisz Scenę Wiedzy z kartami teorii i przykładami komend."
        },
        {
          audioId: "m00_s01_b02",
          card: "tour_card",
          focusRow: "m00s01-r2",
          flashBox: "leftBottom",
          inspectorTab: "trees",
          voiceText: "Pod spodem, w lewym dolnym rogu, znajduje się Twoje Zadanie Praktyczne. Sekcja Co mam teraz zrobić zawsze podpowiada kolejny krok, a asercje sprawdzają na żywo, czy cel został osiągnięty."
        },
        {
          audioId: "m00_s01_b03",
          card: "tour_card",
          focusRow: "m00s01-r3",
          flashBox: "rightTop",
          inspectorTab: "trees",
          voiceText: "Po prawej stronie u góry działa Wizualny Inspektor katalogu .git. Każda komenda wpisana w terminalu natychmiast aktualizuje widok Trzech Obszarów, Grafu historii DAG oraz obiektów pod maską."
        },
        {
          audioId: "m00_s01_b04",
          card: "tour_card",
          focusRow: "m00s01-r4",
          flashBox: "rightBottom",
          inspectorTab: "trees",
          voiceText: "W prawym dolnym rogu masz Terminal Git Bash oraz Edytor plików. Możesz też kliknąć przycisk Uruchom pokaz z kursorem, aby obejrzeć interaktywną wycieczkę po całym interfejsie!"
        }
      ],
      assertions: [
        {
          label: "1. Wyświetlono listę komend w terminalu (wpisz lub kliknij: help)",
          check: (vfs) => vfs.lastCommands.some(c => c === "help" || c === "git help")
        },
        {
          label: "2. Sprawdzono stan repozytorium (wpisz lub kliknij: git status -s)",
          check: (vfs) => vfs.lastCommands.some(c => c.startsWith("git status"))
        }
      ]
    }
  ]
});
