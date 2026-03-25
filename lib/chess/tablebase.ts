export interface TablebaseMove {
  uci: string;
  san: string;
  category: "win" | "draw" | "loss" | "maybe-win" | "maybe-loss" | "cursed-win" | "blessed-loss";
  dtm: number | null;
  dtz: number | null;
}

export interface TablebaseResult {
  category: "win" | "draw" | "loss" | "maybe-win" | "maybe-loss" | "cursed-win" | "blessed-loss";
  dtm: number | null;
  dtz: number | null;
  checkmate: boolean;
  stalemate: boolean;
  moves: TablebaseMove[];
}

const cache = new Map<string, TablebaseResult>();

export async function queryTablebase(fen: string): Promise<TablebaseResult | null> {
  const cached = cache.get(fen);
  if (cached) return cached;

  try {
    // Lichess tablebase API uses underscores for spaces in FEN
    const encodedFen = fen.replace(/ /g, "_");
    const response = await fetch(
      `https://tablebase.lichess.ovh/standard?fen=${encodedFen}`
    );

    if (!response.ok) {
      if (response.status === 404) return null; // Position not in tablebase (>7 pieces)
      throw new Error(`Tablebase API error: ${response.status}`);
    }

    const data = await response.json();
    const result: TablebaseResult = {
      category: data.category,
      dtm: data.dtm,
      dtz: data.dtz,
      checkmate: data.checkmate,
      stalemate: data.stalemate,
      moves: data.moves.map((m: Record<string, unknown>) => ({
        uci: m.uci,
        san: m.san,
        category: m.category,
        dtm: m.dtm,
        dtz: m.dtz,
      })),
    };

    cache.set(fen, result);
    return result;
  } catch (error) {
    console.error("Tablebase query failed:", error);
    return null;
  }
}

export function getOptimalMove(result: TablebaseResult): TablebaseMove | null {
  if (!result.moves.length) return null;

  // For winning positions: find the move that leads to a loss for opponent (fastest mate)
  const winningMoves = result.moves.filter((m) => m.category === "loss");
  if (winningMoves.length > 0) {
    // Sort by DTM (ascending absolute value = fastest mate)
    return winningMoves.sort((a, b) => {
      if (a.dtm === null) return 1;
      if (b.dtm === null) return -1;
      return Math.abs(a.dtm) - Math.abs(b.dtm);
    })[0];
  }

  // For drawing positions: find a drawing move
  const drawingMoves = result.moves.filter((m) => m.category === "draw");
  if (drawingMoves.length > 0) return drawingMoves[0];

  // Fallback: return the first move
  return result.moves[0];
}

export function evaluateUserMove(
  result: TablebaseResult,
  userMoveUci: string
): { quality: "optimal" | "good" | "inaccuracy" | "mistake"; move: TablebaseMove | null } {
  const userMove = result.moves.find((m) => m.uci === userMoveUci);
  if (!userMove) return { quality: "mistake", move: null };

  const optimal = getOptimalMove(result);
  if (!optimal) return { quality: "good", move: userMove };

  // If the user's move has the same category as the optimal move
  if (userMove.category === optimal.category) {
    // Check if DTM is close to optimal
    if (userMove.dtm !== null && optimal.dtm !== null) {
      const diff = Math.abs(Math.abs(userMove.dtm) - Math.abs(optimal.dtm));
      if (diff === 0) return { quality: "optimal", move: userMove };
      if (diff <= 2) return { quality: "good", move: userMove };
      return { quality: "inaccuracy", move: userMove };
    }
    return { quality: "good", move: userMove };
  }

  // User's move changes the evaluation category
  if (
    (result.category === "win" && userMove.category !== "loss") ||
    (result.category === "draw" && userMove.category === "win")
  ) {
    return { quality: "mistake", move: userMove };
  }

  return { quality: "inaccuracy", move: userMove };
}
