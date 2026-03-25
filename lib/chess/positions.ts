export interface Position {
  fen: string;
  title: string;
  description: string;
  targetResult: "win" | "draw";
  lessonGoal: string;
  idealPlan: string;
  commonMistakes: string[];
  hintLadder: string[];
  expectedMoves: number;
}

export const POSITIONS: Record<string, Position[]> = {
  "kq-vs-k": [
    {
      fen: "4k3/8/8/8/8/8/8/Q3K3 w - - 0 1",
      title: "Finish a simple queen mate",
      description: "The enemy king is already near the edge, so the lesson is about calm technique.",
      targetResult: "win",
      lessonGoal: "Use the queen to shrink space first, then bring your king closer without stalemating.",
      idealPlan:
        "Take away a rank or file with the queen, improve your king, and only give checks that keep the king boxed in.",
      commonMistakes: [
        "Checking too early and letting the king run toward the center",
        "Putting the queen next to the king where it can be attacked",
        "Accidentally removing all legal moves too soon and stalemating",
      ],
      hintLadder: [
        "Think restriction first, not check first.",
        "Can your queen cut off a whole rank or file from a safe distance?",
        "After that, which king move helps your own king get closer?",
      ],
      expectedMoves: 7,
    },
    {
      fen: "8/8/8/8/3k4/8/4Q3/4K3 w - - 0 1",
      title: "Central king, same queen-mate idea",
      description: "The defending king has space, so you need to build the box from the center outward.",
      targetResult: "win",
      lessonGoal: "Learn to reduce the king's space one chunk at a time instead of chasing with checks.",
      idealPlan:
        "Use the queen to create a smaller box, then walk your king in and repeat until mate is unavoidable.",
      commonMistakes: [
        "Chasing with checks and losing the box",
        "Moving the queen too close and allowing tempo-gaining attacks",
        "Ignoring king improvement",
      ],
      hintLadder: [
        "Which queen move removes the most escape squares right now?",
        "Pretend you are drawing a fence around the enemy king.",
        "After the fence is built, improve your king instead of checking again.",
      ],
      expectedMoves: 8,
    },
  ],
  "kr-vs-k": [
    {
      fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
      title: "Build the box",
      description: "Classic rook mate technique from a central defending king.",
      targetResult: "win",
      lessonGoal: "Use the rook to cut off the king and shrink the box step by step.",
      idealPlan:
        "Cut off a rank or file with the rook, bring your king closer, and use a rook waiting move when you need to keep the box.",
      commonMistakes: [
        "Giving checks without improving the box",
        "Moving the rook too close so the king attacks it",
        "Forgetting that your king must help",
      ],
      hintLadder: [
        "Your rook should fence the king in before it checks.",
        "What rook move creates the smallest safe box?",
        "Once the box is built, which king move makes progress?",
      ],
      expectedMoves: 15,
    },
    {
      fen: "3k4/8/8/8/8/8/8/R3K3 w - - 0 1",
      title: "Near-edge conversion",
      description: "The king is already near the back rank, so the focus is finishing with clean coordination.",
      targetResult: "win",
      lessonGoal: "Practice the waiting move and final king opposition that convert the box into mate.",
      idealPlan:
        "Keep the rook safe, gain opposition with your king, and save your check for the final mating net.",
      commonMistakes: [
        "Checking before the king is in place",
        "Allowing the defending king to slip sideways",
        "Missing the rook waiting move that keeps the structure intact",
      ],
      hintLadder: [
        "If you check too soon, where can the king escape?",
        "Can you improve your king while the rook keeps the wall in place?",
        "Look for a move that keeps the same box but loses no ground.",
      ],
      expectedMoves: 9,
    },
  ],
  "kp-vs-k": [
    {
      fen: "3k4/3P4/3K4/8/8/8/8/8 w - - 0 1",
      title: "Win by key-square control",
      description: "White is close to promotion, but only if the king uses the right squares.",
      targetResult: "win",
      lessonGoal: "Understand that the king wins this by controlling key squares, not by blindly pushing the pawn.",
      idealPlan:
        "Use the king to support the pawn, keep the opposition when it matters, and only advance the pawn when the king can escort it.",
      commonMistakes: [
        "Pushing the pawn too soon and giving up the winning setup",
        "Walking the king away from the key squares",
        "Ignoring whose move matters in opposition positions",
      ],
      hintLadder: [
        "Do not rush the pawn yet.",
        "Which king move keeps the pawn protected and limits the enemy king?",
        "Ask whether your king or your pawn should move first to keep control.",
      ],
      expectedMoves: 6,
    },
    {
      fen: "8/8/3k4/3P4/3K4/8/8/8 w - - 0 1",
      title: "Same material, different result",
      description: "This similar-looking pawn ending is actually drawn with best play.",
      targetResult: "draw",
      lessonGoal: "Learn to spot when the opposition is missing and the extra pawn is not enough.",
      idealPlan:
        "Try to improve your king first, but notice that the defender reaches the drawing squares if you cannot gain the opposition.",
      commonMistakes: [
        "Assuming every extra pawn must win",
        "Advancing the pawn into a drawn king-front blockade",
        "Missing that move order changes the result",
      ],
      hintLadder: [
        "This is a recognition lesson as much as a winning lesson.",
        "What happens if the pawn advances and the enemy king steps in front?",
        "Compare this setup to a winning one: what crucial square is missing?",
      ],
      expectedMoves: 5,
    },
  ],
  "rook-pawn-exceptions": [
    {
      fen: "7k/7P/6K1/8/8/8/8/8 w - - 0 1",
      title: "Rook pawn fortress",
      description: "White looks one step from promotion, but the corner changes everything.",
      targetResult: "draw",
      lessonGoal: "Recognize the famous rook-pawn draw when the defending king reaches the promotion corner.",
      idealPlan:
        "Notice that the black king already occupies the only square that matters. Without help from another piece, the pawn cannot force promotion.",
      commonMistakes: [
        "Believing proximity to promotion guarantees a win",
        "Ignoring the special drawing power of the corner",
        "Playing on without recognizing the fortress",
      ],
      hintLadder: [
        "This lesson is about recognition, not calculation.",
        "Which square must the defending king hold to draw?",
        "What legal move actually improves White's winning chances here?",
      ],
      expectedMoves: 2,
    },
    {
      fen: "7k/7P/5K2/8/8/8/8/8 w - - 0 1",
      title: "One square farther away, same draw",
      description: "Even with the white king closer, the rook pawn still cannot force the king out of the corner.",
      targetResult: "draw",
      lessonGoal: "See that rook-pawn exceptions are structural, not just tactical.",
      idealPlan:
        "Test candidate king moves, but keep coming back to the same truth: the defending king cannot be pushed off the drawing corner.",
      commonMistakes: [
        "Overvaluing king proximity",
        "Missing that stalemate-like fortresses can exist without full stalemate",
        "Trying to memorize moves instead of the rule",
      ],
      hintLadder: [
        "Ask what White would need that is missing here.",
        "Can the white king actually take the corner away?",
        "The key idea is the promotion corner, not move counting.",
      ],
      expectedMoves: 3,
    },
  ],
  lucena: [
    {
      fen: "3k4/3P4/2K5/8/8/8/3r4/3R4 w - - 0 1",
      title: "Build the bridge",
      description: "A winning rook ending where the stronger side must hide the king from checks.",
      targetResult: "win",
      lessonGoal: "Learn the Lucena idea: use the rook to build a bridge that blocks checking lines.",
      idealPlan:
        "Free your king from the back rank, then place the rook so it shelters the king from side checks while the pawn promotes.",
      commonMistakes: [
        "Trying to queen immediately and walking into endless checks",
        "Keeping the rook passive behind the pawn",
        "Forgetting that king shelter is the whole point of the bridge",
      ],
      hintLadder: [
        "The pawn is strong, but the checks are the real problem.",
        "How can your rook help your king hide from future checks?",
        "Think of the rook as building a shield, not just attacking.",
      ],
      expectedMoves: 6,
    },
  ],
  philidor: [
    {
      fen: "8/8/6k1/4r3/4P3/6K1/8/4R3 b - - 0 1",
      title: "Third-rank defense",
      description: "The defender to move can hold this rook ending by staying active and organized.",
      targetResult: "draw",
      lessonGoal: "Learn the Philidor setup: keep the king cut off and switch to checks only when the pawn advances.",
      idealPlan:
        "Hold the rook on the checking rank while the pawn is not advanced too far, then move behind or to the side to check when the structure changes.",
      commonMistakes: [
        "Checking too soon instead of holding the setup",
        "Letting the enemy king step forward freely",
        "Treating defense as passive instead of active",
      ],
      hintLadder: [
        "You are defending here, not pressing for a win.",
        "Which rook move keeps the attacking king from making progress?",
        "Save the checking sequence for the moment the pawn advances.",
      ],
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
