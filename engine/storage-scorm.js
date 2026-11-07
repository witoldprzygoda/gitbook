/**
 * Zarządzanie stanem sesji użytkownika:
 * 1. Tryb "private" (Prywatny komputer -> localStorage) lub "shared" (Wspólny komputer / Pracownia -> tylko sessionStorage, znika po zamknięciu karty)
 * 2. Eksport z wyborem miejsca zapisu (window.showSaveFilePicker) i import pełnej sesji .json
 * 3. Integracja z Moodle SCORM 1.2 (window.API: cmi.suspend_data & cmi.core.score.raw)
 */
const StorageManager = {
  STORAGE_KEY: "git_lab_engine_state_v1",
  MODE_KEY: "git_lab_storage_mode",
  storageMode: "private", // "private" (localStorage) | "shared" (sessionStorage)
  scormAPI: null,
  autoSaveTimer: null,
  lastSaveTimeStr: "—",

  init() {
    try {
      const savedMode = sessionStorage.getItem(this.MODE_KEY);
      if (savedMode === "shared" || savedMode === "private") {
        this.storageMode = savedMode;
      }
    } catch (e) {}

    this.scormAPI = this.findSCORMAPI(window);
    this.updateBadge();
    if (this.scormAPI) {
      try {
        this.scormAPI.LMSInitialize("");
        this.updateBadge();
      } catch (e) {}
    }
    this.setupAutoSaveTimer();
  },

  setStorageMode(mode) {
    this.storageMode = mode === "shared" ? "shared" : "private";
    try {
      sessionStorage.setItem(this.MODE_KEY, this.storageMode);
      if (this.storageMode === "shared") {
        // Usuń trwały zapis z localStorage na wspólnym komputerze, zostawiając wyłącznie pamięć bieżącej karty
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (e) {}
    if (typeof App !== "undefined" && App.allSteps && App.allSteps.length > 0) {
      this.saveState(App.getSerializableState(), App.allSteps.length);
    }
    this.updateBadge();
  },

  clearAllLocalData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
    this.lastSaveTimeStr = "—";
    this.updateBadge();
  },

  findSCORMAPI(win) {
    let attempts = 0;
    while (win && !win.API && win.parent && win.parent !== win && attempts < 10) {
      attempts++;
      win = win.parent;
    }
    return (win && win.API) ? win.API : null;
  },

  setupAutoSaveTimer() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    const policies = (window.COURSE_CONFIG && window.COURSE_CONFIG.policies) || {};
    const enabled = policies.autoSaveEnabled !== false;
    const sec = Number(policies.autoSaveIntervalSec) || 30;
    this.updateBadge();

    if (!enabled || sec <= 0) return;

    this.autoSaveTimer = setInterval(() => {
      if (typeof App !== "undefined" && App.allSteps && App.allSteps.length > 0) {
        this.saveState(App.getSerializableState(), App.allSteps.length, true);
      }
    }, sec * 1000);
  },

  updateBadge() {
    const badge = document.getElementById("scormStatusBadge");
    if (!badge) return;
    const policies = (window.COURSE_CONFIG && window.COURSE_CONFIG.policies) || {};
    const autoOn = policies.autoSaveEnabled !== false;
    const sec = Number(policies.autoSaveIntervalSec) || 30;

    if (this.scormAPI) {
      badge.textContent = `SCORM (${this.lastSaveTimeStr})`;
      badge.style.color = "#4ade80";
      badge.title = `Połączono z Moodle SCORM 1.2 | Autozapis: ${autoOn ? "co " + sec + "s" : "wyłączony"} | Ostatni zapis: ${this.lastSaveTimeStr}`;
    } else if (this.storageMode === "shared") {
      badge.textContent = `Wspólny PC (${this.lastSaveTimeStr})`;
      badge.style.color = "#facc15";
      badge.title = `Tryb Wspólny komputer (sessionStorage — dane znikną po zamknięciu karty!). Skopiuj swój Kod Postępu przed wyjściem.`;
    } else {
      badge.textContent = autoOn ? `Autozapis: ${this.lastSaveTimeStr}` : `Zapis: ręczny`;
      badge.style.color = autoOn ? "#38bdf8" : "#94a3b8";
      badge.title = `Tryb Prywatny komputer (localStorage) | Autozapis: ${autoOn ? "aktywny co " + sec + "s" : "wyłączony"} | Ostatni zapis: ${this.lastSaveTimeStr}`;
    }
  },

  saveState(stateObj, totalStepsCount, isPeriodic = false) {
    const now = new Date();
    const payload = {
      version: "1.2",
      timestamp: now.toISOString(),
      storageMode: this.storageMode,
      onboardingSeen: !!stateObj.onboardingSeen,
      activeProfile: stateObj.activeProfile,
      enabledTiers: stateObj.enabledTiers,
      selectedVoiceId: stateObj.selectedVoiceId,
      currentStepId: stateObj.currentStepId,
      completedSteps: Array.from(stateObj.completedSteps || []),
      instructorMode: !!stateObj.instructorMode,
      policies: (window.COURSE_CONFIG && window.COURSE_CONFIG.policies) || {},
      security: (window.COURSE_CONFIG && window.COURSE_CONFIG.security) || {},
      vfsState: stateObj.vfsState || null
    };

    const rawJson = JSON.stringify(payload);
    try {
      if (this.storageMode === "shared") {
        sessionStorage.setItem(this.STORAGE_KEY, rawJson);
        localStorage.removeItem(this.STORAGE_KEY);
      } else {
        localStorage.setItem(this.STORAGE_KEY, rawJson);
      }
      this.lastSaveTimeStr = now.toTimeString().slice(0, 8);
      this.updateBadge();
    } catch (e) {}

    // Zapis do Moodle SCORM 1.2 jeśli aktywny
    if (this.scormAPI) {
      try {
        const pct = totalStepsCount > 0
          ? Math.round((payload.completedSteps.length / totalStepsCount) * 100)
          : 0;
        this.scormAPI.LMSSetValue("cmi.suspend_data", rawJson.slice(0, 4000));
        this.scormAPI.LMSSetValue("cmi.core.score.raw", String(pct));
        this.scormAPI.LMSSetValue("cmi.core.lesson_status", pct >= 100 ? "completed" : "incomplete");
        this.scormAPI.LMSCommit("");
      } catch (e) {}
    }
  },

  loadState() {
    if (this.scormAPI) {
      try {
        const suspend = this.scormAPI.LMSGetValue("cmi.suspend_data");
        if (suspend && suspend.startsWith("{")) return JSON.parse(suspend);
      } catch (e) {}
    }
    try {
      const sess = sessionStorage.getItem(this.STORAGE_KEY);
      if (sess) {
        const parsed = JSON.parse(sess);
        if (parsed.storageMode === "shared") this.storageMode = "shared";
        return parsed;
      }
    } catch (e) {}
    try {
      const local = localStorage.getItem(this.STORAGE_KEY);
      if (local) return JSON.parse(local);
    } catch (e) {}
    return null;
  },

  async exportSessionToFile() {
    const state = App.getSerializableState();
    const jsonText = JSON.stringify(state, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const defaultName = `git_lab_sesja_${dateStr}.json`;

    if (typeof window.showSaveFilePicker === "function") {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: defaultName,
          types: [
            {
              description: "Plik sesji Git Lab (.json)",
              accept: { "application/json": [".json"] }
            }
          ]
        });
        const writable = await handle.createWritable();
        await writable.write(jsonText);
        await writable.close();
        this.lastSaveTimeStr = new Date().toTimeString().slice(0, 8);
        this.updateBadge();
        if (typeof App !== "undefined" && App.showToast) {
          App.showToast("✓ Sesja kursu została zapisana na dysku", "ok");
        }
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultName;
    a.click();
    URL.revokeObjectURL(url);
    if (typeof App !== "undefined" && App.showToast) {
      App.showToast(`✓ Pobrano plik sesji (${defaultName})`, "ok");
    }
  },

  importSessionFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        App.restoreFromSavedState(data);
        if (typeof App !== "undefined" && App.showToast) {
          App.showToast("✓ Pomyślnie wczytano plik sesji (.json)", "ok");
        }
      } catch (err) {
        if (typeof App !== "undefined" && App.showToast) {
          App.showToast("Błąd: Nieprawidłowy format pliku sesji (.json)", "err");
        }
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }
};
