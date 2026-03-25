// Curated starting positions for each endgame pattern.
// Each position is winnable for White in a reasonable number of moves.

export interface Position {
  fen: string;
  description: string;
  expectedMoves: number; // approximate moves to mate
}

export const POSITIONS: Record<string, Position[]> = {
  "kq-vs-k": [
    {
      fen: "8/8/8/4k3/8/8/1Q6/4K3 w - - 0 1",
      description: "Queen vs lone king — drive to the edge",
      expectedMoves: 7,
    },
    {
      fen: "8/8/8/8/3k4/8/8/Q3K3 w - - 0 1",
      description: "Queen vs king in the center",
      expectedMoves: 8,
    },
    {
      fen: "4k3/8/8/8/8/8/8/Q3K3 w - - 0 1",
      description: "King already near the edge — finish the mate",
      expectedMoves: 5,
    },
  ],
  "kr-vs-k": [
    {
      fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
      description: "Rook vs lone king — build the box",
      expectedMoves: 15,
    },
    {
      fen: "8/8/8/8/3k4/8/8/R3K3 w - - 0 1",
      description: "Rook mate — king in the center",
      expectedMoves: 16,
    },
    {
      fen: "3k4/8/8/8/8/8/8/R3K3 w - - 0 1",
      description: "King already on the back rank",
      expectedMoves: 8,
    },
  ],
  "k2r-vs-k": [
    {
      fen: "8/8/8/4k3/8/8/8/R3K2R w - - 0 1",
      description: "Two rooks — use the ladder technique",
      expectedMoves: 6,
    },
    {
      fen: "8/8/4k3/8/8/8/8/RR2K3 w - - 0 1",
      description: "Lawnmower mate practice",
      expectedMoves: 5,
    },
  ],
  "k2b-vs-k": [
    {
      fen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
      description: "Two bishops — coordinate the diagonal barrier",
      expectedMoves: 18,
    },
    {
      fen: "8/8/8/8/4k3/8/8/2B1KB2 w - - 0 1",
      description: "Two bishops vs centralized king",
      expectedMoves: 17,
    },
  ],
  "kbn-vs-k": [
    {
      fen: "8/8/8/4k3/8/8/8/1NB1K3 w - - 0 1",
      description: "Bishop + knight — drive to the correct corner",
      expectedMoves: 30,
    },
    {
      fen: "4k3/8/8/8/8/8/8/1NB1K3 w - - 0 1",
      description: "Bishop + knight — king near the edge",
      expectedMoves: 25,
    },
  ],
  "kp-vs-k": [
    {
      fen: "8/8/8/8/4k3/8/4P3/4K3 w - - 0 1",
      description: "King and pawn — gain the opposition",
      expectedMoves: 10,
    },
    {
      fen: "8/8/4k3/8/8/4K3/4P3/8 w - - 0 1",
      description: "Pawn endgame — key squares",
      expectedMoves: 12,
    },
    {
      fen: "8/4k3/8/4K3/4P3/8/8/8 w - - 0 1",
      description: "Advanced pawn — convert the advantage",
      expectedMoves: 6,
    },
  ],
};

export function getPositionsForPattern(patternId: string): Position[] {
  return POSITIONS[patternId] || [];
}

export function getRandomPosition(patternId: string): Position | null {
  const positions = POSITIONS[patternId];
  if (!positions || positions.length === 0) return null;
  return positions[Math.floor(Math.random() * positions.length)];
}
