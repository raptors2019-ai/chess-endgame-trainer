export interface TablebaseMove {
  uci: string;
  san: string;
  category:
    | "win"
    | "draw"
    | "loss"
    | "maybe-win"
    | "maybe-loss"
    | "cursed-win"
    | "blessed-loss";
  dtm: number | null;
  dtz: number | null;
}

export interface TablebaseResult {
  category:
    | "win"
    | "draw"
    | "loss"
    | "maybe-win"
    | "maybe-loss"
    | "cursed-win"
    | "blessed-loss";
  dtm: number | null;
  dtz: number | null;
  checkmate: boolean;
  stalemate: boolean;
  moves: TablebaseMove[];
}

const TABLEBASE_URL = "https://tablebase.lichess.ovh/standard";
const REQUEST_TIMEOUT_MS = 5000;
const cache = new Map<string, TablebaseResult>();
const inFlight = new Map<string, Promise<TablebaseResult | null>>();

function buildTablebaseUrl(fen: string): string {
  const params = new URLSearchParams({ fen });
  return `${TABLEBASE_URL}?${params.toString()}`;
}

function mapTablebaseResult(data: Record<string, unknown>): TablebaseResult {
  const rawMoves = Array.isArray(data.moves) ? data.moves : [];

  return {
    category: data.category as TablebaseResult["category"],
    dtm: (data.dtm as number | null) ?? null,
    dtz: (data.dtz as number | null) ?? null,
    checkmate: Boolean(data.checkmate),
    stalemate: Boolean(data.stalemate),
    moves: rawMoves.map((move) => {
      const mapped = move as Record<string, unknown>;
      return {
        uci: mapped.uci as string,
        san: mapped.san as string,
        category: mapped.category as TablebaseMove["category"],
        dtm: (mapped.dtm as number | null) ?? null,
        dtz: (mapped.dtz as number | null) ?? null,
      };
    }),
  };
}

async function fetchTablebase(fen: string): Promise<TablebaseResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildTablebaseUrl(fen), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Tablebase API error: ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    return mapTablebaseResult(data);
  } finally {
    clearTimeout(timeout);
  }
}

export async function queryTablebase(fen: string): Promise<TablebaseResult | null> {
  const cached = cache.get(fen);
  if (cached) return cached;

  const pending = inFlight.get(fen);
  if (pending) return pending;

  const request = (async () => {
    try {
      const result = await fetchTablebase(fen);
      if (result) {
        cache.set(fen, result);
      }
      return result;
    } catch (error) {
      console.error("Tablebase query failed:", error);
      return null;
    } finally {
      inFlight.delete(fen);
    }
  })();

  inFlight.set(fen, request);
  return request;
}

export function getOptimalMove(result: TablebaseResult): TablebaseMove | null {
  if (!result.moves.length) return null;

  const winningMoves = result.moves.filter((move) => move.category === "loss");
  if (winningMoves.length > 0) {
    return [...winningMoves].sort((a, b) => {
      if (a.dtm === null) return 1;
      if (b.dtm === null) return -1;
      return Math.abs(a.dtm) - Math.abs(b.dtm);
    })[0];
  }

  const drawingMoves = result.moves.filter((move) => move.category === "draw");
  if (drawingMoves.length > 0) return drawingMoves[0];

  return result.moves[0];
}

export function evaluateUserMove(
  result: TablebaseResult,
  userMoveUci: string
): { quality: "optimal" | "good" | "inaccuracy" | "mistake"; move: TablebaseMove | null } {
  const userMove = result.moves.find((move) => move.uci === userMoveUci);
  if (!userMove) return { quality: "mistake", move: null };

  const optimal = getOptimalMove(result);
  if (!optimal) return { quality: "good", move: userMove };

  if (userMove.category === optimal.category) {
    if (userMove.dtm !== null && optimal.dtm !== null) {
      const diff = Math.abs(Math.abs(userMove.dtm) - Math.abs(optimal.dtm));
      if (diff === 0) return { quality: "optimal", move: userMove };
      if (diff <= 2) return { quality: "good", move: userMove };
      return { quality: "inaccuracy", move: userMove };
    }
    return { quality: "good", move: userMove };
  }

  if (
    (result.category === "win" && userMove.category !== "loss") ||
    (result.category === "draw" && userMove.category === "win")
  ) {
    return { quality: "mistake", move: userMove };
  }

  return { quality: "inaccuracy", move: userMove };
}
