export function buildCoachSystemPrompt(context: {
  patternName?: string;
  patternDescription?: string;
  whyItMatters?: string;
  keyConcepts?: string[];
  coachGuidelines?: string[];
  lessonTitle?: string;
  lessonGoal?: string;
  idealPlan?: string;
  commonMistakes?: string[];
  hintLadder?: string[];
  mode: "lesson" | "puzzle";
  progressSummary?: string;
}): string {
  const {
    patternName,
    patternDescription,
    whyItMatters,
    keyConcepts,
    coachGuidelines,
    lessonTitle,
    lessonGoal,
    idealPlan,
    commonMistakes,
    hintLadder,
    mode,
    progressSummary,
  } = context;

  return `You are a friendly, encouraging chess endgame coach for a student under 1200. Your job is to help the student build practical endgame skill through simple explanations, pattern recognition, and repetition.

## Your Teaching Style
- Use plain, conversational English. Avoid unexplained jargon.
- Explain the IDEA behind the move first, then the move itself.
- Treat this as skill-building, not move-recital.
- If you use terms like "opposition", "cut off", "bridge", or "fortress", explain them simply the first time.
- Be encouraging but honest. When a move is off-plan, say what idea it missed.
- Keep explanations concise. Usually 2-4 short sentences is enough.
- Use algebraic squares like e4 and d7 when pointing to specific locations.

## Context
${patternName ? `**Current Pattern:** ${patternName}` : ""}
${patternDescription ? `**About this pattern:** ${patternDescription}` : ""}
${whyItMatters ? `**Why it matters:** ${whyItMatters}` : ""}
${keyConcepts?.length ? `**Key concepts to teach:** ${keyConcepts.join(", ")}` : ""}
${lessonTitle ? `**Current lesson:** ${lessonTitle}` : ""}
${lessonGoal ? `**Lesson goal:** ${lessonGoal}` : ""}
${idealPlan ? `**Ideal plan:** ${idealPlan}` : ""}
${commonMistakes?.length ? `**Common mistakes:** ${commonMistakes.join("; ")}` : ""}
${hintLadder?.length ? `**Hint ladder:** ${hintLadder.join(" -> ")}` : ""}
${coachGuidelines?.length ? `**Coaching reminders:** ${coachGuidelines.join(" ")}` : ""}
**Mode:** ${mode === "lesson" ? "Guided Lesson — actively teach the plan, reinforce concepts, and explain each step." : "Puzzle Mode — let the student solve, give hints progressively, and avoid blurting out the answer."}
${progressSummary ? `\n**Student's progress so far:**\n${progressSummary}` : ""}

## What You Receive
Each message from the system will include:
- The current board position (FEN notation)
- The tablebase analysis showing the optimal move and evaluation
- The student's move (if they made one) and whether it was optimal, good, or a mistake
- A concept-based interpretation of the move when available, such as losing opposition or missing the bridge
- The lesson goal, plan, common mistakes, and hint ladder for the current training position

## Rules
- NEVER calculate chess yourself. Always rely on the tablebase data provided to you.
- When discussing moves, reference the tablebase analysis to stay accurate.
- Evaluate moves in terms of plan execution, not just "best move vs not best move".
- Use the concept feedback as your first teaching lens when it is available.
- If the student asks "why is this move better?", answer in this order:
  1. the goal of the move,
  2. what squares or ideas it controls,
  3. what the alternative move fails to do,
  4. how the tablebase evaluation or conversion changes.
- In lesson mode: proactively teach the next idea after each move.
- In puzzle mode: prefer the next hint from the hint ladder before giving the move. Only reveal the move if the student clearly asks for it or is stuck after hints.
- If the position is theoretically drawn, say so clearly and explain the drawing mechanism.
- If checkmate is achieved, congratulate the student and briefly recap the technique used.
- If stalemate or a draw occurs, explain the underlying idea, not just the result.
- When the student asks about a specific move, give a concrete answer grounded in the tablebase data and the lesson goal.`;
}

export function buildMoveMessage(data: {
  fen: string;
  userMove?: {
    san: string;
    uci: string;
    quality: string;
    conceptFeedback?: {
      label: string;
      summary: string;
      tags: string[];
    } | null;
  } | null;
  lessonContext?: {
    title: string;
    targetResult: "win" | "draw";
    lessonGoal: string;
    idealPlan: string;
    commonMistakes: string[];
    hintLadder: string[];
  } | null;
  tablebaseAnalysis?: {
    category: string;
    dtm: number | null;
    optimalMove?: { san: string; uci: string; dtm: number | null } | null;
    allMoves?: { san: string; uci: string; category: string; dtm: number | null }[];
  } | null;
  isGameOver?: boolean;
  gameOverReason?: string;
  opponentMove?: { san: string } | null;
}): string {
  const parts: string[] = [];

  parts.push(`[Position: ${data.fen}]`);

  if (data.lessonContext) {
    parts.push(`[Lesson: ${data.lessonContext.title}]`);
    parts.push(
      `[Training objective: ${data.lessonContext.targetResult === "draw" ? "Hold the draw" : "Convert the position"}]`
    );
    parts.push(`[Lesson goal: ${data.lessonContext.lessonGoal}]`);
    parts.push(`[Ideal plan: ${data.lessonContext.idealPlan}]`);
    if (data.lessonContext.commonMistakes.length > 0) {
      parts.push(`[Common mistakes: ${data.lessonContext.commonMistakes.join("; ")}]`);
    }
    if (data.lessonContext.hintLadder.length > 0) {
      parts.push(`[Hint ladder: ${data.lessonContext.hintLadder.join(" -> ")}]`);
    }
  }

  if (data.tablebaseAnalysis) {
    const tb = data.tablebaseAnalysis;
    parts.push(
      `[Tablebase: ${tb.category}${tb.category !== "draw" && tb.dtm !== null ? `, mate in ${Math.abs(tb.dtm)}` : ""}]`
    );
    if (tb.optimalMove) {
      parts.push(
        `[Best move: ${tb.optimalMove.san}${tb.optimalMove.dtm !== null && tb.category !== "draw" ? ` (mate in ${Math.abs(tb.optimalMove.dtm)})` : ""}]`
      );
    }
    if (tb.allMoves && tb.allMoves.length > 0) {
      const top5 = tb.allMoves.slice(0, 5);
      parts.push(
        `[Top moves: ${top5.map((move) => `${move.san} (${move.category}${move.dtm !== null ? `, DTM ${move.dtm}` : ""})`).join(", ")}]`
      );
    }
  }

  if (data.userMove) {
    parts.push(`[Student played: ${data.userMove.san} — evaluation: ${data.userMove.quality}]`);
    if (data.userMove.conceptFeedback) {
      parts.push(`[Concept feedback: ${data.userMove.conceptFeedback.label}]`);
      parts.push(`[Concept summary: ${data.userMove.conceptFeedback.summary}]`);
      if (data.userMove.conceptFeedback.tags.length > 0) {
        parts.push(`[Concept tags: ${data.userMove.conceptFeedback.tags.join(", ")}]`);
      }
    }
  }

  if (data.opponentMove) {
    parts.push(`[Opponent (engine) responded: ${data.opponentMove.san}]`);
  }

  if (data.isGameOver) {
    parts.push(`[Game over: ${data.gameOverReason}]`);
  }

  return parts.join("\n");
}
