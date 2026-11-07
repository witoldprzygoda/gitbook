/**
 * Silnik Wirtualnego Repozytorium Git (VFS + Obiekty + Indeks + Katalog Roboczy + Gałęzie + Zdalne + Powłoka MINGW64)
 * Obsługuje pełen zestaw komend Git Bash dla Modułów 00–05, potoki UNIX (| grep, head, tail, wc),
 * historię poleceń oraz komendy eksploracji plików (ls -la/-lh, cat, tree, find, touch, cp, mv, rm, echo, printf).
 */
const VFSGit = {
  repoName: "pracownia-git",
  branch: "main",
  initialized: true,
  detached: false,
  unborn: false,
  merging: false,
  config: {
    "user.name": "Jan Kowalski",
    "user.email": "dev@git-lab.pl",
    "remote.origin.url": "https://github.com/kurs-git/pracownia-git.git",
    "remote.origin.fetch": "+refs/heads/*:refs/remotes/origin/*"
  },
  headCommit: { id: "8a4f19c", msg: "Inicjalny commit", files: {} },
  commits: [],
  branches: {},
  remotes: {},
  tags: {},
  stashStack: [],
  conflictStages: null,
  reflogEntries: [],
  index: {},
  worktree: {},
  lastCommands: [],
  cmdHistory: [],

  loadCheckpoint(checkpoint) {
    this.repoName = checkpoint.repoName || "pracownia-git";
    this.branch = checkpoint.branch || "main";
    this.initialized = checkpoint.initialized !== false;
    this.detached = !!checkpoint.detached;
    this.unborn = !!checkpoint.unborn;
    this.merging = !!checkpoint.merging;
    this.config = Object.assign({
      "user.name": "Jan Kowalski",
      "user.email": "dev@git-lab.pl",
      "remote.origin.url": "https://github.com/kurs-git/pracownia-git.git",
      "remote.origin.fetch": "+refs/heads/*:refs/remotes/origin/*"
    }, JSON.parse(JSON.stringify(checkpoint.config || {})));

    this.headCommit = JSON.parse(JSON.stringify(checkpoint.headCommit || { id: "(unborn)", msg: "Brak commitów", files: {} }));
    this.commits = JSON.parse(JSON.stringify(checkpoint.commits || (this.unborn ? [] : [this.headCommit])));
    this.branches = JSON.parse(JSON.stringify(checkpoint.branches || { [this.branch]: this.headCommit.id }));
    this.remotes = JSON.parse(JSON.stringify(checkpoint.remotes || { origin: "https://github.com/kurs-git/pracownia-git.git" }));
    this.tags = JSON.parse(JSON.stringify(checkpoint.tags || {}));
    this.stashStack = JSON.parse(JSON.stringify(checkpoint.stashStack || []));
    this.conflictStages = checkpoint.conflictStages ? JSON.parse(JSON.stringify(checkpoint.conflictStages)) : null;
    this.reflogEntries = JSON.parse(JSON.stringify(checkpoint.reflogEntries || this.commits.map((c, i) => `${c.id} HEAD@{${i}}: commit: ${c.msg}`)));
    this.index = JSON.parse(JSON.stringify(checkpoint.index || {}));
    this.worktree = JSON.parse(JSON.stringify(checkpoint.worktree || {}));
    this.lastCommands = [];
  },

  hasStagedChanges() {
    const prev = this.unborn ? {} : (this.headCommit.files || {});
    const idxKeys = Object.keys(this.index);
    const prevKeys = Object.keys(prev);
    if (idxKeys.length !== prevKeys.length) return true;
    for (const k of idxKeys) {
      if (this.index[k] !== prev[k]) return true;
    }
    return false;
  },

  hasUnstagedChanges() {
    for (const k of Object.keys(this.index)) {
      if (this.worktree[k] !== this.index[k]) return true;
    }
    return false;
  },

  fail(msg) {
    if (this.lastCommands.length > 0) {
      this.lastCommands.pop();
    }
    return { out: msg, failed: true };
  },

  takeSnapshot() {
    return JSON.parse(JSON.stringify({
      repoName: this.repoName,
      branch: this.branch,
      initialized: this.initialized,
      detached: this.detached,
      unborn: this.unborn,
      merging: this.merging,
      config: this.config,
      headCommit: this.headCommit,
      commits: this.commits,
      branches: this.branches,
      remotes: this.remotes,
      tags: this.tags,
      stashStack: this.stashStack,
      conflictStages: this.conflictStages,
      reflogEntries: this.reflogEntries,
      index: this.index,
      worktree: this.worktree,
      lastCommands: this.lastCommands
    }));
  },

  restoreSnapshot(snap) {
    if (!snap) return;
    const copy = JSON.parse(JSON.stringify(snap));
    Object.assign(this, copy);
  },

  /**
   * Strażnik Laboratorium: Sprawdza, czy komenda jest czystą, niedestrukcyjną operacją odczytu/inspekcji.
   * Takie komendy są zawsze dozwolone w każdym kroku.
   */
  isReadOnlyCommand(rawCmd) {
    const trimmed = String(rawCmd || "").trim();
    if (!trimmed) return false;

    // Specjalny przypadek: potok do obliczenia skrótu SHA-1 (bez flagi zapisu -w)
    if (/^(?:printf|echo)\s+[^|>]+?\s*\|\s*git\s+hash-object\s+--stdin$/.test(trimmed)) {
      return true;
    }

    // Jakiekolwiek przekierowanie zapisu do pliku (> lub >>) na końcu komendy jest operacją modyfikującą
    const withoutTreeRef = trimmed.replace(/\^\{tree\}/g, "");
    if (/(?:>>|>)\s*\S+\s*$/.test(withoutTreeRef)) {
      return false;
    }

    // Obsługa prostych potoków filtrujących odczyt (| grep, | head, | tail, | wc, | nl)
    let baseCmd = trimmed;
    if (trimmed.includes("|")) {
      const pipeIdx = trimmed.indexOf("|");
      baseCmd = trimmed.slice(0, pipeIdx).trim();
      const filterPart = trimmed.slice(pipeIdx + 1).trim();
      if (!/^(?:grep|head|tail|wc|nl)(?:\s+[^|>]+)?$/.test(filterPart)) {
        return false;
      }
    }

    const c = baseCmd.replace(/\s+/g, " ").trim();

    // 1. Niedestrukcyjne polecenia powłoki
    if (/^(?:help|git help|clear|cls|history|history -c|pwd|whoami|id|hostname|date|env|printenv)$/.test(c)) return true;
    if (/^uname(?:\s+-a)?$/.test(c)) return true;
    if (/^(?:which|type)\s+[a-zA-Z0-9._-]+$/.test(c)) return true;
    if (/^ls(?:\s+(?:-[la1Fh]+|\.|(?:\.git(?:\/[a-zA-Z0-9._/-]*)?)|[a-zA-Z0-9._/-]+))*$/.test(c)) return true;
    if (/^tree(?:\s+(?:-a|-L\s*\d+|\.|(?:\.git(?:\/[a-zA-Z0-9._/-]*)?)))*$/.test(c)) return true;
    if (/^find(?:\s+(?:\.|-maxdepth\s+\d+|-name\s+["']?[^"']+["']?))*$/.test(c)) return true;
    if (/^(?:cat|less|more|head|tail|wc|nl)(?:\s+(?:-[nclw]\s*\d*|-[a-zA-Z]+|\.?[a-zA-Z0-9._/-]+))+$/.test(c)) return true;
    if (/^grep(?:\s+(?:-[inrvE]+|["'][^"']+["']|\S+)){2,}$/.test(c)) return true;
    if (/^(?:echo|printf)\s+[^|>]+$/.test(c)) return true;

    // 2. Niedestrukcyjne polecenia inspekcyjne Gita
    if (/^git\s+(?:--version|version|-v|shortlog(?:\s+-[sn]+)?|reflog(?:\s+(?:-n\s*\d+|-\d+))?)$/.test(c)) return true;
    if (/^git\s+status(?:\s+(?:-[sb]+|--short|--branch))*$/.test(c)) return true;
    if (/^git\s+log(?:\s+(?:--oneline|--graph|--all|--decorate|-n\s*\d+|-\d+|refs\/stash|HEAD|[a-zA-Z0-9._/~^-]+))*$/.test(c)) return true;
    if (/^git\s+show(?:\s+(?:HEAD|HEAD~1:[a-zA-Z0-9._/-]+|HEAD:[a-zA-Z0-9._/-]+|origin\/main:[a-zA-Z0-9._/-]+|:[123]:[a-zA-Z0-9._/-]+|:[a-zA-Z0-9._/-]+|[a-f0-9]{4,40}))?$/.test(c)) return true;
    if (/^git\s+diff(?:\s+(?:--staged|--cached|HEAD|--check|--name-only))*$/.test(c)) return true;
    if (/^git\s+cat-file\s+(?:-t|-p)\s+(?:HEAD(?:\^\{tree\})?|\.git\/HEAD|[a-f0-9]{4,40})$/.test(c)) return true;
    if (/^git\s+rev-parse\s+(?:HEAD(?:~\d+|\^\d*)?|[a-zA-Z0-9._/-]+)$/.test(c)) return true;
    if (/^git\s+hash-object\s+(?:--stdin|[a-zA-Z0-9._/-]+)$/.test(c)) return true;
    if (/^git\s+ls-files(?:\s+(?:-s|--stage|-u|--unmerged))?$/.test(c)) return true;
    if (/^git\s+check-ignore(?:\s+-v)?\s+[a-zA-Z0-9._/-]+$/.test(c)) return true;
    if (/^git\s+blame(?:\s+[a-zA-Z0-9._/-]+)?$/.test(c)) return true;
    if (/^git\s+branch(?:\s+(?:-v|-a|-r|--all|--remotes|--list|-l))?$/.test(c)) return true;
    if (/^git\s+remote(?:\s+(?:-v|--verbose))?$/.test(c)) return true;
    if (/^git\s+tag(?:\s+(?:-l|--list))?$/.test(c)) return true;
    if (/^git\s+config\s+(?:(?:--local\s+)?(?:--list|-l)(?:\s+--show-origin)?|--show-origin\s+(?:--list|-l)|(?:--get\s+)?user\.(?:name|email)|--get\s+[a-zA-Z0-9._-]+)$/.test(c)) return true;
    if (/^git\s+stash\s+list$/.test(c)) return true;
    if (/^git\s+merge-base\s+\S+\s+\S+$/.test(c)) return true;
    if (/^git\s+clean\s+(?:-n|--dry-run)$/.test(c)) return true;

    return false;
  },

  /**
   * Odległość edycyjna Levenshteina do wykrywania literówek w nazwach komend i opcji.
   */
  levenshtein(a, b) {
    const s = String(a || "").toLowerCase();
    const t = String(b || "").toLowerCase();
    const dp = Array.from({ length: s.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= t.length; j++) dp[0][j] = j;
    for (let i = 1; i <= s.length; i++) {
      for (let j = 1; j <= t.length; j++) {
        dp[i][j] = s[i - 1] === t[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[s.length][t.length];
  },

  /**
   * Analizator składni i opcji (flags/switches):
   * Jeśli użytkownik wpisał komendę niedestrukcyjną lub komendę z bieżącego zadania, ale z błędną opcją,
   * literówką lub złą składnią, zwraca konstruktywny komunikat diagnostyczny zamiast ogólnej blokady.
   * Zwraca string z komunikatem błędu składniowego lub null (gdy to poprawna składniowo inna komenda modyfikująca).
   */
  diagnoseCommandSyntax(rawCmd, guidedCmds = []) {
    const trimmed = String(rawCmd || "").trim();
    if (!trimmed) return null;

    // 1. Kontrola niezamkniętych cudzysłowów (" lub ')
    const dblQuotes = (trimmed.match(/"/g) || []).length;
    const sglQuotes = (trimmed.match(/'/g) || []).length;
    if (dblQuotes % 2 !== 0 || sglQuotes % 2 !== 0) {
      return [
        "error: błąd składni — niezamknięty cudzysłów w poleceniu.",
        "💡 Upewnij się, że tekst otwarty znakiem cudzysłowu (\" lub ') został poprawnie domknięty na końcu."
      ].join("\n");
    }

    const c = trimmed.replace(/\s+/g, " ");
    const tokens = c.split(" ");
    const firstWord = tokens[0];

    // 2. Literówka w samym słowie 'git' lub sklejenie 'gitstatus', 'gitlog' itp.
    if (/^g(?:ti|it[a-z]+)$/i.test(firstWord)) {
      const gluedSub = firstWord.toLowerCase().startsWith("git") ? firstWord.slice(3) : "";
      const suggestion = gluedSub ? `git ${gluedSub}` : `git ${tokens.slice(1).join(" ")}`;
      return [
        `bash: ${firstWord}: nie znaleziono polecenia (błąd pisowni).`,
        `💡 Czy chodziło Ci o: ${suggestion.trim()} ?`
      ].join("\n");
    }

    // 3. Samo 'git' bez subkomendy
    if (c === "git") {
      return [
        "usage: git [--version] [--help] <command> [<args>]",
        "💡 Błąd składni: po słowie 'git' podaj nazwę polecenia (np. git status, git log --oneline, git diff)."
      ].join("\n");
    }

    // 4. Niedestrukcyjne polecenia powłoki UNIX z błędną opcją/składnią
    if (["ls", "cat", "less", "more", "tree", "find", "grep", "head", "tail", "wc", "pwd", "whoami", "uname", "help", "clear", "history"].includes(firstWord)) {
      if (firstWord === "ls") {
        const badFlag = tokens.slice(1).find(t => t.startsWith("-") && !/^-[la1Fh]+$/.test(t));
        if (badFlag) {
          return [
            `ls: nieznana opcja '${badFlag}'.`,
            "💡 Dozwolone opcje polecenia 'ls' to: -l, -a, -la, -lh, -1, -F (np. ls -la lub ls -lh)."
          ].join("\n");
        }
      }
      if (["cat", "less", "more", "head", "tail", "wc"].includes(firstWord) && tokens.length === 1) {
        return [
          `usage: ${firstWord} <plik>`,
          `💡 Błąd składni: podaj nazwę pliku do odczytania (np. ${firstWord} plan.txt lub ${firstWord} .git/HEAD).`
        ].join("\n");
      }
      if (firstWord === "tree") {
        const badFlag = tokens.slice(1).find(t => t.startsWith("-") && t !== "-a" && !/^-L\d*$/.test(t));
        if (badFlag) {
          return [
            `tree: nieprawidłowa opcja '${badFlag}'.`,
            "💡 Poprawna składnia to np.: tree, tree -a, tree .git lub tree -L 2."
          ].join("\n");
        }
      }
      if (["pwd", "whoami", "clear", "help"].includes(firstWord) && tokens.length > 1) {
        return `💡 Błąd składni: polecenie '${firstWord}' wywołujemy samodzielnie bez dodatkowych opcji (${ tokens.slice(1).join(" ") }).`;
      }
    }

    if (!c.startsWith("git ")) return null;

    const sub = tokens[1];
    const args = tokens.slice(2);
    const knownSubs = [
      "status", "log", "diff", "show", "add", "commit", "restore", "reset", "revert",
      "stash", "branch", "switch", "checkout", "merge", "rebase", "cherry-pick",
      "remote", "fetch", "pull", "push", "tag", "config", "init", "reflog",
      "cat-file", "rev-parse", "hash-object", "ls-files", "check-ignore", "blame",
      "clean", "shortlog", "merge-base", "rm", "mv", "help", "version", "--version", "-v"
    ];

    // 5. Wykrywanie literówek w nazwie subkomendy Gita (np. 'git sttaus', 'git comit', 'git lgo')
    if (!knownSubs.includes(sub)) {
      if (sub.startsWith("-")) {
        return [
          `unknown option: ${sub}`,
          "💡 Po słowie 'git' podaj najpierw nazwę polecenia (np. git status, git log), a dopiero po niej opcje z myślnikiem."
        ].join("\n");
      }
      let bestSub = null;
      let bestDist = 99;
      for (const ks of knownSubs) {
        if (ks.startsWith("-")) continue;
        const d = this.levenshtein(sub, ks);
        if (d < bestDist) {
          bestDist = d;
          bestSub = ks;
        }
      }
      if (bestSub && bestDist <= 2) {
        return [
          `git: '${sub}' is not a git command. See 'git --help'.`,
          `The most similar command is: ${bestSub}`,
          `💡 Błąd pisowni w nazwie polecenia — czy chodziło Ci o: git ${bestSub} ?`
        ].join("\n");
      }
      return null;
    }

    // 6. Częsty błąd składniowy: pojedynczy myślnik przed długą nazwą opcji (np. -oneline, -staged, -short)
    const longOptsWithSingleDash = new Set([
      "-oneline", "-graph", "-all", "-decorate", "-staged", "-cached", "-short", "-branch",
      "-check", "-name-only", "-stage", "-unmerged", "-stdin", "-list", "-show-origin",
      "-amend", "-soft", "-hard", "-mixed", "-no-ff", "-force", "-force-with-lease",
      "-set-upstream", "-rebase", "-worktree", "-source", "-dry-run", "-verbose"
    ]);
    const singleDashErr = args.find(a => longOptsWithSingleDash.has(a.split("=")[0]));
    if (singleDashErr) {
      return [
        `error: błędny zapis opcji '${singleDashErr}' (użyto pojedynczego myślnika '-' zamiast podwójnego '--').`,
        `💡 Błąd składni: w Gicie pełne, wieloliterowe nazwy opcji zawsze poprzedzamy dwoma myślnikami: -${singleDashErr} (np. git ${sub} -${singleDashErr}).`
      ].join("\n");
    }

    // 7. Pełna kontrola opcji (flag) dla komend niedestrukcyjnych (odczytu)
    if (sub === "status") {
      for (const a of args) {
        if (a === "--oneline" || a === "--graph") {
          return [
            `error: unknown option '${a.slice(2)}'`,
            `💡 Błąd składni: opcja '${a}' należy do polecenia 'git log ${a}' (historia commitów).`,
            `   Jeśli chcesz wyświetlić zwięzły, jednowierszowy status plików, użyj opcji -s lub --short: git status -s`
          ].join("\n");
        }
        if (a === "--staged" || a === "--cached") {
          return [
            `error: unknown option '${a.slice(2)}'`,
            `💡 Błąd składni: opcja '${a}' służy do porównywania zmian w poleceniu 'git diff ${a}'.`,
            `   Polecenie 'git status' (lub 'git status -s') od razu pokazuje stan zarówno Indeksu, jak i katalogu roboczego.`
          ].join("\n");
        }
        if (!["-s", "--short", "-b", "--branch", "-sb", "-bs"].includes(a)) {
          return [
            `error: nieznana opcja lub nieprawidłowy argument '${a}' dla polecenia 'git status'.`,
            "💡 Poprawna składnia to: git status (pełny opis), git status -s / --short (format dwukolumnowy) lub git status -sb."
          ].join("\n");
        }
      }
    }

    if (sub === "log") {
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === "-n" && /^\d+$/.test(args[i + 1] || "")) { i++; continue; }
        if (a === "-s" || a === "--short") {
          return [
            `fatal: nieprawidłowa opcja '${a}' dla polecenia 'git log'.`,
            "💡 Błąd składni: opcja '-s' (--short) należy do polecenia 'git status -s'. Aby wyświetlić zwięzłą historię (jeden commit w jednej linii), użyj: git log --oneline."
          ].join("\n");
        }
        if (a.startsWith("-")) {
          if (!["--oneline", "--graph", "--all", "--decorate"].includes(a) && !/^-\d+$/.test(a) && !/^-n\d+$/.test(a)) {
            return [
              `fatal: unrecognized argument: ${a}`,
              "💡 Błąd składni polecenia 'git log': nieznana opcja. Dozwolone opcje to: --oneline, --graph, --all, --decorate, -n <liczba> (np. git log --oneline)."
            ].join("\n");
          }
        }
      }
    }

    if (sub === "diff") {
      for (const a of args) {
        if (a === "--stage" || a === "--cache") {
          return [
            `error: invalid option: ${a}`,
            `💡 Błąd składni (literówka w nazwie opcji): brakuje litery 'd' na końcu — poprawny zapis to: git diff ${a}d`
          ].join("\n");
        }
        if (!["--staged", "--cached", "HEAD", "--check", "--name-only"].includes(a)) {
          return [
            `error: nieprawidłowa opcja lub argument '${a}' w poleceniu 'git diff'.`,
            "💡 Poprawne warianty to: git diff (Dysk vs Indeks), git diff --staged / --cached (Indeks vs HEAD), git diff HEAD oraz git diff --staged --check."
          ].join("\n");
        }
      }
    }

    if (sub === "show") {
      if (args.length > 1) {
        return [
          `error: zbyt wiele argumentów w poleceniu 'git show'.`,
          "💡 Poprawna składnia: git show, git show HEAD:<plik>, git show :<plik> lub git show :2:<plik>."
        ].join("\n");
      }
      if (args.length === 1) {
        const a = args[0];
        if (a.startsWith("-")) {
          return [
            `error: unknown option '${a}' w poleceniu 'git show'.`,
            "💡 Poprawna składnia: git show, git show HEAD:<plik> (wersja z HEAD) lub git show :<plik> (wersja z Indeksu)."
          ].join("\n");
        }
        if (!a.includes(":") && a !== "HEAD" && !this.commits.some(cm => cm.id.startsWith(a))) {
          return [
            `fatal: ambiguous argument '${a}': unknown revision or path not in the working tree.`,
            `💡 Błąd składni: aby odczytać plik za pomocą 'git show', poprzedź jego nazwę dwukropkiem — np. 'git show HEAD:${a}' (z commita HEAD) lub 'git show :${a}' (z Indeksu). Do odczytu pliku z dysku użyj: cat ${a}.`
          ].join("\n");
        }
      }
    }

    if (sub === "cat-file") {
      if (args.length === 0 || (!args.includes("-t") && !args.includes("-p"))) {
        return [
          "usage: git cat-file (-t | -p) <object>",
          "💡 Błąd składni: polecenie 'git cat-file' wymaga podania flagi '-t' (sprawdzenie typu obiektu, np. git cat-file -t HEAD) lub '-p' (wypisanie zawartości, np. git cat-file -p HEAD)."
        ].join("\n");
      }
      if (args.length !== 2) {
        return [
          "error: nieprawidłowa liczba argumentów dla 'git cat-file'.",
          "💡 Poprawna składnia: git cat-file -t HEAD, git cat-file -p HEAD lub git cat-file -p HEAD^{tree}."
        ].join("\n");
      }
    }

    if (sub === "ls-files") {
      for (const a of args) {
        if (a === "--staged") {
          return [
            "error: unknown option 'staged'",
            "💡 Błąd składni: w poleceniu 'git ls-files' opcja wyświetlająca zawartość Indeksu ze slotami nazywa się '--stage' (bez 'd' na końcu) lub '-s': git ls-files --stage."
          ].join("\n");
        }
        if (!["-s", "--stage", "-u", "--unmerged"].includes(a)) {
          return [
            `error: nieznana opcja '${a}' w poleceniu 'git ls-files'.`,
            "💡 Dozwolone opcje to: git ls-files, git ls-files -s (--stage) oraz git ls-files -u (--unmerged)."
          ].join("\n");
        }
      }
    }

    if (sub === "rev-parse") {
      if (args.length !== 1 || args[0].startsWith("-")) {
        return [
          "error: nieprawidłowa składnia polecenia 'git rev-parse'.",
          "💡 Podaj nazwę wskaźnika do rozwiązania na identyfikator SHA-1, np.: git rev-parse HEAD, git rev-parse HEAD~1 lub git rev-parse HEAD^2."
        ].join("\n");
      }
    }

    if (sub === "hash-object") {
      if (args.includes("--stdin") && !trimmed.includes("|")) {
        return [
          "error: opcja '--stdin' oczekuje danych przekazanych potokiem '|'.",
          "💡 Poprawna składnia z potokiem: printf 'A\\n' | git hash-object --stdin (lub dla pliku na dysku: git hash-object plan.txt)."
        ].join("\n");
      }
      if (args.length !== 1 || (args[0].startsWith("-") && args[0] !== "--stdin")) {
        return [
          "error: nieprawidłowa składnia polecenia 'git hash-object'.",
          "💡 Użyj: git hash-object <plik> lub printf 'A\\n' | git hash-object --stdin."
        ].join("\n");
      }
    }

    if (sub === "check-ignore") {
      const nonFlags = args.filter(a => !a.startsWith("-"));
      const badFlag = args.find(a => a.startsWith("-") && a !== "-v" && a !== "--verbose");
      if (badFlag || nonFlags.length !== 1) {
        return [
          "error: nieprawidłowa składnia polecenia 'git check-ignore'.",
          "💡 Podaj opcję -v oraz nazwę pliku do sprawdzenia, np.: git check-ignore -v debug.log."
        ].join("\n");
      }
    }

    if (sub === "reflog" && args.length > 0) {
      return [
        `error: nieznana opcja '${args.join(" ")}' w poleceniu 'git reflog'.`,
        "💡 Wywołaj polecenie bez dodatkowych opcji: git reflog."
      ].join("\n");
    }

    if (sub === "branch") {
      const badFlag = args.find(a => a.startsWith("-") && !["-v", "-a", "-r", "--all", "--remotes", "--list", "-l", "-d", "-D", "-m", "-M"].includes(a));
      if (badFlag) {
        return [
          `error: unknown option '${badFlag}' w poleceniu 'git branch'.`,
          "💡 Do wyświetlenia gałęzi użyj: git branch, git branch -v (z ostatnim commitem) lub git branch -a (wszystkie wraz ze zdalnymi)."
        ].join("\n");
      }
    }

    if (sub === "remote") {
      if (args.length > 0 && args[0] !== "add" && args[0] !== "-v" && args[0] !== "--verbose") {
        return [
          `error: nieznana opcja lub subkomenda '${args.join(" ")}' w poleceniu 'git remote'.`,
          "💡 Aby wyświetlić skonfigurowane repozytoria zdalne wraz z adresami URL, wpisz: git remote -v."
        ].join("\n");
      }
    }

    if (sub === "tag") {
      const badFlag = args.find(a => a.startsWith("-") && !["-l", "--list", "-a", "-m", "-d"].includes(a));
      if (badFlag) {
        return [
          `error: unknown option '${badFlag}' w poleceniu 'git tag'.`,
          "💡 Aby wyświetlić listę istniejących tagów, wpisz: git tag -l (lub samo git tag)."
        ].join("\n");
      }
    }

    if (sub === "config") {
      if (args.includes("--show-origin") && !args.includes("--list") && !args.includes("-l")) {
        return [
          "fatal: --show-origin is only applicable to --list or --get*",
          "💡 Błąd składni: opcja '--show-origin' wymaga jednoczesnego podania flagi '--list' — wpisz: git config --list --show-origin."
        ].join("\n");
      }
      const badFlag = args.find(a => a.startsWith("-") && !["--list", "-l", "--show-origin", "--local", "--global", "--system", "--get"].includes(a));
      if (badFlag) {
        return [
          `error: unknown option '${badFlag}' w poleceniu 'git config'.`,
          "💡 Do odczytu konfiguracji użyj: git config --list lub git config --list --show-origin."
        ].join("\n");
      }
    }

    if (sub === "stash") {
      const badFlag = args.find(a => a.startsWith("-"));
      if (badFlag || (args.length > 0 && !["list", "pop", "apply", "push"].includes(args[0]))) {
        return [
          `error: nieprawidłowa składnia '${args.join(" ")}' w poleceniu 'git stash'.`,
          "💡 W poleceniu 'git stash' słowa 'list' oraz 'pop' to subkomendy zapisywane bez myślników: git stash, git stash list, git stash pop."
        ].join("\n");
      }
    }

    // 8. Konstruktywna diagnostyka składni dla komend modyfikujących z BIEŻĄCEGO ZADANIA
    // (gdy użytkownik próbuje wpisać komendę przewidzianą w ćwiczeniu, ale popełni błąd w opcjach lub argumentach)
    const stepHasSub = guidedCmds.some(gc => gc.trim().startsWith(`git ${sub}`));
    const matchingStepCmd = guidedCmds.find(gc => gc.trim().startsWith(`git ${sub}`));

    if (stepHasSub) {
      if (sub === "add") {
        if (args.length === 0) {
          return [
            "Nothing specified, nothing added.",
            `💡 Błąd składni: po 'git add' musisz wskazać pliki lub opcję (w tym zadaniu: ${matchingStepCmd}).`
          ].join("\n");
        }
        const badFlag = args.find(a => a.startsWith("-") && !["-A", "--all", "-u", "--update", "-f"].includes(a));
        if (badFlag) {
          return [
            `error: unknown switch '${badFlag}' w poleceniu 'git add'.`,
            `💡 Poprawna instrukcja w tym zadaniu to: ${matchingStepCmd}`
          ].join("\n");
        }
        const fileArgs = args.filter(a => !a.startsWith("-") && a !== ".");
        for (const fa of fileArgs) {
          if (this.worktree[fa] === undefined && this.index[fa] === undefined) {
            const avail = Object.keys(this.worktree).join(", ");
            return [
              `fatal: pathspec '${fa}' did not match any files`,
              `💡 Błąd składni / nazwy pliku: plik '${fa}' nie istnieje w katalogu roboczym (dostępne pliki: ${avail}).`,
              `   W tym zadaniu wpisz: ${matchingStepCmd}`
            ].join("\n");
          }
        }
      }

      if (sub === "commit") {
        if (!c.includes("-m")) {
          return [
            "error: brak wymaganej opcji '-m \"...\"' z opisem migawki.",
            `💡 Błąd składni: w terminalu laboratoryjnym podaj komunikat commita po fladze -m w cudzysłowie, np.: ${matchingStepCmd}`
          ].join("\n");
        }
        if (!/-m\s+["'][^"']+["']/.test(c)) {
          return [
            "error: opcja '-m' wymaga podania niepustego opisu ujętego w cudzysłów.",
            `💡 Poprawna składnia w tym zadaniu: ${matchingStepCmd}`
          ].join("\n");
        }
        if (matchingStepCmd.includes("--amend") && !c.includes("--amend")) {
          return [
            "💡 W tym kroku zastępujemy ostatni commit za pomocą flagi '--amend'.",
            `   Użyj składni: ${matchingStepCmd}`
          ].join("\n");
        }
      }

      if (sub === "restore") {
        const badFlag = args.find(a => a === "--stage" || a === "--work");
        if (badFlag) {
          return [
            `error: unknown option '${badFlag.slice(2)}'`,
            `💡 Błąd składni (literówka w opcji): użyj pełnej nazwy '--staged' / '--worktree' (np. ${matchingStepCmd}).`
          ].join("\n");
        }
        return [
          `error: niekompletna lub błędna składnia polecenia 'git restore'.`,
          `💡 W tym zadaniu zastosuj dokładną postać: ${matchingStepCmd}`
        ].join("\n");
      }

      return [
        `error: nieprawidłowa składnia lub opcja w poleceniu 'git ${sub}'.`,
        `💡 Sprawdź zapis opcji — prawidłowa instrukcja w tym zadaniu to: ${matchingStepCmd}`
      ].join("\n");
    }

    return null;
  },

  /**
   * Strażnik Laboratorium: Sprawdza, czy komenda modyfikująca wpisana przez użytkownika
   * odpowiada oczekiwanej instrukcji zadania (guidedCmd) z uwzględnieniem naturalnych równoważników.
   */
  matchesGuidedCommand(rawUserCmd, rawExpectedCmd) {
    const norm = (s) => String(s || "").trim().replace(/\s+/g, " ");
    const u = norm(rawUserCmd);
    const e = norm(rawExpectedCmd);
    if (!u || !e) return false;
    if (u === e || u.replace(/'/g, '"') === e.replace(/'/g, '"')) return true;

    // 1. git init -b main
    if (e === "git init -b main" && (u === "git init" || u === "git init -b main")) return true;

    // 2. git config user.name "..."
    if (e.startsWith("git config user.name ") && /^git config (?:--local )?user\.name (?:["'][^"']+["']|\S+)$/.test(u)) return true;

    // 3. git add ...
    if (e === "git add -u" && (u === "git add -u" || u === "git add --update")) return true;
    if (e === "git add -A" && (u === "git add -A" || u === "git add --all" || u === "git add .")) return true;
    if (e === "git add plan.txt README.md") {
      const m = u.match(/^git add (.+)$/);
      if (m) {
        const args = m[1].split(" ");
        const allowed = new Set(["plan.txt", "README.md", ".", "-A"]);
        if (args.length >= 1 && args.every(a => allowed.has(a))) return true;
      }
    }
    if (/^git add [a-zA-Z0-9._-]+$/.test(e)) {
      const targetFile = e.split(" ")[2];
      if (u === `git add ${targetFile}` || u === "git add ." || u === "git add -A") return true;
    }

    // 4. git commit ...
    if (e.startsWith("git commit --amend")) {
      if (/^git commit (?:--amend -m ["'][^"']+["']|-m ["'][^"']+["'] --amend)$/.test(u)) return true;
    } else if (e.startsWith("git commit -m ")) {
      if (/^git commit -m ["'][^"']+["']$/.test(u)) return true;
    }

    // 5. git restore ...
    if (e === "git restore --staged analyzer.py" && (u === "git restore --staged analyzer.py" || u === "git restore -S analyzer.py")) return true;
    if (e === "git restore --source=HEAD --staged --worktree plan.txt") {
      if (/^git restore (?=.*(?:--source=HEAD|-s HEAD))(?=.*(?:--staged|-S|-SW))(?=.*(?:--worktree|-W|-SW)).*\bplan\.txt$/.test(u)) return true;
    }

    // 6. git stash / pop / reset / switch / merge / branch / tag / fetch / pull / push
    if (e === "git stash" && (u === "git stash" || u === "git stash push")) return true;
    if (e === "git stash pop" && (u === "git stash pop" || u === "git stash apply")) return true;
    if (e === "git reset --soft HEAD~1" && (u === "git reset --soft HEAD~1" || u === "git reset --soft HEAD^")) return true;
    if (e === "git reset --hard c303c00" && (u === "git reset --hard c303c00" || u === "git reset --hard HEAD@{1}")) return true;
    if (/^git switch -c (\S+)$/.test(e)) {
      const br = e.split(" ")[3];
      if (u === `git switch -c ${br}` || u === `git checkout -b ${br}`) return true;
    }
    if (/^git switch (\S+)$/.test(e)) {
      const br = e.split(" ")[2];
      if (u === `git switch ${br}` || u === `git checkout ${br}`) return true;
    }
    if (e === "git merge --no-ff feature" && (u === "git merge --no-ff feature" || u === "git merge feature --no-ff")) return true;
    if (e === "git branch -d feature" && (u === "git branch -d feature" || u === "git branch -D feature")) return true;
    if (e === 'echo "PORT = 8080" > app.py' && /^(?:echo|printf) ["']?PORT\s*=\s*8080(?:\\n)?["']? > app\.py$/.test(u)) return true;
    if (e === "git fetch origin" && (u === "git fetch origin" || u === "git fetch")) return true;
    if (e === "git push -u origin feature-api" && (u === "git push -u origin feature-api" || u === "git push --set-upstream origin feature-api")) return true;
    if (e.startsWith("git tag -a v1.0.0") && /^git tag -a v1\.0\.0 -m ["'][^"']+["']$/.test(u)) return true;
    if (e === "git pull --rebase origin main" && (u === "git pull --rebase origin main" || u === "git pull --rebase")) return true;
    if (e === "git push origin main" && (u === "git push origin main" || u === "git push")) return true;
    if (e === "git push --force-with-lease origin feature-api" && (u === "git push --force-with-lease origin feature-api" || u === "git push origin feature-api --force-with-lease")) return true;

    return false;
  },

  async sha1Blob(content) {
    const text = `blob ${new TextEncoder().encode(content).length}\0${content}`;
    const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  },

  byteLen(str) {
    return new TextEncoder().encode(String(str ?? "")).length;
  },

  formatSize(bytes, human = false) {
    if (!human) return String(bytes).padStart(6, " ");
    if (bytes < 1024) return `${bytes}B`.padStart(6, " ");
    const kb = (bytes / 1024).toFixed(1);
    return `${kb}K`.padStart(6, " ");
  },

  readVirtualFile(rawPath) {
    const p = rawPath.replace(/^\.\//, "").trim();
    if (p.startsWith(".git/") && !this.initialized) {
      return { error: `cat: ${p}: No such file or directory (repozytorium .git jeszcze nie istnieje — wykonaj najpierw git init)` };
    }
    if (p === ".git/HEAD") {
      return this.detached ? `${this.headCommit.id}\n` : `ref: refs/heads/${this.branch}\n`;
    }
    if (p === ".git/config") {
      const lines = [
        "[core]",
        "\trepositoryformatversion = 0",
        "\tfilemode = false",
        "\tbare = false",
        "[user]",
        `\tname = ${this.config["user.name"] || "Jan Kowalski"}`,
        `\temail = ${this.config["user.email"] || "dev@git-lab.pl"}`
      ];
      for (const [rName, rUrl] of Object.entries(this.remotes || {})) {
        lines.push(`[remote "${rName}"]`, `\turl = ${rUrl}`, `\tfetch = +refs/heads/*:refs/remotes/${rName}/*`);
      }
      return lines.join("\n") + "\n";
    }
    if (p === ".git/logs/HEAD") {
      return (this.reflogEntries || []).join("\n") + "\n";
    }
    if (p === ".git/index") {
      const entries = Object.keys(this.index).sort().map(f => `100644 ${f} (${this.byteLen(this.index[f])} B)`);
      return `[Plik binarny .git/index — nagłówek DIRC v2, wpisów: ${entries.length}]\n` + entries.join("\n") + "\n";
    }
    if (p.startsWith(".git/refs/heads/")) {
      const br = p.replace(".git/refs/heads/", "");
      if (this.unborn) return { error: `cat: ${p}: No such file or directory (Unborn Branch!)` };
      const id = this.branches[br] || (br === this.branch ? this.headCommit.id : null);
      return id ? `${id}\n` : { error: `cat: ${p}: No such file or directory` };
    }
    if (p.startsWith(".git/refs/remotes/")) {
      const remBr = p.replace(".git/refs/remotes/", "");
      const id = this.branches[remBr];
      return id ? `${id}\n` : { error: `cat: ${p}: No such file or directory` };
    }
    if (p.startsWith(".git/refs/tags/")) {
      const tg = p.replace(".git/refs/tags/", "");
      const id = this.tags[tg];
      return id ? `${id}\n` : { error: `cat: ${p}: No such file or directory` };
    }
    if (this.worktree[p] !== undefined) {
      return this.worktree[p];
    }
    return { error: `No such file or directory: ${p}` };
  },

  runLsCommand(cmd) {
    const tokens = cmd.trim().split(/\s+/);
    const prog = tokens[0];
    const args = tokens.slice(1);

    let flagLong = (prog === "ll" || prog === "dir");
    let flagAll = (prog === "la");
    let flagHuman = false;
    let flagOnePerLine = false;
    let flagClassify = false;
    let targetPath = ".";

    for (const a of args) {
      if (a === "--all") { flagAll = true; continue; }
      if (a === "--human-readable") { flagHuman = true; continue; }
      if (a.startsWith("-") && a.length > 1) {
        if (a.includes("l")) flagLong = true;
        if (a.includes("a") || a.includes("A")) flagAll = true;
        if (a.includes("h")) flagHuman = true;
        if (a.includes("1")) flagOnePerLine = true;
        if (a.includes("F")) flagClassify = true;
      } else {
        targetPath = a.replace(/^\.\//, "").replace(/\/$/, "") || ".";
      }
    }

    const dateStr = "Oct 24 19:20";
    const items = []; // { name, isDir, size }

    if (targetPath === ".git") {
      if (flagAll) {
        items.push({ name: ".", isDir: true, size: 0 }, { name: "..", isDir: true, size: 0 });
      }
      items.push(
        { name: "HEAD", isDir: false, size: this.byteLen(this.detached ? this.headCommit.id : `ref: refs/heads/${this.branch}\n`) },
        { name: "config", isDir: false, size: 196 },
        { name: "index", isDir: false, size: 128 + Object.keys(this.index).length * 64 },
        { name: "logs", isDir: true, size: 0 },
        { name: "objects", isDir: true, size: 0 },
        { name: "refs", isDir: true, size: 0 }
      );
    } else if (targetPath === ".git/refs") {
      items.push(
        { name: "heads", isDir: true, size: 0 },
        { name: "remotes", isDir: true, size: 0 },
        { name: "tags", isDir: true, size: 0 }
      );
    } else if (targetPath === ".git/refs/heads") {
      if (!this.unborn) {
        Object.keys(this.branches).filter(b => !b.includes("/")).forEach(b => {
          items.push({ name: b, isDir: false, size: 41 });
        });
      }
    } else if (targetPath === ".git/refs/remotes" || targetPath === ".git/refs/remotes/origin") {
      Object.keys(this.branches).filter(b => b.includes("/")).forEach(b => {
        items.push({ name: b.replace(/^origin\//, ""), isDir: false, size: 41 });
      });
    } else if (targetPath === ".git/refs/tags") {
      Object.keys(this.tags).forEach(t => {
        items.push({ name: t, isDir: false, size: 41 });
      });
    } else if (targetPath === ".") {
      if (flagAll) {
        items.push(
          { name: ".", isDir: true, size: 0 },
          { name: "..", isDir: true, size: 0 },
          { name: ".git", isDir: true, size: 0 }
        );
      }
      const files = Object.keys(this.worktree).sort();
      for (const f of files) {
        if (!flagAll && f.startsWith(".")) continue;
        items.push({ name: f, isDir: false, size: this.byteLen(this.worktree[f]) });
      }
    } else if (this.worktree[targetPath] !== undefined) {
      items.push({ name: targetPath, isDir: false, size: this.byteLen(this.worktree[targetPath]) });
    } else {
      return `ls: cannot access '${targetPath}': No such file or directory`;
    }

    if (items.length === 0) return "(katalog pusty)";

    if (flagLong) {
      const totalBytes = items.reduce((acc, it) => acc + it.size, 0);
      const rows = [`total ${Math.max(1, Math.ceil(totalBytes / 512))}`];
      for (const it of items) {
        const perm = it.isDir ? "drwxr-xr-x" : "-rw-r--r--";
        const sz = this.formatSize(it.size, flagHuman);
        const suffix = (it.isDir && (flagClassify || it.name === ".git")) ? "/" : "";
        rows.push(`${perm} 1 dev users ${sz} ${dateStr} ${it.name}${suffix}`);
      }
      return rows.join("\n");
    }

    const names = items.map(it => (it.isDir && flagClassify ? `${it.name}/` : it.name));
    return flagOnePerLine ? names.join("\n") : names.join("  ");
  },

  isIgnored(file) {
    const ignoreText = this.worktree[".gitignore"] || "";
    if (!ignoreText) return null;
    const lines = ignoreText.split(/\r?\n/);
    let matchedRule = null;
    for (let i = 0; i < lines.length; i++) {
      const rule = lines[i].trim();
      if (!rule || rule.startsWith("#")) continue;
      const neg = rule.startsWith("!");
      const pat = neg ? rule.slice(1) : rule;
      const hit =
        file === pat ||
        (pat.endsWith("/") && file.startsWith(pat)) ||
        (pat.startsWith("*.") && file.endsWith(pat.slice(1)));
      if (hit) {
        matchedRule = neg ? null : { line: i + 1, pattern: rule };
      }
    }
    return matchedRule;
  },

  getShortStatusForFile(file) {
    if (this.conflictStages && this.conflictStages[file]) return "UU";
    const inH = this.unborn ? undefined : this.headCommit.files[file];
    const inI = this.index[file];
    const inW = this.worktree[file];

    if (inH === undefined && inI === undefined && inW !== undefined) {
      if (this.isIgnored(file)) return "  ";
      return "??";
    }
    if (inH === undefined && inI !== undefined && inW === inI) return "A ";
    if (inH === undefined && inI !== undefined && inW !== inI) return "AM";
    if (inH !== undefined && inI === undefined && inW !== undefined) return "D ";
    if (inW === undefined && inI !== undefined) return " D";
    if (inW === undefined && inI === undefined && inH !== undefined) return "D ";

    const x = (inI !== inH) ? "M" : " ";
    const y = (inW !== inI) ? "M" : " ";
    return x + y;
  },

  getStatusShortOutput() {
    const allFiles = Array.from(new Set([
      ...Object.keys(this.unborn ? {} : (this.headCommit.files || {})),
      ...Object.keys(this.index),
      ...Object.keys(this.worktree)
    ])).sort();

    const lines = [];
    for (const f of allFiles) {
      const code = this.getShortStatusForFile(f);
      if (code !== "  ") lines.push(`${code} ${f}`);
    }
    return lines.join("\n");
  },

  getStatusLongOutput() {
    const hdr = this.detached
      ? `HEAD detached at ${this.headCommit.id}`
      : `On branch ${this.branch}`;
    const shortLines = this.getStatusShortOutput();
    if (!shortLines) {
      return `${hdr}\nnothing to commit, working tree clean`;
    }
    const staged = [];
    const unstaged = [];
    const untracked = [];
    for (const row of shortLines.split("\n")) {
      const x = row[0];
      const y = row[1];
      const f = row.slice(3);
      if (x === "?" && y === "?") {
        untracked.push(`\t${f}`);
        continue;
      }
      if (x === "U" || y === "U") {
        unstaged.push(`\tboth modified:   ${f}`);
        continue;
      }
      if (x !== " ") {
        const label = x === "A" ? "new file:" : (x === "D" ? "deleted:" : "modified:");
        staged.push(`\t${label.padEnd(16, " ")}${f}`);
      }
      if (y !== " ") {
        const label = y === "D" ? "deleted:" : "modified:";
        unstaged.push(`\t${label.padEnd(16, " ")}${f}`);
      }
    }
    const out = [hdr];
    if (staged.length) {
      out.push("Changes to be committed:\n  (use \"git restore --staged <file>...\" to unstage)", ...staged, "");
    }
    if (unstaged.length) {
      out.push("Changes not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)", ...unstaged, "");
    }
    if (untracked.length) {
      out.push("Untracked files:\n  (use \"git add <file>...\" to include in what will be committed)", ...untracked);
    }
    return out.join("\n").trim();
  },

  makeDiff(oldText = "", newText = "", labelA = "a/plik", labelB = "b/plik") {
    if (oldText === newText) return "";
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");
    const out = [`--- ${labelA}`, `+++ ${labelB}`, `@@ -1,${oldLines.length} +1,${newLines.length} @@`];
    oldLines.forEach(l => { if (!newLines.includes(l)) out.push(`-${l}`); });
    newLines.forEach(l => { if (!oldLines.includes(l)) out.push(`+${l}`); });
    return out.join("\n");
  },

  applyPipeFilter(inputText, filterCmd) {
    const f = filterCmd.trim();
    const lines = inputText ? inputText.split("\n") : [];

    if (f.startsWith("grep")) {
      const args = f.slice(4).trim();
      const ignoreCase = /(?:^|\s)-i(?:\s|$)/.test(args) || /(?:^|\s)-[a-z]*i[a-z]*(?:\s|$)/.test(args);
      const invertMatch = /(?:^|\s)-v(?:\s|$)/.test(args) || /(?:^|\s)-[a-z]*v[a-z]*(?:\s|$)/.test(args);
      const showLineNum = /(?:^|\s)-n(?:\s|$)/.test(args) || /(?:^|\s)-[a-z]*n[a-z]*(?:\s|$)/.test(args);
      const countOnly = /(?:^|\s)-c(?:\s|$)/.test(args) || /(?:^|\s)-[a-z]*c[a-z]*(?:\s|$)/.test(args);

      const cleaned = args.replace(/(?:^|\s)-[ivncE]+(?=\s|$)/g, "").trim();
      const pat = cleaned.replace(/^["']|["']$/g, "");
      if (!pat) return inputText;

      const cmpPat = ignoreCase ? pat.toLowerCase() : pat;
      const matched = [];
      lines.forEach((line, idx) => {
        const hay = ignoreCase ? line.toLowerCase() : line;
        const hit = hay.includes(cmpPat);
        if (invertMatch ? !hit : hit) {
          matched.push(showLineNum ? `${idx + 1}:${line}` : line);
        }
      });

      if (countOnly) return String(matched.length);
      return matched.length > 0 ? matched.join("\n") : `(grep: brak wierszy pasujących do wzorca '${pat}')`;
    }

    if (f.startsWith("head")) {
      const m = f.match(/-n\s*(\d+)|-(\d+)/);
      const n = m ? parseInt(m[1] || m[2], 10) : 10;
      return lines.slice(0, n).join("\n");
    }

    if (f.startsWith("tail")) {
      const m = f.match(/-n\s*(\d+)|-(\d+)/);
      const n = m ? parseInt(m[1] || m[2], 10) : 10;
      return lines.slice(-n).join("\n");
    }

    if (f.startsWith("wc")) {
      const nonEmptyLines = inputText ? inputText.replace(/\n$/, "").split("\n").length : 0;
      const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
      const bytes = this.byteLen(inputText);
      if (f.includes("-l")) return String(nonEmptyLines);
      if (f.includes("-w")) return String(words);
      if (f.includes("-c")) return String(bytes);
      return `  ${nonEmptyLines}  ${words} ${bytes}`;
    }

    if (f === "nl" || f.startsWith("nl ")) {
      return lines.map((l, i) => `${String(i + 1).padStart(6, " ")}\t${l}`).join("\n");
    }

    if (f === "sort" || f.startsWith("sort ")) {
      const sorted = [...lines].sort();
      if (f.includes("-r")) sorted.reverse();
      return sorted.join("\n");
    }

    return `${inputText}\n[bash: nieznany filtr potoku: ${f} — obsługiwane: grep, head, tail, wc, nl, sort]`;
  },

  async execute(rawCmd, primaryFile, isPipeSubCmd = false) {
    let cmd = rawCmd.trim();
    if (!cmd) return { out: "" };

    // Obsługa wywołania z historii: !! oraz !<numer>
    if (!isPipeSubCmd && (cmd === "!!" || /^!\d+$/.test(cmd))) {
      if (this.cmdHistory.length === 0) {
        return { out: "bash: !!: historia poleceń jest jeszcze pusta" };
      }
      if (cmd === "!!") {
        cmd = this.cmdHistory[this.cmdHistory.length - 1];
      } else {
        const idx = parseInt(cmd.slice(1), 10) - 1;
        if (idx < 0 || idx >= this.cmdHistory.length) {
          return { out: `bash: ${cmd}: nie znaleziono zdarzenia w historii (wpisz 'history')` };
        }
        cmd = this.cmdHistory[idx];
      }
    }

    if (!isPipeSubCmd) {
      this.lastCommands.push(cmd);
      if (cmd !== "history -c" && this.cmdHistory[this.cmdHistory.length - 1] !== cmd) {
        this.cmdHistory.push(cmd);
      }
    }

    // Obsługa sekwencji komend połączonych przez && lub ; (poza cudzysłowami)
    if (!isPipeSubCmd && (cmd.includes("&&") || cmd.includes(";")) && !cmd.includes("hash-object")) {
      const isAndChain = cmd.includes("&&");
      const subCmds = cmd.split(/\s*(?:&&|;)\s*/).filter(Boolean);
      if (subCmds.length > 1) {
        this.lastCommands.pop();
        const outs = [];
        for (const sc of subCmds) {
          this.lastCommands.push(sc);
          const r = await this.execute(sc, primaryFile, true);
          if (r && r.out) outs.push(r.out);
          if (typeof App !== "undefined" && typeof App.updateStageLocks === "function") {
            App.updateStageLocks();
          }
          if (r && r.failed && isAndChain) {
            break;
          }
        }
        return { out: outs.join("\n") };
      }
    }

    // Obsługa potoków (pipe: | ), np. history | grep "status" lub ls -lh | grep py
    if (cmd.includes("|") && !cmd.includes("hash-object")) {
      const stages = cmd.split("|").map(s => s.trim()).filter(Boolean);
      if (stages.length >= 2) {
        const baseRes = await this.execute(stages[0], primaryFile, true);
        let pipedOut = baseRes.out || "";
        for (let i = 1; i < stages.length; i++) {
          pipedOut = this.applyPipeFilter(pipedOut, stages[i]);
        }
        return { out: pipedOut };
      }
    }

    if (cmd === "help" || cmd === "git help" || cmd === "git --help" || cmd === "?") {
      return {
        out: [
          "╔══════════════════════════════════════════════════════════════════════════╗",
          "║  POMOC TERMINALA GIT BASH (Wirtualne Środowisko Laboratoryjne VFS)       ║",
          "╚══════════════════════════════════════════════════════════════════════════╝",
          "1. Inspekcja i stan:   git status [-s|-sb], git log [--oneline|-n N], git diff [--staged|HEAD|--check|--stat], git show, git blame <plik>",
          "2. Tworzenie historii: git init [-b main], git config, git add [.|plik|-u|-A], git commit [-m|-a|--amend]",
          "3. Cofanie i schowek:  git restore [-S|-W|-s HEAD], git rm --cached, git mv, git clean [-n|-f], git reset [--soft|--mixed|--hard], git revert, git stash [list|pop], git reflog",
          "4. Gałęzie i scalanie: git branch [-a|-r|-v|-d|-m], git switch [-c], git checkout [-b], git merge [--no-ff], git rebase, git cherry-pick, git merge-base",
          "5. Zdalne (GitHub):    git remote [-v|add], git fetch, git pull [--rebase], git push [-u|--force-with-lease], git tag [-a|-l]",
          "6. Niskopoziomowe:     git cat-file [-t|-p], git hash-object --stdin, git ls-files [-s|-u], git check-ignore -v, git rev-parse",
          "7. Pliki i powłoka:    ls [-l|-a|-lh|-lah] [.git], ll, la, tree [-a], find, cat [-n] <plik>, head [-n N] <plik>, tail [-n N] <plik>, wc [-l] <plik>",
          "8. Edycja i historia:  touch <plik>, cp, mv, rm <plik>, echo \"...\" > plik, grep [-i|-n] <wzorzec> [plik], history [-c], !!, !nr, pwd, whoami, date, clear (Ctrl+L)",
          "💡 Nawigacja: Strzałki ⬆️ / ⬇️ przywołują poprzednie i kolejne komendy z historii; możesz łączyć komendy potokiem | (np. ls -lh | grep py)."
        ].join("\n")
      };
    }

    // POLECENIA POWŁOKI UNIX / MINGW64
    if (cmd === "history" || cmd.startsWith("history ")) {
      if (cmd.includes("-c")) {
        this.cmdHistory = [];
        return { out: "(historia poleceń została wyczyszczona)" };
      }
      const m = cmd.match(/^history\s+(\d+)$/);
      const limit = m ? parseInt(m[1], 10) : this.cmdHistory.length;
      const start = Math.max(0, this.cmdHistory.length - limit);
      const rows = this.cmdHistory.slice(start).map((h, idx) =>
        `${String(start + idx + 1).padStart(4, " ")}  ${h}`
      );
      return { out: rows.join("\n") || "(brak zapisanych poleceń w historii)" };
    }

    if (/^(ls|ll|la|dir)(?:\s|$)/.test(cmd)) {
      return { out: this.runLsCommand(cmd) };
    }

    if (cmd === "tree" || cmd.startsWith("tree ")) {
      const showHidden = cmd.includes("-a") || cmd.includes(".git");
      const files = Object.keys(this.worktree).sort();
      const visible = showHidden ? files : files.filter(f => !f.startsWith("."));
      const lines = ["."];
      if (showHidden) {
        lines.push("├── .git/", "│   ├── HEAD", "│   ├── config", "│   ├── index", "│   ├── objects/", "│   └── refs/");
      }
      visible.forEach((f, idx) => {
        const branchChar = idx === visible.length - 1 ? "└──" : "├──";
        lines.push(`${branchChar} ${f} (${this.byteLen(this.worktree[f])} B)`);
      });
      lines.push(`\n${showHidden ? "4 directories, " : "0 directories, "}${visible.length} files`);
      return { out: lines.join("\n") };
    }

    if (cmd === "find" || cmd.startsWith("find ")) {
      const nameMatch = cmd.match(/-name\s+["']?([^"'\s]+)["']?/);
      const pat = nameMatch ? nameMatch[1].replace(/\*/g, "") : "";
      const allPaths = [
        ".",
        "./.git",
        "./.git/HEAD",
        "./.git/config",
        "./.git/index",
        ...Object.keys(this.worktree).sort().map(f => `./${f}`)
      ];
      const filtered = pat ? allPaths.filter(p => p.includes(pat)) : allPaths;
      return { out: filtered.join("\n") };
    }

    if (cmd.startsWith("grep ")) {
      const parts = cmd.split(/\s+/);
      const fileCandidate = parts[parts.length - 1];
      const fileData = this.readVirtualFile(fileCandidate);
      if (typeof fileData === "string" && parts.length >= 3) {
        const filterPart = parts.slice(0, -1).join(" ");
        return { out: this.applyPipeFilter(fileData, filterPart) };
      }
    }

    if (cmd.startsWith("head ") || cmd.startsWith("tail ")) {
      const isHead = cmd.startsWith("head ");
      const parts = cmd.split(/\s+/);
      const fileCandidate = parts[parts.length - 1];
      const fileData = this.readVirtualFile(fileCandidate);
      if (typeof fileData === "object" && fileData.error) return { out: fileData.error };
      const filterExpr = parts.slice(0, -1).join(" ");
      return { out: this.applyPipeFilter(fileData.replace(/\n$/, ""), isHead ? filterExpr : filterExpr) };
    }

    if (cmd.startsWith("wc ")) {
      const parts = cmd.split(/\s+/);
      const fileCandidate = parts[parts.length - 1];
      const fileData = this.readVirtualFile(fileCandidate);
      if (typeof fileData === "object" && fileData.error) return { out: fileData.error };
      const res = this.applyPipeFilter(fileData, parts.slice(0, -1).join(" "));
      return { out: `${res} ${fileCandidate}` };
    }

    if (cmd.startsWith("nl ")) {
      const f = cmd.slice(3).trim();
      const fileData = this.readVirtualFile(f);
      if (typeof fileData === "object" && fileData.error) return { out: fileData.error };
      return { out: this.applyPipeFilter(fileData.replace(/\n$/, ""), "nl") };
    }

    if (cmd.startsWith("touch ")) {
      const files = cmd.slice(6).trim().split(/\s+/).filter(f => !f.startsWith("-"));
      for (const f of files) {
        if (this.worktree[f] === undefined) {
          this.worktree[f] = "";
        }
      }
      return { out: "" };
    }

    if (cmd.startsWith("rm ") && !cmd.startsWith("git ")) {
      const files = cmd.slice(3).trim().split(/\s+/).filter(f => !f.startsWith("-"));
      for (const f of files) {
        if (this.worktree[f] !== undefined) {
          delete this.worktree[f];
        } else if (!cmd.includes("-f")) {
          return { out: `rm: cannot remove '${f}': No such file or directory` };
        }
      }
      return { out: "" };
    }

    if (cmd.startsWith("cp ")) {
      const parts = cmd.split(/\s+/).filter(p => !p.startsWith("-"));
      if (parts.length >= 3) {
        const [, src, dst] = parts;
        if (this.worktree[src] === undefined) return { out: `cp: cannot stat '${src}': No such file or directory` };
        this.worktree[dst] = this.worktree[src];
        return { out: "" };
      }
    }

    if (cmd.startsWith("mv ") && !cmd.startsWith("git ")) {
      const parts = cmd.split(/\s+/).filter(p => !p.startsWith("-"));
      if (parts.length >= 3) {
        const [, src, dst] = parts;
        if (this.worktree[src] === undefined) return { out: `mv: cannot stat '${src}': No such file or directory` };
        this.worktree[dst] = this.worktree[src];
        delete this.worktree[src];
        return { out: "" };
      }
    }

    if (cmd === "pwd") {
      return { out: `/c/Users/dev/projects/${this.repoName}` };
    }

    if (cmd === "cd" || cmd.startsWith("cd ")) {
      const target = cmd.slice(2).trim();
      if (!target || target === "." || target === "~") {
        return { out: `/c/Users/dev/projects/${this.repoName}` };
      }
      return { out: `💡 W tym laboratorium terminal jest zakotwiczony w głównym katalogu repozytorium (/c/Users/dev/projects/${this.repoName}). Możesz odwoływać się do podkatalogów bezpośrednio (np. ls -la .git lub cat .git/HEAD).` };
    }

    if (cmd === "whoami") return { out: "dev" };
    if (cmd === "id") return { out: "uid=1000(dev) gid=1000(users) groups=1000(users)" };
    if (cmd === "hostname") return { out: "git-lab" };
    if (cmd === "uname" || cmd.startsWith("uname ")) {
      return { out: cmd.includes("-a") ? "MINGW64_NT-10.0-22631 git-lab 3.4.10.x86_64 x86_64 Msys" : "MINGW64_NT-10.0" };
    }
    if (cmd === "date") return { out: new Date().toString() };
    if (cmd === "env" || cmd === "printenv") {
      return {
        out: [
          "USER=dev",
          "HOME=/c/Users/dev",
          `PWD=/c/Users/dev/projects/${this.repoName}`,
          "SHELL=/usr/bin/bash",
          "MSYSTEM=MINGW64",
          "GIT_PAGER=cat"
        ].join("\n")
      };
    }
    if (cmd.startsWith("which ") || cmd.startsWith("type ")) {
      const target = cmd.split(/\s+/)[1] || "git";
      return { out: `/mingw64/bin/${target}` };
    }

    if (cmd === "git --version" || cmd === "git version" || cmd === "git -v") {
      return { out: "git version 2.47.0.windows.1 (VFS Supervised Lab Engine)" };
    }

    if (cmd === "clear" || cmd === "cls") {
      if (typeof document !== "undefined") {
        const outEl = document.getElementById("termOut");
        if (outEl) outEl.innerHTML = "";
      }
      return { out: "" };
    }

    // 1. Inicjalizacja i konfiguracja
    if (cmd.startsWith("git init")) {
      const m = cmd.match(/-b\s+(\S+)/);
      if (m) this.branch = m[1];
      this.initialized = true;
      this.unborn = true;
      this.commits = [];
      this.headCommit = { id: "(unborn)", msg: "Brak commitów (Unborn Branch)", files: {} };
      return { out: `Initialized empty Git repository in /${this.repoName}/.git/ (branch: ${this.branch})` };
    }

    if (cmd.startsWith("git ") && !this.initialized && !cmd.includes("hash-object") && !cmd.includes("--global") && !cmd.includes("--system")) {
      return this.fail("fatal: not a git repository (or any of the parent directories): .git (wykonaj najpierw git init)");
    }

    if (cmd.startsWith("git config")) {
      if (cmd.includes("--list") || cmd.includes("-l")) {
        const showOrigin = cmd.includes("--show-origin");
        return {
          out: Object.entries(this.config).map(([k, v]) =>
            showOrigin ? `file:.git/config\t${k}=${v}` : `${k}=${v}`
          ).join("\n")
        };
      }
      if (cmd.includes("--get")) {
        const parts = cmd.split(/\s+/);
        const key = parts[parts.length - 1];
        return { out: this.config[key] || "" };
      }
      const m = cmd.match(/git\s+config\s+(?:--\S+\s+)?(\S+)\s+["']?([^"']+)["']?$/);
      if (m) {
        this.config[m[1]] = m[2].trim();
        return { out: "" };
      }
      const mGet = cmd.match(/git\s+config\s+(\S+)$/);
      if (mGet && this.config[mGet[1]]) {
        return { out: this.config[mGet[1]] };
      }
      return { out: "" };
    }

    // 2. Plumbing: hash-object, cat-file, rev-parse
    if (cmd.includes("hash-object")) {
      if (cmd.includes("--stdin")) {
        const m = cmd.match(/(?:printf|echo)\s+['"]([^'"]+)['"]/);
        const input = m ? m[1].replace(/\\n/g, "\n") : "A\n";
        const oid = await this.sha1Blob(input);
        return { out: oid };
      }
      const parts = cmd.split(/\s+/);
      const targetFile = parts[parts.length - 1];
      if (this.worktree[targetFile] === undefined) {
        return this.fail(`fatal: Cannot open '${targetFile}': No such file or directory`);
      }
      const oid = await this.sha1Blob(this.worktree[targetFile]);
      return { out: oid };
    }

    if (cmd.startsWith("git cat-file")) {
      if (this.unborn) {
        return this.fail("fatal: Not a valid object name HEAD");
      }
      const parts = cmd.split(/\s+/);
      const target = parts[parts.length - 1];
      if (cmd.includes("-t")) {
        if (target === "HEAD" || this.commits.some(c => c.id.startsWith(target))) return { out: "commit" };
        if (target.includes("^{tree}") || target.startsWith("tree")) return { out: "tree" };
        return { out: "blob" };
      }
      if (cmd.includes("-p")) {
        if (target === "HEAD/.git/HEAD" || target === ".git/HEAD") {
          return { out: this.detached ? this.headCommit.id : `ref: refs/heads/${this.branch}` };
        }
        if (target.includes("^{tree}")) {
          const rows = [];
          for (const [fn, content] of Object.entries(this.headCommit.files)) {
            const oid = await this.sha1Blob(content);
            rows.push(`100644 blob ${oid}\t${fn}`);
          }
          return { out: rows.join("\n") };
        }
        const commitObj = (target === "HEAD")
          ? this.headCommit
          : this.commits.find(c => c.id.startsWith(target));
        if (!commitObj) {
          return this.fail(`fatal: Not a valid object name ${target}`);
        }
        const parentLine = commitObj.parent
          ? `parent ${commitObj.parent}\n`
          : (this.commits.length > 1 && commitObj.id === this.headCommit.id ? `parent ${this.commits[1].id}\n` : "");
        const parent2Line = commitObj.parent2 ? `parent ${commitObj.parent2}\n` : "";
        return {
          out: `tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904\n${parentLine}${parent2Line}author ${this.config["user.name"]} <${this.config["user.email"]}>\n\n${commitObj.msg}`
        };
      }
    }

    if (cmd.startsWith("git rev-parse")) {
      if (this.unborn) {
        return this.fail("fatal: ambiguous argument 'HEAD': unknown revision or path not in the working tree.");
      }
      const parts = cmd.split(/\s+/);
      const ref = parts[parts.length - 1];
      if (ref === "HEAD") return { out: this.headCommit.id };
      if (ref === "HEAD~1" || ref === "HEAD^" || ref === "HEAD^1") {
        return { out: this.headCommit.parent || (this.commits[1] && this.commits[1].id) || this.headCommit.id };
      }
      if (ref === "HEAD~2") {
        return { out: (this.commits[2] && this.commits[2].id) || (this.commits[1] && this.commits[1].id) || this.headCommit.id };
      }
      if (ref === "HEAD^2") {
        if (!this.headCommit.parent2) {
          return this.fail(`fatal: ambiguous argument 'HEAD^2': unknown revision or path not in the working tree.`);
        }
        return { out: this.headCommit.parent2 };
      }
      if (this.branches[ref]) return { out: this.branches[ref] };
      if (this.tags[ref]) return { out: this.tags[ref] };
      const byHash = this.commits.find(c => c.id.startsWith(ref));
      if (byHash) return { out: byHash.id };
      return this.fail(`fatal: ambiguous argument '${ref}': unknown revision or path not in the working tree.`);
    }

    // 3. Echo / printf / cat / show
    if (cmd.startsWith("echo ") || cmd.startsWith("printf ")) {
      const redirMatch = cmd.match(/^(?:echo|printf)\s+["']?([^"'>]+)["']?\s*(>>|>)\s*(\S+)/);
      if (redirMatch) {
        const text = redirMatch[1].replace(/\\n/g, "\n");
        const op = redirMatch[2];
        const target = redirMatch[3];
        if (op === ">>") {
          const prev = this.worktree[target] || "";
          this.worktree[target] = prev + (prev && !prev.endsWith("\n") ? "\n" : "") + text + "\n";
        } else {
          this.worktree[target] = text + "\n";
        }
        return { out: "" };
      }
      // Zwykłe wypisanie na ekran (bez przekierowania >)
      let body = cmd.replace(/^(?:echo|printf)\s+(?:-[neE]+\s+)?/, "").replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
      body = body
        .replace(/\$USER/g, "dev")
        .replace(/\$HOME/g, "/c/Users/dev")
        .replace(/\$PWD/g, `/c/Users/dev/projects/${this.repoName}`)
        .replace(/\$SHELL/g, "/usr/bin/bash");
      return { out: body };
    }

    if (cmd.startsWith("git status")) {
      const flagsPart = cmd.slice("git status".length);
      const isShort = /(?:^|\s)-[a-z]*s[a-z]*(?:\s|$)/.test(flagsPart) || flagsPart.includes("--short");
      const showBranch = /(?:^|\s)-[a-z]*b[a-z]*(?:\s|$)/.test(flagsPart) || flagsPart.includes("--branch");
      if (this.unborn && Object.keys(this.index).length === 0) {
        const untracked = Object.keys(this.worktree).map(f => `?? ${f}`).join("\n");
        return { out: `## No commits yet on ${this.branch}${untracked ? "\n" + untracked : ""}` };
      }
      if (isShort) {
        const shortOut = this.getStatusShortOutput();
        if (showBranch) {
          return { out: `## ${this.branch}${shortOut ? "\n" + shortOut : ""}` };
        }
        return { out: shortOut || "(working tree clean)" };
      }
      return { out: this.getStatusLongOutput() };
    }

    if (cmd.startsWith("git show :1:") || cmd.startsWith("git show :2:") || cmd.startsWith("git show :3:")) {
      const m = cmd.match(/git\s+show\s+:([123]):(\S+)/);
      if (m && this.conflictStages && this.conflictStages[m[2]]) {
        return { out: this.conflictStages[m[2]][m[1]] || "" };
      }
      return { out: "(brak slotu konfliktu)" };
    }

    if (cmd.startsWith("git show origin/main:")) {
      const f = cmd.split("origin/main:")[1].trim();
      const origId = this.branches["origin/main"];
      const origCommit = this.commits.find(c => c.id === origId) || this.headCommit;
      return { out: origCommit.files[f] ?? `fatal: path '${f}' does not exist in 'origin/main'` };
    }

    if (cmd.startsWith("git show HEAD~1:")) {
      const f = cmd.split("HEAD~1:")[1].trim();
      const prevCommit = this.commits[1] || this.headCommit;
      return { out: prevCommit.files[f] ?? `fatal: path '${f}' does not exist in 'HEAD~1'` };
    }

    if (cmd.startsWith("git show HEAD:")) {
      const f = cmd.split("HEAD:")[1].trim();
      return { out: this.headCommit.files[f] ?? `fatal: path '${f}' does not exist in 'HEAD'` };
    }

    if (cmd.startsWith("git show :")) {
      const f = cmd.split(":")[1].trim();
      return { out: this.index[f] ?? `fatal: path '${f}' does not exist in index` };
    }

    if (cmd === "git show" || cmd === "git show HEAD" || cmd.startsWith("git show ")) {
      const c = this.headCommit;
      const prev = this.commits[1] || { files: {} };
      const f = primaryFile || Object.keys(c.files || {})[0] || "README.md";
      const diffPart = this.makeDiff(prev.files[f] || "", c.files[f] || "", `a/${f}`, `b/${f}`);
      return {
        out: [
          `commit ${c.id} (HEAD -> ${this.branch})`,
          `Author: ${this.config["user.name"]} <${this.config["user.email"]}>`,
          `Date:   Sat Oct 24 19:20:00 2026 +0200`,
          "",
          `    ${c.msg}`,
          "",
          diffPart
        ].filter(Boolean).join("\n")
      };
    }

    if (cmd.startsWith("cat ") || cmd.startsWith("less ") || cmd.startsWith("more ")) {
      const rawArgs = cmd.replace(/^(?:cat|less|more)\s+/, "").trim().split(/\s+/);
      const showNums = rawArgs.includes("-n");
      const files = rawArgs.filter(a => !a.startsWith("-"));
      const outs = [];
      for (const f of files) {
        const data = this.readVirtualFile(f);
        if (typeof data === "object" && data.error) {
          return this.fail(data.error);
        } else {
          const text = String(data).replace(/\n$/, "");
          outs.push(showNums ? this.applyPipeFilter(text, "nl") : text);
        }
      }
      return { out: outs.join("\n") };
    }

    // 4. ls-files & check-ignore & blame & clean
    if (cmd.startsWith("git ls-files")) {
      if (cmd.includes("-u") || cmd.includes("--unmerged")) {
        if (!this.conflictStages) return { out: "(brak niescalonych wpisów w indeksie)" };
        const rows = [];
        for (const [fn, stages] of Object.entries(this.conflictStages)) {
          for (const st of ["1", "2", "3"]) {
            if (stages[st]) {
              const oid = await this.sha1Blob(stages[st]);
              rows.push(`100644 ${oid} ${st}\t${fn}`);
            }
          }
        }
        return { out: rows.join("\n") };
      }
      const isStage = cmd.includes("-s") || cmd.includes("--stage");
      const rows = [];
      for (const f of Object.keys(this.index).sort()) {
        if (isStage) {
          const oid = await this.sha1Blob(this.index[f]);
          rows.push(`100644 ${oid} 0\t${f}`);
        } else {
          rows.push(f);
        }
      }
      return { out: rows.join("\n") };
    }

    if (cmd.startsWith("git check-ignore")) {
      const parts = cmd.split(/\s+/);
      const target = parts[parts.length - 1];
      const match = this.isIgnored(target);
      if (match) {
        return { out: `.gitignore:${match.line}:${match.pattern}\t${target}` };
      }
      return { out: `(brak dopasowania w .gitignore dla ${target})` };
    }

    if (cmd.startsWith("git blame")) {
      const parts = cmd.split(/\s+/);
      const f = parts[parts.length - 1] !== "blame" ? parts[parts.length - 1] : primaryFile;
      const content = this.worktree[f] || this.headCommit.files[f];
      if (content === undefined) return { out: `fatal: no such path '${f}' in HEAD` };
      const lines = content.replace(/\n$/, "").split("\n");
      return {
        out: lines.map((l, i) => `${this.headCommit.id} (${this.config["user.name"]} 2026-10-24 ${i + 1}) ${l}`).join("\n")
      };
    }

    if (cmd.startsWith("git clean")) {
      const dryRun = cmd.includes("-n") || cmd.includes("--dry-run");
      const force = cmd.includes("-f") || cmd.includes("--force");
      if (!dryRun && !force) {
        return { out: "fatal: clean.requireForce defaults to true and neither -i, -n, nor -f given; refusing to clean" };
      }
      const untracked = Object.keys(this.worktree).filter(f => this.getShortStatusForFile(f) === "??");
      if (untracked.length === 0) return { out: "(brak nieśledzonych plików do usunięcia)" };
      const rows = [];
      for (const f of untracked) {
        if (dryRun) {
          rows.push(`Would remove ${f}`);
        } else {
          delete this.worktree[f];
          rows.push(`Removing ${f}`);
        }
      }
      return { out: rows.join("\n") };
    }

    // 5. diff
    if (cmd.startsWith("git diff")) {
      const f = primaryFile;
      if (cmd.includes("--check")) {
        const targetMap = (cmd.includes("--staged") || cmd.includes("--cached")) ? this.index : this.worktree;
        const warnings = [];
        for (const [fname, content] of Object.entries(targetMap)) {
          const lines = (content || "").split("\n");
          lines.forEach((line, idx) => {
            if (/[ \t]+$/.test(line)) {
              warnings.push(`${fname}:${idx + 1}: trailing whitespace.\n+${line}`);
            }
            if (/^(<{7}|={7}|>{7})/.test(line)) {
              warnings.push(`${fname}:${idx + 1}: leftover conflict marker`);
            }
          });
        }
        return { out: warnings.length ? warnings.join("\n") : "(brak błędów białych znaków — czysto)" };
      }
      if (cmd.includes("--name-only")) {
        const changed = Object.keys(this.worktree).filter(k => this.getShortStatusForFile(k).trim() !== "" && this.getShortStatusForFile(k) !== "??");
        return { out: changed.join("\n") };
      }
      if (cmd.includes("--staged") || cmd.includes("--cached")) {
        return { out: this.makeDiff(this.headCommit.files[f], this.index[f], `a/${f} (HEAD)`, `b/${f} (Index)`) };
      }
      if (cmd.includes("HEAD")) {
        return { out: this.makeDiff(this.headCommit.files[f], this.worktree[f], `a/${f} (HEAD)`, `b/${f} (Worktree)`) };
      }
      return { out: this.makeDiff(this.index[f], this.worktree[f], `a/${f} (Index)`, `b/${f} (Worktree)`) };
    }

    // 6. restore, rm, mv, add, commit
    if (cmd.startsWith("git restore")) {
      const parts = cmd.split(/\s+/);
      const lastArg = parts[parts.length - 1];
      const f = (this.worktree[lastArg] !== undefined || this.index[lastArg] !== undefined || this.headCommit.files[lastArg] !== undefined)
        ? lastArg
        : primaryFile;
      const hasStaged = cmd.includes("--staged") || cmd.includes("-S");
      const hasWorktree = cmd.includes("--worktree") || cmd.includes("-W") || !hasStaged;
      const fromHead = cmd.includes("--source=HEAD") || cmd.includes("-s HEAD") || hasStaged;

      if (hasStaged) {
        if (this.headCommit.files[f] !== undefined) {
          this.index[f] = this.headCommit.files[f];
        } else {
          delete this.index[f];
        }
      }
      if (hasWorktree) {
        const src = fromHead ? this.headCommit.files[f] : this.index[f];
        if (src !== undefined) {
          this.worktree[f] = src;
        }
      }
      return { out: "" };
    }

    if (cmd.startsWith("git rm")) {
      const parts = cmd.split(/\s+/);
      const f = parts[parts.length - 1];
      const isCached = cmd.includes("--cached");
      if (this.index[f] !== undefined) {
        delete this.index[f];
        if (!isCached && this.worktree[f] !== undefined) {
          delete this.worktree[f];
        }
        return { out: `rm '${f}'` };
      }
      return { out: `fatal: pathspec '${f}' did not match any files` };
    }

    if (cmd.startsWith("git mv ")) {
      const parts = cmd.split(/\s+/);
      if (parts.length >= 4) {
        const src = parts[2];
        const dst = parts[3];
        if (this.worktree[src] !== undefined) {
          this.worktree[dst] = this.worktree[src];
          delete this.worktree[src];
        }
        if (this.index[src] !== undefined) {
          this.index[dst] = this.index[src];
          delete this.index[src];
        }
        return { out: `Renamed ${src} -> ${dst}` };
      }
    }

    if (cmd.startsWith("git add")) {
      if (cmd.includes("-u") || cmd.includes("--update")) {
        for (const k of Object.keys(this.index)) {
          if (this.worktree[k] !== undefined) {
            this.index[k] = this.worktree[k];
          } else {
            delete this.index[k];
          }
        }
        return { out: "" };
      }
      for (const k of Object.keys(this.worktree)) {
        if (this.isIgnored(k) && this.index[k] === undefined && !cmd.includes("-f")) continue;
        if (cmd.includes(k) || cmd.includes(".") || cmd.includes("-A")) {
          if (this.conflictStages && this.conflictStages[k] && /^(<{7}|={7}|>{7})/m.test(this.worktree[k] || "")) {
            return this.fail(
              `error: plik '${k}' nadal zawiera znaczniki konfliktu (<<<<<<< / ======= / >>>>>>>).\n` +
              `hint: Usuń najpierw znaczniki konfliktu w pliku na dysku (np. echo "PORT = 8080" > ${k}), a dopiero potem wykonaj 'git add ${k}'.`
            );
          }
          this.index[k] = this.worktree[k];
          if (this.conflictStages && this.conflictStages[k]) {
            delete this.conflictStages[k];
            if (Object.keys(this.conflictStages).length === 0) this.conflictStages = null;
          }
        }
      }
      if (cmd.includes(".") || cmd.includes("-A")) {
        for (const k of Object.keys(this.index)) {
          if (this.worktree[k] === undefined) delete this.index[k];
        }
      }
      return { out: "" };
    }

    if (cmd.startsWith("git commit")) {
      if (this.conflictStages && Object.keys(this.conflictStages).length > 0) {
        return this.fail([
          "error: Committing is not possible because you have unmerged files.",
          "hint: Fix them up in the work tree, and then use 'git add/rm <file>'",
          "hint: as appropriate to mark resolution and make a commit.",
          "fatal: Exiting because of an unresolved conflict."
        ].join("\n"));
      }

      const m = cmd.match(/-m\s+["']([^"']+)["']/);
      const isAmend = cmd.includes("--amend");
      const msg = m ? m[1] : (isAmend ? this.headCommit.msg : "Nowa migawka");

      if (isAmend && this.unborn) {
        return this.fail("fatal: You have nothing to amend.");
      }

      if (cmd.includes("-a") || cmd.includes("-am")) {
        for (const k of Object.keys(this.index)) {
          if (this.worktree[k] !== undefined) {
            this.index[k] = this.worktree[k];
          } else {
            delete this.index[k];
          }
        }
      }

      if (!isAmend && !this.merging && !this.hasStagedChanges() && !cmd.includes("--allow-empty")) {
        if (this.unborn) {
          const untracked = Object.keys(this.worktree).filter(f => !this.isIgnored(f));
          return this.fail([
            `On branch ${this.branch}`,
            "",
            "Initial commit",
            "",
            ...(untracked.length > 0
              ? [
                  "Untracked files:",
                  "  (use \"git add <file>...\" to include in what will be committed)",
                  ...untracked.map(f => `\t${f}`),
                  "",
                  "nothing added to commit but untracked files present (use \"git add\" to track)"
                ]
              : ["nothing to commit (create/copy files and use \"git add\" to track)"])
          ].join("\n"));
        }
        const longStatus = this.getStatusLongOutput();
        const extraHint = (longStatus.includes("Changes not staged") || longStatus.includes("Untracked files"))
          ? "\nno changes added to commit (use \"git add\" and/or \"git commit -a\")"
          : "";
        return this.fail(longStatus + extraHint);
      }

      if (isAmend && !this.hasStagedChanges() && this.hasUnstagedChanges()) {
        return this.fail([
          this.getStatusLongOutput(),
          "no changes added to commit (dodaj najpierw zmodyfikowany plik do Indeksu poleceniem \"git add\", a następnie wywołaj \"git commit --amend\")"
        ].join("\n"));
      }

      const newId = Math.floor(1000000 + Math.random() * 8999999).toString(16);
      const wasRoot = this.unborn;
      this.unborn = false;
      this.merging = false;
      this.conflictStages = null;

      if (isAmend && this.commits.length > 0) {
        const prevParent = this.headCommit.parent || (this.commits[1] && this.commits[1].id);
        this.headCommit = { id: newId, msg, parent: prevParent, files: JSON.parse(JSON.stringify(this.index)) };
        this.commits[0] = this.headCommit;
      } else {
        const parentId = wasRoot ? undefined : this.headCommit.id;
        this.headCommit = { id: newId, msg, parent: parentId, files: JSON.parse(JSON.stringify(this.index)) };
        this.commits.unshift(this.headCommit);
      }

      if (!this.detached) {
        this.branches[this.branch] = newId;
      }
      this.reflogEntries.unshift(`${newId} HEAD@{0}: commit${wasRoot ? " (initial)" : (isAmend ? " (amend)" : "")}: ${msg}`);
      return { out: `[${this.branch}${wasRoot ? " (root-commit)" : ""} ${newId}] ${msg}` };
    }

    // 7. Reset, Revert, Stash, Reflog
    if (cmd.startsWith("git reset")) {
      const targetMatch = cmd.match(/git\s+reset\s+(?:--\S+\s+)?(\S+)$/);
      const targetRef = targetMatch ? targetMatch[1] : "HEAD~1";
      let targetCommit = this.commits[1] || this.headCommit;

      if (targetRef.startsWith("HEAD@{")) {
        const firstEntry = this.reflogEntries.find(e => !e.includes("reset:")) || this.reflogEntries[0];
        const refId = firstEntry ? firstEntry.split(" ")[0] : targetCommit.id;
        targetCommit = this.commits.find(c => c.id === refId) || targetCommit;
      } else {
        const byHash = this.commits.find(c => c.id.startsWith(targetRef));
        if (byHash) {
          targetCommit = byHash;
        } else if (this.commits.length > 1) {
          this.commits.shift();
          targetCommit = this.commits[0];
        }
      }

      if (!this.commits.some(c => c.id === targetCommit.id)) {
        this.commits.unshift(targetCommit);
      }
      this.headCommit = JSON.parse(JSON.stringify(targetCommit));
      if (!this.detached) this.branches[this.branch] = this.headCommit.id;
      this.reflogEntries.unshift(`${this.headCommit.id} HEAD@{0}: reset: moving to ${targetRef}`);

      if (cmd.includes("--hard")) {
        this.index = JSON.parse(JSON.stringify(this.headCommit.files));
        this.worktree = JSON.parse(JSON.stringify(this.headCommit.files));
        return { out: `HEAD is now at ${this.headCommit.id} ${this.headCommit.msg}` };
      }
      if (!cmd.includes("--soft")) {
        this.index = JSON.parse(JSON.stringify(this.headCommit.files));
      }
      return { out: `Unstaged changes after reset (${this.headCommit.id})` };
    }

    if (cmd.startsWith("git revert")) {
      const prev = this.commits[1] || this.headCommit;
      const newId = Math.floor(1000000 + Math.random() * 8999999).toString(16);
      const msg = `Revert "${this.headCommit.msg}"`;
      this.index = JSON.parse(JSON.stringify(prev.files));
      this.worktree = JSON.parse(JSON.stringify(prev.files));
      this.headCommit = { id: newId, msg, parent: this.commits[0].id, files: JSON.parse(JSON.stringify(prev.files)) };
      this.commits.unshift(this.headCommit);
      this.branches[this.branch] = newId;
      this.reflogEntries.unshift(`${newId} HEAD@{0}: revert: ${msg}`);
      return { out: `[${this.branch} ${newId}] ${msg}` };
    }

    if (cmd.startsWith("git stash")) {
      if (cmd.includes("pop") || cmd.includes("apply")) {
        const snap = this.stashStack.shift();
        if (!snap) return this.fail("No stash entries found.");
        this.worktree = JSON.parse(JSON.stringify(snap.worktree));
        this.index = JSON.parse(JSON.stringify(snap.index));
        return { out: `Dropped refs/stash@{0} (restored working directory and index)` };
      }
      if (cmd.includes("list")) {
        if (this.stashStack.length === 0) {
          return this.fail("(brak zapisanych pozycji w schowku — odłóż najpierw zmiany poleceniem git stash)");
        }
        return {
          out: this.stashStack.map((s, i) => `stash@{${i}}: WIP on ${this.branch}: ${s.msg}`).join("\n")
        };
      }
      if (!this.hasStagedChanges() && !this.hasUnstagedChanges()) {
        return this.fail("No local changes to save");
      }
      this.stashStack.unshift({
        msg: this.headCommit.msg,
        index: JSON.parse(JSON.stringify(this.index)),
        worktree: JSON.parse(JSON.stringify(this.worktree))
      });
      this.index = JSON.parse(JSON.stringify(this.headCommit.files));
      this.worktree = JSON.parse(JSON.stringify(this.headCommit.files));
      return { out: `Saved working directory and index state WIP on ${this.branch}: ${this.headCommit.id} ${this.headCommit.msg}` };
    }

    if (cmd.startsWith("git reflog")) {
      return { out: this.reflogEntries.join("\n") };
    }

    // 8. Gałęzie, switch, checkout, merge, rebase, cherry-pick
    if (cmd.startsWith("git branch")) {
      if (cmd.includes("-d") || cmd.includes("-D")) {
        const parts = cmd.split(/\s+/);
        const delBr = parts[parts.length - 1];
        if (delBr === this.branch) {
          return this.fail(`error: Cannot delete branch '${delBr}' checked out at '/c/Users/dev/projects/${this.repoName}'`);
        }
        if (!this.branches[delBr]) {
          return this.fail(`error: branch '${delBr}' not found.`);
        }
        if (cmd.includes("-d") && !cmd.includes("-D")) {
          const brCommitId = this.branches[delBr];
          const isMerged =
            brCommitId === this.headCommit.id ||
            brCommitId === this.headCommit.parent ||
            brCommitId === this.headCommit.parent2;
          if (!isMerged) {
            return this.fail([
              `error: The branch '${delBr}' is not fully merged.`,
              `hint: Połącz najpierw gałąź '${delBr}' (np. git merge --no-ff ${delBr}) albo wymuś usunięcie flagą -D.`
            ].join("\n"));
          }
        }
        delete this.branches[delBr];
        return { out: `Deleted branch ${delBr}.` };
      }
      if (cmd.includes("-m") || cmd.includes("-M")) {
        const parts = cmd.split(/\s+/);
        const newBr = parts[parts.length - 1];
        const oldBr = this.branch;
        const id = this.branches[oldBr] || this.headCommit.id;
        delete this.branches[oldBr];
        this.branches[newBr] = id;
        this.branch = newBr;
        return { out: "" };
      }
      const parts = cmd.split(/\s+/);
      const showRemoteOnly = cmd.includes("-r");
      const showAll = cmd.includes("-a");
      if (parts.length === 2 || cmd.includes("-v") || showAll || showRemoteOnly) {
        const entries = Object.entries(this.branches).filter(([b]) => {
          if (showRemoteOnly) return b.includes("/");
          if (showAll) return true;
          return !b.includes("/");
        });
        return {
          out: entries.map(([b, id]) => `${b === this.branch ? "* " : "  "}${b}\t${id}`).join("\n")
        };
      }
      const newBr = parts[parts.length - 1];
      this.branches[newBr] = this.headCommit.id;
      return { out: "" };
    }

    if (cmd.startsWith("git switch") || cmd.startsWith("git checkout")) {
      const parts = cmd.split(/\s+/);
      const target = parts[parts.length - 1];
      // git checkout -- <plik> działa jak git restore <plik>
      if (cmd.startsWith("git checkout") && (cmd.includes(" -- ") || (!cmd.includes("-b") && !cmd.includes("--detach") && !this.branches[target] && this.index[target] !== undefined))) {
        if (this.index[target] !== undefined) {
          this.worktree[target] = this.index[target];
          return { out: `Updated 1 path from the index` };
        }
      }
      if (cmd.includes("-c") || cmd.includes("-b")) {
        this.branch = target;
        this.detached = false;
        this.branches[target] = this.headCommit.id;
        return { out: `Switched to a new branch '${target}'` };
      }
      if (cmd.includes("--detach") || this.commits.some(c => c.id === target)) {
        const found = this.commits.find(c => c.id.startsWith(target)) || this.headCommit;
        this.detached = true;
        this.headCommit = JSON.parse(JSON.stringify(found));
        this.index = JSON.parse(JSON.stringify(found.files));
        this.worktree = JSON.parse(JSON.stringify(found.files));
        return { out: `Note: switching to '${target}'. You are in 'detached HEAD' state.` };
      }
      this.branch = target;
      this.detached = false;
      const targetId = this.branches[target];
      const found = this.commits.find(c => c.id === targetId);
      if (found) {
        this.headCommit = JSON.parse(JSON.stringify(found));
        this.index = JSON.parse(JSON.stringify(found.files));
        this.worktree = JSON.parse(JSON.stringify(found.files));
      }
      return { out: `Switched to branch '${target}'` };
    }

    if (cmd.startsWith("git merge-base")) {
      const lastCommit = this.commits[this.commits.length - 1] || this.headCommit;
      return { out: lastCommit.id };
    }

    if (cmd.startsWith("git merge")) {
      const parts = cmd.split(/\s+/);
      const otherBr = parts[parts.length - 1];
      const otherId = this.branches[otherBr];
      if (!otherId) {
        return this.fail(`merge: ${otherBr} - not something we can merge`);
      }
      if (otherId === this.headCommit.id) {
        return this.fail("Already up to date. (Wskazówka: jeśli łączysz gałąź zdalną, pobierz najpierw nowe obiekty poleceniem git fetch)");
      }
      const otherCommit = this.commits.find(c => c.id === otherId);
      const noFF = cmd.includes("--no-ff");

      if (!noFF && otherCommit && otherCommit.parent === this.headCommit.id) {
        this.headCommit = JSON.parse(JSON.stringify(otherCommit));
        this.branches[this.branch] = this.headCommit.id;
        this.index = JSON.parse(JSON.stringify(this.headCommit.files));
        this.worktree = JSON.parse(JSON.stringify(this.headCommit.files));
        return { out: `Updating ${this.headCommit.parent}..${this.headCommit.id}\nFast-forward` };
      }

      const mergedFiles = Object.assign({}, this.headCommit.files, otherCommit ? otherCommit.files : {});
      const newId = Math.floor(1000000 + Math.random() * 8999999).toString(16);
      const msg = `Merge branch '${otherBr}' into ${this.branch}`;
      this.headCommit = {
        id: newId,
        msg,
        parent: this.headCommit.id,
        parent2: otherId,
        files: mergedFiles
      };
      this.commits.unshift(this.headCommit);
      this.branches[this.branch] = newId;
      this.index = JSON.parse(JSON.stringify(mergedFiles));
      this.worktree = JSON.parse(JSON.stringify(mergedFiles));
      return { out: `Merge made by the 'ort' strategy.\n[${this.branch} ${newId}] ${msg}` };
    }

    if (cmd.startsWith("git rebase")) {
      const parts = cmd.split(/\s+/);
      const ontoBr = parts[parts.length - 1];
      const ontoId = this.branches[ontoBr] || (this.commits[1] && this.commits[1].id) || this.headCommit.id;
      const ontoCommit = this.commits.find(c => c.id === ontoId);
      const mergedFiles = Object.assign({}, ontoCommit ? ontoCommit.files : {}, this.headCommit.files);
      const newId = Math.floor(1000000 + Math.random() * 8999999).toString(16);
      this.headCommit = {
        id: newId,
        msg: this.headCommit.msg,
        parent: ontoId,
        files: mergedFiles
      };
      this.commits[0] = this.headCommit;
      this.branches[this.branch] = newId;
      this.index = JSON.parse(JSON.stringify(mergedFiles));
      this.worktree = JSON.parse(JSON.stringify(mergedFiles));
      return { out: `Successfully rebased and updated refs/heads/${this.branch}.` };
    }

    if (cmd.startsWith("git cherry-pick")) {
      const parts = cmd.split(/\s+/);
      const pickId = parts[parts.length - 1];
      const picked = this.commits.find(c => c.id.startsWith(pickId));
      const mergedFiles = Object.assign({}, this.headCommit.files, picked ? picked.files : {});
      const newId = Math.floor(1000000 + Math.random() * 8999999).toString(16);
      const msg = picked ? picked.msg : `Cherry-pick ${pickId}`;
      this.headCommit = {
        id: newId,
        msg,
        parent: this.headCommit.id,
        files: mergedFiles
      };
      this.commits.unshift(this.headCommit);
      this.branches[this.branch] = newId;
      this.index = JSON.parse(JSON.stringify(mergedFiles));
      this.worktree = JSON.parse(JSON.stringify(mergedFiles));
      return { out: `[${this.branch} ${newId}] ${msg}` };
    }

    // 9. Zdalne repozytoria: remote, fetch, pull, push, tag, log, shortlog
    if (cmd.startsWith("git remote")) {
      if (cmd.includes("add ")) {
        const parts = cmd.split(/\s+/);
        const name = parts[3];
        const url = parts[4];
        this.remotes[name] = url;
        return { out: "" };
      }
      return {
        out: Object.entries(this.remotes).map(([name, url]) => `${name}\t${url} (fetch)\n${name}\t${url} (push)`).join("\n")
      };
    }

    if (cmd.startsWith("git fetch")) {
      if (cmd.includes("pull/")) {
        const m = cmd.match(/pull\/(\d+)\/head:(\S+)/);
        const prBranch = m ? m[2] : "pr-42";
        this.branches[prBranch] = this.headCommit.id;
        return { out: `From ${this.remotes.origin}\n * [new ref]         refs/pull/${m ? m[1] : "42"}/head -> ${prBranch}` };
      }
      const isUpstream = cmd.includes("upstream");
      if (isUpstream && !this.remotes.upstream) {
        return this.fail([
          "fatal: 'upstream' does not appear to be a git repository",
          "fatal: Could not read from remote repository. (Dodaj najpierw zdalne repozytorium poleceniem git remote add upstream ...)"
        ].join("\n"));
      }
      const remoteRef = isUpstream ? "upstream/main" : "origin/main";
      const targetId = (this.commits[0] && this.commits[0].id) || this.headCommit.id;
      this.branches[remoteRef] = targetId;
      return { out: `From ${isUpstream ? (this.remotes.upstream || "https://github.com/upstream/repo.git") : this.remotes.origin}\n * branch            main       -> FETCH_HEAD\n   ${this.headCommit.id}..${targetId}  main       -> ${remoteRef}` };
    }

    if (cmd.startsWith("git pull")) {
      const origId = this.branches["origin/main"] || this.branches["upstream/main"];
      const origCommit = this.commits.find(c => c.id === origId);
      if (origCommit) {
        const mergedFiles = Object.assign({}, origCommit.files, this.worktree);
        this.headCommit = JSON.parse(JSON.stringify(origCommit));
        this.headCommit.files = mergedFiles;
        this.index = JSON.parse(JSON.stringify(mergedFiles));
        this.worktree = JSON.parse(JSON.stringify(mergedFiles));
        this.branches[this.branch] = this.headCommit.id;
      }
      return {
        out: cmd.includes("--rebase")
          ? `Successfully rebased and updated refs/heads/${this.branch}.`
          : `Updating.. Fast-forward (pulled from remote)`
      };
    }

    if (cmd.startsWith("git push")) {
      const hasLease = cmd.includes("--force-with-lease");
      const hasForce = hasLease || cmd.includes("--force") || /(?:^|\s)-f(?:\s|$)/.test(cmd);
      const hasSetUpstream = cmd.includes("-u") || cmd.includes("--set-upstream");
      const tokens = cmd.trim().split(/\s+/).filter(t => !t.startsWith("-"));
      const specifiedBr = tokens.length >= 4 ? tokens[3] : this.branch;
      if (!specifiedBr.includes(":") && specifiedBr !== this.branch && !this.branches[specifiedBr]) {
        return this.fail([
          `error: src refspec ${specifiedBr} does not match any`,
          `error: failed to push some refs to '${this.remotes.origin}' (utwórz najpierw gałąź poleceniem git switch -c ${specifiedBr})`
        ].join("\n"));
      }
      const remTracking = this.branches[`origin/${this.branch}`];
      if (
        remTracking &&
        remTracking !== this.headCommit.id &&
        remTracking !== this.headCommit.parent &&
        remTracking !== this.headCommit.parent2 &&
        !hasForce
      ) {
        return this.fail([
          `To ${this.remotes.origin}`,
          ` ! [rejected]        ${this.branch} -> ${this.branch} (non-fast-forward)`,
          `error: failed to push some refs to '${this.remotes.origin}'`,
          `hint: Updates were rejected because the tip of your current branch is behind`,
          `hint: its remote counterpart. Integrate the remote changes (e.g.`,
          `hint: 'git pull --rebase origin ${this.branch}') before pushing again.`
        ].join("\n"));
      }
      this.branches[`origin/${this.branch}`] = this.headCommit.id;
      if (hasSetUpstream) {
        this.config[`branch.${this.branch}.remote`] = "origin";
        this.config[`branch.${this.branch}.merge`] = `refs/heads/${this.branch}`;
      }
      return {
        out: `To ${this.remotes.origin}\n   ${hasLease ? "+ (forced update with lease) " : ""}${this.headCommit.id}  ${this.branch} -> ${this.branch}${hasSetUpstream ? `\nbranch '${this.branch}' set up to track 'origin/${this.branch}'.` : ""}`
      };
    }

    if (cmd.startsWith("git tag")) {
      const m = cmd.match(/git\s+tag\s+(?:-a\s+)?(\S+)/);
      if (m && m[1] !== "-l") {
        this.tags[m[1]] = this.headCommit.id;
        return { out: "" };
      }
      return { out: Object.keys(this.tags).join("\n") };
    }

    if (cmd.startsWith("git shortlog")) {
      return {
        out: `     ${this.commits.length}\t${this.config["user.name"]} <${this.config["user.email"]}>`
      };
    }

    if (cmd.startsWith("git log")) {
      if (this.unborn) {
        return this.fail(`fatal: your current branch '${this.branch}' does not have any commits yet`);
      }
      if (cmd.includes("refs/stash")) {
        if (this.stashStack.length === 0) {
          return this.fail("fatal: ambiguous argument 'refs/stash': unknown revision or path not in the working tree (odłóż najpierw zmiany poleceniem git stash).");
        }
        return {
          out: `*   s909f00 WIP on ${this.branch}: ${this.headCommit.id} ${this.headCommit.msg}\n|\\  \n| * i808e00 index on ${this.branch}: ${this.headCommit.id}\n|/\n* ${this.headCommit.id} ${this.headCommit.msg}`
        };
      }
      const nMatch = cmd.match(/(?:-n\s*(\d+)|-(\d+))/);
      const limit = nMatch ? parseInt(nMatch[1] || nMatch[2], 10) : this.commits.length;
      const list = this.commits.slice(0, limit);
      const isGraph = cmd.includes("--graph");
      const isOneline = cmd.includes("--oneline");

      if (isOneline || isGraph) {
        return {
          out: list.map((c, idx) => {
            const dec = idx === 0 ? ` (HEAD -> ${this.branch})` : "";
            return `${isGraph ? "* " : ""}${c.id}${dec} ${c.msg}`;
          }).join("\n")
        };
      }

      return {
        out: list.map((c, idx) => [
          `commit ${c.id}${idx === 0 ? ` (HEAD -> ${this.branch})` : ""}`,
          `Author: ${this.config["user.name"]} <${this.config["user.email"]}>`,
          `Date:   Sat Oct 24 19:20:00 2026 +0200`,
          "",
          `    ${c.msg}`
        ].join("\n")).join("\n\n")
      };
    }

    if (cmd.startsWith("git ")) {
      const sub = cmd.split(/\s+/)[1] || "";
      return {
        out: [
          `git: '${sub}' nie jest rozpoznanym poleceniem git w tym ćwiczeniu.`,
          `💡 Wpisz 'help', aby wyświetlić listę obsługiwanych komend Gita, lub kliknij gotowy przycisk w ramce „🧭 Co mam teraz zrobić?”.`
        ].join("\n")
      };
    }

    const firstWord = cmd.split(/\s+/)[0];
    return {
      out: [
        `bash: ${firstWord}: nie znaleziono polecenia (nierozpoznana komenda w środowisku laboratoryjnym).`,
        `💡 Wpisz 'help', aby zobaczyć listę dostępnych poleceń (np. ls -lh, cat, tree, find, grep, history, git status -s, git diff), lub skorzystaj z podpowiedzi w ramce zadania po lewej stronie.`
      ].join("\n")
    };
  }
};
