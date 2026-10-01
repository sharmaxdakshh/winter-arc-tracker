import { Task } from "@/types/task";

export type CompletedData = { [date: string]: number[] };

export function getStreak(completedData: CompletedData, minTasks = 1): number {
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

export function getXP(completedData: CompletedData): number {
  return Object.values(completedData).reduce((sum, arr) => sum + arr.length * 10, 0);
}

export function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getRank(level: number): string {
  if (level >= 20) return "Arc Master";
  if (level >= 15) return "Iron Will";
  if (level >= 10) return "Warrior";
  if (level >= 5) return "Disciple";
  return "Initiate";
}

export function lastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export function dayScore(completedData: CompletedData, date: string, taskIds: number[]): number {
  const done = completedData[date] || [];
  if (taskIds.length === 0) return 0;
  const hit = done.filter((id) => taskIds.includes(id)).length;
  return Math.round((hit / taskIds.length) * 100);
}