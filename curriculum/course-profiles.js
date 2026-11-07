/**
 * Konfiguracja wariantów (profili) kursu, aktywnych poziomów oraz zabezpieczeń Instruktora.
 * Ten plik może być edytowany ręcznie, z poziomu Panelu Admina w GUI (Ctrl+Shift+A)
 * lub nadpisywany automatycznie podczas budowania paczki SCORM (pack_moodle_scorm.py).
 */
window.COURSE_CONFIG = {
  // Aktywny preset profilu: "basic" | "extended" | "advanced" | "all" | "custom"
  activeProfile: "basic",

  // Niezależna lista aktualnie włączonych poziomów
  enabledTiers: ["basic"],

  // Jeśli true (np. w paczce SCORM dla konkretnej grupy na Moodle), użytkownik nie może sam zmienić poziomu na górnym pasku
  lockProfileForStudent: false,

  // Zabezpieczenie dostępu do Panelu Administratora / Instruktora
  security: {
    requireAdminPassword: true,           // Wymagaj podania hasła Instruktora przed otwarciem Panelu Admina
    hideAdminButtonOnTopbar: false,       // Jeśli true, przycisk "Admin" znika z paska u góry (dostęp tylko przez Ctrl+Shift+A)
    adminPasswordHash: "8bd917b6a28d1866" // Skrót hasła Instruktora (domyślne hasło startowe: git2026)
  },

  // Polityki dydaktyczne sterowane przez Instruktora w Panelu Admina
  policies: {
    enforceSequentialLock: false, // Jeśli true (np. w paczce SCORM na Moodle), wymaga zaliczenia kroku N przed N+1
    allowHints: true,             // Pokazuj przycisk "Podpowiedź" w zadaniach
    showTierBadgesInDrawer: true, // Pokazuj plakietki [PODST] / [ROZSZ] / [ZAAW] w Mapie Kursu
    autoSaveEnabled: true,        // Automatyczny okresowy zapis stanu sesji (localStorage + SCORM)
    autoSaveIntervalSec: 30       // Interwał autozapisu w sekundach (15, 30, 60, 120)
  },

  // Definicje presetów profili dostępnych na liście rozwijanej
  profiles: {
    basic: {
      id: "basic",
      name: "Poziom Podstawowy",
      shortLabel: "┌ Podstawowy",
      allowedTiers: ["basic"],
      description: "Poziom podstawowy: init, config, add, commit, status, prosty diff, restore, .gitignore, gałęzie i podstawy GitHub."
    },
    extended: {
      id: "extended",
      name: "Poziom Rozszerzony",
      shortLabel: "├ Rozszerzony",
      allowedTiers: ["extended"],
      description: "Poziom rozszerzony: praca na 3 obszarach (MM), rm --cached, rozwiązywanie konfliktów 3-way merge, amend, reset, stash i rebase."
    },
    advanced: {
      id: "advanced",
      name: "Poziom Zaawansowany",
      shortLabel: "├ Zaawansowany",
      allowedTiers: ["advanced"],
      description: "Poziom zaawansowany: architektura obiektów .git (hash-object, cat-file), HEAD~ vs HEAD^, sloty konfliktu :1/:2/:3 i refspec."
    },
    all: {
      id: "all",
      name: "Wszystkie poziomy (Podstawowy + Rozszerzony + Zaawansowany)",
      shortLabel: "└─▸ Wszystkie",
      allowedTiers: ["basic", "extended", "advanced"],
      description: "Pełny kurs łączący wszystkie trzy poziomy trudności: Podstawowy, Rozszerzony oraz Zaawansowany."
    },
    custom: {
      id: "custom",
      name: "Własny wybór poziomów",
      shortLabel: "▸ Wybrane",
      allowedTiers: ["basic", "extended", "advanced"],
      description: "Własna kombinacja aktywnych poziomów ustawiona w Panelu Admina."
    }
  },

  // Nadpisania poziomu dla pojedynczych kroków (ustawiane z Panelu Admina: stepId -> "basic"|"extended"|"advanced"|"hidden")
  stepTierOverrides: {}
};
