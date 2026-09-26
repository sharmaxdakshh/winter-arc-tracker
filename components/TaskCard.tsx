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
      className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 select-none border
        ${
          isCompleted
            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
            : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500"
        }`}
    >
      <div className="absolute top-4 right-4">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
            ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600"}`}
        >
          {isCompleted && "✓"}
        </div>
      </div>

      <h3 className={`text-[16px] font-semibold pr-8 mb-2 ${isCompleted ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
        {task.taskTitle}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {task.phase}
        </span>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          {task.focus}
        </span>
        {task.badDayMinimum === "Yes" && (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            Bad Day
          </span>
        )}
      </div>

      <p className={`text-sm leading-relaxed ${isCompleted ? "text-slate-400" : "text-slate-600 dark:text-slate-400"}`}>
        {task.description}
      </p>
    </div>
  );
}