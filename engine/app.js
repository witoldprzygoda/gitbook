const App = {
  appVersion: "0.11",
  appUpdatedDate: "2026-11-08",

  rawSteps: [],       // Wszystkie kroki w repozytorium
  allSteps: [],       // Kroki przefiltrowane przez aktywne poziomy (enabledTiers)
  currentStepIdx: 0,
  completedSteps: new Set(),
  instructorMode: false,
  adminAuthenticated: false,
  onboardingSeen: false,

  cards: [],
  maximizedCardId: null,
  savedOpenStateBeforeMax: null,
  inspectorTab: "trees",
  workbenchTab: "term",
  taskMinimized: false,

  directorPlaying: false,
  directorPaused: false,
  directorTimer: null,
  directorOrbTimers: [],
  savedLayoutBeforeDirector: null,
  speechKeepAliveTimer: null,
  directorBeatIdx: 0,
  directorFocusCardId: null,
  currentUtterance: null,

  // Stan Interaktywnego Obchodu po Aplikacji (Tour z kursorem)
  tourActive: false,
  tourIdx: 0,
  tourAuto: false,
  tourTimer: null,

  // Nawigacja strzałkami Góra / Dół po historii komend terminala
  cmdHistoryIdx: 0,
  cmdDraft: "",

  // Stan systemu zgłoszeń testowych (Feedback) i anonimowej korespondencji z Adminem
  feedbackClientId: "",
  feedbackAuthor: "",
  feedbackThreads: [],
  knownProgressCodes: [],
  adminFeedbackThreads: [],
  feedbackSyncTimer: null,

  // Stan systemu telemetrii i logów aktywności (analityka sesji, sprzętu, pisania vs klikania i retencji audio)
  telemetrySessionId: "",
  telemetrySeq: 0,
  telemetryQueue: [],
  telemetryDeviceProfile: {},
  telemetryLastInputTs: 0,
  telemetryIsIdle: false,
  telemetryTabHiddenAt: 0,
  telemetryCurrentStepId: "",
  telemetryStepEnterTs: 0,
  telemetryUnsentActiveMs: 0,
  telemetryUnsentIdleMs: 0,
  telemetryUnsentAudioMs: 0,
  telemetryTickTimer: null,
  telemetryFlushTimer: null,
  cmdTypingStartTs: 0,
  cmdKeystrokeCount: 0,
  cmdBackspaceCount: 0,
  cmdPastedFlag: false,
  cmdUsedHistoryFlag: false,
  nextCmdInputMode: null,
  directorStopReason: null,
  adminActivitySummary: null,

  selectedVoiceId: "mp3_eleven",
  availableSystemVoices: [],

  voicePresets: [
    { id: "mp3_eleven", label: "🎵 Studio MP3 (ElevenLabs v4)", gender: "male", pitch: 1.0, rate: 1.0 },
    { id: "female_std", label: "🎙️ Lektorka: Paulina / Zofia (Kobieta)", gender: "female", pitch: 1.06, rate: 1.02 },
    { id: "male_std", label: "🎙️ Lektor: Marek / Adam (Mężczyzna)", gender: "male", pitch: 0.78, rate: 0.98 },
    { id: "female_fast", label: "🎙️ Lektorka: Dynamiczna (1.15x)", gender: "female", pitch: 1.04, rate: 1.15 },
    { id: "male_calm", label: "🎙️ Lektor: Spokojny (0.90x)", gender: "male", pitch: 0.84, rate: 0.90 }
  ],

  tourSteps: [
    {
      targetId: "btnDrawer",
      title: "1. Mapa Kursu (Syllabus) i Przeskakiwanie Tematów",
      desc: "Kliknij ten przycisk, aby otworzyć spis wszystkich modułów. Przy każdym kroku znajdziesz przyciski <b>✓ Zalicz</b> (aby przeskoczyć znany temat awansem) oraz <b>↺ Resetuj</b> (aby powtórzyć pojedyncze ćwiczenie bez utraty reszty postępu!)."
    },
    {
      targetId: "profileSelectTop",
      title: "2. Wybór Poziomu Kursu (Podstawowy – Wszystkie)",
      desc: "Kompaktowe menu pozwala w każdej chwili przełączyć poziom trudności: <b>┌ Podstawowy</b> (20 kroków), <b>├ Rozszerzony</b> (11 kroków), <b>├ Zaawansowany</b> (10 kroków) albo spięte linią <b>└─▸ Wszystkie</b> (pełne 41 kroków kursu)."
    },
    {
      targetId: "topBreadcrumbWrap",
      spotlightIds: ["btnPrevStepTop", "topBreadcrumbWrap", "btnNextStepTop"],
      title: "3. Rozwijane Menu Modułu (Moduł XY) i Strzałki Nawigacji (◀ / ▶)",
      desc: "Najedź myszką lub kliknij ramkę <b>Moduł XY ▸ Krok</b>, aby rozwinąć pełny opis zagadnienia, cel ćwiczenia i kropki nawigacji w module. Po lewej i prawej stronie ramki znajdują się strzałki <b>◀</b> (poprzedni krok) oraz <b>▶</b> (następny krok) — są <b>niebieskie</b>, gdy przejście jest dostępne, a <b>ciemne</b> na początku lub końcu wybranego poziomu."
    },
    {
      targetId: "btnFeedbackTop",
      title: "4. Przycisk Feedback i Mikro-Dioda Stanu Zgłoszeń",
      desc: "Aplikacja jest w fazie testów — po najechaniu lub kliknięciu <b>Feedback</b> rozwiniesz opis z linkiem do zgłaszania błędów i sugestii (anonimowo lub z podpisem). Zgłoszenia zapisują się w historii kursu, a <b>mikro-dioda</b> na przycisku pokazuje status: <b style='color:#fbbf24;'>● Zgłoszone</b>, <b style='color:#38bdf8;'>● Odczytane przez Admina</b> lub <b style='color:#4ade80;'>● Przyszła odpowiedź!</b>"
    },
    {
      targetId: "btnDirector",
      spotlightIds: ["btnDirectorPauseTop", "btnDirector"],
      title: "5. Odtwarzanie Audio (START / STOP) i Pauza",
      desc: "Kliknij <b>START</b> (u góry lub na dole Sceny Wiedzy), aby uruchomić narrację głosową lektora zsynchronizowaną z płynnym wskaźnikiem uwagi oraz podświetlaniem omawianych linii kodu, wierszy tabel i obszarów w Inspektorze."
    },
    {
      targetId: "leftTop",
      title: "6. Dynamiczna Scena Wiedzy",
      desc: "W lewym górnym panelu prezentowana jest teoria oraz przykłady komend. Każde okienko możesz powiększyć na pełny panel przyciskiem <b>⤢ 100%</b> lub zamykać i otwierać z paska dokowania."
    },
    {
      targetId: "leftBottom",
      title: "7. Nadzorowane Zadanie Praktyczne",
      desc: "W nagłówku widzisz zwięzły tytuł zadania, przyciski <b>Podpowiedź</b> i <b>Reset</b>, a pod spodem <b>pasek z pełną treścią polecenia</b> (czytaną głosem lektorki) i gotowymi przyciskami komend. Na dole okienka znajdują się indykatory etapów zaliczenia."
    },
    {
      targetId: "rightTop",
      title: "8. Wizualny Inspektor .git/ (z kolorowaniem składni)",
      desc: "Pokazuje na żywo wnętrze Gita w 3 zakładkach: <b>1. Trzy Obszary</b> (HEAD, Indeks, Dysk), <b>2. Graf DAG</b> oraz <b>3. Obiekty .git/</b>. Po prawej u góry możesz też najechać na pigułkę <b>git status -s</b>, aby rozwinąć pełny raport stanu."
    },
    {
      targetId: "rightBottom",
      title: "9. Terminal Git Bash i Edytor Pliku VFS",
      desc: "Wpisuj komendy w terminalu (działa historia komend strzałkami Góra/Dół, kontrola składni opcji oraz strażnik kolejności ćwiczenia) lub przełącz się na <b>Edytor pliku VFS</b>."
    },
    {
      targetId: "btnSaveTop",
      spotlightIds: ["btnSaveTop", "btnLoadTop", "btnUserSessionTop", "scormStatusBadge"],
      title: "10. Zapisz, Wczytaj, Sesja / Kod (GLAB-...) oraz Autozapis",
      desc: "W kolejności od lewej do prawej: <b>Zapisz...</b> i <b>Wczytaj</b> eksportują/importują plik <code>.json</code> z pełną historią kursu (wraz z korespondencją Feedback!), <b>Sesja / Kod</b> pozwala skopiować osobisty kod <b>GLAB-...</b> i wybrać tryb <b>Prywatny / Wspólny PC</b>, a obok widnieje status <b>Autozapisu</b> i przycisk <b>Admin</b>."
    },
    {
      targetId: "splitMainV",
      highlightSplitters: true,
      title: "11. Trzy Ruchome Belki Podziału (║ oraz ══)",
      desc: "Cztery strefy ekranu oddzielają <b>3 ruchome belki podziału</b> (pionowa <code>║</code> pośrodku oraz dwie poziome <code>══</code> po lewej i prawej stronie — podświetlone teraz na żółto). Możesz je swobodnie przeciągać myszką, regulując szerokość i wysokość okienek."
    },
    {
      targetId: "btnResetLayoutTop",
      highlightSplitters: true,
      title: "12. Przycisk Resetu Układu Okienek (Alt+R)",
      desc: "Gdybyś zbyt mocno przesunął belki podziału lub zwinął panel zadania, kliknij ten <b>malutki przycisk układu</b> obok znaku zapytania (albo <b>kliknij dwukrotnie</b> dowolną belkę podziału <code>║</code> / <code>══</code> lub naciśnij <code>Alt+R</code>), aby od razu przywrócić optymalny układ!"
    }
  ],

  // PŁASKIE, WYRAŹNE IKONY WEKTOROWE 2D (ZAMIAST ROZMYTYCH EMOJI 3D)
  svg2d(name) {
    const map = {
      play: `<svg class="ico2d" viewBox="0 0 16 16"><polygon points="4,2.5 13.5,8 4,13.5" fill="currentColor"/></svg>`,
      pause: `<svg class="ico2d" viewBox="0 0 16 16"><rect x="3.5" y="2.8" width="3.2" height="10.4" rx="0.8" fill="currentColor"/><rect x="9.3" y="2.8" width="3.2" height="10.4" rx="0.8" fill="currentColor"/></svg>`,
      stop: `<svg class="ico2d" viewBox="0 0 16 16"><rect x="3.5" y="3.5" width="9" height="9" rx="1" fill="currentColor"/></svg>`,
      speakerIdle: `<svg class="ico2d speaker-svg" viewBox="0 0 18 16"><polygon points="2,5.5 5.5,5.5 9.5,2 9.5,14 5.5,10.5 2,10.5" fill="#0f172a"/><path d="M12 5.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/></svg>`,
      speakerPlaying: `<svg class="ico2d speaker-svg" viewBox="0 0 18 16"><polygon points="1.5,5.5 5,5.5 9,2 9,14 5,10.5 1.5,10.5" fill="#0f172a"/><path class="speaker-wave-anim" d="M11.5 5a4 4 0 0 1 0 6" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round"/><path class="speaker-wave-anim" d="M14.2 2.6a7.4 7.4 0 0 1 0 10.8" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round"/></svg>`,
      speakerLight: `<svg class="ico2d" viewBox="0 0 18 16"><polygon points="1.5,5.5 5,5.5 9,2 9,14 5,10.5 1.5,10.5" fill="#facc15"/><path class="speaker-wave-anim" d="M11.5 5a4 4 0 0 1 0 6M14 2.8a7.2 7.2 0 0 1 0 10.4" fill="none" stroke="#38bdf8" stroke-width="1.7" stroke-linecap="round"/></svg>`,
      task: `<svg class="ico2d" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/><polyline points="4.3,8.2 7,10.8 11.7,5.2" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      check: `<svg class="ico2d" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="#22c55e"/><polyline points="4.8,8.2 7,10.5 11.3,5.5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      pending: `<svg class="ico2d" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="#d97706" stroke-width="1.8"/><circle cx="8" cy="8" r="2.2" fill="#f59e0b"/></svg>`,
      dotOpen: `<svg class="ico2d" viewBox="0 0 16 16"><circle cx="8" cy="8" r="4.8" fill="#4ade80" stroke="#166534" stroke-width="1.2"/></svg>`,
      plusClosed: `<svg class="ico2d" viewBox="0 0 16 16"><line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      target: `<svg class="ico2d" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="#ef4444" stroke-width="1.6"/><circle cx="8" cy="8" r="3.4" fill="none" stroke="#facc15" stroke-width="1.6"/><circle cx="8" cy="8" r="1.5" fill="#38bdf8"/></svg>`,
      code: `<svg class="ico2d" viewBox="0 0 16 16"><polyline points="5.5,4.5 2,8 5.5,11.5" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="10.5,4.5 14,8 10.5,11.5" fill="none" stroke="#4ade80" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      bolt: `<svg class="ico2d" viewBox="0 0 16 16"><polygon points="9,1.5 3.5,9 8,9 7,14.5 12.5,7 8,7" fill="#facc15" stroke="#ca8a04" stroke-width="0.9" stroke-linejoin="round"/></svg>`,
      branch: `<svg class="ico2d" viewBox="0 0 16 16"><line x1="4.5" y1="3.5" x2="4.5" y2="12.5" stroke="#16a34a" stroke-width="1.8"/><path d="M4.5 9.5c3.5 0 4.5-2 7-4" fill="none" stroke="#2563eb" stroke-width="1.8"/><circle cx="4.5" cy="3.5" r="2.1" fill="#22c55e"/><circle cx="4.5" cy="12.5" r="2.1" fill="#16a34a"/><circle cx="11.5" cy="5.5" r="2.1" fill="#3b82f6"/></svg>`,
      layers: `<svg class="ico2d" viewBox="0 0 16 16"><polygon points="8,1.5 14.5,5 8,8.5 1.5,5" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/><polyline points="1.5,8.2 8,11.7 14.5,8.2" fill="none" stroke="#2563eb" stroke-width="1.6"/><polyline points="1.5,11.2 8,14.7 14.5,11.2" fill="none" stroke="#16a34a" stroke-width="1.6"/></svg>`,
      search: `<svg class="ico2d" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" fill="none" stroke="#c084fc" stroke-width="1.8"/><line x1="10.3" y1="10.3" x2="14.2" y2="14.2" stroke="#c084fc" stroke-width="2" stroke-linecap="round"/></svg>`,
      shield: `<svg class="ico2d" viewBox="0 0 16 16"><path d="M8 1.5l5.5 2.2v4.1c0 3.5-2.3 5.8-5.5 6.9-3.2-1.1-5.5-3.4-5.5-6.9V3.7L8 1.5z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.1"/></svg>`,
      warn: `<svg class="ico2d" viewBox="0 0 16 16"><polygon points="8,2 14.8,13.8 1.2,13.8" fill="#facc15" stroke="#b45309" stroke-width="1.2" stroke-linejoin="round"/><line x1="8" y1="6.2" x2="8" y2="9.8" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.8" r="0.9" fill="#0f172a"/></svg>`,
      tag: `<svg class="ico2d" viewBox="0 0 16 16"><path d="M2 2h5.5l6.5 6.5-5.5 5.5L2 7.5V2z" fill="#c084fc" stroke="#7e22ce" stroke-width="1.1"/><circle cx="5" cy="5" r="1.2" fill="#fff"/></svg>`,
      globe: `<svg class="ico2d" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="#38bdf8" stroke-width="1.5"/><ellipse cx="8" cy="8" rx="3" ry="6.2" fill="none" stroke="#38bdf8" stroke-width="1.2"/><line x1="2" y1="8" x2="14" y2="8" stroke="#38bdf8" stroke-width="1.2"/></svg>`
    };
    return map[name] || map.code;
  },

  replaceEmojisWith2D(str) {
    if (!str) return "";
    return String(str)
      .replace(/🎯|🧭|✨/g, this.svg2d("target"))
      .replace(/📐|📦|🗂️|📊/g, this.svg2d("layers"))
      .replace(/💻|🛠️|🔧|⚙️|📝/g, this.svg2d("code"))
      .replace(/⚡|🚀|💡|🎉/g, this.svg2d("bolt"))
      .replace(/🌿|🔀|🍒/g, this.svg2d("branch"))
      .replace(/🔍|🔎|🕵️/g, this.svg2d("search"))
      .replace(/🛡️|🔒|🔓|🔑/g, this.svg2d("shield"))
      .replace(/⚠️|🚨|🧹/g, this.svg2d("warn"))
      .replace(/🏷️/g, this.svg2d("tag"))
      .replace(/🌐|☁️|📡/g, this.svg2d("globe"));
  },

  normalizeLoadedProfileState(saved) {
    const cfg = window.COURSE_CONFIG;
    if (!cfg || cfg.lockProfileForStudent) return;

    const legacyMap = {
      extended_only: "extended",
      advanced_only: "advanced"
    };

    if (saved && saved.activeProfile) {
      let profId = legacyMap[saved.activeProfile] || saved.activeProfile;
      if (!saved.profileMenuV2) {
        // Migracja ze starej 6-elementowej listy (gdzie "advanced" oznaczało wszystkie 3 poziomy, a "extended" oznaczało basic+extended)
        if (saved.activeProfile === "advanced" && Array.isArray(saved.enabledTiers) && saved.enabledTiers.length === 3) {
          profId = "basic";
        } else if (saved.activeProfile === "extended" && Array.isArray(saved.enabledTiers) && saved.enabledTiers.length === 2) {
          profId = "extended";
        } else if (saved.activeProfile === "ext_adv") {
          profId = "all";
        }
      }
      if (!cfg.profiles[profId]) {
        profId = "basic";
      }
      cfg.activeProfile = profId;
      if (profId !== "custom" && cfg.profiles[profId]) {
        cfg.enabledTiers = [...cfg.profiles[profId].allowedTiers];
      } else if (Array.isArray(saved.enabledTiers) && saved.enabledTiers.length > 0) {
        cfg.enabledTiers = saved.enabledTiers;
      }
    } else if (cfg.profiles[cfg.activeProfile]) {
      cfg.enabledTiers = [...cfg.profiles[cfg.activeProfile].allowedTiers];
    }
  },

  init() {
    const saved = StorageManager.loadState();
    if (saved) {
      this.completedSteps = new Set(saved.completedSteps || []);
      this.instructorMode = !!saved.instructorMode;
      this.onboardingSeen = !!saved.onboardingSeen;
      this.normalizeLoadedProfileState(saved);
      this.selectedVoiceId = "mp3_eleven";
      if (saved.feedbackClientId) this.feedbackClientId = String(saved.feedbackClientId);
      if (saved.feedbackAuthor) this.feedbackAuthor = String(saved.feedbackAuthor);
      if (Array.isArray(saved.feedbackThreads)) this.feedbackThreads = saved.feedbackThreads;
      if (Array.isArray(saved.knownProgressCodes)) this.knownProgressCodes = saved.knownProgressCodes;
      if (saved.policies && window.COURSE_CONFIG && window.COURSE_CONFIG.policies) {
        Object.assign(window.COURSE_CONFIG.policies, saved.policies);
      }
      if (saved.security && window.COURSE_CONFIG && window.COURSE_CONFIG.security) {
        Object.assign(window.COURSE_CONFIG.security, saved.security);
      }
    } else if (window.COURSE_CONFIG.profiles[window.COURSE_CONFIG.activeProfile]) {
      window.COURSE_CONFIG.enabledTiers = [...window.COURSE_CONFIG.profiles[window.COURSE_CONFIG.activeProfile].allowedTiers];
    }
    if (!this.feedbackClientId) {
      this.feedbackClientId = "anon_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    }

    StorageManager.init();
    this.applyUrlParameters();
    this.initVoiceEngine();
    this.rebuildActiveCurriculum();
    this.renderProfileSelectorUI();
    this.setupSplitters();
    this.setupTerminalInput();
    this.setupKeyboardShortcuts();
    this.setupExpandableFramesCloseOnOutsideClick();

    let startIdx = 0;
    if (saved && saved.currentStepId) {
      const found = this.allSteps.findIndex(s => s.id === saved.currentStepId);
      if (found >= 0) startIdx = found;
    }
    this.initTelemetrySystem();
    this.loadStep(startIdx);
    this.initFeedbackSystem();

    // Jeśli w adresie URL przekazano ?resume=GLAB-XXXX-XXXX-XXXX, odtwórz postęp z kodu
    const urlResume = new URLSearchParams(window.location.search).get("resume");
    if (urlResume) {
      this.applyProgressCode(urlResume, true);
      this.onboardingSeen = true;
    } else if (!this.onboardingSeen && !StorageManager.scormAPI) {
      // Przy pierwszym wejściu na otwartą wersję webową pokaż jasny panel „Zanim zaczniesz”
      this.openUserSessionModal();
    }
  },

  // ROZWIJANE RAMKI (BREADCRUMB, STATUS, LEKTOR)
  togglePinExpandable(frameId, event) {
    if (event) event.stopPropagation();
    const el = document.getElementById(frameId);
    if (!el) return;
    const wasPinned = el.classList.contains("pinned");
    document.querySelectorAll(".expandable-frame.pinned").forEach(f => f.classList.remove("pinned"));
    if (!wasPinned) {
      el.classList.add("pinned");
    }
  },

  setupExpandableFramesCloseOnOutsideClick() {
    window.addEventListener("click", () => {
      document.querySelectorAll(".expandable-frame.pinned").forEach(f => f.classList.remove("pinned"));
    });
  },

  // KOLOROWANIE SKŁADNI W ZAKŁADKACH INSPEKTORA
  escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  },

  highlightCode(rawText, filename = "") {
    if (!rawText) return '<span class="syn-cm">(pusty lub brak pliku)</span>';
    const lines = String(rawText).split("\n");
    return lines.map(line => {
      if (line.startsWith("<<<<<<<")) {
        return `<span class="syn-conf-h">${this.escapeHtml(line)}</span>`;
      }
      if (line.startsWith("=======")) {
        return `<span class="syn-conf-m">${this.escapeHtml(line)}</span>`;
      }
      if (line.startsWith(">>>>>>>")) {
        return `<span class="syn-conf-f">${this.escapeHtml(line)}</span>`;
      }

      const trimmed = line.trim();
      if (filename.endsWith(".md") && trimmed.startsWith("#")) {
        return `<span class="syn-h1">${this.escapeHtml(line)}</span>`;
      }
      if (trimmed.startsWith("#")) {
        return `<span class="syn-cm">${this.escapeHtml(line)}</span>`;
      }

      // Tokenizacja linii kodu (komentarz końcowy, napisy, słowa kluczowe, liczby, stałe)
      let codePart = line;
      let commentPart = "";
      const hashIdx = line.indexOf(" #");
      if (hashIdx >= 0) {
        codePart = line.slice(0, hashIdx);
        commentPart = `<span class="syn-cm">${this.escapeHtml(line.slice(hashIdx))}</span>`;
      }

      // Zabezpieczenie napisów w cudzysłowach przed dalszym kolorowaniem
      const strings = [];
      const withPlaceholders = codePart.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (m) => {
        const idx = strings.length;
        strings.push(`<span class="syn-str">${this.escapeHtml(m)}</span>`);
        return `\x00STR${idx}\x00`;
      });

      let html = this.escapeHtml(withPlaceholders);

      // Słowa kluczowe Python / Shell / Config
      html = html.replace(/\b(def|return|import|from|if|elif|else|for|while|in|class|True|False|None|and|or|not|try|except|raise|with|as|pass|async|await)\b/g, '<span class="syn-kw">$1</span>');
      html = html.replace(/\b(print|len|range|open|str|int|dict|list|set|status|analyze|main|run|init|connect)\b(?=\s*\()/g, '<span class="syn-fn">$1</span>');
      html = html.replace(/\b([A-Z][A-Z0-9_]{2,})\b/g, '<span class="syn-var">$1</span>');
      html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syn-num">$1</span>');

      // Przywrócenie napisów
      html = html.replace(/\x00STR(\d+)\x00/g, (_, i) => strings[Number(i)]);
      return html + commentPart;
    }).join("\n");
  },

  highlightDag(commits, branch, detached) {
    if (!commits || commits.length === 0) {
      return `<span class="syn-cm">(Brak commitów — gałąź nienarodzona / Unborn Branch: refs/heads/${this.escapeHtml(branch)})</span>`;
    }
    return commits.map((c, idx) => {
      const prefix = idx === 0
        ? (detached
            ? `<span class="syn-var">HEAD (detached)</span> ──▶ `
            : `<span class="syn-var">HEAD</span> ──▶ <span class="syn-br">${this.escapeHtml(branch)}</span> ──▶ `)
        : `                    `;
      const parentInfo = c.parent2
        ? ` <span class="syn-tag">(Merge: ${this.escapeHtml(c.parent)} + ${this.escapeHtml(c.parent2)})</span>`
        : "";
      return `${prefix}<span class="syn-sha">[${this.escapeHtml(c.id)}]</span> <span class="syn-str">${this.escapeHtml(c.msg)}</span>${parentInfo}`;
    }).join(`\n                    <span class="syn-cm">│ (wskaźnik parent)</span>\n                    <span class="syn-cm">▼</span>\n`);
  },

  highlightGitRefs() {
    const headLine = VFSGit.detached
      ? `<span class="syn-var">HEAD:</span> <span class="syn-sha">${this.escapeHtml(VFSGit.headCommit.id)}</span> <span class="syn-cm">(Detached HEAD)</span>`
      : `<span class="syn-var">HEAD:</span> <span class="syn-kw">ref:</span> <span class="syn-br">refs/heads/${this.escapeHtml(VFSGit.branch)}</span>`;

    const branchLines = Object.entries(VFSGit.branches || {}).map(([k, v]) => {
      if (k.includes("/")) {
        return `<span class="syn-rem">refs/remotes/${this.escapeHtml(k)}</span> ──▶ <span class="syn-sha">${this.escapeHtml(v)}</span>`;
      }
      return `<span class="syn-br">refs/heads/${this.escapeHtml(k)}</span> ──▶ <span class="syn-sha">${this.escapeHtml(v)}</span>`;
    });

    const tagLines = Object.entries(VFSGit.tags || {}).map(([k, v]) =>
      `<span class="syn-tag">refs/tags/${this.escapeHtml(k)}</span> ──▶ <span class="syn-sha">${this.escapeHtml(v)}</span>`
    );

    return [headLine, ...branchLines, ...tagLines].join("\n");
  },

  highlightGitConfig() {
    return Object.entries(VFSGit.config || {}).map(([k, v]) =>
      `<span class="syn-fn">${this.escapeHtml(k)}</span> = <span class="syn-str">${this.escapeHtml(v)}</span>`
    ).join("\n");
  },

  highlightGitObjects() {
    if (!VFSGit.commits || VFSGit.commits.length === 0) {
      return `<span class="syn-cm">(brak obiektów commit w .git/objects/)</span>`;
    }
    const commitRows = VFSGit.commits.map(c =>
      `<span class="syn-kw">commit</span> <span class="syn-sha">${this.escapeHtml(c.id)}</span> <span class="syn-str">${this.escapeHtml(c.msg)}</span>`
    );
    if (VFSGit.stashStack && VFSGit.stashStack.length > 0) {
      commitRows.unshift(`<span class="syn-tag">stash@{0}</span> <span class="syn-cm">(wielorodzicowy commit w refs/stash)</span>`);
    }
    return commitRows.join("\n");
  },

  // KOLOROWANIE SKŁADNI KOMENDY I WYJŚCIA W TERMINALU GIT BASH
  highlightTerminalCmd(rawCmd) {
    if (!rawCmd) return "";
    const strings = [];
    const masked = String(rawCmd).replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (m) => {
      const idx = strings.length;
      strings.push(`<span class="ps-s">${this.escapeHtml(m)}</span>`);
      return `\x00STR${idx}\x00`;
    });

    let html = this.escapeHtml(masked);
    html = html.replace(/(\||&amp;&amp;|;|&gt;&gt;|&gt;)/g, '<span class="term-pipe">$1</span>');
    html = html.replace(/\b(git|ls|ll|la|dir|tree|find|touch|cp|mv|rm|cat|nl|less|more|pwd|cd|whoami|id|hostname|uname|date|env|which|type|history|grep|head|tail|wc|sort|clear|cls|help|echo|printf)\b/g, '<span class="ps-c">$1</span>');
    html = html.replace(/\b(init|config|status|diff|add|commit|restore|rm|mv|ls-files|check-ignore|hash-object|cat-file|rev-parse|log|shortlog|blame|clean|reset|revert|stash|reflog|branch|switch|checkout|merge-base|merge|rebase|cherry-pick|remote|fetch|pull|push|tag|show)\b/g, '<span class="ps-sub">$1</span>');
    html = html.replace(/(?:^|\s)(--[a-z0-9-]+(?:=[a-zA-Z0-9._/-]+)?|-[a-zA-Z0-9]+)(?=\s|$)/g, ' <span class="ps-f">$1</span>');
    html = html.replace(/\b(HEAD(?:~\d+|\^\d+|\^\{tree\})?|origin\/[a-zA-Z0-9._/-]+|upstream\/[a-zA-Z0-9._/-]+|refs\/[a-zA-Z0-9._/-]+|main|feature[a-zA-Z0-9._-]*)\b/g, '<span class="ps-p">$1</span>');

    return html.replace(/\x00STR(\d+)\x00/g, (_, i) => strings[Number(i)]);
  },

  highlightTerminalOutput(rawOut, rawCmd = "") {
    if (!rawOut) return "";
    const lines = String(rawOut).split("\n");
    return lines.map(line => {
      if (line.startsWith("--- ") || line.startsWith("+++ ")) {
        return `<span class="term-diff-hdr">${this.escapeHtml(line)}</span>`;
      }
      if (line.startsWith("@@ ")) {
        return `<span class="term-diff-hunk">${this.escapeHtml(line)}</span>`;
      }
      if (line.startsWith("+") && !line.startsWith("+++")) {
        return `<span class="term-diff-add">${this.escapeHtml(line)}</span>`;
      }
      if (line.startsWith("-") && !line.startsWith("---") && !/^-[rwx-]{9}\s/.test(line)) {
        return `<span class="term-diff-del">${this.escapeHtml(line)}</span>`;
      }
      // Wiersze ls -l / ls -lh / ll: np. "-rw-r--r-- 1 dev 197121      42B Oct 24 14:20 README.md"
      const lsMatch = line.match(/^([d-][rwx-]{9})(\s+\d+\s+\S+\s+\S+\s+)(\S+)(\s+[A-Z][a-z]{2}\s+\d+\s+\d+:\d+\s+)(.+)$/);
      if (lsMatch) {
        const perm = lsMatch[1];
        const meta = lsMatch[2];
        const size = lsMatch[3];
        const date = lsMatch[4];
        const name = lsMatch[5];
        const isDir = perm.startsWith("d") || name.endsWith("/");
        const nameCls = isDir ? "syn-fn" : "syn-str";
        return `<span class="syn-cm">${this.escapeHtml(perm)}${this.escapeHtml(meta)}</span><span class="syn-num">${this.escapeHtml(size)}</span><span class="syn-cm">${this.escapeHtml(date)}</span><span class="${nameCls}">${this.escapeHtml(name)}</span>`;
      }
      if (/^(bash:|git:|fatal:|error:|rm:|cp:|mv:|cat:)/.test(line) || line.includes("trailing whitespace") || line.includes("leftover conflict marker")) {
        return `<span class="term-err">${this.escapeHtml(line)}</span>`;
      }
      if (line.startsWith("💡")) {
        return `<span class="term-hint">${this.escapeHtml(line)}</span>`;
      }
      if (/^[╔║╚]/.test(line)) {
        return `<span class="syn-fn">${this.escapeHtml(line)}</span>`;
      }

      // Wiersze z komendy history: "   1  git status -s"
      const histMatch = line.match(/^(\s*\d+\s+)(.+)$/);
      if (histMatch && (rawCmd.startsWith("history") || rawCmd.includes("| grep"))) {
        return `<span class="term-hist-num">${this.escapeHtml(histMatch[1])}</span>${this.highlightTerminalCmd(histMatch[2])}`;
      }

      // Wiersze git status -s: "MM app.py", "?? secret.key"
      const stMatch = line.match(/^(MM|M | M|A |AM|D | D|UU|\?\?)\s+(.+)$/);
      if (stMatch) {
        const code = stMatch[1];
        const file = stMatch[2];
        const codeCls = (code === "??" || code === "UU") ? "term-err" : "syn-var";
        return `<span class="${codeCls}">${this.escapeHtml(code)}</span> <span class="syn-str">${this.escapeHtml(file)}</span>`;
      }

      // Ogólne kolorowanie hashy SHA-1, referencji, gałęzi i adresów URL
      let html = this.escapeHtml(line);
      html = html.replace(/(https?:\/\/\S+)/g, '<span class="syn-str">$1</span>');
      html = html.replace(/\b(HEAD@\{\d+\}|refs\/[a-zA-Z0-9._/-]+)\b/g, '<span class="syn-tag">$1</span>');
      html = html.replace(/\b(origin\/[a-zA-Z0-9._/-]+|upstream\/[a-zA-Z0-9._/-]+|remotes\/[a-zA-Z0-9._/-]+)\b/g, '<span class="syn-rem">$1</span>');
      html = html.replace(/^(\*\s+\S+)/, '<span class="syn-br">$1</span>');
      html = html.replace(/\b([0-9a-f]{7,40})\b/g, '<span class="syn-sha">$1</span>');
      html = html.replace(/\b(commit|tree|blob|parent|author|committer|Fast-forward)\b/g, '<span class="syn-fn">$1</span>');
      return html;
    }).join("\n");
  },

  initVoiceEngine() {
    this.renderVoiceSelectorUI();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices() || [];
        this.availableSystemVoices = voices.filter(v =>
          v.lang && (v.lang.toLowerCase().startsWith("pl") || v.name.toLowerCase().includes("polish") || v.name.toLowerCase().includes("polski"))
        );
        this.renderVoiceSelectorUI();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  },

  renderVoiceSelectorUI() {
    const sel = document.getElementById("voiceSelectTop");
    if (!sel) return;

    const presetOptions = this.voicePresets.map(p =>
      `<option value="${p.id}" ${p.id === this.selectedVoiceId ? "selected" : ""}>${p.label}</option>`
    );

    const sysOptions = (this.availableSystemVoices || []).map((v, idx) => {
      const id = `sys_${idx}`;
      return `<option value="${id}" ${id === this.selectedVoiceId ? "selected" : ""}>🗣️ Systemowy: ${v.name}</option>`;
    });

    sel.innerHTML = [...presetOptions, ...sysOptions].join("");
  },

  changeVoice(voiceId) {
    this.selectedVoiceId = voiceId;
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
    if (this.directorPlaying) {
      this.runDirectorBeat();
    } else {
      this.speakPreview("Wybrano nowy głos. Kliknij przycisk Start, aby rozpocząć naukę.", "voice_selected");
    }
  },

  pickSystemVoiceForGender(gender) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const allVoices = window.speechSynthesis.getVoices() || [];
    const plVoices = allVoices.filter(v =>
      v.lang && (v.lang.toLowerCase().startsWith("pl") || v.name.toLowerCase().includes("polish") || v.name.toLowerCase().includes("polski"))
    );
    if (plVoices.length === 0) return allVoices[0] || null;

    if (gender === "male") {
      const maleHit = plVoices.find(v => /marek|adam|krzysztof|male|mężczyzna/i.test(v.name));
      if (maleHit) return { voice: maleHit, nativeGenderMatch: true };
      return { voice: plVoices[0], nativeGenderMatch: false };
    } else {
      const femaleHit = plVoices.find(v => /paulina|zofia|agnieszka|ewa|google|female|kobieta/i.test(v.name));
      if (femaleHit) return { voice: femaleHit, nativeGenderMatch: true };
      return { voice: plVoices[0], nativeGenderMatch: true };
    }
  },

  getAudioPlayerElement() {
    if (typeof document === "undefined") return null;
    let el = document.getElementById("elevenAudioPlayer");
    if (!el && document.body) {
      el = document.createElement("audio");
      el.id = "elevenAudioPlayer";
      el.preload = "auto";
      el.style.display = "none";
      document.body.appendChild(el);
    }
    return el;
  },

  stopAllAudio() {
    this.audioPlayToken = (this.audioPlayToken || 0) + 1;
    this.pendingTaskBodyPlay = null;
    this.mainBeatAudioActive = false;
    this.mainBeatAudioMetadataLoaded = false;
    this.usingWebSpeechFallback = false;
    clearTimeout(this.directorTimer);
    clearTimeout(this.webSpeechStartTimer);
    clearInterval(this.speechKeepAliveTimer);
    if (this.directorOrbRafId) {
      cancelAnimationFrame(this.directorOrbRafId);
      this.directorOrbRafId = null;
    }
    if (Array.isArray(this.directorOrbTimers)) {
      this.directorOrbTimers.forEach(t => clearTimeout(t));
      this.directorOrbTimers = [];
    }
    if (this.currentAudioObj) {
      try {
        this.currentAudioObj.onended = null;
        this.currentAudioObj.onerror = null;
        this.currentAudioObj.oncanplay = null;
        this.currentAudioObj.onloadedmetadata = null;
        this.currentAudioObj.pause();
      } catch (e) {}
      this.currentAudioObj = null;
    }
    const domAudio = this.getAudioPlayerElement();
    if (domAudio) {
      try {
        domAudio.onended = null;
        domAudio.onerror = null;
        domAudio.oncanplay = null;
        domAudio.onloadedmetadata = null;
        domAudio.pause();
      } catch (e) {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    }
  },

  speakPreview(text, mp3Id = null) {
    this.stopAllAudio();
    const audio = this.getAudioPlayerElement();
    if (this.selectedVoiceId === "mp3_eleven" && mp3Id && audio) {
      const playToken = ++this.audioPlayToken;
      this.currentAudioObj = audio;
      let fallbackTriggered = false;
      let retriedAfterAbort = false;
      const fallback = () => {
        if (fallbackTriggered || this.audioPlayToken !== playToken) return;
        fallbackTriggered = true;
        audio.onended = null;
        audio.onerror = null;
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          this.speakViaWebSpeech(text, () => {});
        }
      };
      const attemptPlay = () => {
        if (fallbackTriggered || this.audioPlayToken !== playToken) return;
        const p = audio.play();
        if (p && typeof p.catch === "function") {
          p.catch((err) => {
            if (fallbackTriggered || this.audioPlayToken !== playToken) return;
            if (err && err.name === "AbortError") {
              if (!retriedAfterAbort) {
                retriedAfterAbort = true;
                setTimeout(attemptPlay, 60);
              }
              return;
            }
            fallback();
          });
        }
      };
      audio.onended = null;
      audio.onerror = fallback;
      audio.volume = 1.0;
      audio.muted = false;
      audio.src = `audio/${mp3Id}.mp3?v=20261108a`;
      audio.load();
      attemptPlay();
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    this.speakViaWebSpeech(text, () => {});
  },

  speakViaWebSpeech(text, onComplete) {
    const cleanSpeechText = String(text || "").replace(/dwukropek\s+:plan\.txt/gi, "dwukropek plan.txt");
    if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      this.directorTimer = setTimeout(onComplete, Math.max(3800, cleanSpeechText.length * 55));
      return;
    }

    let needCancelDelay = false;
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        needCancelDelay = true;
      }
    } catch (e) {}

    let finished = false;
    const finishOnce = () => {
      if (finished) return;
      finished = true;
      clearInterval(this.speechKeepAliveTimer);
      clearTimeout(this.directorTimer);
      onComplete();
    };

    const startUtterance = () => {
      if (finished) return;
      const utter = new SpeechSynthesisUtterance(cleanSpeechText);
      this.currentUtterance = utter;
      utter.lang = "pl-PL";

      if (this.selectedVoiceId && this.selectedVoiceId.startsWith("sys_")) {
        const idx = parseInt(this.selectedVoiceId.replace("sys_", ""), 10);
        const sysVoice = this.availableSystemVoices[idx];
        if (sysVoice) utter.voice = sysVoice;
        utter.pitch = 1.0;
        utter.rate = 1.0;
      } else {
        const preset = this.voicePresets.find(p => p.id === this.selectedVoiceId) || this.voicePresets[0];
        const picked = this.pickSystemVoiceForGender(preset.gender);
        if (picked && picked.voice) {
          utter.voice = picked.voice;
          if (preset.gender === "male" && picked.nativeGenderMatch) {
            utter.pitch = 0.96;
          } else {
            utter.pitch = preset.pitch;
          }
        } else {
          utter.pitch = preset.pitch;
        }
        utter.rate = preset.rate;
      }

      utter.onend = () => finishOnce();
      utter.onerror = () => {
        this.directorTimer = setTimeout(finishOnce, Math.max(3500, text.length * 50));
      };

      try {
        this.speechKeepAliveTimer = setInterval(() => {
          if (!this.directorPaused && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 8000);
        this.directorTimer = setTimeout(finishOnce, Math.max(6000, text.length * 85));
        window.speechSynthesis.speak(utter);
      } catch (e) {
        this.directorTimer = setTimeout(finishOnce, Math.max(3800, text.length * 55));
      }
    };

    if (needCancelDelay) {
      this.webSpeechStartTimer = setTimeout(startUtterance, 35);
    } else {
      startUtterance();
    }
  },

  applyUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const prof = params.get("profile");
    if (prof && window.COURSE_CONFIG.profiles[prof]) {
      window.COURSE_CONFIG.activeProfile = prof;
      window.COURSE_CONFIG.enabledTiers = [...window.COURSE_CONFIG.profiles[prof].allowedTiers];
    }
    const tiersParam = params.get("tiers");
    if (tiersParam) {
      const parsed = tiersParam.split(",").map(t => t.trim()).filter(t => ["basic", "extended", "advanced"].includes(t));
      if (parsed.length > 0) {
        window.COURSE_CONFIG.enabledTiers = parsed;
      }
    }
    if (params.get("lock") === "1") {
      window.COURSE_CONFIG.lockProfileForStudent = true;
    }
    if (params.get("admin") === "1" || params.get("instructor") === "1") {
      this.instructorMode = true;
    }
  },

  getStepEffectiveTier(step) {
    return window.COURSE_CONFIG.stepTierOverrides[step.id] || step.tier || "basic";
  },

  getActiveTiersList() {
    const cfg = window.COURSE_CONFIG;
    if (Array.isArray(cfg.enabledTiers) && cfg.enabledTiers.length > 0) {
      return cfg.enabledTiers;
    }
    const prof = cfg.profiles[cfg.activeProfile];
    return prof ? prof.allowedTiers : ["basic", "extended", "advanced"];
  },

  isStepAllowedInActiveProfile(step) {
    const tier = this.getStepEffectiveTier(step);
    if (tier === "hidden") return false;
    return this.getActiveTiersList().includes(tier);
  },

  rebuildActiveCurriculum() {
    this.rawSteps = [];
    this.allSteps = [];
    window.CURRICULUM.forEach(mod => {
      mod.steps.forEach(st => {
        const fullSt = { ...st, moduleId: mod.id, moduleTitle: mod.title };
        this.rawSteps.push(fullSt);
        if (this.isStepAllowedInActiveProfile(fullSt)) {
          this.allSteps.push(fullSt);
        }
      });
    });
  },

  renderProfileSelectorUI() {
    const cfg = window.COURSE_CONFIG;
    const selTop = document.getElementById("profileSelectTop");
    const selAdm = document.getElementById("adminProfileSelect");
    const lockBadge = document.getElementById("lockedProfileBadge");
    const btnAdminTop = document.getElementById("btnAdminTop");

    if (btnAdminTop) {
      btnAdminTop.style.display = cfg.security?.hideAdminButtonOnTopbar ? "none" : "inline-flex";
    }

    const visibleProfiles = Object.values(cfg.profiles).filter(p => p.id !== "custom" || cfg.activeProfile === "custom");
    const optionsHTML = visibleProfiles.map(p =>
      `<option value="${p.id}" ${p.id === cfg.activeProfile ? 'selected' : ''}>${p.shortLabel}</option>`
    ).join("");

    if (selTop) selTop.innerHTML = optionsHTML;
    if (selAdm) selAdm.innerHTML = optionsHTML;

    const currentProf = cfg.profiles[cfg.activeProfile] || cfg.profiles.basic || cfg.profiles.all;
    if (cfg.lockProfileForStudent) {
      selTop.style.display = "none";
      lockBadge.style.display = "inline-block";
      lockBadge.innerHTML = `${this.escapeHtml(currentProf.shortLabel)} ${this.svg2d("shield")}`;
    } else {
      selTop.style.display = "inline-block";
      lockBadge.style.display = "none";
    }

    const pInfo = document.getElementById("drawerProfileInfo");
    if (pInfo) pInfo.textContent = `Aktywne poziomy: ${currentProf.name}`;
  },

  switchProfile(profileId) {
    const prof = window.COURSE_CONFIG.profiles[profileId];
    if (!prof) return;
    const currentStepId = this.allSteps[this.currentStepIdx]?.id;
    window.COURSE_CONFIG.activeProfile = profileId;
    window.COURSE_CONFIG.enabledTiers = [...prof.allowedTiers];
    this.rebuildActiveCurriculum();
    this.renderProfileSelectorUI();

    const newIdx = this.allSteps.findIndex(s => s.id === currentStepId);
    this.loadStep(newIdx >= 0 ? newIdx : 0);
    this.renderAdminModalContent();
  },

  toggleEnabledTier() {
    const cfg = window.COURSE_CONFIG;
    const b = document.getElementById("chkTierBasic")?.checked;
    const e = document.getElementById("chkTierExtended")?.checked;
    const a = document.getElementById("chkTierAdvanced")?.checked;

    const selected = [];
    if (b) selected.push("basic");
    if (e) selected.push("extended");
    if (a) selected.push("advanced");

    if (selected.length === 0) {
      this.showToast("Przynajmniej jeden poziom kursu musi pozostać aktywny!", "err");
      this.renderAdminModalContent();
      return;
    }

    cfg.enabledTiers = selected;

    // Dopasuj wybrany zestaw poziomów do nazwanego profilu z listy rozwijanej
    const key = selected.join(",");
    const matchMap = {
      "basic": "basic",
      "extended": "extended",
      "advanced": "advanced",
      "basic,extended,advanced": "all"
    };
    cfg.activeProfile = matchMap[key] || "custom";
    if (cfg.profiles.custom) {
      cfg.profiles.custom.allowedTiers = [...selected];
    }

    const currentStepId = this.allSteps[this.currentStepIdx]?.id;
    this.rebuildActiveCurriculum();
    this.renderProfileSelectorUI();
    const newIdx = this.allSteps.findIndex(s => s.id === currentStepId);
    this.loadStep(newIdx >= 0 ? newIdx : 0);
    this.renderAdminModalContent();
  },

  getTierBadgeHTML(tier) {
    const labels = {
      basic: '<span class="tier-badge tier-basic">Podstawowy</span>',
      extended: '<span class="tier-badge tier-extended">Rozszerzony</span>',
      advanced: '<span class="tier-badge tier-advanced">Zaawansowany</span>'
    };
    return labels[tier] || labels.basic;
  },

  getSerializableState() {
    const currCode = this.encodeProgressCode();
    if (currCode && !this.knownProgressCodes.includes(currCode)) {
      this.knownProgressCodes.push(currCode);
      if (this.knownProgressCodes.length > 30) {
        this.knownProgressCodes = this.knownProgressCodes.slice(-30);
      }
    }
    return {
      activeProfile: window.COURSE_CONFIG.activeProfile,
      enabledTiers: window.COURSE_CONFIG.enabledTiers,
      profileMenuV2: true,
      selectedVoiceId: this.selectedVoiceId,
      voiceMigratedV4: true,
      currentStepId: this.allSteps[this.currentStepIdx]?.id,
      completedSteps: Array.from(this.completedSteps),
      instructorMode: this.instructorMode,
      onboardingSeen: this.onboardingSeen,
      feedbackClientId: this.feedbackClientId,
      feedbackAuthor: this.feedbackAuthor,
      feedbackThreads: this.feedbackThreads,
      knownProgressCodes: this.knownProgressCodes,
      policies: window.COURSE_CONFIG.policies,
      security: window.COURSE_CONFIG.security,
      vfsState: {
        headCommit: VFSGit.headCommit,
        index: VFSGit.index,
        worktree: VFSGit.worktree
      }
    };
  },

  restoreFromSavedState(data) {
    this.completedSteps = new Set(data.completedSteps || []);
    this.instructorMode = !!data.instructorMode;
    this.onboardingSeen = true;
    this.normalizeLoadedProfileState(data);
    if (data.feedbackClientId) this.feedbackClientId = String(data.feedbackClientId);
    if (data.feedbackAuthor) this.feedbackAuthor = String(data.feedbackAuthor);
    if (Array.isArray(data.feedbackThreads)) this.feedbackThreads = data.feedbackThreads;
    if (Array.isArray(data.knownProgressCodes)) {
      this.knownProgressCodes = Array.from(new Set([...(this.knownProgressCodes || []), ...data.knownProgressCodes]));
    }
    if (data.selectedVoiceId) {
      this.selectedVoiceId = data.selectedVoiceId;
      this.renderVoiceSelectorUI();
    }
    if (data.policies && window.COURSE_CONFIG && window.COURSE_CONFIG.policies) {
      Object.assign(window.COURSE_CONFIG.policies, data.policies);
      StorageManager.setupAutoSaveTimer();
    }
    if (data.security && window.COURSE_CONFIG && window.COURSE_CONFIG.security) {
      Object.assign(window.COURSE_CONFIG.security, data.security);
    }
    this.rebuildActiveCurriculum();
    this.renderProfileSelectorUI();
    const idx = this.allSteps.findIndex(s => s.id === data.currentStepId);
    this.loadStep(idx >= 0 ? idx : 0);
    this.updateFeedbackIndicatorUI();
    this.syncFeedbackWithServer(false);
  },

  loadStep(idx) {
    if (this.directorPlaying) {
      this.directorStopReason = "step_change";
    }
    this.toggleDirector(false);
    if (this.allSteps.length === 0) return;

    const prevStepId = this.telemetryCurrentStepId;
    if (prevStepId) {
      this.logActivityEvent("step_leave", {
        deltaActiveMs: this.telemetryUnsentActiveMs,
        deltaIdleMs: this.telemetryUnsentIdleMs,
        deltaAudioMs: this.telemetryUnsentAudioMs,
        completed: this.completedSteps.has(prevStepId)
      }, prevStepId);
      this.telemetryUnsentActiveMs = 0;
      this.telemetryUnsentIdleMs = 0;
      this.telemetryUnsentAudioMs = 0;
    }

    this.currentStepIdx = Math.max(0, Math.min(idx, this.allSteps.length - 1));
    const step = this.allSteps[this.currentStepIdx];
    this.telemetryCurrentStepId = step.id;
    this.telemetryStepEnterTs = Date.now();
    this.logActivityEvent("step_enter", {
      stepIdx: this.currentStepIdx,
      moduleId: step.moduleId,
      tier: this.getStepEffectiveTier(step),
      totalBeats: this.getEffectiveBeats(step).length,
      alreadyCompleted: this.completedSteps.has(step.id)
    }, step.id);

    VFSGit.loadCheckpoint(step.initialRepo);
    this.cards = step.cards.map(c => ({ ...c, open: true }));
    this.maximizedCardId = null;
    this.directorFocusCardId = null;
    this.savedOpenStateBeforeMax = null;
    this.inspectorTab = step.defaultInspector || "trees";

    // Zwięzły napis w ramce na górnym pasku + pełny opis w rozwijanej do dołu ramce
    const shortMod = step.moduleTitle.split(":")[0] || step.moduleTitle;
    document.getElementById("topBreadcrumb").innerHTML = `${shortMod} ▸ <b style="color:#fff;">${step.title}</b>`;
    const fullBread = document.getElementById("topBreadcrumbFull");
    if (fullBread) {
      fullBread.innerHTML = `
        <div style="margin-bottom:4px;"><span style="color:#94a3b8;">Moduł:</span> <b style="color:#facc15;">${step.moduleTitle}</b></div>
        <div style="margin-bottom:4px;"><span style="color:#94a3b8;">Krok (${this.currentStepIdx + 1}/${this.allSteps.length}):</span> <b style="color:#fff;">${step.title}</b> ${this.getTierBadgeHTML(this.getStepEffectiveTier(step))}</div>
        <div style="margin-bottom:4px;"><span style="color:#94a3b8;">Zagadnienie:</span> <span style="color:#38bdf8;">${step.heading}</span></div>
        <div><span style="color:#94a3b8;">Cel ćwiczenia:</span> <span style="color:#4ade80;">${step.taskTitle}</span></div>
      `;
    }

    const kickerText = `${step.moduleTitle.toUpperCase()} • PROJEKT: ${VFSGit.repoName.toUpperCase()}`;
    const kickerEl = document.getElementById("stageKicker");
    const titleEl = document.getElementById("stageTitle");
    if (kickerEl) {
      kickerEl.textContent = kickerText;
      kickerEl.title = kickerText;
    }
    if (titleEl) {
      titleEl.textContent = step.heading;
      titleEl.title = step.heading;
    }
    document.getElementById("stepTierBadgeMain").outerHTML = `<span id="stepTierBadgeMain">${this.getTierBadgeHTML(this.getStepEffectiveTier(step))}</span>`;

    // Zwięzły skrót tytułu w nagłówku ZADANIE (żeby zawsze się zmieścił bez obcinania!)
    const shortTaskHdr = (step.title || "Ćwiczenie").replace(/\s*\([^)]*\)/g, "").trim();
    document.getElementById("taskHeaderTitle").innerHTML = `${this.svg2d("task")} <span>ZADANIE ${this.escapeHtml(shortTaskHdr)}</span>`;

    document.getElementById("termOut").innerHTML = step.initialTerminalHTML || "";
    document.getElementById("promptDir").textContent = VFSGit.repoName;
    document.getElementById("promptBranch").textContent = `(${VFSGit.branch})`;
    document.getElementById("voiceSubtitle").textContent = `Krok ${this.currentStepIdx + 1}/${this.allSteps.length}: Kliknij „START”, aby włączyć narrację głosową i automatyczne wskazywanie elementów.`;

    this.renderVoiceTranscriptDropdown(step);
    this.renderHintDropdown(step);

    const hintWrap = document.getElementById("hintWrap");
    if (hintWrap) hintWrap.style.display = window.COURSE_CONFIG.policies.allowHints ? "inline-flex" : "none";

    const sel = document.getElementById("vfsFileSelect");
    const files = Object.keys(VFSGit.worktree);
    sel.innerHTML = files.map(f => `<option value="${f}" ${f === step.primaryFile ? 'selected' : ''}>${f}</option>`).join("");
    const initialEditorFile = files.includes(step.primaryFile) ? step.primaryFile : files[0];
    if (initialEditorFile) this.loadFileIntoEditor(initialEditorFile);

    this.renderStageWindows();
    this.renderInspector();
    this.renderGuidedInstructions();
    this.isLoadingStep = true;
    this.currentStepAssertionsPassed = false;
    this.stagePassedAtCmdCount = [];
    this.lastAssertionResults = [];
    this.evaluateAssertions();
    this.isLoadingStep = false;
    this.renderDrawer();
    this.updateTopProgress();
    this.autoFitStageHeader();
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
  },

  // Automatyczne dopasowanie rozmiaru czcionki nagłówka Sceny Wiedzy, aby nigdy nie łamał się brzydko na 2 linie na różnych monitorach i fontach
  autoFitStageHeader() {
    if (typeof document === "undefined") return;
    const titleEl = document.getElementById("stageTitle");
    const kickerEl = document.getElementById("stageKicker");
    if (titleEl) {
      let size = 14.5;
      titleEl.style.fontSize = `${size}px`;
      while (titleEl.scrollWidth > titleEl.clientWidth && size > 11.5) {
        size -= 0.5;
        titleEl.style.fontSize = `${size}px`;
      }
    }
    if (kickerEl) {
      let kSize = 10;
      kickerEl.style.fontSize = `${kSize}px`;
      while (kickerEl.scrollWidth > kickerEl.clientWidth && kSize > 8.5) {
        kSize -= 0.5;
        kickerEl.style.fontSize = `${kSize}px`;
      }
    }
  },

  // Reset układu 4 paneli i belek podziału do optymalnych proporcji
  resetLayout(silent = false) {
    const leftCol = document.getElementById("leftCol");
    const leftTop = document.getElementById("leftTop");
    const leftBottom = document.getElementById("leftBottom");
    const rightTop = document.getElementById("rightTop");
    const btnMin = document.getElementById("btnMinTask");

    this.taskMinimized = false;
    if (leftBottom) leftBottom.classList.remove("minimized");
    if (btnMin) btnMin.textContent = "▾ Zwiń";

    if (leftCol) leftCol.style.width = "56%";
    if (leftTop) {
      leftTop.style.flex = "";
      leftTop.style.height = "70%";
    }
    if (rightTop) {
      rightTop.style.flex = "";
      rightTop.style.height = "46%";
    }

    this.openAllCards();
    this.autoFitStageHeader();
    if (!silent) {
      this.showToast("Przywrócono optymalny układ 4 stref ekranu i otwarto wszystkie karty.");
    }
  },

  renderHintDropdown(step) {
    const body = document.getElementById("hintDropdownBody");
    if (!body || !step) return;
    const cmds = this.extractRunnableCommands(step);
    const cmdPills = cmds.map((c, i) => {
      const safeCmd = c.replace(/'/g, "\\'").replace(/"/g, "&quot;");
      return `<button class="guided-cmd-btn" onclick="App.runOrFillCommand('${safeCmd}', 'clicked_hint')" title="Kliknij, aby od razu wykonać w terminalu">▶ ${i + 1}. <code>${this.escapeHtml(c)}</code></button>`;
    }).join(" ");

    body.innerHTML = `
      <div style="margin-bottom:8px; color:#f8fafc;">${this.replaceEmojisWith2D(this.escapeHtml(step.hint || "Sprawdź stan repozytorium przez git status -s."))}</div>
      ${cmdPills ? `<div style="padding-top:6px; border-top:1px solid #334155;"><span style="font-size:11px; color:#facc15; display:block; margin-bottom:4px;">${this.svg2d("bolt")} Szybkie wykonanie komend:</span><div style="display:flex; flex-wrap:wrap; gap:4px;">${cmdPills}</div></div>` : ""}
    `;
  },

  renderVoiceTranscriptDropdown(step) {
    const listEl = document.getElementById("voiceTranscriptList");
    if (!listEl) return;
    const beats = this.getEffectiveBeats(step);
    listEl.innerHTML = beats.map((b, i) => `
      <div style="padding:5px 7px; border-bottom:1px solid #1e293b; cursor:pointer; border-radius:4px;" onclick="App.jumpToDirectorBeat(${i})">
        <b style="color:#facc15;">Fragment ${i + 1}/${beats.length}:</b> <span>${this.escapeHtml(b.voiceText)}</span>
      </div>
    `).join("");
  },

  jumpToDirectorBeat(idx) {
    this.directorPlaying = true;
    this.directorPaused = false;
    this.updateDirectorButtonsUI();
    this.directorBeatIdx = idx;
    this.runDirectorBeat();
  },

  extractRunnableCommands(step) {
    if (Array.isArray(step.guidedCommands) && step.guidedCommands.length > 0) {
      return step.guidedCommands;
    }
    const rawHint = step.hint || "";
    const matches = [];
    const regex = /((?:printf\s+'[^']+'\s*\|\s*)?git\s+[a-z0-9\-_.:/="']+(?:\s+[a-z0-9\-_.:/="']+)*)/gi;
    let m;
    while ((m = regex.exec(rawHint)) !== null) {
      matches.push(m[1].trim());
    }
    return matches;
  },

  renderGuidedInstructions() {
    const box = document.getElementById("guidedInstructionBox");
    if (!box) return;
    const step = this.allSteps[this.currentStepIdx];
    const cmds = this.extractRunnableCommands(step);

    const cmdButtonsHTML = cmds.length > 0
      ? cmds.map((c, i) => {
          const safeCmd = c.replace(/'/g, "\\'").replace(/"/g, "&quot;");
          return `<button class="guided-cmd-btn" onclick="App.runOrFillCommand('${safeCmd}', 'clicked_chip')" title="Kliknij, aby wpisać i wykonać tę komendę w terminalu">▶ ${i + 1}. <code>${this.escapeHtml(c)}</code></button>`;
        }).join(" ")
      : `<code>${this.escapeHtml(step.hint || "git status -s")}</code>`;

    box.innerHTML = `
      <div class="task-full-desc">${this.replaceEmojisWith2D(this.escapeHtml(step.taskTitle))}</div>
      <div class="task-cmd-row">
        <span style="font-weight:700; color:#1e40af;">Wykonaj w terminalu (lub kliknij):</span>
        ${cmdButtonsHTML}
      </div>`;
  },

  async runOrFillCommand(cmdText, source = "clicked_chip") {
    const input = document.getElementById("cmdIn");
    if (!input) return;
    this.switchWorkbench("term");
    input.value = "";
    input.focus();
    this.nextCmdInputMode = source;
    await this.executeTerminalCommand(cmdText);
  },

  async executeTerminalCommand(cmdText) {
    const step = this.allSteps[this.currentStepIdx];
    const outEl = document.getElementById("termOut");
    outEl.innerHTML += `<div><span class="p-dir">${VFSGit.repoName}</span><span class="p-br">(${VFSGit.branch})</span> $ ${this.highlightTerminalCmd(cmdText)}</div>`;

    // Rozpoznanie sposobu wprowadzenia komendy (pisał z klawiatury vs kliknął przycisk vs wkleił vs strzałka historii)
    let inputMode = "typed";
    if (this.nextCmdInputMode) {
      inputMode = this.nextCmdInputMode;
    } else if (this.cmdPastedFlag && this.cmdKeystrokeCount <= 2) {
      inputMode = "pasted";
    } else if (this.cmdUsedHistoryFlag && this.cmdKeystrokeCount === 0) {
      inputMode = "history_arrow";
    }
    const typingMs = (inputMode === "typed" && this.cmdTypingStartTs > 0)
      ? Math.max(0, Date.now() - this.cmdTypingStartTs)
      : 0;
    const keystrokes = this.cmdKeystrokeCount || 0;
    const backspaces = this.cmdBackspaceCount || 0;

    this.nextCmdInputMode = null;
    this.cmdTypingStartTs = 0;
    this.cmdKeystrokeCount = 0;
    this.cmdBackspaceCount = 0;
    this.cmdPastedFlag = false;
    this.cmdUsedHistoryFlag = false;

    const prevResults = this.lastAssertionResults || [];
    const firstUnpassedIdx = prevResults.findIndex(r => !r.pass);
    const minCmdIdx = firstUnpassedIdx <= 0 ? 0 : (this.stagePassedAtCmdCount?.[firstUnpassedIdx - 1] ?? 0);

    const guidedCmds = this.extractRunnableCommands(step);
    const matchedGuidedIdx = guidedCmds.findIndex(gc => VFSGit.matchesGuidedCommand(cmdText, gc));
    const isReadOnly = VFSGit.isReadOnlyCommand(cmdText);

    const logCmd = (outcome, extra = {}) => {
      this.logActivityEvent("cmd_exec", {
        cmd: String(cmdText).slice(0, 180),
        inputMode,
        typingMs,
        keystrokes,
        backspaces,
        isReadOnly,
        matchedStage: matchedGuidedIdx >= 0 ? (matchedGuidedIdx + 1) : null,
        requiredStage: firstUnpassedIdx >= 0 ? (firstUnpassedIdx + 1) : null,
        outcome,
        ...extra
      });
    };

    // 1. WALIDACJA SKŁADNI I OPCJI + STRAŻNIK LABORATORIUM:
    if (!isReadOnly && matchedGuidedIdx === -1) {
      if (!VFSGit.cmdHistory.length || VFSGit.cmdHistory[VFSGit.cmdHistory.length - 1] !== cmdText) {
        VFSGit.cmdHistory.push(cmdText);
      }
      this.cmdHistoryIdx = VFSGit.cmdHistory.length;
      this.cmdDraft = "";

      const syntaxDiag = VFSGit.diagnoseCommandSyntax(cmdText, guidedCmds);
      if (syntaxDiag) {
        logCmd("syntax_err");
        outEl.innerHTML += `<div class="out">${this.highlightTerminalOutput(syntaxDiag, cmdText)}</div>`;
        outEl.scrollTop = outEl.scrollHeight;
        return;
      }

      logCmd("unsupported_cmd");
      const expectedListHTML = guidedCmds.length > 0
        ? guidedCmds.map((c, idx) => `<br/><span style="color:#facc15;">▶ ${idx + 1}. <code>${this.escapeHtml(c)}</code></span>`).join("")
        : "";
      outEl.innerHTML += `<div class="out" style="color:#f87171; font-weight:700;">⛔ Ta instrukcja nie jest obsługiwana w tej części praktycznej.<br/><span style="color:#e2e8f0; font-weight:400;">W terminalu możesz wykonywać niedestrukcyjne operacje odczytu (np. <code>git status</code>, <code>git diff</code>, <code>git log</code>, <code>ls</code>, <code>cat</code>), natomiast do modyfikacji zastosuj prawidłowe instrukcje przewidziane do zrealizowania bieżącego zadania:</span>${expectedListHTML}</div>`;
      outEl.scrollTop = outEl.scrollHeight;
      return;
    }

    // 2. STRAŻNIK KOLEJNOŚCI DLA OPERACJI MODYFIKUJĄCYCH:
    if (!isReadOnly && matchedGuidedIdx !== -1) {
      if (firstUnpassedIdx === -1) {
        if (!VFSGit.cmdHistory.length || VFSGit.cmdHistory[VFSGit.cmdHistory.length - 1] !== cmdText) {
          VFSGit.cmdHistory.push(cmdText);
        }
        this.cmdHistoryIdx = VFSGit.cmdHistory.length;
        this.cmdDraft = "";
        logCmd("already_done");
        outEl.innerHTML += `<div class="out" style="color:#4ade80; font-weight:700;">✓ Wszystkie instrukcje modyfikujące w tym zadaniu zostały już wykonane.<br/><span style="color:#e2e8f0; font-weight:400;">Możesz badać stan repozytorium poleceniami odczytu (np. <code>git status</code>, <code>git log</code>, <code>git diff</code>), przejść do następnego kroku lub kliknąć <b>↻ Reset</b>, aby powtórzyć ćwiczenie.</span></div>`;
        outEl.scrollTop = outEl.scrollHeight;
        return;
      }

      if (matchedGuidedIdx < firstUnpassedIdx) {
        if (!VFSGit.cmdHistory.length || VFSGit.cmdHistory[VFSGit.cmdHistory.length - 1] !== cmdText) {
          VFSGit.cmdHistory.push(cmdText);
        }
        this.cmdHistoryIdx = VFSGit.cmdHistory.length;
        this.cmdDraft = "";
        logCmd("already_done");
        const nextCmd = guidedCmds[firstUnpassedIdx] || "";
        const nextHTML = nextCmd ? `<br/><span style="color:#facc15;">▶ ${firstUnpassedIdx + 1}. <code>${this.escapeHtml(nextCmd)}</code></span>` : "";
        outEl.innerHTML += `<div class="out" style="color:#fbbf24; font-weight:700;">ℹ️ Etap ${matchedGuidedIdx + 1} został już wykonany.<br/><span style="color:#e2e8f0; font-weight:400;">Zastosuj teraz kolejną instrukcję zadania (Etap ${firstUnpassedIdx + 1}):</span>${nextHTML}</div>`;
        outEl.scrollTop = outEl.scrollHeight;
        return;
      }
    }

    // Zapisz pełną migawkę stanu VFS przed wykonaniem komendy, aby wykryć i zablokować wykonanie dalszego etapu przed wcześniejszym
    const snapBefore = VFSGit.takeSnapshot();
    const wasLaterRawTrue = {};
    if (firstUnpassedIdx >= 0 && step && Array.isArray(step.assertions)) {
      const vfsBefore = Object.create(VFSGit);
      vfsBefore.lastCommands = VFSGit.lastCommands.slice(minCmdIdx);
      for (let k = firstUnpassedIdx + 1; k < step.assertions.length; k++) {
        wasLaterRawTrue[k] = !!step.assertions[k].check(vfsBefore);
      }
    }

    const res = await VFSGit.execute(cmdText, step.primaryFile);
    this.cmdHistoryIdx = VFSGit.cmdHistory.length;
    this.cmdDraft = "";

    if (!res.failed && firstUnpassedIdx >= 0 && step && Array.isArray(step.assertions)) {
      const vfsAfter = Object.create(VFSGit);
      vfsAfter.lastCommands = VFSGit.lastCommands.slice(minCmdIdx);
      const nowFirstTrue = !!step.assertions[firstUnpassedIdx].check(vfsAfter);
      if (!nowFirstTrue) {
        let skippedToIdx = -1;
        for (let k = firstUnpassedIdx + 1; k < step.assertions.length; k++) {
          if (!wasLaterRawTrue[k] && !!step.assertions[k].check(vfsAfter)) {
            skippedToIdx = k;
            break;
          }
        }
        if (skippedToIdx !== -1 || (!isReadOnly && matchedGuidedIdx > firstUnpassedIdx)) {
          const targetStage = skippedToIdx !== -1 ? (skippedToIdx + 1) : (matchedGuidedIdx + 1);
          VFSGit.restoreSnapshot(snapBefore);
          logCmd("out_of_order_blocked", { attemptedStage: targetStage });
          const reqLabel = step.assertions[firstUnpassedIdx].label;
          outEl.innerHTML += `<div class="out" style="color:#f97316; font-weight:700;">⚠️ Kolejność ćwiczenia: Próbujesz wykonać Etap ${targetStage}, zanim ukończono Etap ${firstUnpassedIdx + 1}!<br/>Najpierw wykonaj: <span style="color:#facc15;">${this.escapeHtml(reqLabel)}</span></div>`;
          outEl.scrollTop = outEl.scrollHeight;
          document.getElementById("promptBranch").textContent = `(${VFSGit.branch})`;
          this.renderInspector();
          this.evaluateAssertions();
          return;
        }
      }
    }

    logCmd(res.failed ? "exec_failed" : "ok");
    if (res.out) outEl.innerHTML += `<div class="out">${this.highlightTerminalOutput(res.out, cmdText)}</div>`;
    if (res.failed && firstUnpassedIdx >= 0 && step && Array.isArray(step.assertions)) {
      const reqLabel = step.assertions[firstUnpassedIdx].label;
      outEl.innerHTML += `<div class="out" style="color:#fbbf24;">💡 Wymagany bieżący krok ćwiczenia (Etap ${firstUnpassedIdx + 1}): <b>${this.escapeHtml(reqLabel)}</b></div>`;
    }
    outEl.scrollTop = outEl.scrollHeight;

    document.getElementById("promptBranch").textContent = `(${VFSGit.branch})`;
    this.renderInspector();
    this.evaluateAssertions();
  },

  // SESJA UŻYTKOWNIKA („ZANIM ZACZNIESZ”), TRYB KOMPUTERA I KOD POSTĘPU GLAB-XXXX-XXXX-XXXX
  openUserSessionModal() {
    const modal = document.getElementById("userSessionModalBackdrop");
    if (!modal) return;
    this.cancelResetAllProgress();
    this.renderUserSessionModal();
    modal.classList.add("open");
  },

  closeUserSessionModal() {
    this.cancelResetAllProgress();
    document.getElementById("userSessionModalBackdrop")?.classList.remove("open");
  },

  confirmUserSessionModal() {
    this.onboardingSeen = true;
    this.closeUserSessionModal();
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
  },

  renderUserSessionModal() {
    const verEl = document.getElementById("appVersionBadge");
    if (verEl) {
      verEl.textContent = `Wersja ${this.appVersion} • aktualizacja: ${this.appUpdatedDate}`;
    }

    const radPriv = document.getElementById("radStoragePrivate");
    const radShar = document.getElementById("radStorageShared");
    const mode = StorageManager.storageMode || "private";
    if (radPriv) radPriv.checked = (mode === "private");
    if (radShar) radShar.checked = (mode === "shared");

    const codeEl = document.getElementById("currentProgressCodeDisplay");
    if (codeEl) codeEl.textContent = this.encodeProgressCode();

    const statsText = `${this.completedSteps.size}/${this.rawSteps.length} kroków`;
    const statsEl = document.getElementById("progressCodeStatsLabel");
    if (statsEl) {
      statsEl.textContent = statsText;
    }
    const resetCountEl = document.getElementById("resetAllProgressCountLabel");
    if (resetCountEl) {
      resetCountEl.textContent = statsText;
    }
  },

  promptResetAllProgress() {
    const promptRow = document.getElementById("resetAllProgressPromptRow");
    const confirmRow = document.getElementById("resetAllProgressConfirmRow");
    const resetCountEl = document.getElementById("resetAllProgressCountLabel");
    if (resetCountEl) {
      resetCountEl.textContent = `${this.completedSteps.size}/${this.rawSteps.length} kroków`;
    }
    if (promptRow) promptRow.style.display = "none";
    if (confirmRow) confirmRow.style.display = "block";
  },

  cancelResetAllProgress() {
    const promptRow = document.getElementById("resetAllProgressPromptRow");
    const confirmRow = document.getElementById("resetAllProgressConfirmRow");
    if (promptRow) promptRow.style.display = "flex";
    if (confirmRow) confirmRow.style.display = "none";
  },

  setDeviceStorageMode(mode) {
    StorageManager.setStorageMode(mode);
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
    this.renderUserSessionModal();
    if (mode === "shared") {
      this.showToast("Włączono tryb: Wspólny komputer (sesja tymczasowa do zamknięcia karty). Pamiętaj o skopiowaniu Kodu GLAB przed wyjściem!");
    } else {
      this.showToast("Włączono tryb: Prywatny komputer (autozapis na stałe w tej przeglądarce).");
    }
  },

  clearSessionAndReset() {
    this.logActivityEvent("course_reset", { previousCompletedCount: this.completedSteps.size });
    this.flushActivityLogs(false);
    this.cancelResetAllProgress();
    StorageManager.clearAllLocalData();
    this.completedSteps.clear();
    this.instructorMode = false;
    this.adminAuthenticated = false;
    this.onboardingSeen = false;
    this.loadStep(0);
    this.renderUserSessionModal();
    this.showToast("Wyczyszczono sesję i wyzerowano cały postęp w kursie (0/" + this.rawSteps.length + " kroków).");
  },

  // Kodowanie 60-bitowego stanu (41 bitów zaliczonych kroków + 6 bitów bieżącego kroku + 3 bity poziomów + 10 bitów sumy kontrolnej CRC) do GLAB-XXXX-XXXX-XXXX
  computePayloadCrc10(payload50BigInt) {
    let crc = 0x2a5;
    for (let i = 0; i < 50; i++) {
      const bit = Number((payload50BigInt >> BigInt(i)) & 1n);
      const msb = (crc >> 9) & 1;
      crc = ((crc << 1) & 0x3ff) ^ ((bit ^ msb) ? 0x287 : 0);
    }
    return BigInt(crc & 0x3ff);
  },

  encodeProgressCode() {
    const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let mask = 0n;
    const steps = this.rawSteps || [];
    for (let i = 0; i < Math.min(steps.length, 41); i++) {
      if (this.completedSteps.has(steps[i].id)) {
        mask |= (1n << BigInt(i));
      }
    }

    const currStepId = this.allSteps[this.currentStepIdx]?.id;
    const rawCurrIdx = Math.max(0, steps.findIndex(s => s.id === currStepId));
    const currBits = BigInt(rawCurrIdx & 0x3f) << 41n;

    const tiers = this.getActiveTiersList();
    let tierMask = 0;
    if (tiers.includes("basic")) tierMask |= 1;
    if (tiers.includes("extended")) tierMask |= 2;
    if (tiers.includes("advanced")) tierMask |= 4;
    if (tierMask === 0) tierMask = 7;
    const tierBits = BigInt(tierMask & 0x7) << 47n;

    const payload50 = mask | currBits | tierBits;
    const crc10 = this.computePayloadCrc10(payload50) << 50n;
    const full60 = payload50 | crc10;

    let chars = "";
    for (let g = 11; g >= 0; g--) {
      const idx = Number((full60 >> BigInt(g * 5)) & 31n);
      chars += alphabet[idx];
    }
    return `GLAB-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
  },

  decodeProgressCode(rawCode) {
    const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    const cleaned = String(rawCode || "")
      .trim()
      .toUpperCase()
      .replace(/^GLAB-?/i, "")
      .replace(/[^0-9A-Z]/g, "")
      .replace(/O/g, "0")
      .replace(/[IL]/g, "1");

    if (cleaned.length !== 12) {
      return { error: "Kod musi mieć format GLAB-XXXX-XXXX-XXXX (12 znaków po prefiksie GLAB)." };
    }

    let full60 = 0n;
    for (let i = 0; i < 12; i++) {
      const val = alphabet.indexOf(cleaned[i]);
      if (val < 0) {
        return { error: `Nieprawidłowy znak „${cleaned[i]}” w kodzie postępu.` };
      }
      full60 = (full60 << 5n) | BigInt(val);
    }

    const payload50 = full60 & ((1n << 50n) - 1n);
    const givenCrc = (full60 >> 50n) & 0x3ffn;
    const expectedCrc = this.computePayloadCrc10(payload50);
    if (givenCrc !== expectedCrc) {
      return { error: "Suma kontrolna kodu jest nieprawidłowa (literówka w kodzie GLAB-...)." };
    }

    const steps = this.rawSteps || [];
    const completedStepIds = [];
    for (let i = 0; i < Math.min(steps.length, 41); i++) {
      if (((payload50 >> BigInt(i)) & 1n) === 1n) {
        completedStepIds.push(steps[i].id);
      }
    }

    const currentRawIdx = Number((payload50 >> 41n) & 0x3fn);
    const tierMask = Number((payload50 >> 47n) & 0x7n);
    const enabledTiers = [];
    if (tierMask & 1) enabledTiers.push("basic");
    if (tierMask & 2) enabledTiers.push("extended");
    if (tierMask & 4) enabledTiers.push("advanced");

    return {
      completedStepIds,
      currentRawIdx: Math.min(currentRawIdx, Math.max(0, steps.length - 1)),
      enabledTiers: enabledTiers.length > 0 ? enabledTiers : ["basic", "extended", "advanced"]
    };
  },

  applyProgressCode(codeStr, silent = false) {
    const parsed = this.decodeProgressCode(codeStr);
    const fb = document.getElementById("progressCodeFeedback");
    if (parsed.error) {
      if (fb) {
        fb.style.display = "block";
        fb.style.color = "#f87171";
        fb.textContent = parsed.error;
      }
      if (!silent) this.showToast(parsed.error, "err");
      return false;
    }

    this.completedSteps = new Set(parsed.completedStepIds);
    this.onboardingSeen = true;

    if (!window.COURSE_CONFIG.lockProfileForStudent && parsed.enabledTiers.length > 0) {
      window.COURSE_CONFIG.enabledTiers = parsed.enabledTiers;
      const key = parsed.enabledTiers.join(",");
      const matchMap = {
        "basic": "basic",
        "extended": "extended",
        "advanced": "advanced",
        "basic,extended,advanced": "all"
      };
      window.COURSE_CONFIG.activeProfile = matchMap[key] || "custom";
    }

    this.rebuildActiveCurriculum();
    this.renderProfileSelectorUI();

    const targetStepId = this.rawSteps[parsed.currentRawIdx]?.id;
    const newIdx = this.allSteps.findIndex(s => s.id === targetStepId);
    this.loadStep(newIdx >= 0 ? newIdx : 0);
    this.renderUserSessionModal();

    const normalizedCode = String(codeStr || "").trim().toUpperCase();
    if (normalizedCode && !this.knownProgressCodes.includes(normalizedCode)) {
      this.knownProgressCodes.push(normalizedCode);
    }
    this.syncFeedbackWithServer(false);

    if (fb) {
      fb.style.display = "block";
      fb.style.color = "#4ade80";
      fb.textContent = `✓ Odtworzono postęp: zaliczone kroki (${this.completedSteps.size}/${this.rawSteps.length}) oraz bieżącą lekcję.`;
    }
    this.showToast(`Odtworzono postęp z kodu (${this.completedSteps.size} zaliczonych kroków)!`);
    return true;
  },

  applyProgressCodeFromInput() {
    const inp = document.getElementById("restoreProgressCodeInput");
    if (!inp) return;
    this.applyProgressCode(inp.value, false);
  },

  copyProgressCode() {
    const code = this.encodeProgressCode();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.showToast(`Skopiowano Kod Postępu: ${code}`);
  },

  copyProgressLink() {
    const code = this.encodeProgressCode();
    const base = window.location.href.split("?")[0];
    const url = `${base}?resume=${encodeURIComponent(code)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    this.showToast("Skopiowano bezpośredni Link Wznowienia (?resume=GLAB-...) do schowka!");
  },

  // PANEL ADMINA, LOGOWANIE INSTRUKTORA I KONFIGURACJA POZIOMÓW
  hashPassword(str) {
    const s = String(str || "");
    let h1 = 0xdeadbeef ^ s.length;
    let h2 = 0x41c6ce57 ^ s.length;
    for (let i = 0, ch; i < s.length; i++) {
      ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
  },

  toggleAdminModal() {
    const modal = document.getElementById("adminModalBackdrop");
    if (!modal) return;
    if (modal.classList.contains("open")) {
      modal.classList.remove("open");
      return;
    }

    const sec = window.COURSE_CONFIG.security || {};
    if (sec.requireAdminPassword !== false && !this.adminAuthenticated) {
      const loginModal = document.getElementById("adminLoginModalBackdrop");
      const errEl = document.getElementById("adminLoginError");
      const passIn = document.getElementById("adminPassInput");
      if (errEl) errEl.style.display = "none";
      if (passIn) passIn.value = "";
      if (loginModal) {
        loginModal.classList.add("open");
        setTimeout(() => passIn?.focus(), 60);
      }
      return;
    }

    modal.classList.add("open");
    this.renderAdminModalContent();
  },

  closeAdminLoginModal() {
    document.getElementById("adminLoginModalBackdrop")?.classList.remove("open");
  },

  submitAdminLogin() {
    const passIn = document.getElementById("adminPassInput");
    const errEl = document.getElementById("adminLoginError");
    const entered = passIn ? passIn.value.trim() : "";
    const expectedHash = window.COURSE_CONFIG.security?.adminPasswordHash || "8bd917b6a28d1866";

    if (this.hashPassword(entered) === expectedHash) {
      this.adminAuthenticated = true;
      this.closeAdminLoginModal();
      const modal = document.getElementById("adminModalBackdrop");
      if (modal) {
        modal.classList.add("open");
        this.renderAdminModalContent();
      }
      this.showToast("Zalogowano do Panelu Instruktora / Admina.");
    } else if (errEl) {
      errEl.style.display = "block";
    }
  },

  logoutAdmin() {
    this.adminAuthenticated = false;
    document.getElementById("adminModalBackdrop")?.classList.remove("open");
    this.showToast("Zablokowano Panel Admina (wymagane ponowne podanie hasła).");
  },

  changeAdminPassword() {
    const inp = document.getElementById("newAdminPassInput");
    const newPass = inp ? inp.value.trim() : "";
    if (!newPass || newPass.length < 3) {
      this.showToast("Wpisz nowe hasło (min. 3 znaki).", "err");
      return;
    }
    if (!window.COURSE_CONFIG.security) window.COURSE_CONFIG.security = {};
    window.COURSE_CONFIG.security.adminPasswordHash = this.hashPassword(newPass);
    if (inp) inp.value = "";
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
    this.showToast("Zmieniono hasło Instruktora! Pobierz course-profiles.js, aby utrwalić je w paczce SCORM.");
  },

  renderAdminModalContent() {
    const cfg = window.COURSE_CONFIG;
    const activeTiers = this.getActiveTiersList();

    const chkB = document.getElementById("chkTierBasic");
    const chkE = document.getElementById("chkTierExtended");
    const chkA = document.getElementById("chkTierAdvanced");
    if (chkB) chkB.checked = activeTiers.includes("basic");
    if (chkE) chkE.checked = activeTiers.includes("extended");
    if (chkA) chkA.checked = activeTiers.includes("advanced");

    document.getElementById("chkLockProfile").checked = !!cfg.lockProfileForStudent;
    document.getElementById("chkInstructorUnlock").checked = !!this.instructorMode;
    document.getElementById("chkSequential").checked = !!cfg.policies.enforceSequentialLock;
    document.getElementById("chkAllowHints").checked = !!cfg.policies.allowHints;
    document.getElementById("chkShowBadges").checked = !!cfg.policies.showTierBadgesInDrawer;

    const chkReqPass = document.getElementById("chkRequireAdminPass");
    const chkHideBtn = document.getElementById("chkHideAdminBtn");
    if (chkReqPass) chkReqPass.checked = cfg.security?.requireAdminPassword !== false;
    if (chkHideBtn) chkHideBtn.checked = !!cfg.security?.hideAdminButtonOnTopbar;

    const chkAuto = document.getElementById("chkAutoSave");
    const selAuto = document.getElementById("selAutoSaveInterval");
    if (chkAuto) chkAuto.checked = cfg.policies.autoSaveEnabled !== false;
    if (selAuto) selAuto.value = String(cfg.policies.autoSaveIntervalSec || 30);

    this.renderVoiceSelectorUI();
    this.loadAdminFeedback(false);
    this.loadAdminActivitySummary(false);

    const counts = { basic: 0, extended: 0, advanced: 0 };
    this.rawSteps.forEach(s => {
      const t = this.getStepEffectiveTier(s);
      if (counts[t] !== undefined) counts[t]++;
    });

    document.getElementById("adminStatsSummary").innerHTML =
      `${this.svg2d("layers")} <b>Aktywne kroki w wybranym zestawie: ${this.allSteps.length} / ${this.rawSteps.length}</b> ` +
      `(Podstawowy: <b>${counts.basic}</b> | Rozszerzony: <b>${counts.extended}</b> | Zaawansowany: <b>${counts.advanced}</b>)`;

    const tbody = document.getElementById("adminStepsTableBody");
    tbody.innerHTML = this.rawSteps.map(s => {
      const effTier = this.getStepEffectiveTier(s);
      const visible = this.isStepAllowedInActiveProfile(s);
      return `
        <tr>
          <td><code>${s.id}</code></td>
          <td><b>${s.title}</b><br/><span style="font-size:11px; color:#94a3b8;">${s.moduleTitle}</span></td>
          <td>${this.replaceEmojisWith2D(s.badge || 'Zadanie')}</td>
          <td>
            <select class="vfs-select" onchange="App.changeStepTier('${s.id}', this.value)">
              <option value="basic" ${effTier === 'basic' ? 'selected' : ''}>▸ Podstawowy (basic)</option>
              <option value="extended" ${effTier === 'extended' ? 'selected' : ''}>▸ Rozszerzony (extended)</option>
              <option value="advanced" ${effTier === 'advanced' ? 'selected' : ''}>▸ Zaawansowany (advanced)</option>
              <option value="hidden" ${effTier === 'hidden' ? 'selected' : ''}>✕ Ukryty we wszystkich</option>
            </select>
          </td>
          <td style="font-weight:700; color:${visible ? '#4ade80' : '#f87171'};">${visible ? '✓ Widoczny' : '✕ Ukryty w tym zestawie'}</td>
        </tr>`;
    }).join("");
  },

  // SYSTEM ZGŁOSZEŃ TESTOWYCH (FEEDBACK) I ANONIMOWEJ KORESPONDENCJI Z ADMINISTRATOREM
  initFeedbackSystem() {
    this.updateFeedbackIndicatorUI();
    this.syncFeedbackWithServer(false);
    this.loadAdminFeedback(false);
    if (this.feedbackSyncTimer) clearInterval(this.feedbackSyncTimer);
    if (typeof window !== "undefined") {
      this.feedbackSyncTimer = setInterval(() => {
        this.syncFeedbackWithServer(false);
        const admModal = document.getElementById("adminModalBackdrop");
        if (admModal && admModal.classList.contains("open")) {
          this.loadAdminFeedback(false);
          this.loadAdminActivitySummary(false);
        }
      }, 15000);
    }
  },

  // SYSTEM TELEMETRII I LOGÓW AKTYWNOŚCI UŻYTKOWNIKÓW (SESJE, SPRZĘT, CZAS PRACY, PISANIE VS KLIKANIE, RETENCJA AUDIO)
  initTelemetrySystem() {
    this.telemetrySessionId = "ses_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
    this.telemetrySeq = 0;
    this.telemetryQueue = [];
    this.telemetryLastInputTs = Date.now();
    this.telemetryIsIdle = false;
    this.telemetryDeviceProfile = this.collectDeviceTelemetryProfile();

    // Asynchroniczne dociągnięcie szczegółowej architektury procesora i wersji systemu (User-Agent Client Hints)
    if (typeof navigator !== "undefined" && navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === "function") {
      navigator.userAgentData.getHighEntropyValues(["architecture", "bitness", "model", "platformVersion", "fullVersionList"])
        .then(hints => {
          if (hints) {
            if (hints.architecture) this.telemetryDeviceProfile.cpuArch = `${hints.architecture}${hints.bitness ? ('-' + hints.bitness) : ''}`;
            if (hints.platformVersion) this.telemetryDeviceProfile.osVersionHint = hints.platformVersion;
            if (hints.model) this.telemetryDeviceProfile.deviceModel = hints.model;
          }
        })
        .catch(() => {});
    }

    this.logActivityEvent("session_start", {
      appVersion: this.appVersion,
      storageMode: StorageManager.storageMode || "private",
      activeProfile: window.COURSE_CONFIG?.activeProfile || "basic",
      completedCount: this.completedSteps.size
    });

    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const markActiveInput = () => {
        const now = Date.now();
        if (this.telemetryIsIdle) {
          const idleDur = now - this.telemetryLastInputTs;
          this.telemetryIsIdle = false;
          this.logActivityEvent("user_resumed", { afterIdleMs: idleDur });
        }
        this.telemetryLastInputTs = now;
      };

      ["mousedown", "keydown", "wheel", "touchstart"].forEach(evName => {
        window.addEventListener(evName, markActiveInput, { passive: true });
      });

      document.addEventListener("visibilitychange", () => {
        const now = Date.now();
        if (document.visibilityState === "hidden") {
          this.telemetryTabHiddenAt = now;
          this.logActivityEvent("visibility_change", {
            state: "hidden",
            directorPlaying: this.directorPlaying && !this.directorPaused,
            beatIdx: this.directorPlaying ? this.directorBeatIdx : null
          });
          this.flushActivityLogs(true);
        } else {
          const awayMs = this.telemetryTabHiddenAt > 0 ? Math.max(0, now - this.telemetryTabHiddenAt) : 0;
          this.telemetryTabHiddenAt = 0;
          this.telemetryLastInputTs = now;
          this.telemetryIsIdle = false;
          this.logActivityEvent("visibility_change", { state: "visible", awayMs });
        }
      });

      const onUnload = () => {
        this.logActivityEvent("session_end", {
          deltaActiveMs: this.telemetryUnsentActiveMs,
          deltaIdleMs: this.telemetryUnsentIdleMs,
          deltaAudioMs: this.telemetryUnsentAudioMs,
          directorPlayingOnExit: this.directorPlaying && !this.directorPaused,
          beatIdxOnExit: this.directorPlaying ? this.directorBeatIdx : null
        });
        this.telemetryUnsentActiveMs = 0;
        this.telemetryUnsentIdleMs = 0;
        this.telemetryUnsentAudioMs = 0;
        this.flushActivityLogs(true);
      };
      window.addEventListener("pagehide", onUnload);
      window.addEventListener("beforeunload", onUnload);

      if (this.telemetryTickTimer) clearInterval(this.telemetryTickTimer);
      this.telemetryTickTimer = setInterval(() => {
        const now = Date.now();
        const tabVisible = document.visibilityState !== "hidden";
        const audioActive = Boolean(this.directorPlaying && !this.directorPaused);
        const recentlyInteracted = (now - this.telemetryLastInputTs) < 60000;

        if (tabVisible && (recentlyInteracted || audioActive)) {
          this.telemetryUnsentActiveMs += 1000;
          if (audioActive) {
            this.telemetryUnsentAudioMs += 1000;
          }
        } else {
          this.telemetryUnsentIdleMs += 1000;
          if (!this.telemetryIsIdle && (now - this.telemetryLastInputTs) >= 60000 && !audioActive) {
            this.telemetryIsIdle = true;
            this.logActivityEvent("user_idle", { reason: tabVisible ? "no_input_60s" : "tab_hidden" });
          }
        }
      }, 1000);

      if (this.telemetryFlushTimer) clearInterval(this.telemetryFlushTimer);
      this.telemetryFlushTimer = setInterval(() => {
        if (this.telemetryUnsentActiveMs >= 5000 || this.telemetryUnsentIdleMs >= 10000 || this.telemetryUnsentAudioMs >= 3000) {
          this.logActivityEvent("heartbeat", {
            deltaActiveMs: this.telemetryUnsentActiveMs,
            deltaIdleMs: this.telemetryUnsentIdleMs,
            deltaAudioMs: this.telemetryUnsentAudioMs
          });
          this.telemetryUnsentActiveMs = 0;
          this.telemetryUnsentIdleMs = 0;
          this.telemetryUnsentAudioMs = 0;
        }
        this.flushActivityLogs(false);
      }, 10000);
    }
  },

  collectDeviceTelemetryProfile() {
    if (typeof window === "undefined" || typeof navigator === "undefined") return {};
    const ua = String(navigator.userAgent || "");

    let os = "Nieznany OS";
    if (/Windows NT 10\.0/i.test(ua)) os = "Windows 10/11";
    else if (/Windows NT/i.test(ua)) os = "Windows";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS / iPadOS";
    else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
    else if (/CrOS/i.test(ua)) os = "ChromeOS";
    else if (/Linux/i.test(ua)) os = "Linux";

    let browser = "Inna przeglądarka";
    const edg = ua.match(/Edg\/([\d.]+)/);
    const opr = ua.match(/OPR\/([\d.]+)/);
    const chr = ua.match(/Chrome\/([\d.]+)/);
    const ffx = ua.match(/Firefox\/([\d.]+)/);
    const saf = ua.match(/Version\/([\d.]+).*Safari/);
    if (edg) browser = `Edge ${edg[1].split(".")[0]}`;
    else if (opr) browser = `Opera ${opr[1].split(".")[0]}`;
    else if (chr) browser = `Chrome ${chr[1].split(".")[0]}`;
    else if (ffx) browser = `Firefox ${ffx[1].split(".")[0]}`;
    else if (saf) browser = `Safari ${saf[1].split(".")[0]}`;

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
    let gpu = "";
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbg) {
          gpu = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
        }
      }
    } catch (e) {}

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      os,
      browser,
      platform: String(navigator.platform || ""),
      deviceType: isMobile ? "Mobile/Tablet" : "Desktop",
      cpuCores: navigator.hardwareConcurrency || null,
      ramGB: navigator.deviceMemory || null,
      gpu: gpu.slice(0, 140) || null,
      screen: typeof screen !== "undefined" ? `${screen.width}x${screen.height} @${Number(window.devicePixelRatio || 1).toFixed(2)}x` : "",
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      touchPoints: navigator.maxTouchPoints || 0,
      language: navigator.language || "",
      timezone: (typeof Intl !== "undefined" && Intl.DateTimeFormat) ? (Intl.DateTimeFormat().resolvedOptions().timeZone || "") : "",
      netType: conn ? `${conn.effectiveType || "?"} (${conn.downlink || "?"} Mb/s, RTT ${conn.rtt || "?"}ms)` : null
    };
  },

  logActivityEvent(type, data = {}, explicitStepId = null) {
    const step = this.allSteps[this.currentStepIdx];
    const stepId = explicitStepId || (step ? step.id : (this.telemetryCurrentStepId || "m00_s01"));
    this.telemetrySeq = (this.telemetrySeq || 0) + 1;
    this.telemetryQueue.push({
      seq: this.telemetrySeq,
      ts: new Date().toISOString(),
      type,
      stepId,
      stepIdx: this.currentStepIdx,
      progressCode: this.encodeProgressCode(),
      data
    });
    if (this.telemetryQueue.length >= 15) {
      this.flushActivityLogs(false);
    }
  },

  flushActivityLogs(useBeacon = false) {
    if (!Array.isArray(this.telemetryQueue) || this.telemetryQueue.length === 0) return;
    if (typeof window === "undefined") return;

    const batch = this.telemetryQueue.splice(0, this.telemetryQueue.length);
    const currCode = this.encodeProgressCode();
    if (currCode && !this.knownProgressCodes.includes(currCode)) {
      this.knownProgressCodes.push(currCode);
    }
    const step = this.allSteps[this.currentStepIdx];

    const payloadObj = {
      clientId: this.feedbackClientId || "anon",
      sessionId: this.telemetrySessionId || "ses_default",
      author: this.feedbackAuthor || "Anonim",
      progressCode: currCode,
      knownProgressCodes: this.knownProgressCodes,
      storageMode: StorageManager.storageMode || "private",
      appVersion: this.appVersion,
      activeProfile: window.COURSE_CONFIG?.activeProfile || "basic",
      currentStepId: step ? step.id : (this.telemetryCurrentStepId || "m00_s01"),
      completedStepsCount: this.completedSteps.size,
      completedSteps: Array.from(this.completedSteps),
      device: {
        ...this.telemetryDeviceProfile,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      },
      events: batch
    };

    const jsonStr = JSON.stringify(payloadObj);
    if (useBeacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      try {
        const blob = new Blob([jsonStr], { type: "application/json" });
        if (navigator.sendBeacon("/api/activity/log", blob)) {
          return;
        }
      } catch (e) {}
    }

    if (typeof fetch === "function") {
      fetch("/api/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonStr,
        keepalive: true
      }).catch(() => {});
    }
  },

  formatDurationHuman(ms) {
    const totalSec = Math.max(0, Math.round(Number(ms || 0) / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m === 0) return `${s}s`;
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m ${s}s`;
    return `${m}m ${s}s`;
  },

  async loadAdminActivitySummary(showToastOnDone = false) {
    if (typeof fetch !== "function") return;
    try {
      const resp = await fetch("/api/activity/admin-summary");
      if (!resp.ok) return;
      const data = await resp.json();
      if (data && data.ok) {
        this.adminActivitySummary = data;
        this.renderAdminActivitySessions();
        if (showToastOnDone) {
          this.showToast(`Odświeżono logi aktywności (${data.totalSessions} sesji, ${data.totalEvents} zdarzeń).`);
        }
      }
    } catch (e) {}
  },

  renderAdminActivitySessions() {
    if (typeof document === "undefined") return;
    const data = this.adminActivitySummary;
    const badgeEl = document.getElementById("adminActivitySummaryBadge");
    const listEl = document.getElementById("adminActivitySessionsList");
    if (!listEl) return;

    if (!data || !Array.isArray(data.sessions) || data.sessions.length === 0) {
      if (badgeEl) badgeEl.textContent = "0 sesji • 0 zdarzeń";
      listEl.innerHTML = `<div style="background:#0f172a; border:1px dashed #334155; border-radius:6px; padding:12px; text-align:center; color:#94a3b8; font-size:12px;">Brak zapisanych sesji na serwerze. Logi zaczną pojawiać się automatycznie w trakcie korzystania z aplikacji.</div>`;
      return;
    }

    if (badgeEl) {
      badgeEl.textContent = `${data.totalSessions} sesji • ${data.uniqueClients || 1} użytk. • ${data.totalEvents} zdarzeń`;
    }

    listEl.innerHTML = data.sessions.map(s => {
      const dev = s.device || {};
      const net = s.net || {};
      const tim = s.timing || {};
      const cnt = s.counters || {};
      const stepMap = s.stepMetrics || {};
      const stepList = Object.values(stepMap);

      const hwSummary = [
        dev.os || "OS?",
        dev.browser || "Przeglądarka?",
        dev.cpuCores ? `${dev.cpuCores} rdzeni CPU` : null,
        dev.ramGB ? `${dev.ramGB} GB RAM` : null,
        dev.screen || null,
        dev.gpu ? dev.gpu.replace(/^ANGLE \(([^,]+),?\s*([^)]*)\)$/i, "$1 $2").slice(0, 48) : null
      ].filter(Boolean).join(" • ");

      const stepDetailsHTML = stepList.length > 0
        ? stepList.map(sm => {
            const beatInfo = sm.totalBeats > 0
              ? `lektor: ${sm.maxBeatIdx >= 0 ? (sm.maxBeatIdx + 1) : 0}/${sm.totalBeats} (${sm.maxBeatProgressPct || 0}%)`
              : "lektor: 0";
            const stopsInfo = Array.isArray(sm.stopPoints) && sm.stopPoints.length > 0
              ? ` [przerwania: ${sm.stopPoints.map(sp => `fragm.${sp.beatIdx + 1}@${sp.progressPct}%`).join(", ")}]`
              : "";
            return `<span style="display:inline-block; background:#020617; border:1px solid ${sm.completed ? '#166534' : '#334155'}; border-radius:4px; padding:2px 6px; margin:2px; font-size:10.5px;">
              <b style="color:${sm.completed ? '#4ade80' : '#38bdf8'};">${this.escapeHtml(sm.stepId)}${sm.completed ? ' ✓' : ''}</b>:
              akt. <b>${this.formatDurationHuman(sm.activeMs)}</b> | audio <b>${this.formatDurationHuman(sm.audioListenedMs)}</b> (${beatInfo}${stopsInfo}) | pisał: <b>${sm.cmdsTyped || 0}</b> / klikał: <b>${sm.cmdsClicked || 0}</b>
            </span>`;
          }).join("")
        : `<span style="color:#64748b; font-size:11px;">Brak szczegółów kroków</span>`;

      return `
        <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:8px 10px; font-size:11.5px; display:flex; flex-direction:column; gap:5px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; border-bottom:1px solid #1e293b; padding-bottom:4px;">
            <div>
              <b style="color:#facc15;">👤 ${this.escapeHtml(s.author || 'Anonim')}</b>
              <code style="color:#94a3b8; font-size:10.5px; margin-left:4px;">${this.escapeHtml(s.clientId)}</code>
              <span style="color:#38bdf8; font-weight:700; margin-left:6px;">IP: ${this.escapeHtml(net.ip || 'lokalne')}</span>
              <span style="color:#cbd5e1; margin-left:6px;">Kod: <code style="color:#4ade80;">${this.escapeHtml(s.progressCode || '')}</code> (${s.completedStepsCount || 0}/41 ✓, krok: <b>${this.escapeHtml(s.currentStepId || '')}</b>)</span>
            </div>
            <div style="font-size:10.5px; color:#94a3b8;">
              Start: <b>${this.formatFeedbackTimestamp(s.startedAt)}</b> • Ostatnio: <b>${this.formatFeedbackTimestamp(s.lastSeenAt)}</b> ${s.endedAt ? '<span style="color:#f87171;">(Zakończona)</span>' : '<span style="color:#4ade80;">● Aktywna</span>'}
            </div>
          </div>
          <div style="color:#cbd5e1; font-size:11px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
            <span>💻 <b>Sprzęt/System:</b> ${this.escapeHtml(hwSummary)}</span>
            <span>⏱️ <b>Czas aktywny:</b> <b style="color:#4ade80;">${this.formatDurationHuman(tim.totalActiveMs)}</b> (w tle/przerwy: ${this.formatDurationHuman(tim.totalIdleMs)}, wyjścia z karty: ${tim.tabBlurCount || 0}x)</span>
          </div>
          <div style="color:#cbd5e1; font-size:11px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
            <span>⌨️ <b>Terminal (Pisał vs Klikał):</b> wpisane ręcznie: <b style="color:#facc15;">${cnt.cmdsTyped || 0}</b> (${cnt.totalKeystrokes || 0} zn., ${cnt.totalBackspaces || 0} Backspace) | kliknięte: <b style="color:#38bdf8;">${cnt.cmdsClicked || 0}</b> | wklejone: <b>${cnt.cmdsPasted || 0}</b> | błędy: <b style="color:#f87171;">${cnt.cmdsFailed || 0}</b></span>
            <span>🔊 <b>Lektor (START):</b> słuchano <b style="color:#4ade80;">${this.formatDurationHuman(tim.totalAudioListenedMs)}</b> (start: ${cnt.directorStarts || 0}x, pauzy: ${cnt.directorPauses || 0}x, przerwano: ${cnt.directorStopsEarly || 0}x, do końca: ${cnt.directorCompletions || 0}x)</span>
          </div>
          <div style="border-top:1px dashed #1e293b; padding-top:4px; line-height:1.4;">
            ${stepDetailsHTML}
          </div>
        </div>`;
    }).join("");
  },

  formatFeedbackTimestamp(isoStr) {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (Number.isNaN(d.getTime())) return String(isoStr);
      const pad = n => String(n).padStart(2, "0");
      return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return String(isoStr);
    }
  },

  hasUnreadAdminReply(thread) {
    if (!thread || !Array.isArray(thread.messages)) return false;
    const adminMsgs = thread.messages.filter(m => m && m.role === "admin");
    if (adminMsgs.length === 0) return false;
    const lastAdmin = adminMsgs[adminMsgs.length - 1];
    if (!thread.userReadReplyAt) return true;
    return String(lastAdmin.createdAt || "") > String(thread.userReadReplyAt || "");
  },

  getOverallFeedbackLedState() {
    const threads = Array.isArray(this.feedbackThreads) ? this.feedbackThreads : [];
    if (threads.length === 0) {
      return {
        ledCls: "led-none",
        pillCls: "pill-none",
        label: "Brak zgłoszeń",
        title: "Zgłoś spostrzeżenie lub błąd (Brak wysłanych zgłoszeń w tej sesji)",
        boxHTML: `Mikro-dioda na przycisku pokazuje stan Twoich zgłoszeń: <b style="color:#fbbf24;">● Zgłoszone</b>, <b style="color:#38bdf8;">● Odczytane</b> lub <b style="color:#4ade80;">● Przyszła odpowiedź</b>.`
      };
    }

    const unreadCount = threads.filter(t => this.hasUnreadAdminReply(t)).length;
    if (unreadCount > 0) {
      return {
        ledCls: "led-replied-unread",
        pillCls: "pill-replied",
        label: `Przyszła odpowiedź (${unreadCount})`,
        title: "Przyszła nowa odpowiedź od Administratora! Kliknij, aby odczytać.",
        boxHTML: `<span style="color:#4ade80; font-weight:700;">● Przyszła nowa odpowiedź od Administratora (${unreadCount})!</span> Kliknij poniższy link, aby przeczytać wiadomość i ewentualnie odpisać.`
      };
    }

    const submittedCount = threads.filter(t => t.status === "submitted").length;
    if (submittedCount > 0) {
      return {
        ledCls: "led-submitted",
        pillCls: "pill-submitted",
        label: `Zgłoszone (${submittedCount})`,
        title: "Zgłoszenie wysłane — oczekuje na odczytanie przez Administratora",
        boxHTML: `<span style="color:#fbbf24; font-weight:700;">● Stan: Zgłoszone (${submittedCount} w oczekujących).</span> Twoje uwagi są zapisane w historii kursu i czekają na odczytanie przez Admina.`
      };
    }

    const readCount = threads.filter(t => t.status === "read_by_admin").length;
    if (readCount > 0) {
      return {
        ledCls: "led-read",
        pillCls: "pill-read",
        label: "Odczytane przez Admina",
        title: "Twoje zgłoszenie zostało odczytane przez Administratora",
        boxHTML: `<span style="color:#38bdf8; font-weight:700;">● Stan: Odczytane przez Administratora.</span> Gdy Administrator napisze odpowiedź, dioda zaświeci się na zielono.`
      };
    }

    return {
      ledCls: "led-replied-read",
      pillCls: "pill-replied",
      label: `Odpowiedziano (${threads.length})`,
      title: "Odczytano odpowiedzi Administratora w Twoich zgłoszeniach",
      boxHTML: `<span style="color:#4ade80; font-weight:700;">● Stan: Przyszła odpowiedź (odczytana).</span> Masz ${threads.length} wątek/wątków w historii korespondencji z Adminem.`
    };
  },

  updateFeedbackIndicatorUI() {
    if (typeof document === "undefined") return;
    const state = this.getOverallFeedbackLedState();
    const led = document.getElementById("feedbackLedDot");
    const badge = document.getElementById("feedbackDropdownLedBadge");
    const box = document.getElementById("feedbackDropdownStatusBox");
    const btn = document.getElementById("btnFeedbackTop");

    if (led) {
      led.className = `feedback-led ${state.ledCls}`;
      led.title = state.title;
    }
    if (btn) {
      btn.title = state.title;
    }
    if (badge) {
      badge.className = `feedback-status-pill ${state.pillCls}`;
      badge.textContent = state.label;
    }
    if (box) {
      box.innerHTML = state.boxHTML;
    }
  },

  openFeedbackModal(event) {
    if (event) event.stopPropagation();
    document.querySelectorAll(".expandable-frame.pinned").forEach(f => f.classList.remove("pinned"));
    const modal = document.getElementById("feedbackModalBackdrop");
    if (!modal) return;

    const step = this.allSteps[this.currentStepIdx];
    const stepLbl = document.getElementById("feedbackCurrentStepLabel");
    if (stepLbl && step) {
      const shortMod = step.moduleTitle.split(":")[0] || step.moduleTitle;
      stepLbl.textContent = `${shortMod} ▸ ${step.title} (${step.id})`;
    }
    const authIn = document.getElementById("feedbackAuthorInput");
    if (authIn && !authIn.value && this.feedbackAuthor) {
      authIn.value = this.feedbackAuthor;
    }

    modal.classList.add("open");
    this.renderUserFeedbackThreads();
    this.syncFeedbackWithServer(false).then(() => {
      this.markUserFeedbackRepliesRead();
    });
  },

  closeFeedbackModal() {
    document.getElementById("feedbackModalBackdrop")?.classList.remove("open");
  },

  async markUserFeedbackRepliesRead() {
    const unreadIds = (this.feedbackThreads || [])
      .filter(t => this.hasUnreadAdminReply(t))
      .map(t => t.id);
    if (unreadIds.length === 0) return;

    const now = new Date().toISOString();
    this.feedbackThreads.forEach(t => {
      if (unreadIds.includes(t.id)) {
        t.userReadReplyAt = now;
      }
    });
    this.updateFeedbackIndicatorUI();
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);

    if (typeof fetch === "function") {
      try {
        await fetch("/api/feedback/mark-user-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: this.feedbackClientId, threadIds: unreadIds })
        });
      } catch (e) {}
    }
  },

  async syncFeedbackWithServer(showToastOnDone = false) {
    if (typeof fetch !== "function") return;
    const currCode = this.encodeProgressCode();
    if (currCode && !this.knownProgressCodes.includes(currCode)) {
      this.knownProgressCodes.push(currCode);
    }

    try {
      const resp = await fetch("/api/feedback/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: this.feedbackClientId,
          progressCodes: this.knownProgressCodes,
          localThreads: this.feedbackThreads
        })
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data && data.ok && Array.isArray(data.threads)) {
        const hadUnreadBefore = (this.feedbackThreads || []).filter(t => this.hasUnreadAdminReply(t)).length;
        this.feedbackThreads = data.threads;
        const hasUnreadNow = (this.feedbackThreads || []).filter(t => this.hasUnreadAdminReply(t)).length;

        this.updateFeedbackIndicatorUI();
        const modal = document.getElementById("feedbackModalBackdrop");
        if (modal && modal.classList.contains("open")) {
          this.renderUserFeedbackThreads();
        }
        StorageManager.saveState(this.getSerializableState(), this.allSteps.length);

        if (hasUnreadNow > hadUnreadBefore) {
          this.showToast("🔔 Przyszła nowa odpowiedź od Administratora na Twoje zgłoszenie (przycisk Feedback)!");
        } else if (showToastOnDone) {
          this.showToast("Zsynchronizowano stan zgłoszeń z serwerem.");
        }
      }
    } catch (e) {
      // Tryb offline lub otwarty plik statyczny — ciche działanie z historią lokalną (.json / localStorage)
    }
  },

  renderUserFeedbackThreads() {
    const listEl = document.getElementById("feedbackUserThreadsList");
    if (!listEl) return;
    const threads = Array.isArray(this.feedbackThreads) ? this.feedbackThreads : [];

    if (threads.length === 0) {
      listEl.innerHTML = `
        <div style="background:#0f172a; border:1px dashed #334155; border-radius:7px; padding:18px 14px; text-align:center; color:#94a3b8; font-size:12px;">
          Nie masz jeszcze żadnych wysłanych zgłoszeń w historii tej sesji.<br/>
          Wpisz swoje spostrzeżenie w formularzu po lewej stronie i kliknij <b>„Wyślij zgłoszenie ▶”</b>.
        </div>`;
      return;
    }

    listEl.innerHTML = threads.map(t => {
      const hasUnread = this.hasUnreadAdminReply(t);
      let statusPill = `<span class="feedback-status-pill pill-submitted">🟠 Zgłoszone</span>`;
      if (hasUnread) {
        statusPill = `<span class="feedback-status-pill pill-replied">🟢 NOWA ODPOWIEDŹ OD ADMINA!</span>`;
      } else if (t.status === "replied") {
        statusPill = `<span class="feedback-status-pill pill-replied">🟢 Odpowiedziano</span>`;
      } else if (t.status === "read_by_admin") {
        statusPill = `<span class="feedback-status-pill pill-read">🔵 Odczytane przez Admina</span>`;
      }

      const msgsHTML = (t.messages || []).map(m => {
        const isAdmin = m.role === "admin";
        return `
          <div class="fb-msg-bubble ${isAdmin ? 'fb-msg-admin' : 'fb-msg-user'}">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; margin-bottom:3px; opacity:0.85;">
              <b style="color:${isAdmin ? '#4ade80' : '#facc15'};">${isAdmin ? '🛡️ Odpowiedź Administratora' : ('✍️ ' + this.escapeHtml(m.author || t.author || 'Anonim'))}</b>
              <span>${this.formatFeedbackTimestamp(m.createdAt)}</span>
            </div>
            <div>${this.escapeHtml(m.text)}</div>
          </div>`;
      }).join("");

      return `
        <div class="fb-thread-card ${hasUnread ? 'unread-reply' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap; border-bottom:1px solid #1e293b; padding-bottom:4px;">
            <span style="font-size:11px; color:#38bdf8; font-weight:700;">${this.escapeHtml(t.stepTitle || t.stepId || 'Ogólne')}</span>
            ${statusPill}
          </div>
          <div style="display:flex; flex-direction:column; gap:5px;">
            ${msgsHTML}
          </div>
          <div style="display:flex; gap:5px; margin-top:3px;">
            <input type="text" id="userReplyIn_${this.escapeHtml(t.id)}" class="search-in" style="padding:4px 8px; font-size:11.5px;" placeholder="Dopisz wiadomość w tym wątku..." onkeydown="if(event.key==='Enter')App.submitUserThreadReply('${this.escapeHtml(t.id)}')" />
            <button class="btn-top btn-xs btn-next-step" onclick="App.submitUserThreadReply('${this.escapeHtml(t.id)}')">Odpowiedz ▶</button>
          </div>
        </div>`;
    }).join("");
  },

  async submitNewFeedback() {
    const txtIn = document.getElementById("feedbackTextInput");
    const authIn = document.getElementById("feedbackAuthorInput");
    const text = txtIn ? txtIn.value.trim() : "";
    if (!text) {
      this.showToast("Wpisz treść spostrzeżenia przed wysłaniem.", "err");
      return;
    }

    const author = (authIn ? authIn.value.trim() : "") || this.feedbackAuthor || "Anonim";
    if (author !== "Anonim") {
      this.feedbackAuthor = author;
    }

    const step = this.allSteps[this.currentStepIdx];
    const currCode = this.encodeProgressCode();
    if (currCode && !this.knownProgressCodes.includes(currCode)) {
      this.knownProgressCodes.push(currCode);
    }

    const selectedScopes = [];
    if (document.getElementById("fbScopeGeneral")?.checked) {
      selectedScopes.push("Ogólne");
    }
    if (document.getElementById("fbScopeStep")?.checked && step) {
      selectedScopes.push(`Krok: ${step.title} (${step.id})`);
    }
    if (document.getElementById("fbScopeAudio")?.checked) {
      selectedScopes.push("Lektor / wskaźnik");
    }
    if (document.getElementById("fbScopeTerm")?.checked) {
      selectedScopes.push("Terminal / ćwiczenie");
    }
    if (document.getElementById("fbScopeContent")?.checked) {
      selectedScopes.push("Treść / propozycja");
    }
    if (selectedScopes.length === 0) {
      selectedScopes.push("Ogólne");
    }
    const scopeLabel = selectedScopes.join(" • ");

    const payload = {
      clientId: this.feedbackClientId,
      progressCode: currCode,
      author,
      stepId: (document.getElementById("fbScopeStep")?.checked && step) ? step.id : "general",
      stepTitle: scopeLabel,
      profile: window.COURSE_CONFIG.activeProfile,
      text
    };

    let createdThread = null;
    if (typeof fetch === "function") {
      try {
        const resp = await fetch("/api/feedback/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          const resData = await resp.json();
          if (resData && resData.ok && resData.thread) {
            createdThread = resData.thread;
          }
        }
      } catch (e) {}
    }

    if (!createdThread) {
      const now = new Date().toISOString();
      createdThread = {
        id: "fb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        clientId: this.feedbackClientId,
        progressCodes: currCode ? [currCode] : [],
        author,
        stepId: payload.stepId,
        stepTitle: payload.stepTitle,
        profile: payload.profile,
        createdAt: now,
        updatedAt: now,
        status: "submitted",
        adminReadAt: null,
        userReadReplyAt: null,
        messages: [{
          id: "msg_" + Date.now(),
          role: "user",
          author,
          text,
          createdAt: now
        }]
      };
    }

    this.feedbackThreads = [createdThread, ...(this.feedbackThreads || []).filter(t => t.id !== createdThread.id)];
    if (txtIn) txtIn.value = "";
    this.updateFeedbackIndicatorUI();
    this.renderUserFeedbackThreads();
    this.loadAdminFeedback(false);
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
    this.showToast("✓ Zgłoszenie zostało wysłane i dołączone do Twojej historii kursu!");
  },

  async submitUserThreadReply(threadId) {
    const inp = document.getElementById(`userReplyIn_${threadId}`);
    const text = inp ? inp.value.trim() : "";
    if (!text) return;

    const author = this.feedbackAuthor || "Anonim";
    const currCode = this.encodeProgressCode();
    let updatedThread = null;

    if (typeof fetch === "function") {
      try {
        const resp = await fetch("/api/feedback/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threadId,
            clientId: this.feedbackClientId,
            progressCode: currCode,
            author,
            text
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.ok && data.thread) updatedThread = data.thread;
        }
      } catch (e) {}
    }

    if (updatedThread) {
      this.feedbackThreads = this.feedbackThreads.map(t => t.id === threadId ? updatedThread : t);
    } else {
      const now = new Date().toISOString();
      this.feedbackThreads.forEach(t => {
        if (t.id === threadId) {
          t.messages = t.messages || [];
          t.messages.push({ id: "msg_" + Date.now(), role: "user", author, text, createdAt: now });
          t.status = "submitted";
          t.updatedAt = now;
        }
      });
    }

    if (inp) inp.value = "";
    this.updateFeedbackIndicatorUI();
    this.renderUserFeedbackThreads();
    this.loadAdminFeedback(false);
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
    this.showToast("Wysłano wiadomość w wątku zgłoszenia.");
  },

  async loadAdminFeedback(showToastOnDone = false) {
    if (typeof fetch !== "function") return;
    try {
      const resp = await fetch("/api/feedback/admin");
      if (!resp.ok) return;
      const data = await resp.json();
      if (data && data.ok && Array.isArray(data.threads)) {
        this.adminFeedbackThreads = data.threads;
        this.renderAdminFeedbackList();
        if (showToastOnDone) {
          this.showToast(`Odświeżono listę zgłoszeń (${data.threads.length}).`);
        }
      }
    } catch (e) {}
  },

  renderAdminFeedbackList() {
    if (typeof document === "undefined") return;
    const all = Array.isArray(this.adminFeedbackThreads) ? this.adminFeedbackThreads : [];
    const unreadCount = all.filter(t => t.status === "submitted").length;

    const topBadge = document.getElementById("adminUnreadFeedbackBadge");
    if (topBadge) {
      if (unreadCount > 0) {
        topBadge.style.display = "inline-block";
        topBadge.textContent = String(unreadCount);
        topBadge.title = `Nowe nieodczytane zgłoszenia Feedback: ${unreadCount}`;
      } else {
        topBadge.style.display = "none";
      }
    }

    const sumBadge = document.getElementById("adminFeedbackSummaryBadge");
    if (sumBadge) {
      sumBadge.className = `feedback-status-pill ${unreadCount > 0 ? 'pill-submitted' : (all.length > 0 ? 'pill-read' : 'pill-none')}`;
      sumBadge.textContent = unreadCount > 0
        ? `${all.length} zgłoszeń (🟠 ${unreadCount} nowych)`
        : `${all.length} zgłoszeń`;
    }

    const listEl = document.getElementById("adminFeedbackList");
    if (!listEl) return;

    const filterVal = document.getElementById("adminFeedbackFilter")?.value || "all";
    const filtered = filterVal === "all" ? all : all.filter(t => t.status === filterVal);

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="background:#0f172a; border:1px dashed #334155; border-radius:6px; padding:14px; text-align:center; color:#94a3b8; font-size:12px;">
          Brak zgłoszeń spełniających wybrane kryterium.
        </div>`;
      return;
    }

    listEl.innerHTML = filtered.map(t => {
      let statusBadge = `<span class="feedback-status-pill pill-submitted">🟠 NOWE (ZGŁOSZONE)</span>`;
      if (t.status === "read_by_admin") {
        statusBadge = `<span class="feedback-status-pill pill-read">🔵 ODCZYTANE</span>`;
      } else if (t.status === "replied") {
        statusBadge = `<span class="feedback-status-pill pill-replied">🟢 ODPOWIEDZIANO</span>`;
      }

      const lastCode = Array.isArray(t.progressCodes) && t.progressCodes.length > 0
        ? t.progressCodes[t.progressCodes.length - 1]
        : "brak kodu";

      const msgsHTML = (t.messages || []).map(m => {
        const isAdmin = m.role === "admin";
        return `
          <div class="fb-msg-bubble ${isAdmin ? 'fb-msg-admin' : 'fb-msg-user'}">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; margin-bottom:2px; opacity:0.85;">
              <b style="color:${isAdmin ? '#4ade80' : '#facc15'};">${isAdmin ? '🛡️ Administrator' : ('👤 Użytkownik: ' + this.escapeHtml(m.author || t.author || 'Anonim'))}</b>
              <span>${this.formatFeedbackTimestamp(m.createdAt)}</span>
            </div>
            <div>${this.escapeHtml(m.text)}</div>
          </div>`;
      }).join("");

      const markReadBtn = t.status === "submitted"
        ? `<button class="btn-top btn-xs" style="border-color:#38bdf8; color:#38bdf8;" onclick="App.adminMarkFeedbackRead('${this.escapeHtml(t.id)}')" title="Zmień status u użytkownika na: Odczytane przez Admina (niebieska dioda)">✓ Oznacz jako odczytane</button>`
        : "";

      return `
        <div class="fb-thread-card">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; border-bottom:1px solid #1e293b; padding-bottom:4px;">
            <div style="font-size:11.5px; color:#e2e8f0;">
              <b style="color:#facc15;">${this.escapeHtml(t.author || 'Anonim')}</b>
              <span style="color:#64748b;">•</span>
              <span style="color:#38bdf8; font-weight:700;">${this.escapeHtml(t.stepTitle || t.stepId || 'Ogólne')}</span>
              <span style="color:#64748b;">•</span>
              <code style="font-size:10.5px; color:#94a3b8;">${this.escapeHtml(lastCode)}</code>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              ${statusBadge}
              ${markReadBtn}
              <button class="btn-top btn-xs" style="border-color:#ef4444; color:#fca5a5;" onclick="App.adminDeleteFeedback('${this.escapeHtml(t.id)}')" title="Usuń to zgłoszenie z serwera">✕</button>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:5px;">
            ${msgsHTML}
          </div>
          <div style="display:flex; gap:6px; margin-top:3px;">
            <input type="text" id="adminReplyIn_${this.escapeHtml(t.id)}" class="search-in" style="padding:4px 8px; font-size:11.5px;" placeholder="Wpisz odpowiedź dla tego użytkownika (zaświeci u niego zieloną diodę)..." onkeydown="if(event.key==='Enter')App.adminReplyFeedback('${this.escapeHtml(t.id)}')" />
            <button class="btn-top btn-xs btn-director" onclick="App.adminReplyFeedback('${this.escapeHtml(t.id)}')">Wyślij odpowiedź ▶</button>
          </div>
        </div>`;
    }).join("");
  },

  async adminMarkFeedbackRead(threadId) {
    if (typeof fetch !== "function") return;
    try {
      const resp = await fetch("/api/feedback/admin-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", threadId })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ok) {
          this.adminFeedbackThreads = data.threads || [];
          this.renderAdminFeedbackList();
          this.syncFeedbackWithServer(false);
          this.showToast("Oznaczono zgłoszenie jako odczytane (u użytkownika zapali się niebieska dioda).");
        }
      }
    } catch (e) {}
  },

  async adminReplyFeedback(threadId) {
    if (typeof fetch !== "function") return;
    const inp = document.getElementById(`adminReplyIn_${threadId}`);
    const text = inp ? inp.value.trim() : "";
    if (!text) {
      this.showToast("Wpisz treść odpowiedzi dla użytkownika.", "err");
      return;
    }
    try {
      const resp = await fetch("/api/feedback/admin-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", threadId, text })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ok) {
          if (inp) inp.value = "";
          this.adminFeedbackThreads = data.threads || [];
          this.renderAdminFeedbackList();
          this.syncFeedbackWithServer(false);
          this.showToast("✓ Wysłano odpowiedź do użytkownika (u użytkownika zapali się zielona dioda)!");
        }
      }
    } catch (e) {}
  },

  async adminDeleteFeedback(threadId) {
    if (typeof fetch !== "function") return;
    try {
      const resp = await fetch("/api/feedback/admin-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", threadId })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ok) {
          this.adminFeedbackThreads = data.threads || [];
          this.feedbackThreads = (this.feedbackThreads || []).filter(t => t.id !== threadId);
          this.renderAdminFeedbackList();
          this.updateFeedbackIndicatorUI();
          StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
          this.showToast("Usunięto zgłoszenie.");
        }
      }
    } catch (e) {}
  },

  changeStepTier(stepId, newTier) {
    window.COURSE_CONFIG.stepTierOverrides[stepId] = newTier;
    this.rebuildActiveCurriculum();
    this.renderAdminModalContent();
    this.renderDrawer();
    this.updateTopProgress();
  },

  updateAdminPolicy() {
    const cfg = window.COURSE_CONFIG;
    cfg.lockProfileForStudent = document.getElementById("chkLockProfile").checked;
    cfg.policies.enforceSequentialLock = document.getElementById("chkSequential").checked;
    cfg.policies.allowHints = document.getElementById("chkAllowHints").checked;
    cfg.policies.showTierBadgesInDrawer = document.getElementById("chkShowBadges").checked;

    if (!cfg.security) cfg.security = {};
    const chkReqPass = document.getElementById("chkRequireAdminPass");
    const chkHideBtn = document.getElementById("chkHideAdminBtn");
    if (chkReqPass) cfg.security.requireAdminPassword = chkReqPass.checked;
    if (chkHideBtn) cfg.security.hideAdminButtonOnTopbar = chkHideBtn.checked;

    const chkAuto = document.getElementById("chkAutoSave");
    const selAuto = document.getElementById("selAutoSaveInterval");
    if (chkAuto) cfg.policies.autoSaveEnabled = chkAuto.checked;
    if (selAuto) cfg.policies.autoSaveIntervalSec = Number(selAuto.value) || 30;

    StorageManager.setupAutoSaveTimer();
    this.renderProfileSelectorUI();
    this.loadStep(this.currentStepIdx);
  },

  exportProfileConfigJS() {
    const content = `window.COURSE_CONFIG = ${JSON.stringify(window.COURSE_CONFIG, null, 2)};\n`;
    const blob = new Blob([content], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "course-profiles.js";
    a.click();
    URL.revokeObjectURL(url);
  },

  setupKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        this.toggleAdminModal();
      }
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        this.resetLayout();
      }
      if (this.tourActive) {
        if (e.key === "Escape") this.stopTour();
        if (e.key === "ArrowRight") this.nextTourStep();
        if (e.key === "ArrowLeft") this.prevTourStep();
      }
    });
  },

  // INTERAKTYWNY OBCHÓD PO APLIKACJI (TOUR Z KURSOREM)
  startTour() {
    this.tourActive = true;
    this.tourIdx = 0;
    const overlay = document.getElementById("tourOverlay");
    if (overlay) overlay.style.display = "block";
    this.renderTourStep();
  },

  stopTour() {
    this.tourActive = false;
    this.tourAuto = false;
    clearInterval(this.tourTimer);
    ["splitMainV", "splitLeftH", "splitRightH"].forEach(id => {
      document.getElementById(id)?.classList.remove("splitter-tour-glow");
    });
    const chk = document.getElementById("chkTourAuto");
    if (chk) chk.checked = false;
    const overlay = document.getElementById("tourOverlay");
    if (overlay) overlay.style.display = "none";
  },

  toggleTourAuto(enabled) {
    this.tourAuto = enabled;
    clearInterval(this.tourTimer);
    if (enabled) {
      this.tourTimer = setInterval(() => {
        if (!this.tourActive) {
          clearInterval(this.tourTimer);
          return;
        }
        if (this.tourIdx + 1 < this.tourSteps.length) {
          this.nextTourStep();
        } else {
          this.stopTour();
        }
      }, 5000);
    }
  },

  prevTourStep() {
    if (this.tourIdx > 0) {
      this.tourIdx--;
      this.renderTourStep();
    }
  },

  nextTourStep() {
    if (this.tourIdx + 1 < this.tourSteps.length) {
      this.tourIdx++;
      this.renderTourStep();
    } else {
      this.stopTour();
    }
  },

  renderTourStep() {
    if (!this.tourActive) return;
    const item = this.tourSteps[this.tourIdx];
    const target = document.getElementById(item.targetId);
    const spot = document.getElementById("tourSpotlight");
    const cursor = document.getElementById("tourCursor");
    const card = document.getElementById("tourCard");

    document.getElementById("tourStepBadge").textContent = `OBCHÓD ${this.tourIdx + 1} / ${this.tourSteps.length}`;
    document.getElementById("tourTitle").textContent = item.title;
    document.getElementById("tourDesc").innerHTML = item.desc;
    document.getElementById("btnTourPrev").disabled = (this.tourIdx === 0);
    document.getElementById("btnTourNext").textContent = (this.tourIdx + 1 === this.tourSteps.length) ? "✓ Zakończ" : "Dalej ▶";

    ["splitMainV", "splitLeftH", "splitRightH"].forEach(id => {
      document.getElementById(id)?.classList.toggle("splitter-tour-glow", !!item.highlightSplitters);
    });

    if (!target || typeof target.getBoundingClientRect !== "function") return;
    const rTarget = target.getBoundingClientRect();
    let sLeft = rTarget.left;
    let sTop = rTarget.top;
    let sRight = rTarget.right;
    let sBottom = rTarget.bottom;

    if (Array.isArray(item.spotlightIds) && item.spotlightIds.length > 0) {
      item.spotlightIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el || typeof el.getBoundingClientRect !== "function") return;
        const b = el.getBoundingClientRect();
        if (b.width <= 0 || b.height <= 0) return;
        sLeft = Math.min(sLeft, b.left);
        sTop = Math.min(sTop, b.top);
        sRight = Math.max(sRight, b.right);
        sBottom = Math.max(sBottom, b.bottom);
      });
    }

    const r = {
      left: sLeft,
      top: sTop,
      right: sRight,
      bottom: sBottom,
      width: Math.max(10, sRight - sLeft),
      height: Math.max(10, sBottom - sTop)
    };
    const pad = 5;

    spot.style.left = `${Math.max(2, r.left - pad)}px`;
    spot.style.top = `${Math.max(2, r.top - pad)}px`;
    spot.style.width = `${r.width + pad * 2}px`;
    spot.style.height = `${r.height + pad * 2}px`;

    // Umieść kursor bezpośrednio na głównym wskazywanym elemencie (target)
    const isSplitter = item.targetId === "splitMainV";
    const cursorX = isSplitter
      ? rTarget.left + rTarget.width / 2
      : Math.min(window.innerWidth - 40, Math.max(24, rTarget.left + Math.min(120, rTarget.width * 0.42)));
    const cursorY = isSplitter
      ? rTarget.top + rTarget.height * 0.45
      : Math.min(window.innerHeight - 40, Math.max(24, rTarget.top + Math.min(60, rTarget.height * 0.45)));
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    // Inteligentne pozycjonowanie dymku opisu, aby nie zasłaniał wskazywanego elementu
    const cardW = 390;
    const cardH = 210;
    let cardLeft = isSplitter ? Math.max(16, r.left - cardW - 22) : r.left;
    let cardTop = isSplitter ? Math.max(80, r.top + r.height * 0.32) : (r.bottom + 16);

    if (cardTop + cardH > window.innerHeight - 12) {
      cardTop = Math.max(60, r.top - cardH - 16);
    }
    if (cardLeft + cardW > window.innerWidth - 16) {
      cardLeft = Math.max(16, window.innerWidth - cardW - 16);
    }
    card.style.left = `${Math.max(12, cardLeft)}px`;
    card.style.top = `${Math.max(56, cardTop)}px`;
  },

  // ZARZĄDZANIE OKIENKAMI NA SCENIE
  renderStageWindows() {
    const dock = document.getElementById("dockPills");
    const canvas = document.getElementById("stageCanvas");

    dock.innerHTML = this.cards.map(c => {
      const vis = this.maximizedCardId ? (c.id === this.maximizedCardId) : c.open;
      const ico = vis ? this.svg2d("dotOpen") : this.svg2d("plusClosed");
      return `<button class="dock-pill ${vis ? 'open' : ''}" onclick="App.toggleCardFromDock('${c.id}')">${ico} <span>${this.replaceEmojisWith2D(c.title)}</span></button>`;
    }).join("");

    const openCount = this.cards.filter(c => c.open).length;
    canvas.classList.toggle("grid-mode", this.maximizedCardId === null);

    if (this.maximizedCardId === null && openCount === 0) {
      canvas.innerHTML = `
        <div class="empty-stage-box">
          <h3>Wszystkie okienka na scenie zostały zamknięte</h3>
          <p style="margin:8px 0 14px; font-size:13px; color:#64748b;">Kliknij dowolną kartę na Pasku Dokowania powyżej lub otwórz wszystkie naraz:</p>
          <button class="btn-top btn-drawer" onclick="App.openAllCards()">+ Otwórz wszystkie karty</button>
        </div>`;
      return;
    }

    canvas.innerHTML = this.cards.map((c, idx) => {
      const isMax = this.maximizedCardId === c.id;
      const isFocus = this.directorFocusCardId === c.id;
      const isHidden = this.maximizedCardId ? !isMax : !c.open;
      const spanFull = isMax || openCount === 1 || (openCount === 3 && idx === 2);
      const btnLabel = isMax ? "↙↘ Pomniejsz" : "⤢ 100%";
      const btnCls = isMax ? "win-btn restore-active" : "win-btn";

      return `
        <div class="win-panel ${spanFull ? 'full-span' : ''} ${isMax ? 'maximized-mode' : ''} ${isFocus ? 'director-focus-win' : ''}" id="win-${c.id}" style="display:${isHidden ? 'none' : 'flex'}">
          <div class="win-titlebar">
            <span style="display:inline-flex; align-items:center; gap:6px;">${isFocus ? this.svg2d("speakerLight") : ''}${this.replaceEmojisWith2D(c.title)}</span>
            <div class="win-controls">
              <button class="${btnCls}" onclick="App.toggleMaximizeCard('${c.id}')">${btnLabel}</button>
              <button class="win-btn close" onclick="App.closeCard('${c.id}')" title="Zamknij okienko">✕</button>
            </div>
          </div>
          <div class="win-body">${this.replaceEmojisWith2D(c.html)}</div>
        </div>`;
    }).join("");
  },

  toggleMaximizeCard(id) {
    if (this.maximizedCardId === id) {
      this.maximizedCardId = null;
      if (this.savedOpenStateBeforeMax) {
        this.cards.forEach(c => { c.open = this.savedOpenStateBeforeMax[c.id]; });
        this.savedOpenStateBeforeMax = null;
      }
      if (this.cards.filter(c => c.open).length <= 1) {
        this.cards.forEach(c => c.open = true);
      }
    } else {
      if (this.maximizedCardId === null) {
        const savedOpen = {};
        this.cards.forEach(c => { savedOpen[c.id] = c.open; });
        this.savedOpenStateBeforeMax = savedOpen;
      }
      const target = this.cards.find(c => c.id === id);
      if (target) target.open = true;
      this.maximizedCardId = id;
    }
    this.renderStageWindows();
  },

  closeCard(id) {
    const target = this.cards.find(c => c.id === id);
    if (target) target.open = false;
    if (this.maximizedCardId === id) {
      this.maximizedCardId = null;
      if (this.savedOpenStateBeforeMax) {
        this.savedOpenStateBeforeMax[id] = false;
        this.cards.forEach(c => { c.open = this.savedOpenStateBeforeMax[c.id]; });
        this.savedOpenStateBeforeMax = null;
      }
    }
    this.renderStageWindows();
  },

  toggleCardFromDock(id) {
    const target = this.cards.find(c => c.id === id);
    if (!target) return;
    if (this.maximizedCardId !== null) {
      if (this.maximizedCardId !== id) {
        target.open = true;
        this.maximizedCardId = id;
      } else {
        this.closeCard(id);
        return;
      }
    } else {
      target.open = !target.open;
    }
    this.renderStageWindows();
  },

  openAllCards() {
    this.maximizedCardId = null;
    this.directorFocusCardId = null;
    this.savedOpenStateBeforeMax = null;
    this.cards.forEach(c => c.open = true);
    this.renderStageWindows();
  },

  switchInspector(tab) {
    this.inspectorTab = tab;
    this.renderInspector();
  },

  renderInspector() {
    const step = this.allSteps[this.currentStepIdx];
    const f = step.primaryFile;
    const statusOut = VFSGit.getStatusShortOutput();
    const stShort = document.getElementById("stBadge");
    if (stShort) {
      stShort.textContent = `git status -s: ${statusOut ? statusOut.replace(/\n/g, " | ") : "(czysto)"}`;
    }
    const stFull = document.getElementById("stBadgeFull");
    if (stFull) {
      if (!statusOut) {
        stFull.innerHTML = `<div style="color:#4ade80; font-weight:700;">✓ Katalog roboczy i indeks są czyste (brak zmian względem HEAD).</div>`;
      } else {
        const rows = statusOut.split("\n").map(line => {
          const code = line.slice(0, 2);
          const file = line.slice(3);
          return `<div style="font-family:Consolas,monospace; margin-bottom:4px;"><span class="syn-var">${this.escapeHtml(code)}</span> <span class="syn-str">${this.escapeHtml(file)}</span></div>`;
        }).join("");
        stFull.innerHTML = `${rows}<div style="margin-top:6px; padding-top:6px; border-top:1px solid #334155; font-size:11px; color:#94a3b8;">Kolumna 1 (X) = Indeks vs HEAD &nbsp;|&nbsp; Kolumna 2 (Y) = Dysk vs Indeks &nbsp;|&nbsp; <code>??</code> = Nieśledzony</div>`;
      }
    }

    const normTab = (this.inspectorTab === "dag")
      ? "dag"
      : (["git", "head", "config", "objects"].includes(this.inspectorTab) ? "git" : "trees");

    ["trees", "dag", "git"].forEach(t => {
      document.getElementById("inspTab-" + t).classList.toggle("active", normTab === t);
    });

    const body = document.getElementById("inspectorBody");
    if (normTab === "trees") {
      const headRaw = VFSGit.unborn ? "" : (VFSGit.headCommit.files[f] || "");
      const idxRaw = VFSGit.index[f] || "";
      const workRaw = VFSGit.worktree[f] || "";

      body.innerHTML = `
        <div class="trees">
          <div class="tbox" id="boxHead" style="border-top-color:#16a34a;">
            <b>1. HEAD (${VFSGit.headCommit.id})</b>
            <div class="tcode">${headRaw ? this.highlightCode(headRaw, f) : '<span class="syn-cm">(brak w HEAD)</span>'}</div>
            <small>git show HEAD:${f}</small>
          </div>
          <div class="tbox" id="boxIdx" style="border-top-color:#2563eb;">
            <b>2. Indeks (.git/index)</b>
            <div class="tcode">${idxRaw ? this.highlightCode(idxRaw, f) : '<span class="syn-cm">(brak w indeksie)</span>'}</div>
            <small>git show :${f}</small>
          </div>
          <div class="tbox" id="boxWork" style="border-top-color:#d97706;">
            <b>3. Dysk (${f})</b>
            <div class="tcode">${workRaw ? this.highlightCode(workRaw, f) : '<span class="syn-cm">(usunięty z dysku)</span>'}</div>
            <small>cat ${f}</small>
          </div>
        </div>`;
    } else if (normTab === "dag") {
      body.innerHTML = step.dagSvgHTML || `
        <div class="trees">
          <div class="tbox" id="boxHead" style="grid-column: 1 / -1; border-top-color:#16a34a;">
            <b>${this.svg2d("branch")} Graf DAG (Kierunek wskaźników parent: od najnowszego commita w przeszłość)</b>
            <div class="tcode">${this.highlightDag(VFSGit.commits, VFSGit.branch, VFSGit.detached)}</div>
            <small>git log --oneline --graph</small>
          </div>
        </div>`;
    } else {
      body.innerHTML = `
        <div class="trees">
          <div class="tbox" id="boxHead"><b>.git/HEAD i refs/</b><div class="tcode">${this.highlightGitRefs()}</div><small>.git/HEAD &amp; .git/refs/</small></div>
          <div class="tbox" id="boxIdx"><b>.git/config (--local)</b><div class="tcode">${this.highlightGitConfig()}</div><small>git config --list</small></div>
          <div class="tbox" id="boxWork"><b>.git/objects/ (Baza)</b><div class="tcode">${this.highlightGitObjects()}</div><small>git cat-file -p HEAD</small></div>
        </div>`;
    }
  },

  evaluateAssertions() {
    const step = this.allSteps[this.currentStepIdx];
    if (!Array.isArray(this.stagePassedAtCmdCount)) {
      this.stagePassedAtCmdCount = [];
    }
    const results = [];
    for (let i = 0; i < step.assertions.length; i++) {
      const a = step.assertions[i];
      const prevPassed = i === 0 ? true : results[i - 1].pass;
      if (!prevPassed) {
        this.stagePassedAtCmdCount[i] = undefined;
        results.push({ label: a.label, pass: false });
        continue;
      }
      const minCmdIdx = i === 0 ? 0 : (this.stagePassedAtCmdCount[i - 1] ?? 0);
      const vfsView = Object.create(VFSGit);
      vfsView.lastCommands = VFSGit.lastCommands.slice(minCmdIdx);
      const pass = !!a.check(vfsView);
      if (pass) {
        if (this.stagePassedAtCmdCount[i] === undefined) {
          this.stagePassedAtCmdCount[i] = VFSGit.lastCommands.length;
        }
      } else {
        this.stagePassedAtCmdCount[i] = undefined;
      }
      results.push({ label: a.label, pass });
    }
    this.lastAssertionResults = results;
    const passedCount = results.filter(r => r.pass).length;
    const totalCount = results.length;
    const allDone = passedCount === totalCount && totalCount > 0;
    const pct = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

    const container = document.getElementById("assertionsContainer");
    if (container) {
      container.classList.toggle("all-done", allDone);
      const chipsHTML = results.map((r, idx) => `
        <span class="prog-chip ${r.pass ? 'done' : ''}" title="${this.escapeHtml(r.label)}">
          ${r.pass ? this.svg2d("check") : this.svg2d("pending")}
          <span>Etap ${idx + 1}</span>
        </span>
      `).join("");

      const hasNext = this.currentStepIdx + 1 < this.allSteps.length;
      const rightActionHTML = allDone
        ? `<div style="display:flex; align-items:center; gap:8px;">
             <span style="font-size:12px; font-weight:800; color:#15803d;">✓ Zadanie zaliczone (${passedCount}/${totalCount})</span>
             ${hasNext ? `<button class="btn-top btn-xs btn-next-step" onclick="App.nextStep()">Następny krok ▶</button>` : ""}
           </div>`
        : `<div style="display:flex; align-items:center; gap:7px; font-size:11.5px; font-weight:700; color:#475569;">
             <div class="prog-mini-track"><div class="prog-mini-fill" style="width:${pct}%"></div></div>
             <span>${passedCount} / ${totalCount}</span>
           </div>`;

      container.innerHTML = `
        <div class="prog-indicators">
          <span style="font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase;">Postęp:</span>
          ${chipsHTML}
        </div>
        ${rightActionHTML}
      `;
    }

    const justPassedNow = allDone && !this.currentStepAssertionsPassed && !this.isLoadingStep;
    this.currentStepAssertionsPassed = allDone;

    if (allDone) {
      this.completedSteps.add(step.id);
      this.updateTopProgress();
      this.renderDrawer();
      StorageManager.saveState(this.getSerializableState(), this.allSteps.length);

      if (justPassedNow) {
        const activeTimeSinceEnter = Math.max(0, Date.now() - (this.telemetryStepEnterTs || Date.now()));
        this.logActivityEvent("step_complete", {
          via: "terminal",
          timeSinceEnterMs: activeTimeSinceEnter,
          completedTotal: this.completedSteps.size
        });
        this.flushActivityLogs(false);
        if (this.directorPlaying) {
          this.directorStopReason = "task_completed";
          this.toggleDirector(false);
        }
        this.speakPreview("Zadanie praktyczne zostało zaliczone. Kliknij przycisk Następny krok.", "step_completed");
      }
    }
  },

  saveLayoutBeforeDirector() {
    if (this.savedLayoutBeforeDirector) return;
    this.savedLayoutBeforeDirector = {
      taskMinimized: this.taskMinimized
    };
  },

  restoreLayoutAfterDirector() {
    const ws = document.getElementById("workspace");
    if (ws) ws.classList.remove("director-mode-active");
    document.querySelectorAll(".director-lit-pane").forEach(el => el.classList.remove("director-lit-pane"));
    document.querySelectorAll(".director-primary-target").forEach(el => el.classList.remove("director-primary-target"));
    document.querySelectorAll(".has-row-focus").forEach(el => el.classList.remove("has-row-focus"));
    document.querySelectorAll(".has-line-focus").forEach(el => el.classList.remove("has-line-focus"));
    document.querySelectorAll(".has-box-focus").forEach(el => el.classList.remove("has-box-focus"));

    const orb = document.getElementById("directorOrb");
    if (orb) orb.style.display = "none";
    if (this.directorOrbRafId) {
      cancelAnimationFrame(this.directorOrbRafId);
      this.directorOrbRafId = null;
    }
    if ( this.orbPos ) {
      this.orbPos.initialized = false;
    }

    this.savedLayoutBeforeDirector = null;
  },

  updateDirectorButtonsUI() {
    const btn = document.getElementById("btnDirector");
    const btnInline = document.getElementById("btnDirectorInline");
    const btnPauseTop = document.getElementById("btnDirectorPauseTop");
    const btnPauseInline = document.getElementById("btnDirectorPauseInline");
    const badge = document.getElementById("directorBadge");

    if (this.directorPlaying) {
      if (btn) {
        btn.classList.add("playing");
        btn.innerHTML = `${this.svg2d("stop")} <span>STOP</span>`;
        btn.title = "Zatrzymaj narrację głosową lektora i wyłącz wskaźnik (STOP)";
      }
      if (btnInline) {
        btnInline.classList.add("playing");
        btnInline.innerHTML = `${this.svg2d("stop")} <span>STOP</span>`;
        btnInline.title = "Zatrzymaj narrację głosową lektora i wyłącz wskaźnik (STOP)";
      }
      if (btnPauseTop) {
        btnPauseTop.style.display = "inline-flex";
        btnPauseTop.classList.toggle("paused", this.directorPaused);
        btnPauseTop.innerHTML = this.directorPaused ? this.svg2d("play") : this.svg2d("pause");
        btnPauseTop.title = this.directorPaused ? "Wznów narrację lektora od tego momentu" : "Wstrzymaj na chwilę narrację lektora (Pauza)";
      }
      if (btnPauseInline) {
        btnPauseInline.style.display = "inline-flex";
        btnPauseInline.classList.toggle("paused", this.directorPaused);
        btnPauseInline.innerHTML = this.directorPaused ? this.svg2d("play") : this.svg2d("pause");
        btnPauseInline.title = this.directorPaused ? "Wznów narrację lektora od tego momentu" : "Wstrzymaj na chwilę narrację lektora (Pauza)";
      }
      if (badge) {
        badge.classList.toggle("playing", !this.directorPaused);
        badge.innerHTML = this.directorPaused ? this.svg2d("speakerIdle") : this.svg2d("speakerPlaying");
      }
    } else {
      if (btn) {
        btn.classList.remove("playing");
        btn.innerHTML = `${this.svg2d("play")} <span>START</span>`;
        btn.title = "Uruchom narrację głosową lektora i automatyczne wskazywanie elementów na ekranie (START)";
      }
      if (btnInline) {
        btnInline.classList.remove("playing");
        btnInline.innerHTML = `${this.svg2d("play")} <span>START</span>`;
        btnInline.title = "Uruchom narrację głosową lektora i automatyczne wskazywanie elementów na ekranie (START)";
      }
      if (btnPauseTop) {
        btnPauseTop.style.display = "none";
        btnPauseTop.classList.remove("paused");
      }
      if (btnPauseInline) {
        btnPauseInline.style.display = "none";
        btnPauseInline.classList.remove("paused");
      }
      if (badge) {
        badge.classList.remove("playing");
        badge.innerHTML = this.svg2d("speakerIdle");
      }
    }
  },

  togglePauseDirector() {
    if (!this.directorPlaying) return;
    const audio = this.getAudioPlayerElement();
    const step = this.allSteps[this.currentStepIdx];
    const beats = step ? this.getEffectiveBeats(step) : [];
    const beat = beats[this.directorBeatIdx];
    const progressPct = Math.round(this.getCurrentBeatSpeechProgress(beat) * 100);

    if (!this.directorPaused) {
      // Wstrzymanie (PAUZA) — zamrażamy dźwięk, kursor-latarkę i podświetlenie w bieżącym punkcie
      this.directorPaused = true;
      this.logActivityEvent("director_pause", {
        beatIdx: this.directorBeatIdx,
        totalBeats: beats.length,
        progressPct,
        reason: "user_pause_btn"
      });
      clearTimeout(this.directorTimer);
      if (this.selectedVoiceId === "mp3_eleven" && audio) {
        try { audio.pause(); } catch (e) {}
      } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try { window.speechSynthesis.pause(); } catch (e) {}
      }
      this.updateDirectorButtonsUI();
    } else {
      // Wznowienie (RESUME) od miejsca zatrzymania
      this.directorPaused = false;
      this.logActivityEvent("director_resume", {
        beatIdx: this.directorBeatIdx,
        totalBeats: beats.length,
        progressPct
      });
      this.updateDirectorButtonsUI();
      if (typeof this.pendingTaskBodyPlay === "function") {
        const fn = this.pendingTaskBodyPlay;
        this.pendingTaskBodyPlay = null;
        fn();
      } else if (this.selectedVoiceId === "mp3_eleven" && audio && audio.src && !audio.ended) {
        const p = audio.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => this.runDirectorBeat());
        }
      } else if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (e) {}
      } else {
        this.runDirectorBeat();
      }
    }
  },

  textOffsetToSpeechProgress(text, charIdx) {
    const s = String(text || "");
    if (!s.length || charIdx <= 0) return 0;
    const clamped = Math.min(s.length, Math.max(0, charIdx));
    const weightOf = (str) => {
      let w = 0;
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === "." || ch === "!" || ch === "?") w += 9;
        else if (ch === "," || ch === ";" || ch === ":" || ch === "—" || ch === "–") w += 4;
        else w += 1;
      }
      return Math.max(1, w);
    };
    return Math.min(0.92, Math.max(0, weightOf(s.slice(0, clamped)) / weightOf(s)));
  },

  getCurrentBeatSpeechProgress(beat) {
    if (!this.mainBeatAudioActive) return 0;
    if (this.selectedVoiceId === "mp3_eleven" && !this.usingWebSpeechFallback && this.currentAudioObj) {
      const a = this.currentAudioObj;
      if ((this.mainBeatAudioMetadataLoaded || a.readyState >= 1) && a.duration > 0 && isFinite(a.duration)) {
        return Math.min(1, Math.max(0, a.currentTime / a.duration));
      }
      return 0;
    }
    const est = Math.max(1000, this.beatEstimatedDurationMs || 5000);
    return Math.min(0.95, Math.max(0, (this.beatElapsedSpeechMs || 0) / est));
  },

  resolveCardForTarget(step, focusLine, focusRow, fallbackCard) {
    const targetId = focusLine || focusRow;
    if (targetId && step && Array.isArray(step.cards)) {
      const found = step.cards.find(c => String(c.html || "").includes(`id="${targetId}"`));
      if (found) return found.id;
    }
    return fallbackCard || (step && step.cards && step.cards[0] && step.cards[0].id) || null;
  },

  // Semantyczna mapa punktów zwrotnych w narracji (zsynchronizowana z dokładną frazą lektora i postępem audio.currentTime / audio.duration)
  beatSemanticOverrides: {
    "m01_s01_b03": [
      { atChar: 0, focusLine: null, focusRow: null, flashBoxes: ["boxHead", "boxIdx", "boxWork"], targetType: "treeSeq", treeSeq: ["boxHead", "boxIdx", "boxWork"] },
      { matchRe: /git\s+status\s+-s/i, focusLine: "m01s01-l1", focusRow: null, flashBoxes: ["boxHead"] },
      { matchRe: /a\s+git\s+log\s+--oneline/i, focusLine: "m01s01-l2", focusRow: null, flashBoxes: ["boxHead"] }
    ],
    "m01_s02_b01": [
      { atChar: 0, focusLine: "m01s02-l1", focusRow: null, flashBoxes: ["boxHead"] },
      { matchRe: /Plik\s+\.git\/HEAD/i, focusLine: null, focusRow: "m01s02-r1", flashBoxes: ["boxHead"] },
      { matchRe: /ale\s+sam\s+plik\s+gałęzi/i, focusLine: null, focusRow: "m01s02-r2", flashBoxes: ["boxHead"] }
    ],
    "m01_s03_b01": [
      { atChar: 0, focusLine: null, focusRow: "m01s03-r3", flashBoxes: [] },
      { matchRe: /i\s+nadpisują\s+ustawienia\s+globalne/i, focusLine: null, focusRow: "m01s03-r2", flashBoxes: [] }
    ],
    "m01_s04_b01": [
      { atChar: 0, focusLine: null, focusRow: null, flashBoxes: ["boxWork"], targetType: "box", boxId: "boxWork" },
      { matchRe: /a\s+Indeks\s+oraz\s+HEAD/i, focusLine: null, focusRow: null, flashBoxes: ["boxIdx", "boxHead"], targetType: "treeSeq", treeSeq: ["boxIdx", "boxHead"] },
      { matchRe: /Polecenie\s+git\s+add/i, focusLine: "m01s04-l1", focusRow: null, flashBoxes: ["boxIdx"] }
    ],
    "m01_s04_b02": [
      { atChar: 0, focusLine: "m01s04-l2", focusRow: null, flashBoxes: ["boxHead"] },
      { matchRe: /nazywany\s+Root\s+Commitem/i, focusLine: null, focusRow: "m01s04-r1", flashBoxes: ["boxHead"] }
    ],
    "m01_s05_b01": [
      { atChar: 0, focusLine: null, focusRow: null, flashBoxes: ["boxWork"], targetType: "box", boxId: "boxWork" },
      { matchRe: /podczas\s+gdy/i, focusLine: "m01s05-l1", focusRow: null, flashBoxes: ["boxWork"] }
    ],
    "m01_s05_b02": [
      { atChar: 0, focusLine: "m01s05-l1", focusRow: null, flashBoxes: ["boxIdx"] },
      { matchRe: /i\s+utworzysz\s+Commit\s+B/i, focusLine: "m01s05-l2", focusRow: null, flashBoxes: ["boxHead"] },
      { matchRe: /nowe\s+drzewo\s+wykorzysta/i, focusLine: null, focusRow: "m01s05-r1", flashBoxes: ["boxHead"] }
    ],
    "m01_s06_b01": [
      { atChar: 0, focusLine: "m01s06-l1", focusRow: null, flashBoxes: ["boxIdx"] },
      { matchRe: /pozostawiając\s+Twoje\s+poprawki\s+na\s+dysku/i, focusLine: null, focusRow: "m01s06-r1", flashBoxes: ["boxIdx", "boxWork"] }
    ],
    "m01_s06_b02": [
      { atChar: 0, focusLine: "m01s06-l2", focusRow: null, flashBoxes: ["boxWork"] },
      { matchRe: /kopiuje\s+zawartość\s+z\s+Indeksu/i, focusLine: null, focusRow: "m01s06-r2", flashBoxes: ["boxIdx", "boxWork"] }
    ],
    "m01_s08_b01": [
      { atChar: 0, focusLine: "m01s08-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /natomiast\s+flaga\s+-p/i, focusLine: "m01s08-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m01_s08_b02": [
      { atChar: 0, focusLine: "m01s08-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /git\s+cat-file\s+-p\s+HEAD\b/i, focusLine: "m01s08-l2", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /oraz\s+git\s+cat-file\s+-p\s+HEAD\^\{tree\}/i, focusLine: "m01s08-l3", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m02_s01_b01": [
      { atChar: 0, focusLine: null, focusRow: null, flashBoxes: ["boxHead", "boxIdx", "boxWork"], targetType: "box", boxId: "rightTop" },
      { matchRe: /Wersja\s+A\s+w\s+commicie\s+HEAD/i, focusLine: null, focusRow: "m02s01-r1", flashBoxes: ["boxHead"] },
      { matchRe: /Wersja\s+B\s+w\s+Indeksie/i, focusLine: null, focusRow: "m02s01-r2", flashBoxes: ["boxIdx"] },
      { matchRe: /oraz\s+Wersja\s+C\s+na\s+dysku/i, focusLine: null, focusRow: "m02s01-r3", flashBoxes: ["boxWork"] }
    ],
    "m02_s01_b02": [
      { atChar: 0, focusLine: "m02s01-l1", focusRow: null, flashBoxes: ["boxIdx", "boxWork"] },
      { matchRe: /pierwsza\s+kolumna\s+X/i, focusLine: null, focusRow: "m02s01-r2", flashBoxes: ["boxHead", "boxIdx"] },
      { matchRe: /a\s+druga\s+kolumna\s+Y/i, focusLine: null, focusRow: "m02s01-r3", flashBoxes: ["boxIdx", "boxWork"] }
    ],
    "m02_s01_b03": [
      { atChar: 0, focusLine: "m02s01-l2", focusRow: null, flashBoxes: ["boxHead"] },
      { matchRe: /a\s+sam\s+dwukropek\s+:plan\.txt/i, focusLine: "m02s01-l3", focusRow: null, flashBoxes: ["boxIdx"] }
    ],
    "m02_s04_b01": [
      { atChar: 0, focusLine: "m02s04-l1", focusRow: null, flashBoxes: ["boxWork"] },
      { matchRe: /bierze\s+wersję\s+z\s+Indeksu/i, focusLine: null, focusRow: "m02s04-r1", flashBoxes: ["boxIdx", "boxWork"] }
    ],
    "m02_s05_b01": [
      { atChar: 0, focusLine: null, focusRow: "m02s05-r1", flashBoxes: ["boxIdx"] },
      { matchRe: /oraz\s+skrót\s+git\s+commit\s+-a/i, focusLine: null, focusRow: "m02s05-r2", flashBoxes: ["boxIdx", "boxHead"] }
    ],
    "m02_s05_b02": [
      { atChar: 0, focusLine: "m02s05-l1", focusRow: null, flashBoxes: ["boxIdx"] },
      { matchRe: /a\s+następnie\s+git\s+add\s+-A/i, focusLine: "m02s05-l2", focusRow: null, flashBoxes: ["boxIdx"] }
    ],
    "m02_s07_b02": [
      { atChar: 0, focusLine: "m02s07-l2", focusRow: null, flashBoxes: ["boxHead"] },
      { matchRe: /Pamiętaj\s+jednak/i, focusLine: null, focusRow: "m02s07-r2", flashBoxes: ["boxHead"] }
    ],
    "m02_s08_b01": [
      { atChar: 0, focusLine: "m02s08-l1", focusRow: null, flashBoxes: ["boxIdx"] },
      { matchRe: /zmień\s+nazwę\s+pliku\s+poleceniem\s+git\s+mv/i, focusLine: "m02s08-l2", focusRow: null, flashBoxes: ["boxIdx", "boxWork"] }
    ],
    "m03_s01_b01": [
      { atChar: 0, focusLine: null, focusRow: null, flashBoxes: ["rightTop"], targetType: "box", boxId: "rightTop" },
      { matchRe: /każdy\s+commit\s+wskazuje\s+strzałką\s+parent/i, focusLine: null, focusRow: "m03s01-r1", flashBoxes: ["rightTop"] }
    ],
    "m03_s02_b02": [
      { atChar: 0, focusLine: "m03s02-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /w\s+dzienniku\s+git\s+log/i, focusLine: "m03s02-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m03_s03_b01": [
      { atChar: 0, focusLine: null, focusRow: null, flashBoxes: ["boxWork"], targetType: "box", boxId: "boxWork" },
      { matchRe: /Kiedy\s+wykonasz\s+git\s+stash/i, focusLine: "m03s03-l1", focusRow: null, flashBoxes: ["boxWork", "boxHead"] }
    ],
    "m03_s03_b02": [
      { atChar: 0, focusLine: "m03s03-l2", focusRow: null, flashBoxes: ["boxWork"] },
      { matchRe: /polecenie\s+git\s+stash\s+pop/i, focusLine: "m03s03-l3", focusRow: null, flashBoxes: ["boxWork"] }
    ],
    "m03_s04_b02": [
      { atChar: 0, focusLine: "m03s04-l1", focusRow: null, flashBoxes: ["boxHead"] },
      { matchRe: /zobacz\s+jak\s+zmienił\s+się\s+pierwszy\s+boks\s+HEAD/i, focusLine: "m03s04-l1", focusRow: null, flashBoxes: ["boxHead"], targetType: "box", boxId: "boxHead" },
      { matchRe: /a\s+następnie\s+utwórz\s+nowy\s+skonsolidowany\s+commit/i, focusLine: "m03s04-l2", focusRow: null, flashBoxes: ["boxHead"] }
    ],
    "m03_s05_b01": [
      { atChar: 0, focusLine: "m03s05-l1", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m03_s05_b02": [
      { atChar: 0, focusLine: "m03s05-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /a\s+następnie\s+odzyskaj\s+cały\s+kod\s+poleceniem\s+git\s+reset/i, focusLine: "m03s05-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m03_s06_b01": [
      { atChar: 0, focusLine: "m03s06-l1", focusRow: null, flashBoxes: ["boxHead"] },
      { matchRe: /za\s+pomocą\s+git\s+commit\s+--amend/i, focusLine: "m03s06-l2", focusRow: null, flashBoxes: ["boxHead"] }
    ],
    "m03_s06_b02": [
      { atChar: 0, focusLine: "m03s06-l1", focusRow: null, flashBoxes: ["boxIdx"] },
      { matchRe: /a\s+następnie\s+wykonaj\s+git\s+commit\s+--amend/i, focusLine: "m03s06-l2", focusRow: null, flashBoxes: ["boxHead"] }
    ],
    "m03_s07_b01": [
      { atChar: 0, focusLine: null, focusRow: "m03s07-r1", flashBoxes: ["rightTop"] },
      { matchRe: /Natomiast\s+daszek\s+z\s+numerem/i, focusLine: null, focusRow: "m03s07-r2", flashBoxes: ["rightTop"] }
    ],
    "m03_s07_b02": [
      { atChar: 0, focusLine: "m03s07-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /oraz\s+git\s+rev-parse\s+HEAD\^2/i, focusLine: "m03s07-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m03_s08_b01": [
      { atChar: 0, focusLine: null, focusRow: "m03s08-r1", flashBoxes: ["rightTop"] },
      { matchRe: /którego\s+pierwszym\s+rodzicem\s+jest\s+HEAD/i, focusLine: null, focusRow: "m03s08-r2", flashBoxes: ["rightTop"] },
      { matchRe: /a\s+drugim\s+rodzicem\s+specjalny\s+commit/i, focusLine: null, focusRow: "m03s08-r3", flashBoxes: ["rightTop"] }
    ],
    "m03_s08_b02": [
      { atChar: 0, focusLine: "m03s08-l1", focusRow: null, flashBoxes: ["boxWork"] },
      { matchRe: /a\s+następnie\s+wyświetl\s+ukryty\s+graf\s+schowka\s+poleceniem\s+git\s+log/i, focusLine: "m03s08-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m04_s01_b02": [
      { atChar: 0, focusLine: "m04s01-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /a\s+następnie\s+sprawdź\s+listę\s+gałęzi\s+poleceniem\s+git\s+branch\s+-v/i, focusLine: "m04s01-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m04_s02_b01": [
      { atChar: 0, focusLine: null, focusRow: "m04s02-r1", flashBoxes: ["rightTop"] },
      { matchRe: /Ponieważ\s+historia\s+się\s+nie\s+rozwidliła/i, focusLine: null, focusRow: "m04s02-r2", flashBoxes: ["rightTop"] }
    ],
    "m04_s02_b02": [
      { atChar: 0, focusLine: "m04s02-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /oraz\s+git\s+log\s+--oneline/i, focusLine: "m04s02-l2", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /Zobaczysz\s+w\s+Inspektorze/i, focusLine: "m04s02-l2", focusRow: null, flashBoxes: ["rightTop"], targetType: "box", boxId: "rightTop" }
    ],
    "m04_s03_b01": [
      { atChar: 0, focusLine: null, focusRow: "m04s03-r1", flashBoxes: ["rightTop"] },
      { matchRe: /oraz\s+oba\s+końce\s+gałęzi/i, focusLine: null, focusRow: "m04s03-r2", flashBoxes: ["rightTop"] },
      { matchRe: /Wynikiem\s+jest\s+nowy\s+obiekt\s+Merge\s+Commit/i, focusLine: null, focusRow: "m04s03-r3", flashBoxes: ["rightTop"] }
    ],
    "m04_s03_b02": [
      { atChar: 0, focusLine: "m04s03-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /a\s+następnie\s+podejrzyj\s+utworzony\s+commit\s+poleceniem\s+git\s+cat-file/i, focusLine: "m04s03-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m04_s04_b01": [
      { atChar: 0, focusLine: null, focusRow: null, flashBoxes: ["boxWork"], targetType: "box", boxId: "boxWork" },
      { matchRe: /pokazujące\s+wersję\s+z\s+HEAD/i, focusLine: null, focusRow: "m04s04-r1", flashBoxes: ["boxWork"] },
      { matchRe: /oraz\s+wersję\s+z\s+gałęzi\s+feature/i, focusLine: null, focusRow: "m04s04-r3", flashBoxes: ["boxWork"] }
    ],
    "m04_s04_b02": [
      { atChar: 0, focusLine: "m04s04-l1", focusRow: null, flashBoxes: ["boxWork"] },
      { matchRe: /wywołaj\s+git\s+add\s+app\.py/i, focusLine: "m04s04-l2", focusRow: null, flashBoxes: ["boxIdx"] },
      { matchRe: /i\s+zakończ\s+łączenie\s+poleceniem\s+git\s+commit/i, focusLine: "m04s04-l3", focusRow: null, flashBoxes: ["boxHead"] }
    ],
    "m04_s06_b02": [
      { atChar: 0, focusLine: null, focusRow: "m04s06-r2", flashBoxes: ["rightTop"] },
      { matchRe: /Wykonaj\s+teraz\s+git\s+rebase/i, focusLine: "m04s06-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /oraz\s+git\s+log/i, focusLine: "m04s06-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m04_s07_b02": [
      { atChar: 0, focusLine: "m04s07-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /oraz\s+sprawdź\s+historię\s+przez\s+git\s+log/i, focusLine: "m04s07-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m04_s08_b01": [
      { atChar: 0, focusLine: null, focusRow: "m04s08-r1", flashBoxes: ["boxIdx"] },
      { matchRe: /slot\s+drugi\s+z\s+naszą\s+wersją\s+HEAD/i, focusLine: null, focusRow: "m04s08-r2", flashBoxes: ["boxIdx"] },
      { matchRe: /oraz\s+slot\s+trzeci\s+z\s+wersją/i, focusLine: null, focusRow: "m04s08-r3", flashBoxes: ["boxIdx"] }
    ],
    "m04_s08_b02": [
      { atChar: 0, focusLine: "m04s08-l1", focusRow: null, flashBoxes: ["boxIdx"] },
      { matchRe: /:2:app\.py/i, focusLine: "m04s08-l2", focusRow: null, flashBoxes: ["boxIdx"] },
      { matchRe: /:3:app\.py/i, focusLine: "m04s08-l3", focusRow: null, flashBoxes: ["boxIdx"] }
    ],
    "m05_s01_b03": [
      { atChar: 0, focusLine: "m05s01-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /oraz\s+listę\s+wszystkich\s+wskaźników\s+poleceniem\s+git\s+branch\s+-a/i, focusLine: "m05s01-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m05_s02_b03": [
      { atChar: 0, focusLine: "m05s02-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /a\s+następnie\s+połącz\s+je\s+ze\s+swoją\s+gałęzią\s+poleceniem\s+git\s+merge/i, focusLine: "m05s02-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m05_s03_b03": [
      { atChar: 0, focusLine: "m05s03-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /i\s+wypchnij\s+ją\s+z\s+flagą\s+-u/i, focusLine: "m05s03-l2", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /obserwując\s+w\s+Inspektorze/i, focusLine: "m05s03-l2", focusRow: null, flashBoxes: ["rightTop"], targetType: "box", boxId: "rightTop" }
    ],
    "m05_s04_b03": [
      { atChar: 0, focusLine: "m05s04-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /i\s+sprawdź\s+jego\s+obecność\s+w\s+Inspektorze/i, focusLine: "m05s04-l1", focusRow: null, flashBoxes: ["rightTop"], targetType: "box", boxId: "rightTop" }
    ],
    "m05_s05_b03": [
      { atChar: 0, focusLine: "m05s05-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /a\s+następnie\s+wypchnij\s+czystą,\s+liniową\s+historię\s+poleceniem\s+git\s+push/i, focusLine: "m05s05-l2", focusRow: null, flashBoxes: ["rightTop"] }
    ],
    "m05_s07_b03": [
      { atChar: 0, focusLine: "m05s07-l1", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /pobierz\s+z\s+niego\s+aktualizacje\s+poleceniem\s+git\s+fetch\s+upstream/i, focusLine: "m05s07-l2", focusRow: null, flashBoxes: ["rightTop"] },
      { matchRe: /i\s+sprawdź\s+w\s+Inspektorze/i, focusLine: "m05s07-l2", focusRow: null, flashBoxes: ["rightTop"], targetType: "box", boxId: "rightTop" }
    ],
    "m05_s08_b01": [
      { atChar: 0, focusLine: null, focusRow: null, flashBoxes: ["rightTop"], targetType: "box", boxId: "rightTop" },
      { matchRe: /Wpis\s+fetch\s*=/i, focusLine: null, focusRow: "m05s08-r1", flashBoxes: ["rightTop"] }
    ]
  },

  buildCueSegments(cue) {
    if (Array.isArray(cue.segments) && cue.segments.length > 0) {
      return cue.segments;
    }
    const getLT = () => document.getElementById("leftTop");
    const getRT = () => document.getElementById("rightTop");

    if (cue.targetType === "treeSeq" && Array.isArray(cue.treeSeq) && cue.treeSeq.length > 0) {
      const segs = [];
      cue.treeSeq.forEach((boxId, idx) => {
        const getBoxEl = () => document.getElementById(boxId) || getRT();
        segs.push(
          {
            type: "glide",
            el: getBoxEl,
            rx: 0.5,
            ry: 0.22,
            duration: idx === 0 ? 420 : 320,
            onStart: () => this.highlightTreeBoxes([boxId])
          },
          {
            type: "circle",
            el: getBoxEl,
            cx: 0.5,
            cy: 0.5,
            rx: 0.4,
            ry: 0.36,
            maxRx: 110,
            maxRy: 75,
            duration: 720
          }
        );
      });
      segs.push({
        type: "hold",
        duration: 300,
        onStart: () => this.highlightTreeBoxes(cue.treeSeq)
      });
      return segs;
    }

    if (cue.targetType === "box" && cue.boxId) {
      const getBox = () => document.getElementById(cue.boxId) || getRT();
      const isFullPane = cue.boxId === "rightTop" || cue.boxId === "leftBottom" || cue.boxId === "rightBottom";
      return [
        { type: "glide", el: getBox, rx: 0.5, ry: 0.2, duration: 480 },
        {
          type: "circle",
          el: getBox,
          cx: 0.5,
          cy: 0.5,
          rx: 0.42,
          ry: 0.38,
          maxRx: isFullPane ? 340 : 135,
          maxRy: isFullPane ? 150 : 85,
          duration: 1350
        }
      ];
    }

    if (cue.focusLine) {
      const getLine = () => document.getElementById(cue.focusLine);
      return [
        { type: "glide", el: getLine, rx: 0.05, ry: 0.72, duration: 460 },
        { type: "underline", el: getLine, x1: 0.05, x2: 0.78, y: 0.78, duration: 1550 }
      ];
    }

    if (cue.focusRow) {
      const getRow = () => document.getElementById(cue.focusRow);
      return [
        { type: "glide", el: getRow, rx: 0.05, ry: 0.72, duration: 460 },
        { type: "underline", el: getRow, x1: 0.05, x2: 0.82, y: 0.78, duration: 1650 }
      ];
    }

    const getFallback = () => document.querySelector("#leftTop .win-panel.maximized-mode") || getLT();
    return [
      { type: "glide", el: getFallback, rx: 0.5, ry: 0.18, duration: 480 },
      { type: "circle", el: getFallback, cx: 0.5, cy: 0.5, rx: 0.4, ry: 0.36, maxRx: 360, maxRy: 180, duration: 1650 }
    ];
  },

  buildSemanticBeatTimeline(beat, step) {
    const getWS = () => document.getElementById("workspace");
    const getLT = () => document.getElementById("leftTop");
    const getLB = () => document.getElementById("leftBottom");
    const getRT = () => document.getElementById("rightTop");
    const getRB = () => document.getElementById("rightBottom");
    const vt = String(beat.voiceText || "");
    const baseTab = beat.inspectorTab || (step && step.defaultInspector) || "trees";
    const baseCard = this.resolveCardForTarget(step, beat.focusLine, beat.focusRow, beat.card);

    // 1. Samouczek 0.1 (zsynchronizowany z dokładnymi frazami lektora)
    if (beat.audioId === "m00_s01_b01") {
      const idxLT = Math.max(0, vt.indexOf("W lewym górnym rogu"));
      const idxDock = Math.max(idxLT + 10, vt.indexOf("z kartami teorii"));
      return [
        {
          atProgress: 0,
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r1",
          flashBoxes: [],
          litPanes: ["leftTop", "leftBottom", "rightTop", "rightBottom"],
          primaryPane: null,
          segments: [
            { type: "glide", el: getWS, rx: 0.5, ry: 0.18, duration: 480 },
            { type: "circle", el: getWS, cx: 0.5, cy: 0.5, rx: 0.34, ry: 0.32, maxRx: 520, maxRy: 280, duration: 2100 }
          ]
        },
        {
          atProgress: this.textOffsetToSpeechProgress(vt, idxLT),
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r1",
          flashBoxes: [],
          litPanes: ["leftTop"],
          primaryPane: "leftTop",
          segments: [
            { type: "glide", el: getLT, rx: 0.5, ry: 0.14, duration: 450 },
            { type: "circle", el: getLT, cx: 0.5, cy: 0.5, rx: 0.42, ry: 0.38, maxRx: 420, maxRy: 220, duration: 1650 }
          ]
        },
        {
          atProgress: this.textOffsetToSpeechProgress(vt, idxDock),
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r1",
          flashBoxes: [],
          litPanes: ["leftTop"],
          primaryPane: "leftTop",
          segments: [
            { type: "underline", el: () => document.getElementById("dockPills") || getLT(), x1: 0.05, x2: 0.72, y: 0.65, duration: 1450 }
          ]
        }
      ];
    }

    if (beat.audioId === "m00_s01_b02") {
      const getBox = () => document.getElementById("guidedInstructionBox") || getLB();
      const getChecks = () => document.getElementById("assertionsContainer") || getLB();
      const idxSec = Math.max(0, vt.indexOf("Sekcja Co mam teraz zrobić"));
      const idxChecks = Math.max(idxSec + 10, vt.indexOf("a asercje sprawdzają"));
      return [
        {
          atProgress: 0,
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r2",
          flashBoxes: ["leftBottom"],
          litPanes: ["leftBottom"],
          primaryPane: "leftBottom",
          segments: [
            { type: "glide", el: getLB, rx: 0.5, ry: 0.18, duration: 500 },
            { type: "circle", el: getLB, cx: 0.5, cy: 0.5, rx: 0.42, ry: 0.38, maxRx: 400, maxRy: 120, duration: 1650 }
          ]
        },
        {
          atProgress: this.textOffsetToSpeechProgress(vt, idxSec),
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r2",
          flashBoxes: ["leftBottom"],
          litPanes: ["leftBottom"],
          primaryPane: "leftBottom",
          segments: [
            { type: "underline", el: getBox, x1: 0.06, x2: 0.76, y: 0.45, duration: 1500 }
          ]
        },
        {
          atProgress: this.textOffsetToSpeechProgress(vt, idxChecks),
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r2",
          flashBoxes: ["leftBottom"],
          litPanes: ["leftBottom"],
          primaryPane: "leftBottom",
          segments: [
            { type: "underline", el: getChecks, x1: 0.06, x2: 0.55, y: 0.55, duration: 1450 }
          ]
        }
      ];
    }

    if (beat.audioId === "m00_s01_b03") {
      const getTabs = () => document.querySelector("#rightTop .insp-tabs") || getRT();
      const idxTrees = Math.max(0, vt.indexOf("widok Trzech Obszarów"));
      const idxDag = Math.max(idxTrees + 10, vt.indexOf("Grafu historii DAG"));
      return [
        {
          atProgress: 0,
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r3",
          flashBoxes: [],
          litPanes: ["rightTop"],
          primaryPane: "rightTop",
          segments: [
            { type: "glide", el: getRT, rx: 0.5, ry: 0.16, duration: 480 },
            { type: "circle", el: getRT, cx: 0.5, cy: 0.5, rx: 0.42, ry: 0.38, maxRx: 380, maxRy: 160, duration: 1650 }
          ]
        },
        {
          atProgress: this.textOffsetToSpeechProgress(vt, idxTrees),
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r3",
          flashBoxes: ["boxHead", "boxIdx", "boxWork"],
          litPanes: ["rightTop"],
          primaryPane: "rightTop",
          segments: this.buildCueSegments({ targetType: "treeSeq", treeSeq: ["boxHead", "boxIdx", "boxWork"] })
        },
        {
          atProgress: this.textOffsetToSpeechProgress(vt, idxDag),
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r3",
          flashBoxes: ["boxHead", "boxIdx", "boxWork"],
          litPanes: ["rightTop"],
          primaryPane: "rightTop",
          segments: [
            { type: "glide", el: getTabs, rx: 0.35, ry: 0.65, duration: 380 },
            { type: "underline", el: getTabs, x1: 0.35, x2: 0.92, y: 0.65, duration: 1400 }
          ]
        }
      ];
    }

    if (beat.audioId === "m00_s01_b04") {
      const getTermBar = () => document.querySelector("#rightBottom .term-bar") || getRB();
      const getTourBtn = () => document.getElementById("btnStartTourCard") || document.getElementById("btnTourTop") || getLT();
      const idxTour = Math.max(0, vt.indexOf("Możesz też kliknąć przycisk"));
      return [
        {
          atProgress: 0,
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r4",
          flashBoxes: ["rightBottom"],
          litPanes: ["rightBottom"],
          primaryPane: "rightBottom",
          segments: [
            { type: "glide", el: getRB, rx: 0.5, ry: 0.18, duration: 480 },
            { type: "circle", el: getRB, cx: 0.5, cy: 0.5, rx: 0.42, ry: 0.38, maxRx: 380, maxRy: 150, duration: 1450 },
            { type: "underline", el: getTermBar, x1: 0.05, x2: 0.48, y: 0.65, duration: 1200 }
          ]
        },
        {
          atProgress: this.textOffsetToSpeechProgress(vt, idxTour),
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: "m00s01-r4",
          flashBoxes: [],
          litPanes: ["leftTop", "rightBottom"],
          primaryPane: "leftTop",
          segments: [
            { type: "glide", el: getTourBtn, rx: 0.5, ry: 0.3, duration: 550 },
            { type: "circle", el: getTourBtn, cx: 0.5, cy: 0.5, rx: 0.48, ry: 0.55, maxRx: 145, maxRy: 26, duration: 1500 }
          ]
        }
      ];
    }

    // 2. Podsumowanie zadania praktycznego (_task_guide) — zsynchronizowane z treścią polecenia lektorki Magdaleny
    const isTaskGuide = Boolean(beat.isTaskGuide || (beat.audioId && beat.audioId.endsWith("_task_guide")));
    if (isTaskGuide) {
      const getBtn = () => document.querySelector("#guidedInstructionBox .guided-cmd-btn") || document.getElementById("guidedInstructionBox") || getLB();
      const getBox = () => document.getElementById("guidedInstructionBox") || getLB();
      const getTerm = () => document.getElementById("termInputRow") || getRB();
      const bodyStr = String(beat.taskBodyText || vt);
      const termMatch = /Wpisz\s+w\s+terminalu|Możesz\s+wpisać\s+poleceni\w*\s+w\s+terminalu/i.exec(bodyStr);
      const btnMatch = /albo\s+kliknij\s+gotowy\s+przycisk|lub\s+kliknąć\s+gotowy\s+przycisk/i.exec(bodyStr);
      const pTerm = termMatch ? Math.max(0.18, this.textOffsetToSpeechProgress(bodyStr, termMatch.index)) : 0.28;
      const pBtn = btnMatch ? Math.max(pTerm + 0.16, this.textOffsetToSpeechProgress(bodyStr, btnMatch.index)) : 0.68;

      return [
        {
          atProgress: 0,
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: null,
          flashBoxes: ["leftBottom"],
          litPanes: ["leftBottom", "rightBottom"],
          primaryPane: "leftBottom",
          segments: [
            { type: "glide", el: getBox, rx: 0.08, ry: 0.35, duration: 500 },
            { type: "underline", el: getBox, x1: 0.06, x2: 0.72, y: 0.36, duration: 1500 }
          ]
        },
        {
          atProgress: pTerm,
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: null,
          flashBoxes: ["rightBottom"],
          litPanes: ["leftBottom", "rightBottom"],
          primaryPane: "rightBottom",
          segments: [
            { type: "glide", el: getTerm, rx: 0.08, ry: 0.5, duration: 500 },
            { type: "underline", el: getTerm, x1: 0.06, x2: 0.62, y: 0.65, duration: 1450 }
          ]
        },
        {
          atProgress: pBtn,
          card: baseCard,
          inspectorTab: baseTab,
          focusLine: null,
          focusRow: null,
          flashBoxes: ["leftBottom"],
          litPanes: ["leftBottom", "rightBottom"],
          primaryPane: "leftBottom",
          segments: [
            { type: "glide", el: getBtn, rx: 0.5, ry: 0.25, duration: 480 },
            { type: "circle", el: getBtn, cx: 0.5, cy: 0.5, rx: 0.48, ry: 0.6, maxRx: 95, maxRy: 22, duration: 1450 }
          ]
        }
      ];
    }

    // 3. Sprawdzenie wielopunktowej / wielokartowej mapy semantycznej dla danego fragmentu
    const overrideSpecs = this.beatSemanticOverrides[beat.audioId];
    if (Array.isArray(overrideSpecs) && overrideSpecs.length > 0) {
      let prevProgress = 0;
      return overrideSpecs.map((spec, idx) => {
        let charIdx = spec.atChar ?? 0;
        if (spec.matchRe) {
          const m = spec.matchRe.exec(vt);
          charIdx = m ? m.index : 0;
        }
        let atProgress = idx === 0 ? 0 : this.textOffsetToSpeechProgress(vt, charIdx);
        if (idx > 0 && atProgress <= prevProgress + 0.04) {
          atProgress = Math.min(0.92, prevProgress + 0.08);
        }
        prevProgress = atProgress;

        const resolvedCard = this.resolveCardForTarget(step, spec.focusLine, spec.focusRow, spec.card || baseCard);
        const flashBoxes = Array.isArray(spec.flashBoxes)
          ? spec.flashBoxes
          : (beat.flashBox && beat.flashBox !== "leftTop" ? [beat.flashBox] : []);
        const isInspectorPrimary = spec.targetType === "box" || spec.targetType === "treeSeq";
        const hasRightFlash = isInspectorPrimary || flashBoxes.some(b => ["boxHead", "boxIdx", "boxWork", "rightTop"].includes(b));
        const litPanes = hasRightFlash ? ["leftTop", "rightTop"] : ["leftTop"];
        const primaryPane = isInspectorPrimary ? "rightTop" : "leftTop";

        const cueObj = {
          atProgress,
          card: resolvedCard,
          inspectorTab: spec.inspectorTab || baseTab,
          focusLine: spec.focusLine || null,
          focusRow: spec.focusRow || null,
          flashBoxes,
          litPanes,
          primaryPane,
          targetType: spec.targetType || null,
          boxId: spec.boxId || null,
          treeSeq: spec.treeSeq || null
        };
        cueObj.segments = this.buildCueSegments(cueObj);
        return cueObj;
      });
    }

    // 4. Pojedynczy fragment skupiony na jednej linii kodu lub jednym wierszu tabeli
    const flashBoxes = (beat.flashBox && beat.flashBox !== "leftTop") ? [beat.flashBox] : [];
    const hasRightFlash = flashBoxes.some(b => ["boxHead", "boxIdx", "boxWork", "rightTop"].includes(b));
    const singleCue = {
      atProgress: 0,
      card: baseCard,
      inspectorTab: baseTab,
      focusLine: beat.focusLine || null,
      focusRow: beat.focusRow || null,
      flashBoxes,
      litPanes: hasRightFlash ? ["leftTop", "rightTop"] : ["leftTop"],
      primaryPane: "leftTop"
    };
    singleCue.segments = this.buildCueSegments(singleCue);
    return [singleCue];
  },

  setDirectorOrbXY(x, y) {
    const orb = document.getElementById("directorOrb");
    if (!orb) return;
    const clampedX = Math.max(20, Math.min(window.innerWidth - 20, x));
    const clampedY = Math.max(20, Math.min(window.innerHeight - 20, y));
    if (!this.orbPos) {
      this.orbPos = { x: clampedX, y: clampedY, initialized: true };
    } else {
      this.orbPos.x = clampedX;
      this.orbPos.y = clampedY;
      this.orbPos.initialized = true;
    }
    orb.style.display = "block";
    orb.style.left = `${clampedX}px`;
    orb.style.top = `${clampedY}px`;
  },

  getElementRectSafe(elOrFn) {
    const el = typeof elOrFn === "function" ? elOrFn() : elOrFn;
    if (!el || typeof el.getBoundingClientRect !== "function") return null;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    return r;
  },

  setOrbActiveSegments(segments) {
    if (!this.orbPos || !this.orbPos.initialized) {
      const startBtn = document.getElementById("btnDirector") || document.getElementById("leftTop");
      const sr = this.getElementRectSafe(startBtn);
      if (sr) {
        this.setDirectorOrbXY(sr.left + sr.width * 0.5, sr.top + sr.height * 0.5);
      } else {
        this.setDirectorOrbXY(window.innerWidth * 0.35, 80);
      }
    }
    this.activeOrbSegments = Array.isArray(segments) ? segments : [];
    this.activeOrbSegIdx = 0;
    this.activeOrbSegElapsed = 0;
    this.activeOrbSegStarted = false;
    this.activeOrbSegStartX = this.orbPos.x;
    this.activeOrbSegStartY = this.orbPos.y;
  },

  triggerDirectorCue(cueIdx, beat) {
    if (!Array.isArray(this.currentBeatCues) || cueIdx < 0 || cueIdx >= this.currentBeatCues.length) return;
    this.currentBeatCueIdx = cueIdx;
    const cue = this.currentBeatCues[cueIdx];

    if (cue.inspectorTab && this.inspectorTab !== cue.inspectorTab) {
      this.inspectorTab = cue.inspectorTab;
      this.renderInspector();
    }

    if (cue.card) {
      const target = this.cards.find(c => c.id === cue.card);
      if (target) target.open = true;
      const needStageRender = (cueIdx === 0) || (this.maximizedCardId !== cue.card) || (this.directorFocusCardId !== cue.card);
      this.directorFocusCardId = cue.card;
      this.maximizedCardId = cue.card;
      if (needStageRender) {
        this.renderStageWindows();
      }
    }

    const ws = document.getElementById("workspace");
    const panes = {
      leftTop: document.getElementById("leftTop"),
      leftBottom: document.getElementById("leftBottom"),
      rightTop: document.getElementById("rightTop"),
      rightBottom: document.getElementById("rightBottom")
    };
    if (ws && panes.leftTop && panes.leftBottom && panes.rightTop && panes.rightBottom) {
      this.saveLayoutBeforeDirector();
      ws.classList.add("director-mode-active");
      if (this.taskMinimized) {
        this.taskMinimized = false;
        panes.leftBottom.classList.remove("minimized");
        const btnMin = document.getElementById("btnMinTask");
        if (btnMin) btnMin.textContent = "▾ Zwiń";
      }
      Object.values(panes).forEach(el => {
        el.classList.remove("director-lit-pane", "director-primary-target");
      });
      const litList = Array.isArray(cue.litPanes) && cue.litPanes.length > 0 ? cue.litPanes : ["leftTop"];
      litList.forEach(pId => panes[pId]?.classList.add("director-lit-pane"));
      if (cue.primaryPane && panes[cue.primaryPane]) {
        panes[cue.primaryPane].classList.add("director-lit-pane", "director-primary-target");
      }
    }

    document.querySelectorAll(".ps-codeblock").forEach(el => el.classList.remove("has-line-focus"));
    document.querySelectorAll(".code-line").forEach(el => el.classList.remove("laser-focus"));
    if (cue.focusLine) {
      const lineEl = document.getElementById(cue.focusLine);
      if (lineEl) {
        lineEl.classList.add("laser-focus");
        lineEl.closest(".ps-codeblock")?.classList.add("has-line-focus");
        if (typeof lineEl.scrollIntoView === "function") {
          lineEl.scrollIntoView({ behavior: "instant", block: "nearest" });
        }
      }
    }

    document.querySelectorAll(".tech-table").forEach(el => el.classList.remove("has-row-focus"));
    document.querySelectorAll(".tech-table tr").forEach(el => el.classList.remove("row-focus"));
    if (cue.focusRow) {
      const rowEl = document.getElementById(cue.focusRow);
      if (rowEl) {
        rowEl.classList.add("row-focus");
        rowEl.closest(".tech-table")?.classList.add("has-row-focus");
        if (typeof rowEl.scrollIntoView === "function") {
          rowEl.scrollIntoView({ behavior: "instant", block: "nearest" });
        }
      }
    }

    document.querySelectorAll(".trees").forEach(el => el.classList.remove("has-box-focus"));
    document.querySelectorAll(".tbox, .card, .term-card").forEach(el => el.classList.remove("flash"));
    if (Array.isArray(cue.flashBoxes) && cue.flashBoxes.length > 0) {
      cue.flashBoxes.forEach(boxId => {
        const fbEl = document.getElementById(boxId);
        if (fbEl) {
          fbEl.classList.add("flash");
          if (fbEl.classList.contains("tbox")) {
            fbEl.closest(".trees")?.classList.add("has-box-focus");
          }
        }
      });
    }

    this.setOrbActiveSegments(cue.segments || []);
  },

  startDirectorTimelineLoop(beat) {
    if (this.directorOrbRafId) {
      cancelAnimationFrame(this.directorOrbRafId);
      this.directorOrbRafId = null;
    }

    this.triggerDirectorCue(0, beat);

    let lastTime = performance.now();
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const computeTargetPoint = (seg, t) => {
      const segStartX = this.activeOrbSegStartX ?? this.orbPos.x;
      const segStartY = this.activeOrbSegStartY ?? this.orbPos.y;
      if (seg.type === "hold") {
        return { x: segStartX, y: segStartY };
      }

      const r = this.getElementRectSafe(seg.el);
      if (!r) return { x: segStartX, y: segStartY };

      if (seg.type === "glide") {
        const endX = r.left + r.width * (seg.rx ?? 0.12);
        const endY = r.top + r.height * (seg.ry ?? 0.65);
        const e = easeInOutCubic(t);
        const dist = Math.hypot(endX - segStartX, endY - segStartY);
        const arc = Math.min(26, dist * 0.1) * Math.sin(t * Math.PI);
        return {
          x: segStartX + (endX - segStartX) * e,
          y: segStartY + (endY - segStartY) * e - arc
        };
      }

      if (seg.type === "underline") {
        const x1 = r.left + r.width * (seg.x1 ?? 0.08);
        const x2 = r.left + r.width * (seg.x2 ?? 0.78);
        const baseY = r.top + Math.min(r.height * (seg.y ?? 0.72), r.height - 6);
        const e = easeInOutCubic(t);
        const rawX = x1 + (x2 - x1) * e;
        const rawY = baseY + Math.sin(t * Math.PI) * 2.5;
        const blend = Math.min(1, t / 0.15);
        return {
          x: segStartX + (rawX - segStartX) * blend,
          y: segStartY + (rawY - segStartY) * blend
        };
      }

      if (seg.type === "circle") {
        const cx = r.left + r.width * (seg.cx ?? 0.5);
        const cy = r.top + r.height * (seg.cy ?? 0.5);
        const rx = Math.max(22, Math.min(seg.maxRx ?? 420, r.width * (seg.rx ?? 0.38)));
        const ry = Math.max(12, Math.min(seg.maxRy ?? 260, r.height * (seg.ry ?? 0.38)));
        const loops = seg.loops ?? 1;
        const angle = -Math.PI * 0.5 + easeInOutCubic(t) * Math.PI * 2 * loops;
        const rawX = cx + rx * Math.cos(angle);
        const rawY = cy + ry * Math.sin(angle);
        const blend = Math.min(1, t / 0.18);
        return {
          x: segStartX + (rawX - segStartX) * blend,
          y: segStartY + (rawY - segStartY) * blend
        };
      }

      return { x: segStartX, y: segStartY };
    };

    const stepFrame = (now) => {
      if (!this.directorPlaying) return;
      const dt = Math.min(64, Math.max(0, now - lastTime));
      lastTime = now;

      if (!this.directorPaused) {
        if (this.mainBeatAudioActive) {
          this.beatElapsedSpeechMs = (this.beatElapsedSpeechMs || 0) + dt;
        }
        const speechProgress = this.getCurrentBeatSpeechProgress(beat);
        while (
          Array.isArray(this.currentBeatCues) &&
          this.currentBeatCueIdx + 1 < this.currentBeatCues.length &&
          speechProgress >= this.currentBeatCues[this.currentBeatCueIdx + 1].atProgress
        ) {
          this.triggerDirectorCue(this.currentBeatCueIdx + 1, beat);
        }

        const segments = this.activeOrbSegments || [];
        if (segments.length > 0 && this.activeOrbSegIdx < segments.length) {
          const seg = segments[this.activeOrbSegIdx];
          if (!this.activeOrbSegStarted) {
            this.activeOrbSegStarted = true;
            if (typeof seg.onStart === "function") {
              try { seg.onStart(); } catch (e) {}
            }
          }
          const dur = Math.max(100, seg.duration || 1400);
          this.activeOrbSegElapsed += dt;
          const t = Math.min(1, this.activeOrbSegElapsed / dur);
          const pt = computeTargetPoint(seg, t);
          this.setDirectorOrbXY(pt.x, pt.y);

          if (t >= 1) {
            this.activeOrbSegStartX = this.orbPos.x;
            this.activeOrbSegStartY = this.orbPos.y;
            this.activeOrbSegElapsed = 0;
            this.activeOrbSegStarted = false;
            this.activeOrbSegIdx++;
          }
        }
      }

      this.directorOrbRafId = requestAnimationFrame(stepFrame);
    };

    this.directorOrbRafId = requestAnimationFrame(stepFrame);
  },

  highlightTreeBoxes(boxIds) {
    const ids = Array.isArray(boxIds) ? boxIds : (boxIds ? [boxIds] : []);
    document.querySelectorAll(".tbox").forEach(el => el.classList.remove("flash"));
    document.querySelectorAll(".trees").forEach(el => {
      if (ids.length > 0) {
        el.classList.add("has-box-focus");
      } else {
        el.classList.remove("has-box-focus");
      }
    });
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("flash");
    });
  },

  toggleDirector(force) {
    const wasPlaying = this.directorPlaying;
    const step = this.allSteps[this.currentStepIdx];
    const beats = step ? this.getEffectiveBeats(step) : [];
    const prevBeat = beats[this.directorBeatIdx];
    const prevProgressPct = prevBeat ? Math.round(this.getCurrentBeatSpeechProgress(prevBeat) * 100) : 0;

    this.directorPlaying = typeof force === "boolean" ? force : !this.directorPlaying;
    this.directorPaused = false;
    this.updateDirectorButtonsUI();

    if (this.directorPlaying) {
      this.directorStopReason = null;
      this.directorBeatIdx = 0;
      this.logActivityEvent("director_start", {
        totalBeats: beats.length,
        voiceId: this.selectedVoiceId
      });
      this.runDirectorBeat();
    } else {
      if (wasPlaying) {
        const reason = this.directorStopReason || "user_stop_btn";
        this.directorStopReason = null;
        if (reason === "finished_all") {
          this.logActivityEvent("director_finish", {
            totalBeats: beats.length
          });
        } else {
          this.logActivityEvent("director_stop", {
            beatIdx: this.directorBeatIdx,
            totalBeats: beats.length,
            progressPct: prevProgressPct,
            reason
          });
        }
      }
      this.stopAllAudio();
      this.directorFocusCardId = null;
      this.maximizedCardId = null;
      this.restoreLayoutAfterDirector();
      this.renderStageWindows();
      document.querySelectorAll(".tbox, .card, .term-card").forEach(el => el.classList.remove("flash"));
    }
  },

  prevDirectorBeat() {
    const step = this.allSteps[this.currentStepIdx];
    const beats = this.getEffectiveBeats(step);
    if (beats.length === 0) return;
    this.directorPlaying = true;
    this.directorPaused = false;
    this.updateDirectorButtonsUI();
    this.directorBeatIdx = Math.max(0, this.directorBeatIdx - 1);
    this.runDirectorBeat();
  },

  nextDirectorBeat() {
    const step = this.allSteps[this.currentStepIdx];
    const beats = this.getEffectiveBeats(step);
    if (beats.length === 0) return;
    if (!this.directorPlaying) {
      this.toggleDirector(true);
      return;
    }
    this.directorPaused = false;
    this.updateDirectorButtonsUI();
    if (this.directorBeatIdx + 1 < beats.length) {
      this.directorBeatIdx++;
      this.runDirectorBeat();
    } else {
      this.toggleDirector(false);
    }
  },

  taskGuideOpeners: [
    { id: "task_opener_01", text: "Teraz Twoja kolej" },
    { id: "task_opener_02", text: "Teraz wykonaj ćwiczenie" },
    { id: "task_opener_03", text: "Teraz przećwicz to" },
    { id: "task_opener_04", text: "Teraz czas na praktykę" },
    { id: "task_opener_05", text: "Teraz sprawdź to samodzielnie" },
    { id: "task_opener_06", text: "Teraz pora na ćwiczenie" },
    { id: "task_opener_07", text: "Teraz wypróbuj to w terminalu" },
    { id: "task_opener_08", text: "Teraz przejdź do zadania" },
    { id: "task_opener_09", text: "Teraz przećwiczmy to w praktyce" },
    { id: "task_opener_10", text: "Teraz sprawdź, jak to działa" },
    { id: "task_opener_11", text: "Teraz pora na Ciebie" },
    { id: "task_opener_12", text: "Teraz wykonaj to zadanie" },
    { id: "task_opener_13", text: "Teraz przetestuj to własnoręcznie" }
  ],

  lastTaskOpenerIdx: -1,

  pickRandomTaskOpener() {
    const list = this.taskGuideOpeners;
    if (!Array.isArray(list) || list.length === 0) {
      return { id: "task_opener_01", text: "Teraz Twoja kolej" };
    }
    if (list.length === 1) return list[0];
    let idx = Math.floor(Math.random() * list.length);
    if (idx === this.lastTaskOpenerIdx) {
      idx = (idx + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
    }
    this.lastTaskOpenerIdx = idx;
    return list[idx];
  },

  getEffectiveBeats(step) {
    const baseBeats = Array.isArray(step.beats) ? [...step.beats] : [];
    const cmds = this.extractRunnableCommands(step);
    const cmdHint = cmds.length > 0 ? cmds.join(" a następnie ") : (step.hint || "git status -s");

    // Usuń z tytułu zadania dopiski w nawiasach powtarzające komendy (np. "(git status -s)")
    let cleanGoal = String(step.taskTitle || "")
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/^Rozgrzewka:\s*/i, "")
      .trim();

    const lastBeatText = String(baseBeats[baseBeats.length - 1]?.voiceText || "");
    const lastBeatAlreadyDictatesCmds =
      cmds.length > 0 &&
      cmds.every(c => lastBeatText.toLowerCase().includes(c.toLowerCase())) &&
      /wykonaj|wpisz|ustaw|wywołaj|przetestuj|użyj/i.test(lastBeatText);

    const goalSentence = cleanGoal.charAt(0).toUpperCase() + cleanGoal.slice(1);
    let taskBodyText;
    if (/uruchom w terminalu|wpisz w terminalu|wykonaj w terminalu/i.test(cleanGoal)) {
      // Jeśli sam tytuł zadania podaje już komendy do wpisania, wypowiedz tę instrukcję dokładnie JEDEN raz
      taskBodyText = `${goalSentence}, albo kliknij gotowy przycisk w ramce zadania.`;
    } else if (lastBeatAlreadyDictatesCmds) {
      taskBodyText = `${goalSentence}. Możesz wpisać polecenia w terminalu lub kliknąć gotowy przycisk w ramce zadania.`;
    } else {
      taskBodyText = `${goalSentence}. Wpisz w terminalu ${cmdHint}, albo kliknij gotowy przycisk w ramce zadania.`;
    }

    const defaultOpener = this.taskGuideOpeners[0];
    const lowerBody = taskBodyText.charAt(0).toLowerCase() + taskBodyText.slice(1);

    baseBeats.push({
      audioId: `${step.id}_task_guide`,
      isTaskGuide: true,
      taskBodyText,
      card: baseBeats[baseBeats.length - 1]?.card || (step.cards[0] && step.cards[0].id),
      flashBox: "leftBottom",
      voiceText: `${defaultOpener.text}: ${lowerBody}`
    });
    return baseBeats;
  },

  runDirectorBeat() {
    this.stopAllAudio();
    const step = this.allSteps[this.currentStepIdx];
    const beats = this.getEffectiveBeats(step);
    const beat = beats[this.directorBeatIdx];
    if (!beat) {
      this.directorStopReason = "finished_all";
      this.toggleDirector(false);
      return;
    }

    this.logActivityEvent("director_beat", {
      beatIdx: this.directorBeatIdx,
      totalBeats: beats.length,
      audioId: beat.audioId || null,
      cardId: beat.card || null
    });

    const badge = document.getElementById("directorBadge");
    if (badge) {
      badge.classList.add("playing");
      badge.innerHTML = this.svg2d("speakerPlaying");
      badge.title = `Odtwarzanie audio (${this.directorBeatIdx + 1}/${beats.length})`;
    }

    let activeOpener = null;
    let effectiveVoiceText = beat.voiceText;
    if (beat.audioId && beat.audioId.endsWith("_task_guide") && beat.taskBodyText) {
      activeOpener = this.pickRandomTaskOpener();
      const lowerBody = beat.taskBodyText.charAt(0).toLowerCase() + beat.taskBodyText.slice(1);
      effectiveVoiceText = `${activeOpener.text}: ${lowerBody}`;
    }
    document.getElementById("voiceSubtitle").textContent = effectiveVoiceText;

    // Inicjalizacja śledzenia postępu mowy i osi czasu (100% synchronizacji z głosem lektora)
    const timelineRefText = (beat.isTaskGuide && beat.taskBodyText) ? beat.taskBodyText : effectiveVoiceText;
    this.mainBeatAudioActive = !activeOpener;
    this.mainBeatAudioMetadataLoaded = false;
    this.usingWebSpeechFallback = (this.selectedVoiceId !== "mp3_eleven" || !beat.audioId);
    this.beatElapsedSpeechMs = 0;
    this.beatEstimatedDurationMs = Math.max(3200, String(timelineRefText || "").length * 68);

    this.currentBeatCues = this.buildSemanticBeatTimeline(beat, step);
    this.currentBeatCueIdx = -1;
    this.startDirectorTimelineLoop(beat);

    let advanced = false;
    const next = () => {
      if (advanced || !this.directorPlaying) return;
      advanced = true;
      this.directorBeatIdx++;
      if (this.directorBeatIdx < beats.length) {
        const nextBeat = beats[this.directorBeatIdx];
        const isTransitionToTask = Boolean(nextBeat && nextBeat.audioId && nextBeat.audioId.endsWith("_task_guide"));
        if (isTransitionToTask) {
          // 1 sekunda oddechu przed przejściem lektora do kwestii o ćwiczeniu ("Teraz...")
          this.directorTimer = setTimeout(() => {
            if (this.directorPlaying && !this.directorPaused) {
              this.runDirectorBeat();
            }
          }, 1000);
        } else {
          this.runDirectorBeat();
        }
      } else {
        this.directorStopReason = "finished_all";
        this.toggleDirector(false);
      }
    };

    const audio = this.getAudioPlayerElement();
    if (this.selectedVoiceId === "mp3_eleven" && beat.audioId && audio) {
      const playToken = ++this.audioPlayToken;
      this.currentAudioObj = audio;
      let fallbackTriggered = false;
      let retriedAfterAbort = false;

      const fallbackToWebSpeech = () => {
        if (fallbackTriggered || !this.directorPlaying || this.audioPlayToken !== playToken) return;
        fallbackTriggered = true;
        this.usingWebSpeechFallback = true;
        this.mainBeatAudioActive = true;
        this.beatElapsedSpeechMs = 0;
        audio.onended = null;
        audio.onerror = null;
        audio.oncanplay = null;
        audio.onloadedmetadata = null;
        this.speakViaWebSpeech(effectiveVoiceText, next);
      };

      const attemptPlay = () => {
        if (fallbackTriggered || !this.directorPlaying || this.directorPaused || this.audioPlayToken !== playToken) return;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch((err) => {
            if (fallbackTriggered || !this.directorPlaying || this.audioPlayToken !== playToken) return;
            if (err && err.name === "AbortError") {
              if (!retriedAfterAbort) {
                retriedAfterAbort = true;
                setTimeout(attemptPlay, 60);
              }
              return;
            }
            fallbackToWebSpeech();
          });
        }
      };

      const startMainBeatAudio = () => {
        if (fallbackTriggered || !this.directorPlaying || this.audioPlayToken !== playToken) return;
        this.pendingTaskBodyPlay = null;
        retriedAfterAbort = false;
        this.mainBeatAudioActive = true;
        this.mainBeatAudioMetadataLoaded = false;
        this.beatElapsedSpeechMs = 0;
        audio.onloadedmetadata = () => {
          if (this.audioPlayToken !== playToken) return;
          this.mainBeatAudioMetadataLoaded = true;
        };
        audio.onended = () => {
          if (this.audioPlayToken !== playToken) return;
          next();
        };
        audio.onerror = () => {
          if (this.audioPlayToken !== playToken) return;
          fallbackToWebSpeech();
        };
        audio.volume = 1.0;
        audio.muted = false;
        audio.src = `audio/${beat.audioId}.mp3?v=20261108a`;
        audio.load();
        attemptPlay();
      };

      if (activeOpener) {
        audio.onended = () => {
          if (this.audioPlayToken !== playToken) return;
          this.pendingTaskBodyPlay = startMainBeatAudio;
          this.directorTimer = setTimeout(() => {
            if (this.directorPlaying && !this.directorPaused && this.audioPlayToken === playToken) {
              startMainBeatAudio();
            }
          }, 150);
        };
        audio.onerror = () => {
          if (this.audioPlayToken !== playToken) return;
          startMainBeatAudio();
        };
        audio.volume = 1.0;
        audio.muted = false;
        audio.src = `audio/${activeOpener.id}.mp3?v=20261108a`;
        audio.load();
        attemptPlay();
      } else {
        startMainBeatAudio();
      }
    } else {
      this.speakViaWebSpeech(effectiveVoiceText, next);
    }
  },

  setupTerminalInput() {
    const inputEl = document.getElementById("cmdIn");
    if (!inputEl) return;

    inputEl.addEventListener("paste", () => {
      this.cmdPastedFlag = true;
    });

    inputEl.addEventListener("keydown", async (e) => {
      // Skrót Ctrl+L do czyszczenia terminala
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        this.clearTerminal();
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        this.cmdBackspaceCount = (this.cmdBackspaceCount || 0) + 1;
      } else if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!this.cmdTypingStartTs) {
          this.cmdTypingStartTs = Date.now();
        }
        this.cmdKeystrokeCount = (this.cmdKeystrokeCount || 0) + 1;
        this.cmdUsedHistoryFlag = false;
      }

      // Strzałka w górę: cofanie się po historii komend
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.cmdUsedHistoryFlag = true;
        const hist = VFSGit.cmdHistory || [];
        if (hist.length === 0) return;
        if (this.cmdHistoryIdx >= hist.length) {
          this.cmdDraft = e.target.value;
          this.cmdHistoryIdx = hist.length - 1;
        } else if (this.cmdHistoryIdx > 0) {
          this.cmdHistoryIdx--;
        }
        e.target.value = hist[this.cmdHistoryIdx] || "";
        const len = e.target.value.length;
        if (typeof e.target.setSelectionRange === "function") {
          e.target.setSelectionRange(len, len);
        }
        return;
      }

      // Strzałka w dół: przejście w przód po historii komend aż do bieżącego szkicu
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.cmdUsedHistoryFlag = true;
        const hist = VFSGit.cmdHistory || [];
        if (hist.length === 0) return;
        if (this.cmdHistoryIdx < hist.length - 1) {
          this.cmdHistoryIdx++;
          e.target.value = hist[this.cmdHistoryIdx] || "";
        } else {
          this.cmdHistoryIdx = hist.length;
          e.target.value = this.cmdDraft || "";
        }
        const len = e.target.value.length;
        if (typeof e.target.setSelectionRange === "function") {
          e.target.setSelectionRange(len, len);
        }
        return;
      }

      if (e.key !== "Enter") return;
      const val = e.target.value.trim();
      if (!val) return;
      e.target.value = "";
      await this.executeTerminalCommand(val);
    });
  },

  switchWorkbench(tab) {
    this.workbenchTab = tab;
    const isTerm = tab === "term";
    document.getElementById("wbBtnTerm").classList.toggle("active-wb", isTerm);
    document.getElementById("wbBtnEdit").classList.toggle("active-wb", !isTerm);
    document.getElementById("termOut").style.display = isTerm ? "block" : "none";
    document.getElementById("termInputRow").style.display = isTerm ? "flex" : "none";
    document.getElementById("editorPane").style.display = isTerm ? "none" : "flex";
  },

  loadFileIntoEditor(file) {
    document.getElementById("editorFileName").textContent = file;
    document.getElementById("editorTextarea").value = VFSGit.worktree[file] || "";
  },

  saveEditorToVFS() {
    const step = this.allSteps[this.currentStepIdx];
    const file = document.getElementById("editorFileName").textContent;
    const newVal = document.getElementById("editorTextarea").value;
    const prevResults = this.lastAssertionResults || [];
    const firstUnpassedIdx = prevResults.findIndex(r => !r.pass);
    const allowsDiskEdit = Boolean(step && step.id === "m04_s04" && firstUnpassedIdx === 0 && file === "app.py");

    if (!allowsDiskEdit) {
      document.getElementById("editorTextarea").value = VFSGit.worktree[file] || "";
      this.switchWorkbench("term");
      const outEl = document.getElementById("termOut");
      if (outEl) {
        outEl.innerHTML += `<div class="out" style="color:#f87171; font-weight:700;">⛔ Ręczna modyfikacja plików na dysku nie jest obsługiwana w tej części praktycznej.<br/><span style="color:#e2e8f0; font-weight:400;">Zastosuj prawidłowe instrukcje w terminalu przewidziane do zrealizowania bieżącego zadania.</span></div>`;
        outEl.scrollTop = outEl.scrollHeight;
      }
      return;
    }

    VFSGit.worktree[file] = newVal;
    this.logActivityEvent("editor_save", { file, length: String(newVal || "").length });
    this.switchWorkbench("term");
    this.renderInspector();
    this.evaluateAssertions();
  },

  clearTerminal() {
    document.getElementById("termOut").innerHTML = "";
  },

  showHint(event) {
    this.logActivityEvent("hint_toggle", {});
    this.togglePinExpandable("hintWrap", event);
  },

  resetCurrentStep() {
    const step = this.allSteps[this.currentStepIdx];
    if (step) {
      this.completedSteps.delete(step.id);
      this.logActivityEvent("step_reset", { source: "task_bar" }, step.id);
    }
    this.loadStep(this.currentStepIdx);
    this.showToast("Zresetowano stan repozytorium oraz postęp bieżącego zadania.");
  },

  toggleTaskMinimize() {
    this.taskMinimized = !this.taskMinimized;
    const leftTop = document.getElementById("leftTop");
    const leftBottom = document.getElementById("leftBottom");
    if (leftBottom) leftBottom.classList.toggle("minimized", this.taskMinimized);
    if (leftTop) {
      if (this.taskMinimized) {
        leftTop.style.height = "auto";
        leftTop.style.flex = "1 1 auto";
      } else {
        leftTop.style.flex = "";
        leftTop.style.height = "72%";
      }
    }
    document.getElementById("btnMinTask").textContent = this.taskMinimized ? "▴ Rozwiń" : "▾ Zwiń";
  },

  toggleDrawer() {
    document.getElementById("drawerBackdrop").classList.toggle("open");
  },

  showToast(message, type = "ok") {
    if (typeof document === "undefined") return;
    let box = document.getElementById("appToastBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "appToastBox";
      box.style.cssText = "position:fixed; bottom:18px; right:18px; z-index:200; padding:10px 16px; border-radius:8px; font-size:12.5px; font-weight:700; color:#f8fafc; background:#0f172a; border:1.5px solid #22c55e; box-shadow:0 12px 28px rgba(0,0,0,0.6); transition:opacity 0.25s; pointer-events:none;";
      document.body.appendChild(box);
    }
    box.style.borderColor = type === "err" ? "#ef4444" : "#22c55e";
    box.style.opacity = "1";
    box.textContent = message;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      if (box) box.style.opacity = "0";
    }, 3200);
  },

  // ZALICZANIE AWANSEM I RESETOWANIE POJEDYNCZYCH KROKÓW / MODUŁÓW W SYLLABUSIE
  markStepCompletedAdvance(stepId, event) {
    if (event) event.stopPropagation();
    // Zalicza wyłącznie wskazany krok, nie zmieniając statusu żadnych wcześniejszych ani późniejszych części
    this.completedSteps.add(stepId);
    this.logActivityEvent("step_complete", { via: "fast_forward" }, stepId);
    this.updateTopProgress();
    this.renderDrawer();
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
  },

  resetStepCompletion(stepId, event) {
    if (event) event.stopPropagation();
    this.completedSteps.delete(stepId);
    this.logActivityEvent("step_reset", { source: "drawer" }, stepId);
    if (this.allSteps[this.currentStepIdx]?.id === stepId) {
      this.loadStep(this.currentStepIdx);
    } else {
      this.updateTopProgress();
      this.renderDrawer();
      StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
    }
  },

  markModuleCompletedAdvance(modId, event) {
    if (event) event.stopPropagation();
    const mod = window.CURRICULUM.find(m => m.id === modId);
    if (!mod) return;
    mod.steps.forEach(s => {
      if (this.isStepAllowedInActiveProfile(s)) {
        this.completedSteps.add(s.id);
      }
    });
    this.updateTopProgress();
    this.renderDrawer();
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
  },

  resetModuleCompletion(modId, event) {
    if (event) event.stopPropagation();
    const mod = window.CURRICULUM.find(m => m.id === modId);
    if (!mod) return;
    mod.steps.forEach(s => this.completedSteps.delete(s.id));
    if (this.allSteps[this.currentStepIdx]?.moduleId === modId) {
      this.loadStep(this.currentStepIdx);
    } else {
      this.updateTopProgress();
      this.renderDrawer();
      StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
    }
  },

  isStepUnlocked(idx) {
    if (idx <= 0) return true;
    const seqLockActive = window.COURSE_CONFIG.policies.enforceSequentialLock && !this.instructorMode;
    if (!seqLockActive) return true;
    const st = this.allSteps[idx];
    const prevSt = this.allSteps[idx - 1];
    return !!(st && (this.completedSteps.has(st.id) || (prevSt && this.completedSteps.has(prevSt.id))));
  },

  renderDrawer() {
    const list = document.getElementById("drawerList");
    const showBadges = window.COURSE_CONFIG.policies.showTierBadgesInDrawer;
    const seqLockActive = window.COURSE_CONFIG.policies.enforceSequentialLock && !this.instructorMode;
    let globalIdx = 0;

    list.innerHTML = window.CURRICULUM.map(mod => {
      const visibleSteps = mod.steps.filter(st => this.isStepAllowedInActiveProfile(st));
      if (visibleSteps.length === 0) return "";

      const doneInMod = visibleSteps.filter(s => this.completedSteps.has(s.id)).length;
      const allModDone = doneInMod === visibleSteps.length;

      const rows = visibleSteps.map(st => {
        const idx = globalIdx++;
        const isDone = this.completedSteps.has(st.id);
        const isCurr = idx === this.currentStepIdx;
        const unlocked = this.isStepUnlocked(idx);
        const icon = isDone ? "✓" : (isCurr ? "●" : (unlocked ? "○" : "🔒"));
        const tierBadge = showBadges ? this.getTierBadgeHTML(this.getStepEffectiveTier(st)) : "";
        const actionBtn = isDone
          ? `<button class="step-act-btn mark-reset" onclick="App.resetStepCompletion('${st.id}', event)" title="Zresetuj zaliczenie TYLKO tego kroku, aby wykonać go ponownie (bez utraty pozostałych zaliczonych tematów)">↺ Resetuj</button>`
          : (!seqLockActive
              ? `<button class="step-act-btn mark-done" onclick="App.markStepCompletedAdvance('${st.id}', event)" title="Zalicz tylko ten krok awansem">✓ Zalicz</button>`
              : "");

        return `<div class="step-row ${isCurr ? 'active' : ''} ${!unlocked ? 'locked' : ''}" onclick="App.selectStepFromDrawer(${idx})">
          <span style="flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis;">${this.replaceEmojisWith2D(icon)} ${st.title}</span>
          ${tierBadge}
          ${actionBtn}
        </div>`;
      }).join("");

      const modActionBtn = allModDone
        ? `<button class="step-act-btn mark-reset" onclick="App.resetModuleCompletion('${mod.id}', event)" title="Zresetuj zaliczenie kroków tylko w tym module">↺ Resetuj moduł</button>`
        : (!seqLockActive
            ? `<button class="step-act-btn mark-done" onclick="App.markModuleCompletedAdvance('${mod.id}', event)" title="Zalicz awansem wszystkie kroki w tym module">✓ Zalicz moduł</button>`
            : "");

      return `<div class="mod-box">
        <div class="mod-hdr" onclick="this.parentElement.classList.toggle('collapsed')">
          <span style="flex:1; min-width:0;">▾ ${mod.title}</span>
          ${modActionBtn}
          <span style="color:#38bdf8; white-space:nowrap;">${doneInMod} / ${visibleSteps.length}</span>
        </div>
        <div class="mod-steps">${rows}</div>
      </div>`;
    }).join("");
  },

  selectStepFromDrawer(idx) {
    if (!this.isStepUnlocked(idx)) {
      this.showToast("Ten krok jest zablokowany przez ustawienia sekwencyjne kursu — zalicz najpierw poprzedni krok.", "err");
      return;
    }
    const backdrop = document.getElementById("drawerBackdrop");
    if (backdrop) backdrop.classList.remove("open");
    this.loadStep(idx);
  },

  setInstructorMode(enabled) {
    this.instructorMode = enabled;
    const chk2 = document.getElementById("chkInstructorUnlock");
    if (chk2) chk2.checked = enabled;
    this.renderDrawer();
    StorageManager.saveState(this.getSerializableState(), this.allSteps.length);
  },

  collapseAllModules(collapse) {
    document.querySelectorAll(".mod-box").forEach(b => b.classList.toggle("collapsed", collapse));
  },

  filterDrawer(q) {
    const term = q.toLowerCase();
    document.querySelectorAll(".mod-box").forEach(box => {
      box.classList.remove("collapsed");
      box.querySelectorAll(".step-row").forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(term) ? "flex" : "none";
      });
    });
  },

  updateStepNavButtonsUI() {
    const btnPrev = document.getElementById("btnPrevStepTop");
    const btnNext = document.getElementById("btnNextStepTop");
    const total = this.allSteps.length;
    const hasPrev = this.currentStepIdx > 0;
    const hasNext = this.currentStepIdx + 1 < total;

    if (btnPrev) {
      btnPrev.classList.toggle("disabled", !hasPrev);
      btnPrev.setAttribute("aria-disabled", String(!hasPrev));
      if (hasPrev) {
        const prevSt = this.allSteps[this.currentStepIdx - 1];
        btnPrev.title = `Poprzedni krok (${this.currentStepIdx}/${total}): ${prevSt ? prevSt.title : ""}`;
      } else {
        btnPrev.title = "To jest pierwszy krok wybranego poziomu kursu (brak poprzedniego kroku)";
      }
    }

    if (btnNext) {
      btnNext.classList.toggle("disabled", !hasNext);
      btnNext.setAttribute("aria-disabled", String(!hasNext));
      if (hasNext) {
        const nextSt = this.allSteps[this.currentStepIdx + 1];
        btnNext.title = `Następny krok (${this.currentStepIdx + 2}/${total}): ${nextSt ? nextSt.title : ""}`;
      } else {
        btnNext.title = "To jest ostatni krok wybranego poziomu kursu (brak następnego kroku)";
      }
    }
  },

  updateTopProgress() {
    const visibleIds = new Set(this.allSteps.map(s => s.id));
    const doneInProfile = Array.from(this.completedSteps).filter(id => visibleIds.has(id)).length;
    const total = this.allSteps.length;

    document.getElementById("btnDrawer").textContent = `☰ Mapa Kursu (${doneInProfile} / ${total})`;
    document.getElementById("topProgressFill").style.width = total > 0 ? `${(doneInProfile / total) * 100}%` : "0%";
    this.updateStepNavButtonsUI();
    this.renderUserSessionModal();

    const dots = document.getElementById("localDots");
    if (dots) {
      const currentModId = this.allSteps[this.currentStepIdx]?.moduleId;
      dots.innerHTML = this.allSteps
        .map((s, i) => ({ s, i }))
        .filter(item => item.s.moduleId === currentModId)
        .map(({ s, i }) => {
          const cls = i === this.currentStepIdx ? "dot active" : (this.completedSteps.has(s.id) ? "dot done" : "dot");
          return `<span class="${cls}" title="${s.title}" onclick="App.selectStepFromDrawer(${i}, true)"></span>`;
        }).join("");
    }
  },

  prevStep() {
    if (this.currentStepIdx > 0) this.loadStep(this.currentStepIdx - 1);
  },

  nextStep() {
    if (this.currentStepIdx + 1 < this.allSteps.length) this.loadStep(this.currentStepIdx + 1);
  },

  setupSplitters() {
    const makeRes = (id, isV, target, container, minPct, maxPct) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("dblclick", () => this.resetLayout());
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const ws = document.getElementById("workspace");
        if (ws) ws.classList.add("dragging-splitter");
        const onM = (ev) => {
          const rc = container.getBoundingClientRect();
          const raw = isV ? ((ev.clientX - rc.left) / rc.width) * 100 : ((ev.clientY - rc.top) / rc.height) * 100;
          const clamped = Math.max(minPct, Math.min(maxPct, raw));
          target.style[isV ? "width" : "height"] = clamped + "%";
          if (isV) this.autoFitStageHeader();
        };
        const onU = () => {
          if (ws) ws.classList.remove("dragging-splitter");
          window.removeEventListener("mousemove", onM);
          window.removeEventListener("mouseup", onU);
        };
        window.addEventListener("mousemove", onM);
        window.addEventListener("mouseup", onU);
      });
    };
    makeRes("splitMainV", true, document.getElementById("leftCol"), document.getElementById("workspace"), 40, 68);
    makeRes("splitLeftH", false, document.getElementById("leftTop"), document.getElementById("leftCol"), 44, 80);
    makeRes("splitRightH", false, document.getElementById("rightTop"), document.getElementById("rightCol"), 32, 72);
    window.addEventListener("resize", () => this.autoFitStageHeader());
  }
};

window.addEventListener("DOMContentLoaded", () => App.init());
