"use client";

import { useState, useEffect } from "react";
import { tasks } from "@/data/tasks";
import TaskCard from "@/components/TaskCard";

type FilterType = "All" | "Control" | "Capacity" | "Proof";

type CompletedData = {
  [date: string]: number[];
};

type User = {
  name: string;
  contact: string;
};

export default function Home() {
  const [step, setStep] = useState<"intro" | "login" | "app">("intro");
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [completedData, setCompletedData] = useState<CompletedData>({});
  const [filter, setFilter] = useState<FilterType>("All");
  const [badDayMode, setBadDayMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Load saved data
  useEffect(() => {
    const savedUser = localStorage.getItem("winter-arc-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep("app"); // agar already login hai to seedha app pe jao
    }

    const saved = localStorage.getItem("winter-arc-data");
    if (saved) {
      setCompletedData(JSON.parse(saved));
    }

    const savedTheme = localStorage.getItem("winter-arc-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Intro → Login (2.2 second baad)
  useEffect(() => {
    if (step === "intro") {
      const timer = setTimeout(() => {
        setStep("login");
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Save progress
  useEffect(() => {
    localStorage.setItem("winter-arc-data", JSON.stringify(completedData));
  }, [completedData]);

  // Dark mode
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

  const todayCompleted = completedData[today] || [];

  const toggleTask = (id: number) => {
    setCompletedData((prev) => {
      const current = prev[today] || [];
      const updated = current.includes(id)
        ? current.filter((t) => t !== id)
        : [...current, id];
      return { ...prev, [today]: updated };
    });
  };

  let filteredTasks = tasks;
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
      totalPossible += tasks.length;
      totalCompleted += dayCompleted.length;
    });
    return totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
  };

  const weeklyProgress = calculateAverage(getDateRange(7));
  const monthlyProgress = calculateAverage(getDateRange(30));

  // ====================== 1. INTRO PAGE ======================
  if (step === "intro") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: "#0B0F19" }}
      >
        <div className="text-center px-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-[0.2em] uppercase mb-8">
            90-Day Challenge
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-6">
            Winter{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              Arc
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-lg mx-auto leading-relaxed font-light">
            Discipline. Deep Work. Mathematical Mastery.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          </div>
        </div>
      </main>
    );
  }

  // ====================== 2. LOGIN PAGE ======================
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

          <form
            onSubmit={handleLogin}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-xl"
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="email@example.com or 9876543210"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:from-indigo-500 hover:to-violet-500 transition shadow-lg shadow-indigo-500/20"
              >
                Enter Winter Arc
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // ====================== 3. MAIN APP (Tasks + Reports) ======================
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-4">
              Welcome, {user?.name.split(" ")[0]}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Winter{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                Arc
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Reports */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
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
        <div className="mb-10 bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-end mb-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today&apos;s Progress</p>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {(["All", "Control", "Capacity", "Proof"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setBadDayMode(!badDayMode)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              badDayMode
                ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {badDayMode ? "🔥 Bad Day Mode" : "Bad Day Mode"}
          </button>
        </div>

        {/* Tasks */}
        <div className="grid gap-5 sm:grid-cols-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted={todayCompleted.includes(task.id)}
              onToggle={toggleTask}
            />
          ))}
        </div>
      </div>
    </main>
  );
}