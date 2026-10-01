"use client";

import { useState, useEffect, useRef } from "react";

export default function Pomodoro() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(mode === "focus" ? "Focus done! Break lo." : "Break over! Focus mode.");
          }
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

  const switchMode = (m: "focus" | "break") => {
    setRunning(false);
    setMode(m);
    setSeconds(m === "focus" ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">⏱️ Pomodoro</h3>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => switchMode("focus")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === "focus" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
        >
          Focus 25m
        </button>
        <button
          onClick={() => switchMode("break")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === "break" ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
        >
          Break 5m
        </button>
      </div>
      <p className="text-4xl font-bold tabular-nums text-slate-900 dark:text-white mb-4">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning(!running)}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium"
        >
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