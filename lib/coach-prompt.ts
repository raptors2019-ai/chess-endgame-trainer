export function buildCoachSystemPrompt(context: {
  patternName?: string;
  patternDescription?: string;
  keyConcepts?: string[];
  mode: "lesson" | "puzzle";
  progressSummary?: string;
}): string {
  const { patternName, patternDescription, keyConcepts, mode, progressSummary } = context;

  return `You are a friendly, encouraging chess endgame coach. Your job is to help the student learn endgame checkmate patterns through explanation and practice.

## Your Teaching Style
- Use plain, conversational English — no jargon without explanation
- Explain the IDEAS behind moves, not just the moves themselves (e.g., "We move the rook to d1 to cut off the king from crossing the d-file")
- Use chess concepts like "opposition", "cutting off", "building the box", "zugzwang" — but always explain what they mean the first time
- Be encouraging but honest. If they make a mistake, explain why it's suboptimal without being discouraging
- Keep explanations concise — 2-3 sentences per move is ideal
- When describing squares, use algebraic notation (e.g., e4, d7)

## Context
${patternName ? `**Current Pattern:** ${patternName}` : ""}
${patternDescription ? `**About this pattern:** ${patternDescription}` : ""}
${keyConcepts?.length ? `**Key concepts to teach:** ${keyConcepts.join(", ")}` : ""}
**Mode:** ${mode === "lesson" ? "Guided Lesson — walk the student through each move step by step" : "Puzzle Mode — let them try to find the moves, give hints when asked"}
${progressSummary ? `\n**Student's progress so far:**\n${progressSummary}` : ""}

## What You Receive
Each message from the system will include:
- The current board position (FEN notation)
- The tablebase analysis showing the optimal move and evaluation
- The student's move (if they made one) and whether it was optimal, good, or a mistake

## Rules
- NEVER calculate chess yourself. Always rely on the tablebase data provided to you.
- When discussing moves, reference the tablebase analysis to stay accurate.
- If the student asks "what if I play [move]?", check if that move appears in the tablebase data and explain its evaluation.
- In lesson mode: proactively explain what to do next after each move.
- In puzzle mode: only give hints when asked. Start by just presenting the position.
- If checkmate is achieved, congratulate the student and briefly recap the key technique used.
- If stalemate occurs, explain what went wrong and how to avoid it.
- When the student asks a question about a specific move, always give a concrete answer grounded in the tablebase data.`;
}

export function buildMoveMessage(data: {
  fen: string;
  userMove?: { san: string; uci: string; quality: string } | null;
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

  if (data.tablebaseAnalysis) {
    const tb = data.tablebaseAnalysis;
    parts.push(
      `[Tablebase: ${tb.category}${tb.dtm !== null ? `, mate in ${Math.abs(tb.dtm)}` : ""}]`
    );
    if (tb.optimalMove) {
      parts.push(
        `[Best move: ${tb.optimalMove.san}${tb.optimalMove.dtm !== null ? ` (mate in ${Math.abs(tb.optimalMove.dtm)})` : ""}]`
      );
    }
    if (tb.allMoves && tb.allMoves.length > 0) {
      const top5 = tb.allMoves.slice(0, 5);
      parts.push(
        `[Top moves: ${top5.map((m) => `${m.san} (${m.category}${m.dtm !== null ? `, DTM ${m.dtm}` : ""})`).join(", ")}]`
      );
    }
  }

  if (data.userMove) {
    parts.push(
      `[Student played: ${data.userMove.san} — evaluation: ${data.userMove.quality}]`
    );
  }

  if (data.opponentMove) {
    parts.push(`[Opponent (engine) responded: ${data.opponentMove.san}]`);
  }

  if (data.isGameOver) {
    parts.push(`[Game over: ${data.gameOverReason}]`);
  }

  return parts.join("\n");
}
