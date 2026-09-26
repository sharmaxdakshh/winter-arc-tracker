import { Task } from "@/types/task";

export const tasks: Task[] = [
  // ========== STUDY - CONTROL ==========
  { id: 1, taskTitle: "5 AM Wake-Up + Make Bed", taskCategory: "Fixed Core Rule", phase: "Control", description: "Din ki pehli jeet. 5 AM uth, bed bana, Winter Arc mode ON.", badDayMinimum: "Yes", focus: "Study" },
  { id: 2, taskTitle: "Cold Shower (2-3 min)", taskCategory: "Fixed Core Rule", phase: "Control", description: "Thanda paani se mind aur body tough banao.", badDayMinimum: "Yes", focus: "Study" },
  { id: 3, taskTitle: "3 Litres Water Tracking", taskCategory: "Fixed Core Rule", phase: "Control", description: "Pani = brain fuel. Din bhar 3 litre minimum.", badDayMinimum: "Yes", focus: "Study" },
  { id: 4, taskTitle: "Clean Plate + Protein Focus", taskCategory: "Fixed Core Rule", phase: "Control", description: "Junk band. Clean food + protein.", badDayMinimum: "Yes", focus: "Study" },
  { id: 5, taskTitle: "Digital Sunset (Phone off 9:30 PM)", taskCategory: "Fixed Core Rule", phase: "Control", description: "9:30 ke baad phone band. Sleep cycle banao.", badDayMinimum: "Yes", focus: "Study" },
  { id: 6, taskTitle: "Sleep by 10 PM", taskCategory: "Fixed Core Rule", phase: "Control", description: "7-8 ghante quality sleep zaroori hai.", badDayMinimum: "Yes", focus: "Study" },
  { id: 7, taskTitle: "Number System Drill (60 min)", taskCategory: "Focus Goal", phase: "Control", description: "Divisibility, LCM-HCM, remainders. Foundation solid karo.", badDayMinimum: "No", focus: "Study" },
  { id: 8, taskTitle: "Simplification Speed Round (25 min)", taskCategory: "Focus Goal", phase: "Control", description: "BODMAS, squares, cubes – pure speed practice.", badDayMinimum: "Yes", focus: "Study" },
  { id: 9, taskTitle: "Mental Math + Vedic (30 min)", taskCategory: "Focus Goal", phase: "Control", description: "Mental calculation + Vedic tricks.", badDayMinimum: "No", focus: "Study" },

  // ========== STUDY - CAPACITY ==========
  { id: 10, taskTitle: "Deep Work Block 1 (100 min)", taskCategory: "Focus Goal", phase: "Capacity", description: "Arithmetic / Algebra pe pure focus. Phone airplane.", badDayMinimum: "No", focus: "Study" },
  { id: 11, taskTitle: "Deep Work Block 2 (90 min)", taskCategory: "Focus Goal", phase: "Capacity", description: "Advanced mixed questions. Difficulty badhao.", badDayMinimum: "No", focus: "Study" },
  { id: 12, taskTitle: "Arithmetic Full Attack", taskCategory: "Focus Goal", phase: "Capacity", description: "Percentage, PL, SI-CI, Ratio, TSD.", badDayMinimum: "No", focus: "Study" },
  { id: 13, taskTitle: "Algebra + Mensuration", taskCategory: "Focus Goal", phase: "Capacity", description: "Equations + 2D/3D Mensuration practice.", badDayMinimum: "No", focus: "Study" },
  { id: 14, taskTitle: "Weak Area Attack (40 min)", taskCategory: "Focus Goal", phase: "Capacity", description: "Din ke weak points pe focused practice.", badDayMinimum: "Yes", focus: "Study" },

  // ========== STUDY - PROOF ==========
  { id: 15, taskTitle: "Full-Length Mock Test", taskCategory: "Focus Goal", phase: "Proof", description: "Exact exam pattern, strict timed mock.", badDayMinimum: "No", focus: "Study" },
  { id: 16, taskTitle: "PYQ + Error Log", taskCategory: "Focus Goal", phase: "Proof", description: "Previous year questions + error analysis.", badDayMinimum: "No", focus: "Study" },
  { id: 17, taskTitle: "Speed + Accuracy Drill (50 min)", taskCategory: "Focus Goal", phase: "Proof", description: "Mixed questions – speed aur accuracy dono.", badDayMinimum: "Yes", focus: "Study" },
  { id: 18, taskTitle: "Final Revision Sprint", taskCategory: "Focus Goal", phase: "Proof", description: "Sirf weak areas + formula sheets.", badDayMinimum: "No", focus: "Study" },

  // ========== FITNESS - CONTROL ==========
  { id: 101, taskTitle: "5 AM Wake-Up", taskCategory: "Fixed Core Rule", phase: "Control", description: "Subah 5 baje uthna non-negotiable.", badDayMinimum: "Yes", focus: "Fitness" },
  { id: 102, taskTitle: "Cold Shower 3 min", taskCategory: "Fixed Core Rule", phase: "Control", description: "Cold exposure se discipline badhao.", badDayMinimum: "Yes", focus: "Fitness" },
  { id: 103, taskTitle: "4 Litres Water", taskCategory: "Fixed Core Rule", phase: "Control", description: "Hydration = performance.", badDayMinimum: "Yes", focus: "Fitness" },
  { id: 104, taskTitle: "High Protein Diet", taskCategory: "Fixed Core Rule", phase: "Control", description: "Protein focus + zero junk.", badDayMinimum: "Yes", focus: "Fitness" },
  { id: 105, taskTitle: "Bodyweight Circuit (30 min)", taskCategory: "Focus Goal", phase: "Control", description: "Push-ups, Squats, Plank, Lunges.", badDayMinimum: "Yes", focus: "Fitness" },
  { id: 106, taskTitle: "Zone 2 Walk/Jog 30 min", taskCategory: "Focus Goal", phase: "Control", description: "Easy pace cardio for base fitness.", badDayMinimum: "Yes", focus: "Fitness" },
  { id: 107, taskTitle: "Mobility + Stretch 15 min", taskCategory: "Focus Goal", phase: "Control", description: "Injury prevention ke liye daily mobility.", badDayMinimum: "Yes", focus: "Fitness" },

  // ========== FITNESS - CAPACITY ==========
  { id: 108, taskTitle: "Strength Training (45 min)", taskCategory: "Focus Goal", phase: "Capacity", description: "Push / Pull / Legs. Progressive overload.", badDayMinimum: "No", focus: "Fitness" },
  { id: 109, taskTitle: "HIIT 20 min", taskCategory: "Focus Goal", phase: "Capacity", description: "High intensity intervals. Work capacity badhao.", badDayMinimum: "No", focus: "Fitness" },
  { id: 110, taskTitle: "Zone 2 Cardio 40 min", taskCategory: "Focus Goal", phase: "Capacity", description: "Longer easy cardio. Aerobic base.", badDayMinimum: "Yes", focus: "Fitness" },
  { id: 111, taskTitle: "Core + Prehab 20 min", taskCategory: "Focus Goal", phase: "Capacity", description: "Core strong + injury prevention work.", badDayMinimum: "Yes", focus: "Fitness" },

  // ========== FITNESS - PROOF ==========
  { id: 112, taskTitle: "Peak Strength Session", taskCategory: "Focus Goal", phase: "Proof", description: "Heavy compounds. Strength peak.", badDayMinimum: "No", focus: "Fitness" },
  { id: 113, taskTitle: "Benchmark Test", taskCategory: "Focus Goal", phase: "Proof", description: "Max push-ups / 2km run / plank hold.", badDayMinimum: "No", focus: "Fitness" },
  { id: 114, taskTitle: "Active Recovery Day", taskCategory: "Focus Goal", phase: "Proof", description: "Walk + mobility. Recovery = gains.", badDayMinimum: "Yes", focus: "Fitness" },
];