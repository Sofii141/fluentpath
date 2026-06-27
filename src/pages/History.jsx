import { useState, useEffect } from "react";
import { MessagesSquare, ArrowLeft, Cloud, HardDrive, Volume2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { speak } from "../lib/speech";

/** Read any conversations saved locally in this browser. */
function readLocalConversations() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("englishup.convo.")) {
      try {
        const rec = JSON.parse(localStorage.getItem(k));
        if (rec?.messages?.length) out.push(rec);
      } catch { /* skip */ }
    }
  }
  return out.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export default function History() {
  const { isAuthed, token } = useAuth();
  const [list, setList] = useState([]);
  const [active, setActive] = useState(null);
  const [source, setSource] = useState(isAuthed ? "cloud" : "local");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isAuthed) {
        try {
          const { conversations } = await api.getConversations(token);
          if (!cancelled && conversations?.length) { setList(conversations); setSource("cloud"); return; }
        } catch { /* fall back to local */ }
      }
      if (!cancelled) { setList(readLocalConversations()); setSource("local"); }
    })();
    return () => { cancelled = true; };
  }, [isAuthed, token]);

  if (active) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <button onClick={() => setActive(null)} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
          <ArrowLeft size={16} /> History
        </button>
        <h1 className="font-display text-xl font-extrabold text-main">{active.title}</h1>
        <p className="text-xs text-mute">{new Date(active.updatedAt).toLocaleString()} · {active.messages.length} messages</p>
        <div className="space-y-3 rounded-xl border border-app bg-surface p-4 shadow-card">
          {active.messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-brand-600 text-white" : "bg-surface-2 text-main"}`}>
                {m.role === "assistant" && (
                  <button onClick={() => speak(m.content)} className="float-right ml-2 text-mute hover:text-brand-600"><Volume2 size={14} /></button>
                )}
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">History</h1>
        <p className="mt-1 text-soft">Review your past conversations and interview practice.</p>
      </header>

      <div className="flex items-center gap-1.5 text-xs font-medium text-mute">
        {source === "cloud" ? <><Cloud size={13} className="text-emerald-500" /> Synced from your account</> : <><HardDrive size={13} /> Saved on this device {isAuthed ? "" : "(sign in to sync)"}</>}
      </div>

      {list.length === 0 ? (
        <div className="grid min-h-[40vh] place-items-center text-center">
          <div>
            <MessagesSquare size={36} className="mx-auto text-mute" />
            <p className="mt-3 text-soft">No conversations yet. Chat with Emma or do a Roleplay interview — they'll appear here.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((c) => (
            <button key={c.id} onClick={() => setActive(c)}
              className="flex flex-col rounded-xl border border-app bg-surface p-4 text-left shadow-card hover:border-brand-200">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft capitalize">{c.type}</span>
                <span className="text-xs text-mute">{new Date(c.updatedAt).toLocaleDateString()}</span>
              </div>
              <h3 className="mt-2 font-display font-bold text-main">{c.title}</h3>
              <p className="text-sm text-soft">{c.messages.length} messages</p>
              <p className="mt-1 truncate text-xs text-mute">{c.messages[c.messages.length - 1]?.content}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
