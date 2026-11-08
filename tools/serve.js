#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8090);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");
const ACTIVITY_EVENTS_FILE = path.join(DATA_DIR, "activity_events.jsonl");
const ACTIVITY_SESSIONS_FILE = path.join(DATA_DIR, "activity_sessions.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function extractClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  const xri = req.headers["x-real-ip"] || req.headers["cf-connecting-ip"];
  if (typeof xri === "string" && xri.trim()) {
    return xri.trim();
  }
  const remote = req.socket?.remoteAddress || "";
  return remote.replace(/^::ffff:/, "");
}

function loadActivitySessionsDB() {
  try {
    ensureDataDir();
    if (!fs.existsSync(ACTIVITY_SESSIONS_FILE)) {
      const init = { updatedAt: new Date().toISOString(), totalEvents: 0, sessions: {} };
      fs.writeFileSync(ACTIVITY_SESSIONS_FILE, JSON.stringify(init, null, 2), "utf8");
      return init;
    }
    const raw = fs.readFileSync(ACTIVITY_SESSIONS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.sessions !== "object") {
      return { updatedAt: new Date().toISOString(), totalEvents: 0, sessions: {} };
    }
    return parsed;
  } catch (e) {
    return { updatedAt: new Date().toISOString(), totalEvents: 0, sessions: {} };
  }
}

function saveActivitySessionsDB(db) {
  try {
    ensureDataDir();
    db.updatedAt = new Date().toISOString();
    fs.writeFileSync(ACTIVITY_SESSIONS_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("[ACTIVITY SESSIONS SAVE ERROR]", e);
  }
}

function appendActivityEventsJsonl(lines) {
  try {
    if (!lines.length) return;
    ensureDataDir();
    fs.appendFileSync(ACTIVITY_EVENTS_FILE, lines.join("\n") + "\n", "utf8");
  } catch (e) {
    console.error("[ACTIVITY EVENTS APPEND ERROR]", e);
  }
}

function loadFeedbackDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FEEDBACK_FILE)) {
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify({ threads: [] }, null, 2), "utf8");
      return { threads: [] };
    }
    const raw = fs.readFileSync(FEEDBACK_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.threads)) return { threads: [] };
    return parsed;
  } catch (e) {
    return { threads: [] };
  }
}

function saveFeedbackDB(db) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("[FEEDBACK SAVE ERROR]", e);
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString("utf8");
      if (body.length > 1024 * 512) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
  });
  res.end(payload);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  try {
    const cleanUrl = decodeURIComponent((req.url || "/").split("?")[0]);

    // OBSŁUGA ENDPOINTÓW API FEEDBACKU TESTOWEGO I KORESPONDENCJI Z ADMINEM
    if (cleanUrl.startsWith("/api/feedback")) {
      const db = loadFeedbackDB();

      if (req.method === "GET" && cleanUrl === "/api/feedback/admin") {
        const sorted = [...db.threads].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
        return sendJson(res, 200, { ok: true, threads: sorted });
      }

      if (req.method === "POST" && cleanUrl === "/api/feedback/sync") {
        const body = await readJsonBody(req);
        const clientId = String(body.clientId || "").trim();
        const codes = Array.isArray(body.progressCodes)
          ? body.progressCodes.map(c => String(c || "").trim().toUpperCase()).filter(Boolean)
          : [];
        const localThreads = Array.isArray(body.localThreads) ? body.localThreads : [];

        let changed = false;

        // Scal wątki przywiezione w pliku .json lub pamięci lokalnej klienta z bazą serwera
        for (const lt of localThreads) {
          if (!lt || !lt.id) continue;
          const existing = db.threads.find(t => t.id === lt.id);
          if (!existing) {
            db.threads.push({
              id: String(lt.id),
              clientId: clientId || String(lt.clientId || ""),
              progressCodes: Array.from(new Set([...(lt.progressCodes || []), ...codes])),
              author: String(lt.author || "Anonim"),
              stepId: String(lt.stepId || ""),
              stepTitle: String(lt.stepTitle || ""),
              profile: String(lt.profile || "basic"),
              createdAt: lt.createdAt || new Date().toISOString(),
              updatedAt: lt.updatedAt || new Date().toISOString(),
              status: lt.status || "submitted",
              adminReadAt: lt.adminReadAt || null,
              userReadReplyAt: lt.userReadReplyAt || null,
              messages: Array.isArray(lt.messages) ? lt.messages : []
            });
            changed = true;
          } else {
            // Dopisz nowe kody postępu lub wiadomości z lokalnej historii, których jeszcze nie ma na serwerze
            if (clientId && existing.clientId !== clientId) {
              existing.linkedClientIds = Array.from(new Set([...(existing.linkedClientIds || []), existing.clientId, clientId]));
            }
            const mergedCodes = Array.from(new Set([...(existing.progressCodes || []), ...(lt.progressCodes || []), ...codes]));
            if (mergedCodes.length !== (existing.progressCodes || []).length) {
              existing.progressCodes = mergedCodes;
              changed = true;
            }
            if (Array.isArray(lt.messages)) {
              const knownMsgIds = new Set((existing.messages || []).map(m => m.id));
              for (const m of lt.messages) {
                if (m && m.id && !knownMsgIds.has(m.id)) {
                  existing.messages.push(m);
                  changed = true;
                }
              }
            }
          }
        }

        // Odszukaj wszystkie wątki należące do tego użytkownika (po clientId lub po kodzie postępu GLAB-...)
        const userThreads = db.threads.filter(t => {
          const matchClient = clientId && (t.clientId === clientId || (Array.isArray(t.linkedClientIds) && t.linkedClientIds.includes(clientId)));
          const matchCode = codes.length > 0 && Array.isArray(t.progressCodes) && t.progressCodes.some(c => codes.includes(c));
          if (matchClient || matchCode) {
            if (codes.length > 0) {
              const nextCodes = Array.from(new Set([...(t.progressCodes || []), ...codes]));
              if (nextCodes.length !== (t.progressCodes || []).length) {
                t.progressCodes = nextCodes;
                changed = true;
              }
            }
            if (clientId && t.clientId !== clientId) {
              t.linkedClientIds = Array.from(new Set([...(t.linkedClientIds || []), t.clientId, clientId]));
              changed = true;
            }
            return true;
          }
          return false;
        });

        if (changed) saveFeedbackDB(db);
        userThreads.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
        return sendJson(res, 200, { ok: true, threads: userThreads });
      }

      if (req.method === "POST" && cleanUrl === "/api/feedback/submit") {
        const body = await readJsonBody(req);
        const text = String(body.text || "").trim();
        if (!text) {
          return sendJson(res, 400, { ok: false, error: "Treść wiadomości nie może być pusta." });
        }
        const now = new Date().toISOString();
        const clientId = String(body.clientId || "anon").trim();
        const author = String(body.author || "").trim() || "Anonim";
        const progressCode = String(body.progressCode || "").trim().toUpperCase();
        const msgObj = {
          id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          role: "user",
          author,
          text,
          createdAt: now
        };

        let thread = body.threadId ? db.threads.find(t => t.id === body.threadId) : null;
        if (thread) {
          thread.messages.push(msgObj);
          thread.status = "submitted";
          thread.updatedAt = now;
          if (author !== "Anonim") thread.author = author;
          if (progressCode) {
            thread.progressCodes = Array.from(new Set([...(thread.progressCodes || []), progressCode]));
          }
        } else {
          thread = {
            id: "fb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
            clientId,
            linkedClientIds: [clientId],
            progressCodes: progressCode ? [progressCode] : [],
            author,
            stepId: String(body.stepId || ""),
            stepTitle: String(body.stepTitle || ""),
            profile: String(body.profile || "basic"),
            createdAt: now,
            updatedAt: now,
            status: "submitted",
            adminReadAt: null,
            userReadReplyAt: null,
            messages: [msgObj]
          };
          db.threads.push(thread);
        }

        saveFeedbackDB(db);
        return sendJson(res, 200, { ok: true, thread });
      }

      if (req.method === "POST" && cleanUrl === "/api/feedback/mark-user-read") {
        const body = await readJsonBody(req);
        const ids = Array.isArray(body.threadIds) ? body.threadIds : [];
        const now = new Date().toISOString();
        let changed = false;
        for (const t of db.threads) {
          if (ids.includes(t.id)) {
            t.userReadReplyAt = now;
            changed = true;
          }
        }
        if (changed) saveFeedbackDB(db);
        return sendJson(res, 200, { ok: true });
      }

      if (req.method === "POST" && cleanUrl === "/api/feedback/admin-action") {
        const body = await readJsonBody(req);
        const action = String(body.action || "");
        const threadId = String(body.threadId || "");
        const now = new Date().toISOString();

        if (action === "delete") {
          const before = db.threads.length;
          db.threads = db.threads.filter(t => t.id !== threadId);
          if (db.threads.length !== before) saveFeedbackDB(db);
        } else {
          const thread = db.threads.find(t => t.id === threadId);
          if (!thread) {
            return sendJson(res, 404, { ok: false, error: "Nie znaleziono zgłoszenia." });
          }
          if (action === "mark_read") {
            if (thread.status === "submitted") {
              thread.status = "read_by_admin";
            }
            thread.adminReadAt = now;
            thread.updatedAt = now;
            saveFeedbackDB(db);
          } else if (action === "reply") {
            const replyText = String(body.text || "").trim();
            if (!replyText) {
              return sendJson(res, 400, { ok: false, error: "Treść odpowiedzi nie może być pusta." });
            }
            thread.messages.push({
              id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
              role: "admin",
              author: "Administrator",
              text: replyText,
              createdAt: now
            });
            thread.status = "replied";
            thread.adminReadAt = now;
            thread.userReadReplyAt = null;
            thread.updatedAt = now;
            saveFeedbackDB(db);
          }
        }

        const sorted = [...db.threads].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
        return sendJson(res, 200, { ok: true, threads: sorted });
      }

      return sendJson(res, 404, { ok: false, error: "Unknown feedback endpoint" });
    }

    // OBSŁUGA ENDPOINTÓW TELEMETRII I LOGÓW AKTYWNOŚCI UŻYTKOWNIKÓW (ANALITYKA KURSU)
    if (cleanUrl.startsWith("/api/activity")) {
      if (req.method === "POST" && cleanUrl === "/api/activity/log") {
        const body = await readJsonBody(req);
        const now = new Date().toISOString();
        const ip = extractClientIp(req);
        const userAgent = String(req.headers["user-agent"] || "");
        const acceptLang = String(req.headers["accept-language"] || "");

        const clientId = String(body.clientId || "anon").trim();
        const sessionId = String(body.sessionId || ("ses_" + Date.now())).trim();
        const author = String(body.author || "").trim();
        const progressCode = String(body.progressCode || "").trim().toUpperCase();
        const knownCodes = Array.isArray(body.knownProgressCodes)
          ? body.knownProgressCodes.map(c => String(c || "").trim().toUpperCase()).filter(Boolean)
          : [];
        const storageMode = String(body.storageMode || "private");
        const appVersion = String(body.appVersion || "0.11");
        const device = (body.device && typeof body.device === "object") ? body.device : {};
        const events = Array.isArray(body.events) ? body.events : [];

        const db = loadActivitySessionsDB();
        if (!db.sessions[sessionId]) {
          db.sessions[sessionId] = {
            sessionId,
            clientId,
            author: author || "Anonim",
            startedAt: now,
            lastSeenAt: now,
            endedAt: null,
            appVersion,
            storageMode,
            progressCode: progressCode || "GLAB-0000-0000-0000",
            knownProgressCodes: progressCode ? [progressCode] : [],
            activeProfile: String(body.activeProfile || "basic"),
            currentStepId: String(body.currentStepId || "m00_s01"),
            completedStepsCount: Number(body.completedStepsCount || 0),
            completedSteps: Array.isArray(body.completedSteps) ? body.completedSteps : [],
            net: {
              ip,
              ipHistory: ip ? [ip] : [],
              userAgent,
              acceptLanguage: acceptLang
            },
            device: {},
            timing: {
              totalActiveMs: 0,
              totalIdleMs: 0,
              totalAudioListenedMs: 0,
              tabBlurCount: 0
            },
            counters: {
              eventsCount: 0,
              cmdsTotal: 0,
              cmdsTyped: 0,
              cmdsClicked: 0,
              cmdsPasted: 0,
              cmdsFromHistory: 0,
              cmdsFailed: 0,
              cmdsBlockedOrder: 0,
              totalKeystrokes: 0,
              totalBackspaces: 0,
              editorSaves: 0,
              directorStarts: 0,
              directorPauses: 0,
              directorStopsEarly: 0,
              directorCompletions: 0,
              stepChanges: 0,
              resetsCount: 0
            },
            stepMetrics: {}
          };
        }

        const ses = db.sessions[sessionId];
        ses.lastSeenAt = now;
        if (clientId) ses.clientId = clientId;
        if (author && author !== "Anonim") ses.author = author;
        if (appVersion) ses.appVersion = appVersion;
        if (storageMode) ses.storageMode = storageMode;
        if (body.activeProfile) ses.activeProfile = String(body.activeProfile);
        if (body.currentStepId) ses.currentStepId = String(body.currentStepId);
        if (typeof body.completedStepsCount === "number") ses.completedStepsCount = body.completedStepsCount;
        if (Array.isArray(body.completedSteps)) ses.completedSteps = body.completedSteps;
        if (progressCode) {
          ses.progressCode = progressCode;
          if (!ses.knownProgressCodes.includes(progressCode)) ses.knownProgressCodes.push(progressCode);
        }
        for (const kc of knownCodes) {
          if (kc && !ses.knownProgressCodes.includes(kc)) ses.knownProgressCodes.push(kc);
        }
        if (ip) {
          ses.net.ip = ip;
          if (!Array.isArray(ses.net.ipHistory)) ses.net.ipHistory = [];
          if (!ses.net.ipHistory.includes(ip)) ses.net.ipHistory.push(ip);
        }
        if (userAgent) ses.net.userAgent = userAgent;
        if (Object.keys(device).length > 0) {
          ses.device = { ...ses.device, ...device };
        }

        const jsonlLines = [];
        for (const ev of events) {
          if (!ev || typeof ev !== "object") continue;
          const evType = String(ev.type || "unknown");
          const stepId = String(ev.stepId || ses.currentStepId || "m00_s01");
          const d = (ev.data && typeof ev.data === "object") ? ev.data : {};

          // 1. Zapis pełnego rekordu zdarzenia do strumienia JSONL
          jsonlLines.push(JSON.stringify({
            srvTs: now,
            clientTs: ev.ts || now,
            seq: ev.seq || 0,
            sessionId,
            clientId: ses.clientId,
            ip,
            type: evType,
            stepId,
            stepIdx: typeof ev.stepIdx === "number" ? ev.stepIdx : null,
            progressCode: ev.progressCode || ses.progressCode,
            data: d
          }));

          db.totalEvents = (db.totalEvents || 0) + 1;
          ses.counters.eventsCount = (ses.counters.eventsCount || 0) + 1;

          // Inicjalizacja metryk kroku
          if (!ses.stepMetrics[stepId]) {
            ses.stepMetrics[stepId] = {
              stepId,
              visits: 0,
              activeMs: 0,
              idleMs: 0,
              audioListenedMs: 0,
              totalBeats: 0,
              beatsReached: [],
              maxBeatIdx: -1,
              maxBeatProgressPct: 0,
              stopPoints: [],
              cmdsTyped: 0,
              cmdsClicked: 0,
              cmdsPasted: 0,
              cmdsFailed: 0,
              completed: false,
              completedVia: null,
              resets: 0
            };
          }
          const sm = ses.stepMetrics[stepId];

          // 2. Aktualizacja agregatów czasowych i zachowań
          if (evType === "step_enter") {
            sm.visits++;
            ses.counters.stepChanges++;
            if (typeof d.totalBeats === "number" && d.totalBeats > 0) sm.totalBeats = d.totalBeats;
          } else if (evType === "heartbeat" || evType === "step_leave" || evType === "session_end") {
            const addAct = Math.max(0, Number(d.deltaActiveMs || 0));
            const addIdle = Math.max(0, Number(d.deltaIdleMs || 0));
            const addAud = Math.max(0, Number(d.deltaAudioMs || 0));
            ses.timing.totalActiveMs += addAct;
            ses.timing.totalIdleMs += addIdle;
            ses.timing.totalAudioListenedMs += addAud;
            sm.activeMs += addAct;
            sm.idleMs += addIdle;
            sm.audioListenedMs += addAud;
            if (evType === "session_end") {
              ses.endedAt = now;
            }
          } else if (evType === "visibility_change") {
            if (d.state === "hidden") {
              ses.timing.tabBlurCount++;
            }
          } else if (evType === "cmd_exec") {
            ses.counters.cmdsTotal++;
            const mode = String(d.inputMode || "typed");
            if (mode === "clicked_chip" || mode === "clicked_hint") {
              ses.counters.cmdsClicked++;
              sm.cmdsClicked++;
            } else if (mode === "pasted") {
              ses.counters.cmdsPasted++;
              sm.cmdsPasted++;
            } else if (mode === "history_arrow") {
              ses.counters.cmdsFromHistory++;
              sm.cmdsTyped++;
            } else {
              ses.counters.cmdsTyped++;
              sm.cmdsTyped++;
            }
            ses.counters.totalKeystrokes += Math.max(0, Number(d.keystrokes || 0));
            ses.counters.totalBackspaces += Math.max(0, Number(d.backspaces || 0));
            if (d.outcome && d.outcome !== "ok" && d.outcome !== "already_done") {
              ses.counters.cmdsFailed++;
              sm.cmdsFailed++;
              if (d.outcome === "out_of_order_blocked") {
                ses.counters.cmdsBlockedOrder++;
              }
            }
          } else if (evType === "editor_save") {
            ses.counters.editorSaves++;
          } else if (evType === "director_start") {
            ses.counters.directorStarts++;
            if (typeof d.totalBeats === "number") sm.totalBeats = d.totalBeats;
          } else if (evType === "director_beat") {
            const bIdx = Number(d.beatIdx ?? 0);
            if (typeof d.totalBeats === "number") sm.totalBeats = d.totalBeats;
            if (!sm.beatsReached.includes(bIdx)) sm.beatsReached.push(bIdx);
            if (bIdx > sm.maxBeatIdx) {
              sm.maxBeatIdx = bIdx;
              sm.maxBeatProgressPct = 0;
            }
          } else if (evType === "director_pause" || evType === "director_stop") {
            const bIdx = Number(d.beatIdx ?? 0);
            const pct = Math.round(Number(d.progressPct ?? 0));
            if (bIdx > sm.maxBeatIdx || (bIdx === sm.maxBeatIdx && pct > sm.maxBeatProgressPct)) {
              sm.maxBeatIdx = bIdx;
              sm.maxBeatProgressPct = pct;
            }
            if (evType === "director_pause") {
              ses.counters.directorPauses++;
            } else {
              ses.counters.directorStopsEarly++;
            }
            sm.stopPoints.push({
              type: evType === "director_pause" ? "pause" : "stop",
              beatIdx: bIdx,
              progressPct: pct,
              reason: String(d.reason || "user"),
              ts: ev.ts || now
            });
            if (sm.stopPoints.length > 25) sm.stopPoints = sm.stopPoints.slice(-25);
          } else if (evType === "director_finish") {
            ses.counters.directorCompletions++;
            if (typeof d.totalBeats === "number" && d.totalBeats > 0) {
              sm.totalBeats = d.totalBeats;
              sm.maxBeatIdx = d.totalBeats - 1;
              sm.maxBeatProgressPct = 100;
            }
          } else if (evType === "step_complete") {
            sm.completed = true;
            sm.completedVia = String(d.via || "terminal");
          } else if (evType === "step_reset" || evType === "module_reset" || evType === "course_reset") {
            ses.counters.resetsCount++;
            sm.resets++;
          }
        }

        appendActivityEventsJsonl(jsonlLines);
        saveActivitySessionsDB(db);
        return sendJson(res, 200, { ok: true, logged: jsonlLines.length });
      }

      if (req.method === "GET" && cleanUrl === "/api/activity/admin-summary") {
        const db = loadActivitySessionsDB();
        const sessionsList = Object.values(db.sessions || {}).sort((a, b) =>
          String(b.lastSeenAt || "").localeCompare(String(a.lastSeenAt || ""))
        );
        const uniqueClients = new Set(sessionsList.map(s => s.clientId).filter(Boolean)).size;
        return sendJson(res, 200, {
          ok: true,
          updatedAt: db.updatedAt,
          totalEvents: db.totalEvents || 0,
          totalSessions: sessionsList.length,
          uniqueClients,
          sessions: sessionsList.slice(0, 100)
        });
      }

      if (req.method === "GET" && cleanUrl === "/api/activity/export-sessions") {
        ensureDataDir();
        const db = loadActivitySessionsDB();
        const payload = JSON.stringify(db, null, 2);
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="gitbook_activity_sessions_${new Date().toISOString().slice(0, 10)}.json"`,
          "Cache-Control": "no-store"
        });
        return res.end(payload);
      }

      if (req.method === "GET" && cleanUrl === "/api/activity/export-events") {
        ensureDataDir();
        if (!fs.existsSync(ACTIVITY_EVENTS_FILE)) {
          res.writeHead(200, {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Content-Disposition": `attachment; filename="gitbook_activity_events_${new Date().toISOString().slice(0, 10)}.jsonl"`,
            "Cache-Control": "no-store"
          });
          return res.end("");
        }
        const stat = fs.statSync(ACTIVITY_EVENTS_FILE);
        res.writeHead(200, {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Content-Length": stat.size,
          "Content-Disposition": `attachment; filename="gitbook_activity_events_${new Date().toISOString().slice(0, 10)}.jsonl"`,
          "Cache-Control": "no-store"
        });
        const stream = fs.createReadStream(ACTIVITY_EVENTS_FILE);
        stream.pipe(res);
        return;
      }

      return sendJson(res, 404, { ok: false, error: "Unknown activity endpoint" });
    }

    const relPath = cleanUrl === "/" ? "index.html" : cleanUrl.replace(/^\/+/, "");
    const filePath = path.resolve(ROOT, relPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        console.log(`[404] ${req.method} ${req.url}`);
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("Not found");
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] || "application/octet-stream";
      const range = req.headers.range;

      if (range && ext === ".mp3" && stat.size > 0) {
        const parts = range.replace(/bytes=/, "").split("-");
        const rawStart = parseInt(parts[0], 10);
        const start = Number.isNaN(rawStart) ? 0 : Math.min(Math.max(0, rawStart), stat.size - 1);
        const rawEnd = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const end = Number.isNaN(rawEnd) ? (stat.size - 1) : Math.min(Math.max(start, rawEnd), stat.size - 1);
        const chunkSize = (end - start) + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": contentType,
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
        });
        if (req.method === "HEAD") return res.end();
        const stream = fs.createReadStream(filePath, { start, end });
        stream.on("error", () => {
          if (!res.headersSent) res.writeHead(500);
          res.end();
        });
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": stat.size,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
        });
        if (req.method === "HEAD") return res.end();
        const stream = fs.createReadStream(filePath);
        stream.on("error", () => {
          if (!res.headersSent) res.writeHead(500);
          res.end();
        });
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      }
    });
  } catch (e) {
    if (!res.headersSent) res.writeHead(500);
    res.end("Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`[OK] Serwer deweloperski Node.js działa na http://localhost:${PORT}`);
});
