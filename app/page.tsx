"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { tasks } from "@/data/tasks";
import TaskCard from "@/components/TaskCard";

type FilterType = "All" | "Control" | "Capacity" | "Proof";
type FocusType = "Study" | "Fitness" | "Both";
type Step = "intro" | "login" | "app";
type CompletedData = { [date: string]: number[] };
type PlanData = { [date: string]: string[] };
type User = { name: string; contact: string };
type CustomTask = { id: number; title: string };
type Mood = "great" | "ok" | "low" | "";
type Friend = { code: string; name: string; xp: number; streak: number };
type Lang = "en" | "hi";
type Skin = "midnight" | "forest" | "sunset" | "ocean";

const QUOTES = [
  "Discipline is choosing what you want most over what you want now.",
  "Show up. Especially on the hard days.",
  "Small daily progress beats rare big leaps.",
  "Winter Arc: build the version that doesn't quit.",
  "One focused block at a time.",
  "Consistency compounds. Excuses don't.",
];

const i18n = {
  en: {
    welcome: "Welcome",
    day: "Day",
    phase: "Phase",
    share: "Share",
    logout: "Logout",
    study: "Study",
    fitness: "Fitness",
    both: "Both",
    badDay: "Bad Day",
    autoPhase: "Auto Phase",
    recovery: "Recovery mode: yesterday missed. Showing minimum tasks.",
    nonNeg: "Non-negotiables",
    contract: "My Contract",
    milestones: "Milestones",
    resetArc: "New 90-Day Arc",
    language: "Language",
    theme: "Theme",
    tourNext: "Next",
    tourSkip: "Skip tour",
    eveningReview: "Evening review: 2 minutes — what went well today?",
    smartMiss: "You slipped yesterday. Today: minimum tasks only. Still counts.",
    smartStreak: "Streak is alive. Protect it today.",
    smartStart: "Winter Arc reminder — start your first block.",
    loading: "Loading...",
    signContract: "Sign contract",
    signed: "Signed & locked",
    close: "Close",
  },
  hi: {
    welcome: "स्वागत है",
    day: "दिन",
    phase: "चरण",
    share: "शेयर",
    logout: "लॉग आउट",
    study: "पढ़ाई",
    fitness: "फिटनेस",
    both: "दोनों",
    badDay: "बैड डे",
    autoPhase: "ऑटो चरण",
    recovery: "रिकवरी मोड: कल मिस। आज न्यूनतम टास्क।",
    nonNeg: "ज़रूरी नियम",
    contract: "मेरा अनुबंध",
    milestones: "मीलस्टोन",
    resetArc: "नया 90-दिन आर्क",
    language: "भाषा",
    theme: "थीम",
    tourNext: "आगे",
    tourSkip: "टूर छोड़ें",
    eveningReview: "शाम की समीक्षा: आज क्या अच्छा रहा?",
    smartMiss: "कल चूक गए। आज न्यूनतम टास्क।",
    smartStreak: "स्ट्रीक ज़िंदा है। आज बचाओ।",
    smartStart: "विंटर आर्क — पहला ब्लॉक शुरू करो।",
    loading: "लोड हो रहा है...",
    signContract: "अनुबंध पर हस्ताक्षर",
    signed: "हस्ताक्षरित",
    close: "बंद",
  },
} as const;

type I18nKey = keyof typeof i18n.en;
function tr(lang: Lang, key: I18nKey) {
  return i18n[lang][key];
}

function getStreak(completedData: CompletedData, minTasks = 1): number {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 120; i++) {
    const key = d.toISOString().split("T")[0];
    const count = (completedData[key] || []).length;
    if (count >= minTasks) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      if (i === 0) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

function getXP(completedData: CompletedData): number {
  return Object.values(completedData).reduce((sum, arr) => sum + arr.length * 10, 0);
}

function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

function getRank(level: number): string {
  if (level >= 20) return "Arc Master";
  if (level >= 15) return "Iron Will";
  if (level >= 10) return "Warrior";
  if (level >= 5) return "Disciple";
  return "Initiate";
}

function lastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function dayScore(completedData: CompletedData, date: string, taskIds: number[]): number {
  const done = completedData[date] || [];
  if (taskIds.length === 0) return 0;
  return Math.round((done.filter((id) => taskIds.includes(id)).length / taskIds.length) * 100);
}

function daysBetween(start: string, end: string): number {
  const a = new Date(start + "T00:00:00");
  const b = new Date(end + "T00:00:00");
  return Math.floor((b.getTime() - a.getTime()) / 86400000) + 1;
}

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = 0.06;
      o.start(ctx.currentTime + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
      o.stop(ctx.currentTime + i * 0.08 + 0.22);
    });
  } catch {}
}

function speakDone(title: string) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`Done. ${title}`);
    u.lang = "en-IN";
    window.speechSynthesis.speak(u);
  } catch {}
}

function smartBody(lang: Lang, streak: number, missed: boolean): string {
  if (missed) return tr(lang, "smartMiss");
  if (streak >= 3) return tr(lang, "smartStreak");
  return tr(lang, "smartStart");
}

function Heatmap({ dates, scores }: { dates: string[]; scores: number[] }) {
  const color = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 50) return "bg-indigo-500";
    if (s >= 20) return "bg-indigo-300 dark:bg-indigo-800";
    if (s > 0) return "bg-slate-300 dark:bg-slate-700";
    return "bg-slate-100 dark:bg-slate-800";
  };
  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">Last {dates.length} days</p>
      <div className="flex flex-wrap gap-1.5">
        {dates.map((d, i) => (
          <div key={d} title={`${d}: ${scores[i]}%`} className={`w-3.5 h-3.5 rounded-sm ${color(scores[i])}`} />
        ))}
      </div>
    </div>
  );
}

function Pomodoro() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(mode === "focus" ? "Focus done!" : "Break over!");
          }
          setMode(mode === "focus" ? "break" : "focus");
          return mode === "focus" ? 5 * 60 : 25 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running, mode]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 h-full">
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">⏱️ Pomodoro</h3>
      <p className="text-4xl font-bold tabular-nums mb-4 text-slate-900 dark:text-white">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </p>
      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setSeconds(mode === "focus" ? 25 * 60 : 5 * 60);
          }}
          className="px-4 py-2 rounded-xl border text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [completedData, setCompletedData] = useState<CompletedData>({});
  const [planData, setPlanData] = useState<PlanData>({});
  const [planInput, setPlanInput] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");
  const [focus, setFocus] = useState<FocusType>("Study");
  const [badDayMode, setBadDayMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [mood, setMood] = useState<Record<string, Mood>>({});
  const [water, setWater] = useState<Record<string, number>>({});
  const [sleep, setSleep] = useState<Record<string, number>>({});
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});
  const [formulas, setFormulas] = useState<string[]>([]);
  const [formulaInput, setFormulaInput] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [myCode, setMyCode] = useState("");
  const [autoPhase, setAutoPhase] = useState(true);
  const [weeklyGoal, setWeeklyGoal] = useState(80);
  const [accent, setAccent] = useState("indigo");
  const [today, setToday] = useState("");

  // UX + challenge
  const [lang, setLang] = useState<Lang>("en");
  const [themeSkin, setThemeSkin] = useState<Skin>("midnight");
  const [tourStep, setTourStep] = useState(-1);
  const [contractSigned, setContractSigned] = useState(false);
  const [contractText, setContractText] = useState(
    "I will show up for 90 days. Bad days = minimum. No zero days."
  );
  const [nonNeg, setNonNeg] = useState<string[]>([
    "Wake up on time",
    "No junk scroll before deep work",
    "Sleep by 10:30 PM",
  ]);
  const [nonNegInput, setNonNegInput] = useState("");
  const [showMilestones, setShowMilestones] = useState(false);
  const [eveningPrompt, setEveningPrompt] = useState(false);

  useEffect(() => {
    const tdate = new Date().toISOString().split("T")[0];
    setToday(tdate);
    setQuoteIndex(new Date().getDate() % QUOTES.length);

    const savedUser = localStorage.getItem("winter-arc-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep("app");
    } else {
      setStep("intro");
    }

    const load = (key: string, setter: (v: any) => void) => {
      const s = localStorage.getItem(key);
      if (s) {
        try {
          setter(JSON.parse(s));
        } catch {}
      }
    };
    load("winter-arc-data", setCompletedData);
    load("winter-arc-plan", setPlanData);
    load("winter-arc-custom", setCustomTasks);
    load("winter-arc-mood", setMood);
    load("winter-arc-water", setWater);
    load("winter-arc-sleep", setSleep);
    load("winter-arc-notes", setTaskNotes);
    load("winter-arc-formulas", setFormulas);
    load("winter-arc-friends", setFriends);
    load("winter-arc-nonneg", setNonNeg);

    const theme = localStorage.getItem("winter-arc-theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    let start = localStorage.getItem("winter-arc-start");
    if (!start) {
      start = tdate;
      localStorage.setItem("winter-arc-start", start);
    }
    setStartDate(start);

    let code = localStorage.getItem("winter-arc-code");
    if (!code) {
      code = "WA-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      localStorage.setItem("winter-arc-code", code);
    }
    setMyCode(code);

    const goal = localStorage.getItem("winter-arc-weekly-goal");
    if (goal) setWeeklyGoal(Number(goal));

    const savedLang = localStorage.getItem("winter-arc-lang");
    if (savedLang === "hi" || savedLang === "en") setLang(savedLang);

    const skin = localStorage.getItem("winter-arc-skin") as Skin | null;
    if (skin) setThemeSkin(skin);

    if (localStorage.getItem("winter-arc-contract") === "1") setContractSigned(true);
    const ct = localStorage.getItem("winter-arc-contract-text");
    if (ct) setContractText(ct);

    if (typeof Notification !== "undefined") setNotifPermission(Notification.permission);

    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!mounted || step !== "intro" || user) return;
    const timer = setTimeout(() => setStep("login"), 2200);
    return () => clearTimeout(timer);
  }, [mounted, step, user]);

  useEffect(() => {
    if (!mounted || step !== "app") return;
    if (!localStorage.getItem("winter-arc-tour-done")) setTourStep(0);
  }, [mounted, step]);

  const persist = (key: string, value: unknown, ready: boolean) => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  };

  useEffect(() => persist("winter-arc-data", completedData, mounted), [completedData, mounted]);
  useEffect(() => persist("winter-arc-plan", planData, mounted), [planData, mounted]);
  useEffect(() => persist("winter-arc-custom", customTasks, mounted), [customTasks, mounted]);
  useEffect(() => persist("winter-arc-mood", mood, mounted), [mood, mounted]);
  useEffect(() => persist("winter-arc-water", water, mounted), [water, mounted]);
  useEffect(() => persist("winter-arc-sleep", sleep, mounted), [sleep, mounted]);
  useEffect(() => persist("winter-arc-notes", taskNotes, mounted), [taskNotes, mounted]);
  useEffect(() => persist("winter-arc-formulas", formulas, mounted), [formulas, mounted]);
  useEffect(() => persist("winter-arc-friends", friends, mounted), [friends, mounted]);
  useEffect(() => persist("winter-arc-nonneg", nonNeg, mounted), [nonNeg, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-weekly-goal", String(weeklyGoal));
  }, [weeklyGoal, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-lang", lang);
  }, [lang, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-skin", themeSkin);
  }, [themeSkin, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("winter-arc-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("winter-arc-theme", "light");
    }
  }, [darkMode, mounted]);

  const dayNumber =
    startDate && today ? Math.min(90, Math.max(1, daysBetween(startDate, today))) : 1;
  const suggestedPhase: FilterType =
    dayNumber <= 30 ? "Control" : dayNumber <= 60 ? "Capacity" : "Proof";

  useEffect(() => {
    if (autoPhase && mounted) setFilter(suggestedPhase);
  }, [autoPhase, suggestedPhase, mounted]);

  const xpPreview = getXP(completedData);
  const levelPreview = getLevel(xpPreview);
  useEffect(() => {
    if (levelPreview >= 15) setAccent("rose");
    else if (levelPreview >= 10) setAccent("violet");
    else if (levelPreview >= 5) setAccent("emerald");
    else setAccent("indigo");
  }, [levelPreview]);

  const yesterday = useMemo(() => {
    if (!today) return "";
    const d = new Date(today + "T00:00:00");
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }, [today]);

  const missedYesterday =
    !!yesterday && !!startDate && startDate < today && (completedData[yesterday] || []).length === 0;

  const streakEarly = getStreak(completedData);

  // Smart daily reminder + evening review
  useEffect(() => {
    if (!mounted || step !== "app") return;
    const id = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      // evening 20-22
      if (h >= 20 && h <= 22) {
        const key = `evening-${today}`;
        if (!sessionStorage.getItem(key)) {
          setEveningPrompt(true);
          if (notifPermission === "granted") {
            new Notification("Winter Arc", { body: tr(lang, "eveningReview"), icon: "/icon-192.png" });
          }
          sessionStorage.setItem(key, "1");
        }
      }
      // morning-ish smart ping once per day when app open around 6-9
      if (h >= 6 && h <= 9) {
        const key = `morning-${today}`;
        if (!sessionStorage.getItem(key) && notifPermission === "granted") {
          new Notification("Winter Arc", {
            body: smartBody(lang, streakEarly, missedYesterday),
            icon: "/icon-192.png",
          });
          sessionStorage.setItem(key, "1");
        }
      }
    }, 30000);
    return () => clearInterval(id);
  }, [mounted, step, today, lang, notifPermission, streakEarly, missedYesterday]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    const newUser = { name: name.trim(), contact: contact.trim() };
    setUser(newUser);
    localStorage.setItem("winter-arc-user", JSON.stringify(newUser));
    setStep("app");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("winter-arc-user");
    setStep("login");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("PWA install nahi mila.\nAndroid: APK\niPhone: Share → Add to Home Screen");
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const todayCompleted = today ? completedData[today] || [] : [];
  const todayPlan = today ? planData[today] || [] : [];

  const toggleTask = (id: number) => {
    if (!today) return;
    const task = tasks.find((t) => t.id === id);
    setCompletedData((prev) => {
      const current = prev[today] || [];
      const isDone = current.includes(id);
      if (!isDone) {
        playSuccessSound();
        if (task) speakDone(task.taskTitle);
        const note = prompt("Optional note (Cancel = skip):");
        if (note && note.trim()) {
          setTaskNotes((n) => ({ ...n, [`${today}-${id}`]: note.trim() }));
        }
      }
      return {
        ...prev,
        [today]: isDone ? current.filter((t) => t !== id) : [...current, id],
      };
    });
  };

  let filteredTasks = tasks;
  if (focus !== "Both") filteredTasks = filteredTasks.filter((t) => t.focus === focus);
  if (filter !== "All") filteredTasks = filteredTasks.filter((t) => t.phase === filter);
  if (badDayMode || missedYesterday) {
    filteredTasks = filteredTasks.filter((t) => t.badDayMinimum === "Yes");
  }

  const totalTasks = filteredTasks.length;
  const completedCount = filteredTasks.filter((t) => todayCompleted.includes(t.id)).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  useEffect(() => {
    if (!mounted) return;
    if (progress === 100 && totalTasks > 0) {
      setShowConfetti(true);
      try {
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance("Perfect day. Winter Arc strong.");
          u.lang = "en-IN";
          window.speechSynthesis.speak(u);
        }
      } catch {}
      const t = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  }, [progress, totalTasks, mounted]);

  const getDateRange = (days: number) => {
    if (!today) return [];
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today + "T00:00:00");
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const calculateAverage = (dates: string[]) => {
    let totalPossible = 0;
    let totalCompleted = 0;
    dates.forEach((date) => {
      const dayCompleted = completedData[date] || [];
      const relevant = tasks.filter((t) => (focus === "Both" ? true : t.focus === focus));
      totalPossible += relevant.length;
      totalCompleted += dayCompleted.filter((id) => relevant.some((t) => t.id === id)).length;
    });
    return totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
  };

  const weeklyProgress = calculateAverage(getDateRange(7));
  const monthlyProgress = calculateAverage(getDateRange(30));
  const streak = getStreak(completedData);
  const xp = getXP(completedData);
  const level = getLevel(xp);
  const rank = getRank(level);
  const heatDates = lastNDates(28);
  const heatScores = heatDates.map((d) => dayScore(completedData, d, tasks.map((t) => t.id)));
  const studyDone = Object.values(completedData)
    .flat()
    .filter((id) => tasks.some((t) => t.id === id && t.focus === "Study")).length;
  const fitnessDone = Object.values(completedData)
    .flat()
    .filter((id) => tasks.some((t) => t.id === id && t.focus === "Fitness")).length;

  const achievements = [
    { id: "first", title: "First Step", ok: Object.values(completedData).some((a) => a.length > 0) },
    { id: "streak3", title: "3-Day Streak", ok: streak >= 3 },
    { id: "streak7", title: "7-Day Streak", ok: streak >= 7 },
    { id: "xp100", title: "100 XP", ok: xp >= 100 },
    { id: "xp500", title: "500 XP", ok: xp >= 500 },
    { id: "perfect", title: "Perfect Day", ok: Object.values(completedData).some((a) => a.length >= 5) },
    { id: "day30", title: "Day 30", ok: dayNumber >= 30 },
    { id: "both", title: "Study + Fitness", ok: studyDone > 0 && fitnessDone > 0 },
  ];

  const milestones = [
    { day: 7, title: "Week 1 Locked", desc: "7 days of showing up" },
    { day: 21, title: "Habit Forming", desc: "3 weeks deep" },
    { day: 45, title: "Halfway Fire", desc: "Past the middle" },
    { day: 90, title: "Arc Complete", desc: "Full Winter Arc" },
  ];

  const shareCard = async () => {
    const text = `❄️ Winter Arc — Day ${dayNumber}/90\n🔥 Streak: ${streak}\n⚡ XP: ${xp} · L${level} (${rank})\n📊 Today ${progress}% · Week ${weeklyProgress}%\n#WinterArc`;
    try {
      if (navigator.share) await navigator.share({ title: "Winter Arc", text });
      else {
        await navigator.clipboard.writeText(text);
        alert(text);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        alert(text);
      } catch {
        alert(text);
      }
    }
  };

  const exportMyCard = () => {
    const payload = JSON.stringify({ code: myCode, name: user?.name || "Warrior", xp, streak });
    navigator.clipboard.writeText(payload);
    alert("Card copied.");
  };

  const importFriend = () => {
    try {
      const data = JSON.parse(friendCodeInput.trim());
      if (!data.code || !data.name) throw new Error("bad");
      setFriends((f) => {
        const rest = f.filter((x) => x.code !== data.code);
        return [...rest, { code: data.code, name: data.name, xp: data.xp || 0, streak: data.streak || 0 }];
      });
      setFriendCodeInput("");
    } catch {
      alert("Invalid friend card JSON.");
    }
  };

  const leaderboard = [
    { code: myCode, name: user?.name || "You", xp, streak },
    ...friends,
  ].sort((a, b) => b.xp - a.xp);

  const signContract = () => {
    setContractSigned(true);
    localStorage.setItem("winter-arc-contract", "1");
    localStorage.setItem("winter-arc-contract-text", contractText);
  };

  const resetArc = () => {
    if (!confirm("Start a new 90-day Arc? Start date will reset to today.")) return;
    const t0 = new Date().toISOString().split("T")[0];
    localStorage.setItem("winter-arc-start", t0);
    setStartDate(t0);
    localStorage.removeItem("winter-arc-contract");
    setContractSigned(false);
    alert("New Arc — Day 1");
  };

  const btnAccent =
    accent === "rose"
      ? "from-rose-600 to-pink-600"
      : accent === "violet"
        ? "from-violet-600 to-purple-600"
        : accent === "emerald"
          ? "from-emerald-600 to-teal-600"
          : "from-indigo-600 to-violet-600";

  const skinBg =
    themeSkin === "forest"
      ? "from-emerald-50 to-green-100/40 dark:from-slate-950 dark:to-emerald-950/30"
      : themeSkin === "sunset"
        ? "from-orange-50 to-rose-100/40 dark:from-slate-950 dark:to-rose-950/30"
        : themeSkin === "ocean"
          ? "from-sky-50 to-cyan-100/40 dark:from-slate-950 dark:to-cyan-950/30"
          : "from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20";

  const quote = QUOTES[quoteIndex] || QUOTES[0];

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0B0F19" }}>
        <div className="text-center px-6">
          <p className="text-indigo-300 text-xs tracking-[0.2em] uppercase mb-6">90-Day Challenge</p>
          <h1 className="text-5xl font-bold text-white mb-4">
            Winter <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Arc</span>
          </h1>
          <p className="text-slate-500 text-sm">{tr("en", "loading")}</p>
        </div>
      </main>
    );
  }

  if (step === "intro") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0B0F19" }}>
        <div className="text-center px-6">
          <p className="text-indigo-300 text-xs tracking-[0.2em] uppercase mb-6">90-Day Challenge</p>
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-4">
            Winter <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Arc</span>
          </h1>
          <p className="text-slate-400">Discipline. Deep Work. Mastery.</p>
        </div>
      </main>
    );
  }

  if (step === "login") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Winter <span className="text-indigo-400">Arc</span>
          </h1>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white" required />
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or Phone" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white" required />
          <button type="submit" className={`w-full py-3 rounded-xl bg-gradient-to-r ${btnAccent} text-white font-medium`}>
            Enter Winter Arc
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-gradient-to-b ${skinBg}`}>
      {showConfetti && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/25 pointer-events-none">
          <p className="text-5xl animate-bounce">🎉</p>
          <p className="text-2xl font-bold text-white">Perfect Day!</p>
        </div>
      )}

      {tourStep >= 0 && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-xl border">
            <p className="text-sm text-slate-500 mb-1">Tour {tourStep + 1}/4</p>
            <p className="font-semibold mb-4 text-slate-900 dark:text-white">
              {tourStep === 0 && "Track Day 1–90 at the top. Auto Phase follows your journey."}
              {tourStep === 1 && "Complete tasks for XP, streak, sound & voice feedback."}
              {tourStep === 2 && "Use Planning, Pomodoro, Non-negotiables daily."}
              {tourStep === 3 && "Sign your contract, share progress, hit milestones."}
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-xl border text-sm"
                onClick={() => {
                  localStorage.setItem("winter-arc-tour-done", "1");
                  setTourStep(-1);
                }}
              >
                {tr(lang, "tourSkip")}
              </button>
              <button
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm"
                onClick={() => {
                  if (tourStep >= 3) {
                    localStorage.setItem("winter-arc-tour-done", "1");
                    setTourStep(-1);
                  } else setTourStep((s) => s + 1);
                }}
              >
                {tr(lang, "tourNext")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMilestones && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowMilestones(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">{tr(lang, "milestones")}</h3>
            <div className="space-y-2">
              {milestones.map((m) => (
                <div key={m.day} className={`p-3 rounded-xl border text-sm ${dayNumber >= m.day ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40" : "opacity-50"}`}>
                  Day {m.day}: <b>{m.title}</b> — {m.desc} {dayNumber >= m.day ? "✅" : "🔒"}
                </div>
              ))}
            </div>
            <button onClick={() => setShowMilestones(false)} className="mt-4 w-full py-2 rounded-xl border text-sm">
              {tr(lang, "close")}
            </button>
          </div>
        </div>
      )}

      {eveningPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-indigo-600 text-white rounded-2xl p-4 shadow-xl">
          <p className="text-sm mb-2">{tr(lang, "eveningReview")}</p>
          <button onClick={() => setEveningPrompt(false)} className="text-xs underline">
            {tr(lang, "close")}
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              {tr(lang, "day")} {dayNumber} / 90 · {suggestedPhase} {tr(lang, "phase")} · {rank}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Winter <span className={`text-transparent bg-clip-text bg-gradient-to-r ${btnAccent}`}>Arc</span>
            </h1>
            <p className="text-sm text-slate-500">
              {tr(lang, "welcome")}, {user?.name.split(" ")[0]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={shareCard} className="px-3 py-2 rounded-xl bg-sky-600 text-white text-sm">
              📤 {tr(lang, "share")}
            </button>
            <a href="/winter-arc.apk" download className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm">
              ⬇️ APK
            </a>
            <button onClick={handleInstall} className={`px-3 py-2 rounded-xl bg-gradient-to-r ${btnAccent} text-white text-sm`}>
              📲 Install
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-2 rounded-xl border text-sm">
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={handleLogout} className="px-3 py-2 rounded-xl border border-rose-300 text-rose-600 text-sm">
              {tr(lang, "logout")}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="px-3 py-2 rounded-xl border text-sm bg-white dark:bg-slate-900">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
          <select value={themeSkin} onChange={(e) => setThemeSkin(e.target.value as Skin)} className="px-3 py-2 rounded-xl border text-sm bg-white dark:bg-slate-900">
            <option value="midnight">Midnight</option>
            <option value="forest">Forest</option>
            <option value="sunset">Sunset</option>
            <option value="ocean">Ocean</option>
          </select>
          <button onClick={() => setShowMilestones(true)} className="px-3 py-2 rounded-xl border text-sm">
            🏁 {tr(lang, "milestones")}
          </button>
          <button onClick={resetArc} className="px-3 py-2 rounded-xl border border-rose-300 text-rose-600 text-sm">
            {tr(lang, "resetArc")}
          </button>
          <button
            onClick={async () => {
              if (typeof Notification === "undefined") return;
              const p = await Notification.requestPermission();
              setNotifPermission(p);
              if (p === "granted") {
                new Notification("Winter Arc", { body: smartBody(lang, streak, missedYesterday), icon: "/icon-192.png" });
              }
            }}
            className="px-3 py-2 rounded-xl border text-sm"
          >
            🔔 Notify
          </button>
        </div>

        {missedYesterday && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-sm text-amber-800 dark:text-amber-200">
            🛡️ {tr(lang, "recovery")}
          </div>
        )}

        <div className="mb-4 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-900 bg-indigo-50/80 dark:bg-indigo-950/40">
          <p className="text-sm italic text-indigo-800 dark:text-indigo-200">&ldquo;{quote}&rdquo;</p>
        </div>

        {/* Non-negotiables */}
        <div className="mb-4 bg-white dark:bg-slate-900 rounded-2xl p-4 border">
          <h3 className="font-semibold mb-2">📌 {tr(lang, "nonNeg")}</h3>
          <ul className="text-sm space-y-1 mb-2">
            {nonNeg.map((n, i) => (
              <li key={i} className="flex justify-between">
                <span>• {n}</span>
                <button className="text-rose-500" onClick={() => setNonNeg((x) => x.filter((_, j) => j !== i))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input value={nonNegInput} onChange={(e) => setNonNegInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border text-sm" placeholder="Add rule..." />
            <button
              onClick={() => {
                if (!nonNegInput.trim()) return;
                setNonNeg((x) => [...x, nonNegInput.trim()]);
                setNonNegInput("");
              }}
              className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* Contract */}
        <div className="mb-4 bg-white dark:bg-slate-900 rounded-2xl p-4 border">
          <h3 className="font-semibold mb-2">✍️ {tr(lang, "contract")}</h3>
          <textarea
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            disabled={contractSigned}
            className="w-full px-3 py-2 rounded-xl border text-sm mb-2 bg-slate-50 dark:bg-slate-800 min-h-[80px]"
          />
          {contractSigned ? (
            <p className="text-emerald-600 text-sm font-medium">✅ {tr(lang, "signed")}</p>
          ) : (
            <button onClick={signContract} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">
              {tr(lang, "signContract")}
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border">
            <p className="text-sm font-semibold mb-2">😊 Mood</p>
            <div className="flex gap-2">
              {(["great", "ok", "low"] as Mood[]).map((m) => (
                <button key={m} onClick={() => setMood((x) => ({ ...x, [today]: m }))} className={`px-3 py-1.5 rounded-lg text-sm ${mood[today] === m ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                  {m === "great" ? "😄" : m === "ok" ? "😐" : "😓"}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border">
            <p className="text-sm font-semibold mb-2">💧 Water</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setWater((w) => ({ ...w, [today]: Math.max(0, (w[today] || 0) - 1) }))} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">−</button>
              <span className="text-2xl font-bold">{water[today] || 0}</span>
              <button onClick={() => setWater((w) => ({ ...w, [today]: (w[today] || 0) + 1 }))} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">+</button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border">
            <p className="text-sm font-semibold mb-2">😴 Sleep</p>
            <input type="number" min={0} max={14} step={0.5} value={sleep[today] ?? ""} onChange={(e) => setSleep((s) => ({ ...s, [today]: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm" placeholder="7.5" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["Study", "Fitness", "Both"] as FocusType[]).map((f) => (
            <button key={f} onClick={() => setFocus(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold ${focus === f ? `bg-gradient-to-r ${btnAccent} text-white` : "border bg-white dark:bg-slate-900"}`}>
              {f === "Study" ? tr(lang, "study") : f === "Fitness" ? tr(lang, "fitness") : tr(lang, "both")}
            </button>
          ))}
          <button onClick={() => setAutoPhase(!autoPhase)} className={`px-4 py-2 rounded-xl text-sm ${autoPhase ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border"}`}>
            {tr(lang, "autoPhase")}: {autoPhase ? "ON" : "OFF"}
          </button>
          <button onClick={() => setBadDayMode(!badDayMode)} className={`px-4 py-2 rounded-xl text-sm ${badDayMode ? "bg-rose-600 text-white" : "border"}`}>
            {tr(lang, "badDay")}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border"><p className="text-xs text-slate-500">Streak</p><p className="text-2xl font-bold text-orange-500">🔥 {streak}</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border"><p className="text-xs text-slate-500">XP</p><p className="text-2xl font-bold text-indigo-600">{xp}</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border"><p className="text-xs text-slate-500">Level</p><p className="text-2xl font-bold">{level}</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border"><p className="text-xs text-slate-500">Week {weeklyGoal}%</p><p className={`text-2xl font-bold ${weeklyProgress >= weeklyGoal ? "text-emerald-600" : "text-amber-600"}`}>{weeklyProgress}%</p></div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border text-center"><p className="text-xs text-slate-500">Today</p><p className="text-2xl font-bold">{progress}%</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border text-center"><p className="text-xs text-slate-500">Week</p><p className="text-2xl font-bold text-indigo-600">{weeklyProgress}%</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border text-center"><p className="text-xs text-slate-500">Month</p><p className="text-2xl font-bold text-violet-600">{monthlyProgress}%</p></div>
        </div>

        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-4 border">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
            <div className={`h-full rounded-full bg-gradient-to-r ${btnAccent}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border">
            <h3 className="font-semibold mb-3">📅 Consistency</h3>
            <Heatmap dates={heatDates} scores={heatScores} />
          </div>
          <Pomodoro />
        </div>

        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border">
          <h3 className="font-semibold mb-3">🏆 Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {achievements.map((a) => (
              <div key={a.id} className={`p-3 rounded-xl text-sm border ${a.ok ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40" : "opacity-50"}`}>
                {a.ok ? "✅" : "🔒"} {a.title}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border">
          <h3 className="font-semibold mb-2">👥 Accountability · {myCode}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={exportMyCard} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm">Export card</button>
            <input value={friendCodeInput} onChange={(e) => setFriendCodeInput(e.target.value)} placeholder="Friend JSON..." className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border text-sm" />
            <button onClick={importFriend} className="px-3 py-2 rounded-xl border text-sm">Import</button>
          </div>
          {leaderboard.map((p, i) => (
            <div key={p.code + i} className="flex justify-between text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 mb-1">
              <span>#{i + 1} {p.name}{p.code === myCode ? " (You)" : ""}</span>
              <span className="font-semibold">{p.xp} XP · 🔥{p.streak}</span>
            </div>
          ))}
        </div>

        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border">
          <h3 className="font-semibold mb-2">📘 Formula locker</h3>
          <div className="flex gap-2 mb-3">
            <input value={formulaInput} onChange={(e) => setFormulaInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border text-sm" placeholder="Formula..." />
            <button onClick={() => { if (!formulaInput.trim()) return; setFormulas((f) => [...f, formulaInput.trim()]); setFormulaInput(""); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">Save</button>
          </div>
          {formulas.map((f, i) => (
            <div key={i} className="flex justify-between text-sm px-2 py-1">
              {f}
              <button className="text-rose-500" onClick={() => setFormulas((x) => x.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>

        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border">
          <h3 className="font-semibold mb-2">📝 Planning</h3>
          <div className="flex gap-2 mb-3">
            <input value={planInput} onChange={(e) => setPlanInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border text-sm" />
            <button onClick={() => { if (!planInput.trim() || !today) return; setPlanData((p) => ({ ...p, [today]: [...(p[today] || []), planInput.trim()] })); setPlanInput(""); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">Add</button>
          </div>
          {todayPlan.map((item, i) => (
            <div key={i} className="flex justify-between text-sm px-2 py-1">
              {item}
              <button className="text-rose-500" onClick={() => setPlanData((p) => ({ ...p, [today]: (p[today] || []).filter((_, j) => j !== i) }))}>×</button>
            </div>
          ))}
          <h3 className="font-semibold mb-2 mt-4">✨ Custom</h3>
          <div className="flex gap-2 mb-2">
            <input value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border text-sm" />
            <button onClick={() => { if (!customInput.trim()) return; setCustomTasks((c) => [...c, { id: Date.now(), title: customInput.trim() }]); setCustomInput(""); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">Add</button>
          </div>
          {customTasks.map((t) => (
            <div key={t.id} className="flex justify-between text-sm px-2 py-1">
              {t.title}
              <button className="text-rose-500" onClick={() => setCustomTasks((c) => c.filter((x) => x.id !== t.id))}>×</button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["All", "Control", "Capacity", "Proof"] as FilterType[]).map((f) => (
            <button key={f} onClick={() => { setAutoPhase(false); setFilter(f); }} className={`px-4 py-2 rounded-xl text-sm ${filter === f ? `bg-gradient-to-r ${btnAccent} text-white` : "border bg-white dark:bg-slate-900"}`}>
              {f}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-2 sm:hidden">Tip: Tap task card to complete</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTasks.map((task) => (
            <div key={task.id}>
              <TaskCard task={task} isCompleted={todayCompleted.includes(task.id)} onToggle={toggleTask} />
              {taskNotes[`${today}-${task.id}`] && (
                <p className="text-xs text-slate-500 mt-1 px-2">📝 {taskNotes[`${today}-${task.id}`]}</p>
              )}
            </div>
          ))}
        </div>
        {filteredTasks.length === 0 && <p className="text-center text-slate-400 py-12">No tasks.</p>}
      </div>
    </main>
  );
}