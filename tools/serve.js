#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8090);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

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
