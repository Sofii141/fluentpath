import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "./api";

/**
 * Keeps a conversation persisted so it survives refreshes and can be resumed
 * or reviewed later. Saves to localStorage immediately and (when signed in)
 * debounce-syncs to the backend so progress can be analyzed.
 */
const LS = (id) => `englishup.convo.${id}`;

function readLocal(id) {
  try { return JSON.parse(localStorage.getItem(LS(id)) || "null"); } catch { return null; }
}

export function usePersistentConversation(id, { type, title, initial }) {
  const { token } = useAuth();
  const saved = useRef(readLocal(id)).current;
  const hadSaved = !!(saved?.messages?.length);
  const [messages, setMessages] = useState(hadSaved ? saved.messages : initial);
  const firstRun = useRef(true);

  useEffect(() => {
    // Don't re-save the untouched initial state on first mount.
    if (firstRun.current && !hadSaved) { firstRun.current = false; return; }
    firstRun.current = false;

    const record = { id, type, title, messages, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(LS(id), JSON.stringify(record)); } catch { /* full */ }
    if (!token) return;
    const t = setTimeout(() => { api.saveConversation(record, token).catch(() => {}); }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, token]);

  /** Clear and start fresh. */
  const reset = () => {
    setMessages(initial);
    try { localStorage.removeItem(LS(id)); } catch { /* ignore */ }
    if (token) api.saveConversation({ id, type, title, messages: initial, updatedAt: new Date().toISOString() }, token).catch(() => {});
  };

  return { messages, setMessages, resumed: hadSaved, reset };
}
