export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Chess-specific events
export const trackGameStart = (mode: "bot" | "friend" | "online", timeControl?: string) => {
  event({
    action: "game_start",
    category: "game",
    label: `${mode}${timeControl ? `_${timeControl}` : ""}`,
  });
};

export const trackGameEnd = (result: "win" | "loss" | "draw", mode: string) => {
  event({
    action: "game_end",
    category: "game",
    label: `${result}_${mode}`,
  });
};

export const trackLessonComplete = (lessonSlug: string) => {
  event({
    action: "lesson_complete",
    category: "learn",
    label: lessonSlug,
  });
};

export const trackPuzzleSolved = (puzzleId: string, correct: boolean) => {
  event({
    action: correct ? "puzzle_correct" : "puzzle_incorrect",
    category: "learn",
    label: puzzleId,
  });
};

export const trackSignUp = (method: "email" | "google") => {
  event({
    action: "sign_up",
    category: "auth",
    label: method,
  });
};

export const trackLogin = (method: "email" | "google") => {
  event({
    action: "login",
    category: "auth",
    label: method,
  });
};
