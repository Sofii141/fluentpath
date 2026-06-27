/**
 * EnglishUp backend — accounts + cloud-synced progress.
 * Express + JWT auth + bcrypt password hashing + JSON-file storage.
 */
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "./db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_TTL = "30d";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ---- helpers ----
const sign = (user) => jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_TTL });
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name });

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");

// ---- routes ----
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: "Please enter a valid email." });
  if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
  if (db.findUserByEmail(email)) return res.status(409).json({ error: "That email is already registered." });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = db.createUser({ email, name, passwordHash });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = db.findUserByEmail(email || "");
  if (!user) return res.status(401).json({ error: "Wrong email or password." });
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Wrong email or password." });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get("/api/me", auth, (req, res) => {
  const user = db.findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

app.get("/api/progress", auth, (req, res) => {
  res.json({ progress: db.getProgress(req.userId) });
});

app.put("/api/progress", auth, (req, res) => {
  const progress = req.body?.progress;
  if (!progress || typeof progress !== "object") return res.status(400).json({ error: "Invalid progress payload" });
  res.json({ progress: db.setProgress(req.userId, progress) });
});

app.post("/api/feedback", auth, (req, res) => {
  const { type, scenario, transcript, feedback } = req.body || {};
  if (!feedback) return res.status(400).json({ error: "Missing feedback" });
  const record = db.addFeedback(req.userId, { type, scenario, transcript, feedback });
  res.json({ entry: record });
});

app.get("/api/feedback", auth, (req, res) => {
  res.json({ feedback: db.getFeedback(req.userId) });
});

app.put("/api/conversation", auth, (req, res) => {
  const conv = req.body?.conversation;
  if (!conv || !conv.id) return res.status(400).json({ error: "Invalid conversation" });
  res.json({ conversation: db.saveConversation(req.userId, conv) });
});

app.get("/api/conversations", auth, (req, res) => {
  res.json({ conversations: db.getConversations(req.userId) });
});

app.listen(PORT, () => {
  console.log(`EnglishUp API running on http://localhost:${PORT}`);
});
