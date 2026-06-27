import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, Loader2, Cloud } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { isAuthed, user, login, register, logout } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthed) {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <div className="rounded-xl border border-app bg-surface p-6 text-center shadow-card">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-600 font-display text-xl font-extrabold text-white">
            {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
          </span>
          <h1 className="mt-3 font-display text-xl font-extrabold text-main">You're signed in</h1>
          <p className="text-soft">{user?.name ? `${user.name} · ` : ""}{user?.email}</p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-emerald-600">
            <Cloud size={15} /> Your progress is syncing to the cloud
          </div>
          <button onClick={logout} className="mt-5 rounded-lg border border-app px-5 py-2.5 text-sm font-semibold text-soft hover:text-rose-500">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "register") await register(email, password, name);
      else await login(email, password);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-app bg-surface p-7 shadow-card">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
            <GraduationCap size={28} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-main">
            {mode === "register" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-soft">Save your progress and sync it across devices.</p>
        </div>

        <div className="mt-6 space-y-3">
          {mode === "register" && (
            <Field icon={User} placeholder="Name" value={name} onChange={setName} />
          )}
          <Field icon={Mail} placeholder="Email" type="email" value={email} onChange={setEmail} />
          <Field icon={Lock} placeholder="Password (min 6 chars)" type="password" value={password} onChange={setPassword}
            onEnter={submit} />

          {error && <p className="rounded-lg bg-rose-500/10 p-2.5 text-sm font-medium text-rose-500">{error}</p>}

          <button onClick={submit} disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {mode === "register" ? "Sign up" : "Sign in"}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-soft">
          {mode === "register" ? "Already have an account?" : "New here?"}{" "}
          <button onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
            className="font-semibold text-brand-600 hover:underline">
            {mode === "register" ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
      <p className="mt-3 text-center text-xs text-mute">
        Optional — the app works without an account, saving locally on this device.
      </p>
    </div>
  );
}

function Field({ icon: Icon, type = "text", placeholder, value, onChange, onEnter }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-app bg-app px-3">
      <Icon size={16} className="text-mute" />
      <input type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className="w-full bg-transparent py-2.5 text-sm text-main outline-none" />
    </div>
  );
}
