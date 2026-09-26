"use client";

import { useState, useEffect } from "react";
import { tasks } from "@/data/tasks";
import TaskCard from "@/components/TaskCard";

type FilterType = "All" | "Control" | "Capacity" | "Proof";
type FocusType = "Study" | "Fitness" | "Both";
type Step = "intro" | "login" | "app";

type CompletedData = {
  [date: string]: number[];
};

type PlanData = {
  [date: string]: string[];
};

type User = {
  name: string;
  contact: string;
};

export default function Home() {
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

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const savedUser = localStorage.getItem("winter-arc-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep("app");
    }

    const savedCompleted = localStorage.getItem("winter-arc-data");
    if (savedCompleted) setCompletedData(JSON.parse(savedCompleted));

    const savedPlan = localStorage.getItem("winter-arc-plan");
    if (savedPlan) setPlanData(JSON.parse(savedPlan));

    const savedTheme = localStorage.getItem("winter-arc-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission);
    }
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
    if (step === "intro") {
      const timer = setTimeout(() => setStep("login"), 2200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    localStorage.setItem("winter-arc-data", JSON.stringify(completedData));
  }, [completedData]);

  useEffect(() => {
    localStorage.setItem("winter-arc-plan", JSON.stringify(planData));
  }, [planData]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("winter-arc-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("winter-arc-theme", "light");
    }
  }, [darkMode]);

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
      alert(
        "PWA install is browser mein available nahi.\n\nAndroid: neeche Download APK use karo\n\niPhone: Share → Add to Home Screen"
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  const todayCompleted = completedData[today] || [];
  const todayPlan = planData[today] || [];

  const toggleTask = (id: number) => {
    setCompletedData((prev) => {
      const current = prev[today] || [];
      const updated = current.includes(id)
        ? current.filter((t) => t !== id)
        : [...current, id];
      return { ...prev, [today]: updated };
    });
  };

  const addPlanItem = () => {
    if (!planInput.trim()) return;
    setPlanData((prev) => ({
      ...prev,
      [today]: [...(prev[today] || []), planInput.trim()],
    }));
    setPlanInput("");
  };

  const removePlanItem = (index: number) => {
    setPlanData((prev) => ({
      ...prev,
      [today]: (prev[today] || []).filter((_, i) => i !== index),
    }));
  };

  const requestNotification = async () => {
    if (typeof Notification === "undefined") {
      alert("Ye browser notifications support nahi karta");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === "granted") {
      new Notification("Winter Arc", {
        body: "Notifications on! Discipline yaad dilata rahunga.",
        icon: "/icon-192.png",
      });
    }
  };

  const sendTestNotification = () => {
    if (notifPermission === "granted") {
      new Notification("Winter Arc Reminder", {
        body: `${user?.name?.split(" ")[0] || "Warrior"}, aaj ke tasks complete kiye? Let's go!`,
        icon: "/icon-192.png",
      });
    } else {
      requestNotification();
    }
  };

  let filteredTasks = tasks;
  if (focus !== "Both") filteredTasks = filteredTasks.filter((t) => t.focus === focus);
  if (filter !== "All") filteredTasks = filteredTasks.filter((t) => t.phase === filter);
  if (badDayMode) filteredTasks = filteredTasks.filter((t) => t.badDayMinimum === "Yes");

  const totalTasks = filteredTasks.length;
  const completedCount = filteredTasks.filter((t) => todayCompleted.includes(t.id)).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  const getDateRange = (days: number) => {
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
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
      const relevantTasks = tasks.filter((t) =>
        focus === "Both" ? true : t.focus === focus
      );
      totalPossible += relevantTasks.length;
      totalCompleted += dayCompleted.filter((id) =>
        relevantTasks.some((t) => t.id === id)
      ).length;
    });
    return totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
  };

  const weeklyProgress = calculateAverage(getDateRange(7));
  const monthlyProgress = calculateAverage(getDateRange(30));

  // INTRO
  if (step === "intro") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#0B0F19" }}>
        <div className="text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-[0.2em] uppercase mb-8">
            90-Day Challenge
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-6">
            Winter{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              Arc
            </span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-lg mx-auto font-light">
            Discipline. Deep Work. Mathematical Mastery.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          </div>
        </div>
      </main>
    );
  }

  // LOGIN
  if (step === "login") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-[0.2em] uppercase mb-6">
              90-Day Challenge
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
              Winter{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Arc
              </span>
            </h1>
            <p className="text-slate-400">Login to begin your journey</p>
          </div>

          <form onSubmit={handleLogin} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-xl">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email or Phone</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="email@example.com or 9876543210"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/20"
              >
                Enter Winter Arc
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // MAIN APP
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-3">
              Welcome, {user?.name.split(" ")[0]}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Winter{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                Arc
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download APK */}
            <a
              href="/winter-arc.apk"
              download="Winter-Arc.apk"
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium shadow-md shadow-emerald-500/25"
            >
              ⬇️ Download APK
            </a>

            {/* PWA Install */}
            <button
              onClick={handleInstall}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium shadow-md shadow-indigo-500/25"
            >
              📲 Install App
            </button>

            <button
              onClick={sendTestNotification}
              className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-sm font-medium"
            >
              🔔 Notify
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Focus Switch */}
        <div className="flex gap-2 mb-6">
          {(["Study", "Fitness", "Both"] as FocusType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFocus(f)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                focus === f
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {f === "Study" ? "📚 Study" : f === "Fitness" ? "💪 Fitness" : "🔥 Both"}
            </button>
          ))}
        </div>

        {/* Reports */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Today</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{progress}%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">This Week</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{weeklyProgress}%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">This Month</p>
            <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{monthlyProgress}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white/80 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-end mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today&apos;s Progress</p>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Daily Planning */}
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">📝 Daily Planning</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Kal ki planning / aaj ke extra goals yahan likho
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={planInput}
              onChange={(e) => setPlanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlanItem()}
              placeholder="e.g. Mock test revise, 5km run, sleep early..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <button
              onClick={addPlanItem}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
            >
              Add
            </button>
          </div>
          {todayPlan.length === 0 ? (
            <p className="text-sm text-slate-400">Abhi koi plan nahi. Upar se add karo.</p>
          ) : (
            <ul className="space-y-2">
              {todayPlan.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-200">{item}</span>
                  <button
                    onClick={() => removePlanItem(index)}
                    className="text-rose-500 hover:text-rose-400 text-sm font-medium shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["All", "Control", "Capacity", "Proof"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setBadDayMode(!badDayMode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              badDayMode
                ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {badDayMode ? "🔥 Bad Day ON" : "Bad Day Mode"}
          </button>
        </div>

        {/* Tasks */}
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted={todayCompleted.includes(task.id)}
              onToggle={toggleTask}
            />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <p className="text-center text-slate-400 py-16">Is filter pe koi task nahi mila.</p>
        )}
      </div>
    </main>
  );
}