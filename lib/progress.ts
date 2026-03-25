export interface PatternProgress {
  attempted: number;
  solved: number;
  avgMovesToSolve: number;
  commonMistakes: { fen: string; wrongMove: string; correctMove: string }[];
  lastPracticed: string; // ISO date
}

export interface Progress {
  patterns: Record<string, PatternProgress>;
  totalSessions: number;
  currentStreak: number;
  lastSessionDate: string;
}

const STORAGE_KEY = "chess-endgame-progress";

function getDefaultProgress(): Progress {
  return {
    patterns: {},
    totalSessions: 0,
    currentStreak: 0,
    lastSessionDate: "",
  };
}

export function getProgress(): Progress {
  if (typeof window === "undefined") return getDefaultProgress();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultProgress();
    return JSON.parse(data);
  } catch {
    return getDefaultProgress();
  }
}

function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordAttempt(
  patternId: string,
  solved: boolean,
  movesUsed: number,
  mistakes: { fen: string; wrongMove: string; correctMove: string }[] = []
): void {
  const progress = getProgress();
  const today = new Date().toISOString().split("T")[0];

  if (!progress.patterns[patternId]) {
    progress.patterns[patternId] = {
      attempted: 0,
      solved: 0,
      avgMovesToSolve: 0,
      commonMistakes: [],
      lastPracticed: today,
    };
  }

  const pattern = progress.patterns[patternId];
  pattern.attempted += 1;
  if (solved) {
    pattern.solved += 1;
    // Update running average
    const totalSolved = pattern.solved;
    pattern.avgMovesToSolve =
      (pattern.avgMovesToSolve * (totalSolved - 1) + movesUsed) / totalSolved;
  }
  pattern.lastPracticed = today;

  // Keep last 10 mistakes per pattern
  pattern.commonMistakes = [...mistakes, ...pattern.commonMistakes].slice(0, 10);

  // Update streak
  if (progress.lastSessionDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (progress.lastSessionDate === yesterdayStr) {
      progress.currentStreak += 1;
    } else if (progress.lastSessionDate !== today) {
      progress.currentStreak = 1;
    }
    progress.totalSessions += 1;
    progress.lastSessionDate = today;
  }

  saveProgress(progress);
}

export function getWeakPatterns(progress: Progress): string[] {
  return Object.entries(progress.patterns)
    .filter(([, p]) => {
      if (p.attempted < 2) return false;
      return p.solved / p.attempted < 0.5;
    })
    .map(([id]) => id);
}

export function getProgressSummary(progress: Progress): string {
  const entries = Object.entries(progress.patterns);
  if (entries.length === 0) return "No patterns practiced yet.";

  return entries
    .map(([id, p]) => {
      const rate = p.attempted > 0 ? Math.round((p.solved / p.attempted) * 100) : 0;
      return `${id}: ${p.solved}/${p.attempted} solved (${rate}%)`;
    })
    .join("\n");
}
