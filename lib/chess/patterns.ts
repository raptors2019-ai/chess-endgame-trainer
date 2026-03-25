export interface EndgamePattern {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  pieces: string;
  track: "basic-mates" | "pawn-endgames" | "rook-endgames";
  whyItMatters: string;
  keyConcepts: string[];
  coachGuidelines: string[];
}

export const PATTERNS: EndgamePattern[] = [
  {
    id: "kq-vs-k",
    name: "King & Queen vs King",
    description:
      "Your cleanest first mating pattern. Learn to take away squares without rushing into stalemate tricks.",
    difficulty: "beginner",
    pieces: "K+Q vs K",
    track: "basic-mates",
    whyItMatters:
      "This teaches the habit of restricting the king first and only checking when it helps.",
    keyConcepts: [
      "Cut off escape squares before checking",
      "Bring your king closer safely",
      "Use waiting moves to avoid stalemate",
      "Box the king toward the edge",
    ],
    coachGuidelines: [
      "Praise efficient restriction more than flashy checks.",
      "Warn early about stalemate when the enemy king is trapped.",
      "Keep the language beginner-friendly and visual.",
    ],
  },
  {
    id: "kr-vs-k",
    name: "King & Rook vs King",
    description:
      "The most practical basic mate. Learn the box method, king support, and the waiting move that keeps control.",
    difficulty: "beginner",
    pieces: "K+R vs K",
    track: "basic-mates",
    whyItMatters:
      "This is the first endgame where technique matters more than raw material advantage.",
    keyConcepts: [
      "Build the box",
      "Shrink the box one step at a time",
      "Use your king to take opposition",
      "Find the rook waiting move",
    ],
    coachGuidelines: [
      "Explain why the rook cuts off files or ranks before suggesting checks.",
      "Call out when the student moves the rook too close and risks counterplay.",
      "Connect each move to the shrinking box idea.",
    ],
  },
  {
    id: "kp-vs-k",
    name: "King & Pawn Basics",
    description:
      "Learn the ideas that decide beginner pawn endings: key squares, opposition, and when a pawn actually queens.",
    difficulty: "beginner",
    pieces: "K+P vs K",
    track: "pawn-endgames",
    whyItMatters:
      "Pawn endings teach calculation discipline and show when a tiny advantage is really winning.",
    keyConcepts: [
      "Opposition",
      "Key squares",
      "King in front of the pawn",
      "Do not rush the pawn",
    ],
    coachGuidelines: [
      "Teach the concept first, then connect the move to that concept.",
      "Use simple rules of thumb before deeper calculation.",
      "Point out when a move keeps or loses the opposition.",
    ],
  },
  {
    id: "rook-pawn-exceptions",
    name: "Rook Pawn Exceptions",
    description:
      "A beginner trap: extra material is not always enough. Learn why rook pawns can draw even when you look close to promotion.",
    difficulty: "beginner",
    pieces: "K+Rook Pawn vs K",
    track: "pawn-endgames",
    whyItMatters:
      "This prevents one of the most common beginner mistakes: assuming every extra pawn wins.",
    keyConcepts: [
      "Wrong corner",
      "Promotion-square blockade",
      "Do not autopilot winning plans",
      "Recognize drawing fortresses",
    ],
    coachGuidelines: [
      "Be explicit that this lesson is about recognizing a draw, not forcing a win.",
      "Explain why edge pawns are special.",
      "Show how the defender survives by reaching the promotion corner.",
    ],
  },
  {
    id: "lucena",
    name: "Lucena Bridge",
    description:
      "The classic winning rook ending. Learn how the stronger side builds a bridge to shelter the king from checks.",
    difficulty: "intermediate",
    pieces: "R+P vs R",
    track: "rook-endgames",
    whyItMatters:
      "Lucena is the blueprint for converting many rook endings once your pawn reaches the seventh rank.",
    keyConcepts: [
      "Build a bridge",
      "Shield the king from checks",
      "Activate the rook before rushing",
      "Win with technique, not hope",
    ],
    coachGuidelines: [
      "Talk about the bridge image often so the student remembers the pattern.",
      "Emphasize rook activity and king shelter over memorized moves.",
      "Compare wrong tries to the successful bridge plan.",
    ],
  },
  {
    id: "philidor",
    name: "Philidor Defense",
    description:
      "The classic drawing method in rook endings. Learn how the defender uses the third-rank setup and side checks to hold.",
    difficulty: "intermediate",
    pieces: "R vs R+P",
    track: "rook-endgames",
    whyItMatters:
      "Philidor teaches that active defense and the right setup can save many worse rook endings.",
    keyConcepts: [
      "Third-rank defense",
      "Keep the king cut off",
      "Switch to side checks at the right time",
      "Hold the draw with activity",
    ],
    coachGuidelines: [
      "Frame the lesson as defensive skill, not passive suffering.",
      "Point out the exact moment to switch from rank defense to checks.",
      "Make the drawing idea feel repeatable and calm.",
    ],
  },
];

export function getPatternById(id: string): EndgamePattern | undefined {
  return PATTERNS.find((pattern) => pattern.id === id);
}
