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
      className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 select-none border
        ${
          isCompleted
            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-950/50 dark:to-teal-950/40 dark:border-emerald-800"
            : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/40 hover:-translate-y-1 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500 dark:hover:shadow-indigo-900/20"
        }`}
    >
      {/* Check Circle */}
      <div className="absolute top-5 right-5">
        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300
            ${
              isCompleted
                ? "bg-emerald-500 border-emerald-500 text-white scale-105"
                : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-500"
            }`}
        >
          {isCompleted && (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className={`text-[17px] font-semibold leading-snug pr-10 mb-3 transition-colors
          ${isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}
      >
        {task.taskTitle}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {task.phase}
        </span>
        <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          {task.taskCategory}
        </span>
        {task.badDayMinimum === "Yes" && (
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            Bad Day
          </span>
        )}
      </div>

      {/* Description */}
      <p
        className={`text-sm leading-relaxed ${
          isCompleted ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {task.description}
      </p>
    </div>
  );
}