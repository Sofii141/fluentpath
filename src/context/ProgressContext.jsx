import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import { useLocalStorage } from "../lib/useLocalStorage";
import { ALL_STATIONS, LEVEL_ORDER, levelIndex } from "../data/curriculum";
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";

const ProgressContext = createContext(null);

const todayStr = () => new Date().toISOString().slice(0, 10);

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

/** ISO-ish week key like "2026-W26" so we can track weekly coverage. */
function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week}`;
}

export function ProgressProvider({ children }) {
  const [data, setData] = useLocalStorage("englishup.progress", {
    xp: 0,
    streak: 0,
    lastActive: null,
    dailyGoal: 30, // xp per day
    xpToday: 0,
    xpTodayDate: todayStr(),
    completed: {},   // stationId -> lessons done
    name: "",
    level: "",       // the learner's placement level (A1..C1)
    week: weekKey(), // current week bucket
    weekSkills: {},  // skill -> times practiced this week
    dayDone: {},     // "YYYY-MM-DD" -> { skill: true } activities finished today
    speakGoalMin: 15,          // mandatory daily speaking minutes
    speak: { date: todayStr(), seconds: 0 }, // speaking time done today
  });

  // ---- Cloud sync (only when logged in) ----
  const { token } = useAuth();
  const syncedRef = useRef(false);

  // On login: pull the account's progress, or seed the cloud with local data.
  useEffect(() => {
    if (!token) { syncedRef.current = false; return; }
    let cancelled = false;
    (async () => {
      try {
        const { progress } = await api.getProgress(token);
        if (cancelled) return;
        if (progress) {
          const { updatedAt, ...rest } = progress;
          setData((d) => ({ ...d, ...rest }));
        } else {
          await api.saveProgress(data, token);
        }
        syncedRef.current = true;
      } catch {
        /* offline — keep using local storage */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // While logged in, debounce-save every change to the cloud.
  useEffect(() => {
    if (!token || !syncedRef.current) return;
    const t = setTimeout(() => { api.saveProgress(data, token).catch(() => {}); }, 1200);
    return () => clearTimeout(t);
  }, [data, token]);

  /** Register study activity: award XP, keep streak alive, track daily goal. */
  const addXp = useCallback((amount) => {
    setData((d) => {
      const today = todayStr();
      let { streak, lastActive, xpToday, xpTodayDate } = d;
      if (xpTodayDate !== today) { xpToday = 0; xpTodayDate = today; }
      if (lastActive !== today) {
        const gap = lastActive ? daysBetween(lastActive, today) : 1;
        streak = gap === 1 ? streak + 1 : 1;
        lastActive = today;
      }
      return { ...d, xp: d.xp + amount, xpToday: xpToday + amount, xpTodayDate, streak, lastActive };
    });
  }, [setData]);

  /**
   * Set the learner's placement level. Stations below that level are marked
   * complete so the path (and all auto-generated practice) starts right there.
   */
  const setLevel = useCallback((level) => {
    setData((d) => {
      const completed = { ...d.completed };
      for (const s of ALL_STATIONS) {
        if (levelIndex(s.level) < levelIndex(level)) completed[s.id] = s.lessons;
      }
      return { ...d, level, completed };
    });
  }, [setData]);

  /** Accumulate daily speaking time (in seconds), resetting on a new day. */
  const addSpeakSeconds = useCallback((secs) => {
    setData((d) => {
      const today = todayStr();
      const cur = d.speak?.date === today ? d.speak.seconds : 0;
      return { ...d, speak: { date: today, seconds: cur + secs } };
    });
  }, [setData]);

  const setSpeakGoal = useCallback((min) => setData((d) => ({ ...d, speakGoalMin: min })), [setData]);

  /** Mark progress on a specific station. */
  const completeLesson = useCallback((stationId, lessonsDone) => {
    setData((d) => ({
      ...d,
      completed: { ...d.completed, [stationId]: Math.max(d.completed[stationId] || 0, lessonsDone) },
    }));
  }, [setData]);

  /**
   * Record that the user practiced a skill: advances the next unlocked,
   * unfinished station of that skill along the path, and logs weekly/daily
   * coverage. This is what makes the path fill in as you study.
   */
  const practiceSkill = useCallback((skill, lessons = 1) => {
    setData((d) => {
      const wk = weekKey();
      const week = d.week === wk ? d.week : wk;
      const weekSkills = d.week === wk ? { ...d.weekSkills } : {};
      weekSkills[skill] = (weekSkills[skill] || 0) + 1;

      const today = todayStr();
      const dayDone = { ...(d.dayDone || {}) };
      dayDone[today] = { ...(dayDone[today] || {}), [skill]: true };

      // Advance the earliest unlocked, unfinished station of this skill.
      const completed = { ...d.completed };
      const isDone = (s) => (completed[s.id] || 0) >= s.lessons;
      const isUnlocked = (s) => {
        const idx = ALL_STATIONS.indexOf(s);
        if (idx <= 0) return true;
        const prev = ALL_STATIONS[idx - 1];
        return (completed[prev.id] || 0) >= prev.lessons;
      };
      const target = ALL_STATIONS.find((s) => s.skill === skill && !isDone(s) && isUnlocked(s));
      if (target) completed[target.id] = Math.min(target.lessons, (completed[target.id] || 0) + lessons);

      return { ...d, completed, week, weekSkills, dayDone };
    });
  }, [setData]);

  const isStationDone = useCallback((station) =>
    (data.completed[station.id] || 0) >= station.lessons, [data.completed]);

  const isStationUnlocked = useCallback((stationId) => {
    const idx = ALL_STATIONS.findIndex((s) => s.id === stationId);
    if (idx <= 0) return true;
    const prev = ALL_STATIONS[idx - 1];
    return (data.completed[prev.id] || 0) >= prev.lessons;
  }, [data.completed]);

  const totalLessons = ALL_STATIONS.reduce((n, s) => n + s.lessons, 0);
  const doneLessons = ALL_STATIONS.reduce((n, s) => n + Math.min(data.completed[s.id] || 0, s.lessons), 0);

  // Weekly coverage (reset view if the stored week is stale).
  const skillsThisWeek = data.week === weekKey() ? (data.weekSkills || {}) : {};
  const doneToday = data.dayDone?.[todayStr()] || {};

  // Daily speaking goal tracking.
  const speakGoalSec = (data.speakGoalMin || 15) * 60;
  const speakToday = data.speak?.date === todayStr() ? data.speak.seconds : 0;
  const speakDoneToday = speakToday >= speakGoalSec;

  // The next station you haven't finished — drives "what to do now".
  const nextStation =
    ALL_STATIONS.find((s) => (data.completed[s.id] || 0) < s.lessons && isStationUnlocked(s.id)) ||
    ALL_STATIONS[ALL_STATIONS.length - 1];

  // Your level is set by placement and raised only by passing the level test.
  // XP and station completion do NOT change it — they're separate progress.
  const effectiveLevel = data.level || "A2";
  const nextLevel = LEVEL_ORDER[Math.min(LEVEL_ORDER.length - 1, levelIndex(effectiveLevel) + 1)];
  const isMaxLevel = levelIndex(effectiveLevel) >= LEVEL_ORDER.length - 1;

  const value = {
    data, setData, addXp, completeLesson, practiceSkill, setLevel,
    addSpeakSeconds, setSpeakGoal,
    isStationDone, isStationUnlocked,
    totalLessons, doneLessons,
    overallPct: Math.round((doneLessons / totalLessons) * 100),
    skillsThisWeek, doneToday,
    speakGoalSec, speakToday, speakDoneToday,
    nextStation, effectiveLevel, nextLevel, isMaxLevel,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
