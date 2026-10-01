import { Task } from "@/types/task";

type Props = {
  task: Task;
  isCompleted: boolean;
  onToggle: (id: number) => void;
};

export default function TaskCard({ task, isCompleted, onToggle }: Props) {
  return (
    <div
      onClick={() => onToggle(task.id)}
      className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 select-none border overflow-hidden
        ${
          isCompleted
            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-lg shadow-emerald-500/20 scale-[0.98] dark:from-emerald-950/50 dark:to-teal-950/40 dark:border-emerald-700"
            : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 active:scale-[0.98] dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500 dark:hover:shadow-indigo-900/30"
        }`}
    >
      {/* Shine on complete */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse pointer-events-none" />
      )}

      {/* Check */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300
            ${
              isCompleted
                ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40"
                : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 group-hover:scale-105"
            }`}
        >
          {isCompleted ? "✓" : ""}
        </div>
      </div>

      <h3
        className={`text-[16px] font-semibold pr-10 mb-2 transition-all duration-300
          ${isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}
      >
        {task.taskTitle}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {task.phase}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          {task.focus}
        </span>
        {task.badDayMinimum === "Yes" && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            Bad Day
          </span>
        )}
        {isCompleted && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-500 text-white animate-pulse">
            Done +10 XP
          </span>
        )}
      </div>

      <p
        className={`text-sm leading-relaxed relative z-10 ${
          isCompleted ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {task.description}
      </p>
    </div>
  );
}