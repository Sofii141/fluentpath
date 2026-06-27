/**
 * Tiny JSON-file database. Zero external services — data lives in server/data.json.
 * Fine for a personal app / portfolio; the same interface could be swapped for
 * Postgres or SQLite later without touching the routes.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "data.json");
const FEEDBACK_DIR = join(__dirname, "feedback");
const CONV_DIR = join(__dirname, "conversations");

function load() {
  if (!existsSync(DATA_FILE)) return { users: [], progress: {} };
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { users: [], progress: {} };
  }
}

/** Atomic write: write to a temp file then rename, so we never corrupt data.json. */
function save(db) {
  if (!existsSync(__dirname)) mkdirSync(__dirname, { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  writeFileSync(tmp, JSON.stringify(db, null, 2));
  renameSync(tmp, DATA_FILE);
}

export const db = {
  findUserByEmail(email) {
    return load().users.find((u) => u.email === email.toLowerCase());
  },
  findUserById(id) {
    return load().users.find((u) => u.id === id);
  },
  createUser({ email, name, passwordHash }) {
    const data = load();
    const user = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email: email.toLowerCase(),
      name: name || "",
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    data.users.push(user);
    save(data);
    return user;
  },
  getProgress(userId) {
    return load().progress[userId] || null;
  },
  setProgress(userId, progress) {
    const data = load();
    data.progress[userId] = { ...progress, updatedAt: new Date().toISOString() };
    save(data);
    return data.progress[userId];
  },

  // ---- Feedback log (one JSON file per user in server/feedback/) ----
  addFeedback(userId, entry) {
    if (!existsSync(FEEDBACK_DIR)) mkdirSync(FEEDBACK_DIR, { recursive: true });
    const file = join(FEEDBACK_DIR, `${userId}.json`);
    let list = [];
    if (existsSync(file)) {
      try { list = JSON.parse(readFileSync(file, "utf8")); } catch { list = []; }
    }
    const record = { id: `f_${Date.now()}`, date: new Date().toISOString(), ...entry };
    list.push(record);
    const tmp = file + ".tmp";
    writeFileSync(tmp, JSON.stringify(list, null, 2));
    renameSync(tmp, file);
    return record;
  },
  getFeedback(userId) {
    const file = join(FEEDBACK_DIR, `${userId}.json`);
    if (!existsSync(file)) return [];
    try { return JSON.parse(readFileSync(file, "utf8")); } catch { return []; }
  },

  // ---- Saved conversations (one file per user, keyed by conversation id) ----
  saveConversation(userId, conv) {
    if (!existsSync(CONV_DIR)) mkdirSync(CONV_DIR, { recursive: true });
    const file = join(CONV_DIR, `${userId}.json`);
    let obj = {};
    if (existsSync(file)) {
      try { obj = JSON.parse(readFileSync(file, "utf8")); } catch { obj = {}; }
    }
    obj[conv.id] = { ...conv, updatedAt: new Date().toISOString() };
    const tmp = file + ".tmp";
    writeFileSync(tmp, JSON.stringify(obj, null, 2));
    renameSync(tmp, file);
    return obj[conv.id];
  },
  getConversations(userId) {
    const file = join(CONV_DIR, `${userId}.json`);
    if (!existsSync(file)) return [];
    try {
      const obj = JSON.parse(readFileSync(file, "utf8"));
      return Object.values(obj).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    } catch { return []; }
  },
};
