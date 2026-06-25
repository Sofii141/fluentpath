import { NavLink, useLocation } from "react-router-dom";
import {
  Home, Map, Layers, Headphones, Mic, BookOpen, PenLine,
  MessagesSquare, Bot, Flame, Star, Sun, Moon, GraduationCap,
  FileCheck, User, ClipboardCheck, Library,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useProgress } from "../context/ProgressContext";

const NAV = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/path", label: "Learning Path", Icon: Map },
  { to: "/vocab", label: "Vocabulary", Icon: Layers },
  { to: "/listening", label: "Listening", Icon: Headphones },
  { to: "/speaking", label: "Speaking", Icon: Mic },
  { to: "/reading", label: "Reading", Icon: BookOpen },
  { to: "/writing", label: "Writing", Icon: PenLine },
  { to: "/roleplay", label: "Roleplay", Icon: MessagesSquare },
  { to: "/tutor", label: "AI Tutor", Icon: Bot },
  { to: "/level-test", label: "Level Test", Icon: ClipboardCheck },
  { to: "/toefl", label: "TOEFL Mock", Icon: FileCheck },
  { to: "/resources", label: "Resources", Icon: Library },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function Layout({ children }) {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const { data } = useProgress();

  return (
    <div className="min-h-screen bg-app">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-app bg-surface px-3 py-5 md:flex">
        <div className="mb-7 flex items-center gap-2.5 px-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
            <GraduationCap size={20} strokeWidth={2.25} />
          </span>
          <span className="font-display text-lg font-extrabold text-main">EnglishUp</span>
        </div>

        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-mute">Menu</p>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-soft hover:bg-surface-2 hover:text-main"
                }`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button onClick={toggle}
          className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-soft hover:bg-surface-2 hover:text-main">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </aside>

      {/* ===== Main ===== */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-app bg-surface/85 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-600 text-white">
              <GraduationCap size={16} />
            </span>
            <span className="font-display text-base font-extrabold text-main">EnglishUp</span>
          </div>
          <div className="hidden text-sm text-mute md:block">Consistency beats intensity. Keep going.</div>
          <div className="flex items-center gap-2">
            <Pill Icon={Flame} value={data.streak} tone="amber" />
            <Pill Icon={Star} value={data.xp} tone="brand" />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-7 pb-24 md:px-8 md:pb-10">{children}</main>
      </div>

      {/* ===== Bottom nav (mobile) ===== */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full justify-around border-t border-app bg-surface px-1 py-1.5 md:hidden">
        {NAV.slice(0, 5).map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <NavLink key={to} to={to} end={to === "/"}
              className={`flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium ${
                active ? "text-brand-700" : "text-mute"
              }`}>
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function Pill({ Icon, value, tone }) {
  const tones = {
    amber: "text-amber-500 bg-amber-500/10",
    brand: "text-brand-600 bg-brand-600/10",
  };
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${tones[tone]}`}>
      <Icon size={15} /> <span>{value}</span>
    </div>
  );
}
