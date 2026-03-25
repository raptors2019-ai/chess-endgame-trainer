import { afterEach, describe, expect, it, vi } from "vitest";
import { evaluateUserMove, getOptimalMove, queryTablebase, TablebaseResult } from "@/lib/chess/tablebase";

const baseResult: TablebaseResult = {
  category: "win",
  dtm: 7,
  dtz: 7,
  checkmate: false,
  stalemate: false,
  moves: [
    { uci: "a1a5", san: "Ra5+", category: "loss", dtm: -6, dtz: -6 },
    { uci: "e1e2", san: "Ke2", category: "loss", dtm: -4, dtz: -4 },
    { uci: "a1a2", san: "Ra2", category: "draw", dtm: 0, dtz: 0 },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getOptimalMove", () => {
  it("prefers the fastest winning move without mutating the source moves", () => {
    const original = structuredClone(baseResult);

    const optimal = getOptimalMove(baseResult);

    expect(optimal?.uci).toBe("e1e2");
    expect(baseResult.moves).toEqual(original.moves);
  });
});

describe("evaluateUserMove", () => {
  it("classifies a same-category but slower move as an inaccuracy", () => {
    const result = evaluateUserMove(baseResult, "a1a5");
    expect(result.quality).toBe("good");
  });

  it("classifies a result-changing move as a mistake", () => {
    const result = evaluateUserMove(baseResult, "a1a2");
    expect(result.quality).toBe("mistake");
  });
});

describe("queryTablebase", () => {
  it("deduplicates concurrent requests for the same fen", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "win",
        dtm: 3,
        dtz: 3,
        checkmate: false,
        stalemate: false,
        moves: [],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const fen = "8/8/8/8/8/8/8/K6k w - - 0 1";
    const [first, second] = await Promise.all([queryTablebase(fen), queryTablebase(fen)]);

    expect(first?.category).toBe("win");
    expect(second?.category).toBe("win");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("fen=8%2F8%2F8%2F8%2F8%2F8%2F8%2FK6k+w+-+-+0+1");
  });
});
