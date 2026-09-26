export type Task = {
  id: number;
  taskTitle: string;
  taskCategory: "Fixed Core Rule" | "Focus Goal";
  phase: "Control" | "Capacity" | "Proof";
  description: string;
  badDayMinimum: "Yes" | "No";
};