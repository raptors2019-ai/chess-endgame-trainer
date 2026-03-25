export interface EndgamePattern {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  pieces: string; // e.g., "K+R vs K"
  keyConcepts: string[];
}

export const PATTERNS: EndgamePattern[] = [
  {
    id: "kq-vs-k",
    name: "King & Queen vs King",
    description:
      "The easiest forced checkmate. Learn to drive the enemy king to the edge using your queen and king together.",
    difficulty: "beginner",
    pieces: "K+Q vs K",
    keyConcepts: [
      "Drive the king to the edge",
      "Use the queen to cut off squares",
      "Bring your king close to support",
      "Avoid stalemate",
    ],
  },
  {
    id: "kr-vs-k",
    name: "King & Rook vs King",
    description:
      "The most important endgame technique. Learn the 'box' method to systematically push the enemy king to the edge.",
    difficulty: "beginner",
    pieces: "K+R vs K",
    keyConcepts: [
      "Build a box with the rook",
      "Shrink the box one rank/file at a time",
      "Use opposition to force the king back",
      "Waiting moves with the rook",
    ],
  },
  {
    id: "k2r-vs-k",
    name: "King & Two Rooks vs King",
    description:
      "A straightforward checkmate using the 'ladder' or 'lawnmower' technique with two rooks.",
    difficulty: "beginner",
    pieces: "K+2R vs K",
    keyConcepts: [
      "Ladder/lawnmower technique",
      "Rooks alternate pushing the king",
      "Keep rooks protected from each other",
      "No need for king assistance",
    ],
  },
  {
    id: "k2b-vs-k",
    name: "King & Two Bishops vs King",
    description:
      "A more challenging mate that requires coordinating both bishops to create a diagonal barrier.",
    difficulty: "intermediate",
    pieces: "K+2B vs K",
    keyConcepts: [
      "Bishops work on adjacent diagonals",
      "Create a diagonal barrier",
      "Drive the king to a corner",
      "King must assist actively",
    ],
  },
  {
    id: "kbn-vs-k",
    name: "King, Bishop & Knight vs King",
    description:
      "The hardest basic checkmate. Must force the king to the corner matching the bishop's color.",
    difficulty: "advanced",
    pieces: "K+B+N vs K",
    keyConcepts: [
      "Drive king to correct corner (bishop's color)",
      "W-maneuver with the knight",
      "Coordinate all three pieces",
      "Must mate within 50 moves",
    ],
  },
  {
    id: "kp-vs-k",
    name: "King & Pawn vs King",
    description:
      "Learn the key concepts of opposition and the square of the pawn to know when a pawn endgame is winning.",
    difficulty: "intermediate",
    pieces: "K+P vs K",
    keyConcepts: [
      "Opposition (direct and distant)",
      "The square of the pawn",
      "Key squares",
      "When the pawn promotes vs draws",
    ],
  },
];

export function getPatternById(id: string): EndgamePattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}
