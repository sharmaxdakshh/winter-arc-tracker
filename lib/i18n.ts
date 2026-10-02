export type Lang = "en" | "hi";

const dict = {
  en: {
    welcome: "Welcome",
    day: "Day",
    phase: "Phase",
    share: "Share",
    logout: "Logout",
    study: "Study",
    fitness: "Fitness",
    both: "Both",
    badDay: "Bad Day",
    autoPhase: "Auto Phase",
    recovery: "Recovery mode: yesterday missed. Showing minimum tasks.",
    nonNeg: "Non-negotiables",
    contract: "My Contract",
    milestones: "Milestones",
    resetArc: "New 90-Day Arc",
    language: "Language",
    theme: "Theme",
    tourNext: "Next",
    tourSkip: "Skip tour",
    eveningReview: "Evening review: 2 minutes — what went well today?",
    smartMiss: "You slipped yesterday. Today: minimum tasks only. Still counts.",
    smartStreak: "Streak is alive. Protect it today.",
    smartStart: "Winter Arc reminder — start your first block.",
  },
  hi: {
    welcome: "स्वागत है",
    day: "दिन",
    phase: "चरण",
    share: "शेयर",
    logout: "लॉग आउट",
    study: "पढ़ाई",
    fitness: "फिटनेस",
    both: "दोनों",
    badDay: "बैड डे",
    autoPhase: "ऑटो चरण",
    recovery: "रिकवरी मोड: कल मिस हुआ। आज न्यूनतम टास्क।",
    nonNeg: "ज़रूरी नियम",
    contract: "मेरा अनुबंध",
    milestones: "मीलस्टोन",
    resetArc: "नया 90-दिन आर्क",
    language: "भाषा",
    theme: "थीम",
    tourNext: "आगे",
    tourSkip: "टूर छोड़ें",
    eveningReview: "शाम की समीक्षा: 2 मिनट — आज क्या अच्छा रहा?",
    smartMiss: "कल चूक गए। आज सिर्फ न्यूनतम टास्क। फिर भी गिनती होगी।",
    smartStreak: "स्ट्रीक ज़िंदा है। आज बचाओ।",
    smartStart: "विंटर आर्क याद दिलाना — पहला ब्लॉक शुरू करो।",
  },
} as const;

export type DictKey = keyof typeof dict.en;

export function t(lang: Lang, key: DictKey): string {
  return dict[lang][key] || dict.en[key];
}