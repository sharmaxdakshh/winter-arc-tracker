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

const QUOTES = [
  "Discipline is choosing what you want most over what you want now.",
  "Show up. Especially on the hard days.",
  "Small daily progress beats rare big leaps.",
  "Winter Arc: build the version that doesn't quit.",
  "One focused block at a time.",
  "Consistency compounds. Excuses don't.",
];

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
    u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch {}
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
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
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
  const [reminderTime, setReminderTime] = useState("06:00");
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

  useEffect(() => {
    const t = new Date().toISOString().split("T")[0];
    setToday(t);
    setQuoteIndex(new Date().getDate() % QUOTES.length);

    const savedUser = localStorage.getItem("winter-arc-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep("app");
    } else {
      setStep("intro");
      const introTimer = setTimeout(() => setStep("login"), 2200);
      // cleanup via mounted path — store timer
      (window as any).__winterIntroTimer = introTimer;
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

    const theme = localStorage.getItem("winter-arc-theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    const rem = localStorage.getItem("winter-arc-reminder");
    if (rem) setReminderTime(rem);

    let start = localStorage.getItem("winter-arc-start");
    if (!start) {
      start = t;
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

    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission);
    }

    setMounted(true);

    return () => {
      if ((window as any).__winterIntroTimer) {
        clearTimeout((window as any).__winterIntroTimer);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Intro → login only when not logged in
  useEffect(() => {
    if (!mounted || step !== "intro") return;
    if (user) return;
    const timer = setTimeout(() => setStep("login"), 2200);
    return () => clearTimeout(timer);
  }, [mounted, step, user]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-data", JSON.stringify(completedData));
  }, [completedData, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-plan", JSON.stringify(planData));
  }, [planData, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-custom", JSON.stringify(customTasks));
  }, [customTasks, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-mood", JSON.stringify(mood));
  }, [mood, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-water", JSON.stringify(water));
  }, [water, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-sleep", JSON.stringify(sleep));
  }, [sleep, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-notes", JSON.stringify(taskNotes));
  }, [taskNotes, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-formulas", JSON.stringify(formulas));
  }, [formulas, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-friends", JSON.stringify(friends));
  }, [friends, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-reminder", reminderTime);
  }, [reminderTime, mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("winter-arc-weekly-goal", String(weeklyGoal));
  }, [weeklyGoal, mounted]);

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
    !!yesterday &&
    !!startDate &&
    startDate < today &&
    (completedData[yesterday] || []).length === 0;

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
      alert("PWA install nahi mila.\nAndroid: APK use karo\niPhone: Share → Add to Home Screen");
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
        const note = prompt("Optional note / reflection (Cancel = skip):");
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
    { id: "day30", title: "Day 30 Reached", ok: dayNumber >= 30 },
    { id: "both", title: "Study + Fitness", ok: studyDone > 0 && fitnessDone > 0 },
  ];

  const shareCard = async () => {
    const text = `❄️ Winter Arc — Day ${dayNumber}/90\n🔥 Streak: ${streak}\n⚡ XP: ${xp} · Level ${level} (${rank})\n📊 Today: ${progress}% · Week: ${weeklyProgress}%\nCode: ${myCode}\n#WinterArc`;
    try {
      if (navigator.share) await navigator.share({ title: "Winter Arc", text });
      else {
        await navigator.clipboard.writeText(text);
        alert("Progress card copy ho gaya!\n\n" + text);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        alert("Clipboard pe copy:\n\n" + text);
      } catch {
        alert(text);
      }
    }
  };

  const exportMyCard = () => {
    const payload = JSON.stringify({ code: myCode, name: user?.name || "Warrior", xp, streak });
    navigator.clipboard.writeText(payload);
    alert("Partner card clipboard pe copy. Friend ko bhejo.");
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
      alert("Friend add ho gaya!");
    } catch {
      alert("Galat format. Friend ka Export card paste karo.");
    }
  };

  const leaderboard = [
    { code: myCode, name: user?.name || "You", xp, streak },
    ...friends,
  ].sort((a, b) => b.xp - a.xp);

  const btnAccent =
    accent === "rose"
      ? "from-rose-600 to-pink-600"
      : accent === "violet"
        ? "from-violet-600 to-purple-600"
        : accent === "emerald"
          ? "from-emerald-600 to-teal-600"
          : "from-indigo-600 to-violet-600";

  const quote = QUOTES[quoteIndex] || QUOTES[0];

  // ——— Hydration-safe loading (server + first client paint same) ———
  if (!mounted) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0B0F19" }}
      >
        <div className="text-center px-6">
          <p className="text-indigo-300 text-xs tracking-[0.2em] uppercase mb-6">90-Day Challenge</p>
          <h1 className="text-5xl font-bold text-white mb-4">
            Winter{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Arc
            </span>
          </h1>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  if (step === "intro") {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0B0F19" }}
      >
        <div className="text-center px-6">
          <p className="text-indigo-300 text-xs tracking-[0.2em] uppercase mb-6">90-Day Challenge</p>
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-4">
            Winter{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Arc
            </span>
          </h1>
          <p className="text-slate-400">Discipline. Deep Work. Mastery.</p>
        </div>
      </main>
    );
  }

  if (step === "login") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4"
        >
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Winter <span className="text-indigo-400">Arc</span>
          </h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
            required
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or Phone"
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
            required
          />
          <button
            type="submit"
            className={`w-full py-3 rounded-xl bg-gradient-to-r ${btnAccent} text-white font-medium`}
          >
            Enter Winter Arc
          </button>
        </form>
      </main>
    );
  }

  // ——— MAIN APP ———
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20">
      {showConfetti && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/25 pointer-events-none">
          <p className="text-5xl animate-bounce">🎉</p>
          <p className="text-2xl font-bold text-white">Perfect Day!</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              Day {dayNumber} / 90 · {suggestedPhase} Phase · {rank}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Winter{" "}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${btnAccent}`}>
                Arc
              </span>
            </h1>
            <p className="text-sm text-slate-500">Welcome, {user?.name.split(" ")[0]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={shareCard} className="px-3 py-2 rounded-xl bg-sky-600 text-white text-sm">
              📤 Share
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
              Logout
            </button>
          </div>
        </div>

        {missedYesterday && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-sm text-amber-800 dark:text-amber-200">
            🛡️ <b>Recovery mode:</b> Kal miss hua. Aaj Bad Day minimum tasks.
          </div>
        )}

        <div className="mb-4 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-900 bg-indigo-50/80 dark:bg-indigo-950/40">
          <p className="text-sm italic text-indigo-800 dark:text-indigo-200">&ldquo;{quote}&rdquo;</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold mb-2">😊 Mood</p>
            <div className="flex gap-2">
              {(["great", "ok", "low"] as Mood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood((x) => ({ ...x, [today]: m }))}
                  className={`px-3 py-1.5 rounded-lg text-sm ${mood[today] === m ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
                >
                  {m === "great" ? "😄" : m === "ok" ? "😐" : "😓"}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold mb-2">💧 Water</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setWater((w) => ({ ...w, [today]: Math.max(0, (w[today] || 0) - 1) }))} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">−</button>
              <span className="text-2xl font-bold">{water[today] || 0}</span>
              <button onClick={() => setWater((w) => ({ ...w, [today]: (w[today] || 0) + 1 }))} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">+</button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold mb-2">😴 Sleep (hrs)</p>
            <input
              type="number"
              min={0}
              max={14}
              step={0.5}
              value={sleep[today] ?? ""}
              onChange={(e) => setSleep((s) => ({ ...s, [today]: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm"
              placeholder="7.5"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["Study", "Fitness", "Both"] as FocusType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFocus(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${focus === f ? `bg-gradient-to-r ${btnAccent} text-white` : "border bg-white dark:bg-slate-900"}`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setAutoPhase(!autoPhase)}
            className={`px-4 py-2 rounded-xl text-sm ${autoPhase ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border"}`}
          >
            Auto Phase: {autoPhase ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setBadDayMode(!badDayMode)}
            className={`px-4 py-2 rounded-xl text-sm ${badDayMode ? "bg-rose-600 text-white" : "border"}`}
          >
            Bad Day
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border"><p className="text-xs text-slate-500">Streak</p><p className="text-2xl font-bold text-orange-500">🔥 {streak}</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border"><p className="text-xs text-slate-500">XP</p><p className="text-2xl font-bold text-indigo-600">{xp}</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border"><p className="text-xs text-slate-500">Level</p><p className="text-2xl font-bold">{level}</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border"><p className="text-xs text-slate-500">Week goal {weeklyGoal}%</p><p className={`text-2xl font-bold ${weeklyProgress >= weeklyGoal ? "text-emerald-600" : "text-amber-600"}`}>{weeklyProgress}%</p></div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-slate-500">Weekly goal:</span>
          <input type="number" min={50} max={100} value={weeklyGoal} onChange={(e) => setWeeklyGoal(Number(e.target.value))} className="w-20 px-2 py-1 rounded-lg border bg-white dark:bg-slate-900" />
          <span className="text-slate-400">%</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border text-center"><p className="text-xs text-slate-500">Today</p><p className="text-2xl font-bold">{progress}%</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border text-center"><p className="text-xs text-slate-500">Week</p><p className="text-2xl font-bold text-indigo-600">{weeklyProgress}%</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border text-center"><p className="text-xs text-slate-500">Month</p><p className="text-2xl font-bold text-violet-600">{monthlyProgress}%</p></div>
        </div>

        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-4 border">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
            <div className={`h-full rounded-full bg-gradient-to-r ${btnAccent} transition-all`} style={{ width: `${progress}%` }} />
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
          <h3 className="font-semibold mb-2">👥 Accountability</h3>
          <p className="text-xs text-slate-500 mb-3">Code: <b>{myCode}</b></p>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={exportMyCard} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm">Export my card</button>
            <input value={friendCodeInput} onChange={(e) => setFriendCodeInput(e.target.value)} placeholder="Friend JSON paste..." className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800" />
            <button onClick={importFriend} className="px-3 py-2 rounded-xl border text-sm">Import friend</button>
          </div>
          <div className="space-y-2">
            {leaderboard.map((p, i) => (
              <div key={p.code + i} className="flex justify-between text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span>#{i + 1} {p.name} {p.code === myCode ? "(You)" : ""}</span>
                <span className="font-semibold">{p.xp} XP · 🔥{p.streak}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border">
          <h3 className="font-semibold mb-2">📘 Formula locker</h3>
          <div className="flex gap-2 mb-3">
            <input value={formulaInput} onChange={(e) => setFormulaInput(e.target.value)} placeholder="Formula / note..." className="flex-1 px-3 py-2 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800" />
            <button onClick={() => { if (!formulaInput.trim()) return; setFormulas((f) => [...f, formulaInput.trim()]); setFormulaInput(""); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">Save</button>
          </div>
          <ul className="space-y-1 text-sm">
            {formulas.map((f, i) => (
              <li key={i} className="flex justify-between px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span>{f}</span>
                <button className="text-rose-500" onClick={() => setFormulas((x) => x.filter((_, j) => j !== i))}>×</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border">
          <h3 className="font-semibold mb-2">📝 Daily Planning</h3>
          <div className="flex gap-2 mb-3">
            <input value={planInput} onChange={(e) => setPlanInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border text-sm" placeholder="Plan..." />
            <button onClick={() => { if (!planInput.trim() || !today) return; setPlanData((p) => ({ ...p, [today]: [...(p[today] || []), planInput.trim()] })); setPlanInput(""); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">Add</button>
          </div>
          <ul className="text-sm space-y-1 mb-4">
            {todayPlan.map((item, i) => (
              <li key={i} className="flex justify-between px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded">
                {item}
                <button className="text-rose-500" onClick={() => setPlanData((p) => ({ ...p, [today]: (p[today] || []).filter((_, j) => j !== i) }))}>×</button>
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mb-2">✨ Custom tasks</h3>
          <div className="flex gap-2 mb-2">
            <input value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border text-sm" placeholder="Custom task" />
            <button onClick={() => { if (!customInput.trim()) return; setCustomTasks((c) => [...c, { id: Date.now(), title: customInput.trim() }]); setCustomInput(""); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">Add</button>
          </div>
          {customTasks.map((t) => (
            <div key={t.id} className="flex justify-between text-sm px-2 py-1">
              {t.title}
              <button className="text-rose-500" onClick={() => setCustomTasks((c) => c.filter((x) => x.id !== t.id))}>×</button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(["All", "Control", "Capacity", "Proof"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setAutoPhase(false);
                setFilter(f);
              }}
              className={`px-4 py-2 rounded-xl text-sm ${filter === f ? `bg-gradient-to-r ${btnAccent} text-white` : "border bg-white dark:bg-slate-900"}`}
            >
              {f}
            </button>
          ))}
        </div>

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
        {filteredTasks.length === 0 && (
          <p className="text-center text-slate-400 py-12">No tasks for this filter.</p>
        )}
      </div>
    </main>
  );
}