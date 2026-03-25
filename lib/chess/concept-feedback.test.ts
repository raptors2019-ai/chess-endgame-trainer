import { describe, expect, it } from "vitest";
import { buildConceptFeedback } from "@/lib/chess/concept-feedback";
import { Position } from "@/lib/chess/positions";
import { TablebaseMove, TablebaseResult } from "@/lib/chess/tablebase";

const winningResult: TablebaseResult = {
  category: "win",
  dtm: 9,
  dtz: 9,
  checkmate: false,
  stalemate: false,
  moves: [],
};

function createMove(partial: Partial<TablebaseMove>): TablebaseMove {
  return {
    uci: "a1a2",
    san: "Ra2",
    category: "loss",
    dtm: -8,
    dtz: -8,
    ...partial,
  };
}

function createPosition(partial: Partial<Position>): Position {
  return {
    fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
    title: "Test",
    description: "Test position",
    targetResult: "win",
    lessonGoal: "Test goal",
    idealPlan: "Test plan",
    commonMistakes: [],
    hintLadder: [],
    expectedMoves: 5,
    ...partial,
  };
}

describe("buildConceptFeedback", () => {
  it("identifies rushed checks in rook mate lessons", () => {
    const feedback = buildConceptFeedback({
      patternId: "kr-vs-k",
      position: createPosition({ targetResult: "win" }),
      fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
      userMoveSan: "Ra5+",
      userMoveUci: "a1a5",
      quality: "mistake",
      tablebaseResult: winningResult,
      userTablebaseMove: createMove({ san: "Ra5+", uci: "a1a5", category: "draw" }),
      optimalMove: createMove({ san: "Ke2", uci: "e1e2", category: "loss" }),
    });

    expect(feedback?.label).toBe("Box method interrupted");
    expect(feedback?.tags).toContain("box method");
  });

  it("identifies early pawn pushes in king and pawn lessons", () => {
    const feedback = buildConceptFeedback({
      patternId: "kp-vs-k",
      position: createPosition({ targetResult: "win" }),
      fen: "3k4/3P4/3K4/8/8/8/8/8 w - - 0 1",
      userMoveSan: "d8=Q",
      userMoveUci: "d7d8q",
      quality: "mistake",
      tablebaseResult: winningResult,
      userTablebaseMove: createMove({ san: "d8=Q", uci: "d7d8q", category: "draw" }),
      optimalMove: createMove({ san: "Kc7", uci: "d6c7", category: "loss" }),
    });

    expect(feedback?.label).toBe("Pawn was pushed too early");
    expect(feedback?.tags).toContain("key squares");
  });

  it("rewards recognizing draw mechanics in rook-pawn exceptions", () => {
    const feedback = buildConceptFeedback({
      patternId: "rook-pawn-exceptions",
      position: createPosition({ targetResult: "draw" }),
      fen: "7k/7P/6K1/8/8/8/8/8 w - - 0 1",
      userMoveSan: "Kg5",
      userMoveUci: "g6g5",
      quality: "good",
      tablebaseResult: { ...winningResult, category: "draw", dtm: 0 },
      userTablebaseMove: createMove({ san: "Kg5", uci: "g6g5", category: "draw", dtm: 0 }),
      optimalMove: createMove({ san: "Kg5", uci: "g6g5", category: "draw", dtm: 0 }),
    });

    expect(feedback?.label).toBe("Corner draw recognized");
    expect(feedback?.summary).toContain("extra material");
  });

  it("explains the bridge theme in Lucena", () => {
    const feedback = buildConceptFeedback({
      patternId: "lucena",
      position: createPosition({ targetResult: "win" }),
      fen: "3k4/3P4/2K5/8/8/8/3r4/3R4 w - - 0 1",
      userMoveSan: "Rd4",
      userMoveUci: "d1d4",
      quality: "good",
      tablebaseResult: winningResult,
      userTablebaseMove: createMove({ san: "Rd4", uci: "d1d4", category: "loss" }),
      optimalMove: createMove({ san: "Rd4", uci: "d1d4", category: "loss" }),
    });

    expect(feedback?.label).toBe("Bridge plan on track");
    expect(feedback?.tags).toContain("build the bridge");
  });
});
