import { Chess, Square } from "chess.js";
import { Position } from "@/lib/chess/positions";
import { TablebaseMove, TablebaseResult } from "@/lib/chess/tablebase";

export interface ConceptFeedback {
  label: string;
  summary: string;
  tags: string[];
}

interface BuildConceptFeedbackParams {
  patternId: string | null;
  position: Position | null;
  fen: string;
  userMoveSan: string;
  userMoveUci: string;
  quality: "optimal" | "good" | "inaccuracy" | "mistake";
  tablebaseResult: TablebaseResult | null;
  userTablebaseMove: TablebaseMove | null;
  optimalMove: TablebaseMove | null;
}

function movedPieceType(fen: string, uci: string): string | null {
  const game = new Chess(fen);
  const piece = game.get(uci.slice(0, 2) as Square);
  return piece?.type ?? null;
}

function isCheckMove(san: string): boolean {
  return san.includes("+") || san.includes("#");
}

function isPawnPush(pieceType: string | null): boolean {
  return pieceType === "p";
}

function isKingMove(pieceType: string | null): boolean {
  return pieceType === "k";
}

function isRookMove(pieceType: string | null): boolean {
  return pieceType === "r";
}

function buildGenericFeedback(params: BuildConceptFeedbackParams): ConceptFeedback {
  const { quality, optimalMove, userTablebaseMove, position } = params;

  if (quality === "optimal") {
    return {
      label: "Best move found",
      summary: "That move matched the best tablebase plan and kept the lesson idea fully on track.",
      tags: ["best move", position?.targetResult === "draw" ? "held the draw" : "kept the win"],
    };
  }

  if (quality === "good") {
    return {
      label: "Plan still works",
      summary: "That was not the cleanest route, but it still kept the right endgame idea alive.",
      tags: ["plan kept", position?.targetResult === "draw" ? "safe defense" : "safe conversion"],
    };
  }

  if (quality === "inaccuracy") {
    return {
      label: "Plan slowed down",
      summary: `The move still ${
        userTablebaseMove?.category === optimalMove?.category ? "kept the same result" : "held on for now"
      }, but it made the technique less clear or less efficient.`,
      tags: ["slower technique", "improve conversion"],
    };
  }

  return {
    label: "Critical idea missed",
    summary: "That move missed the main idea of the position and changed the result or made the task much harder.",
    tags: ["critical mistake", "missed idea"],
  };
}

export function buildConceptFeedback(
  params: BuildConceptFeedbackParams
): ConceptFeedback | null {
  const { patternId, position, fen, userMoveSan, userMoveUci, quality, tablebaseResult } =
    params;

  if (!patternId || !position || !tablebaseResult) {
    return null;
  }

  const pieceType = movedPieceType(fen, userMoveUci);
  const checked = isCheckMove(userMoveSan);

  switch (patternId) {
    case "kq-vs-k":
      if (quality === "mistake" || quality === "inaccuracy") {
        if (checked) {
          return {
            label: "Checked before tightening the net",
            summary:
              "This queen endgame is usually won by shrinking the king's space first. The check looked active, but it did not improve the box enough.",
            tags: ["box control", "restrict first", "avoid rushing checks"],
          };
        }
        return {
          label: "Box not improved cleanly",
          summary:
            "The move did not lose immediately, but it missed the main queen-mate habit: restrict the king safely, then bring your king closer.",
          tags: ["box control", "king support"],
        };
      }
      return {
        label: "Kept the mating net tight",
        summary:
          isKingMove(pieceType)
            ? "Good king improvement. In queen mates, bringing the king in safely is often the real progress move."
            : "Good restriction. The queen kept the king boxed in instead of just chasing with checks.",
        tags: ["box control", isKingMove(pieceType) ? "king support" : "safe restriction"],
      };

    case "kr-vs-k":
      if (quality === "mistake" || quality === "inaccuracy") {
        if (checked) {
          return {
            label: "Box method interrupted",
            summary:
              "The rook check was tempting, but rook mates are about shrinking the box with control, not checking on autopilot.",
            tags: ["box method", "avoid pointless checks", "keep the wall"],
          };
        }
        if (isRookMove(pieceType)) {
          return {
            label: "Rook wall drifted",
            summary:
              "The rook moved, but it did not keep the king cut off cleanly. In this mate, the rook should act like a wall first.",
            tags: ["box method", "cutoff", "rook wall"],
          };
        }
        return {
          label: "King support came too late",
          summary:
            "The move missed the coordination idea. In rook mate technique, your king is what forces the final squeeze.",
          tags: ["king support", "opposition"],
        };
      }
      return {
        label: isKingMove(pieceType) ? "King helped the squeeze" : "Box stayed under control",
        summary: isKingMove(pieceType)
          ? "Nice improvement. Your king move supports the rook and helps take away the enemy king's last safe squares."
          : "That move kept the rook wall working and preserved the box method.",
        tags: ["box method", isKingMove(pieceType) ? "king support" : "rook control"],
      };

    case "kp-vs-k":
      if (position.targetResult === "draw") {
        if (quality === "mistake") {
          return {
            label: "Drawing setup lost",
            summary:
              "This was one of those pawn endings where move order matters a lot. The move gave up the drawing structure instead of holding the key defensive squares.",
            tags: ["opposition", "drawing setup", "key squares"],
          };
        }
        return {
          label: "Recognized the drawing mechanism",
          summary:
            "Good practical thinking. The goal here is not to force something, but to understand that the stronger side cannot make progress.",
          tags: ["draw recognition", "opposition", "key squares"],
        };
      }

      if ((quality === "mistake" || quality === "inaccuracy") && isPawnPush(pieceType)) {
        return {
          label: "Pawn was pushed too early",
          summary:
            "This pawn ending is won by king placement and key squares first. Pushing the pawn before the king is ready often throws the win away.",
          tags: ["key squares", "do not rush the pawn", "opposition"],
        };
      }

      if ((quality === "mistake" || quality === "inaccuracy") && isKingMove(pieceType)) {
        return {
          label: "Opposition slipped away",
          summary:
            "The king move looked natural, but it gave up the square battle that decides these pawn endings.",
          tags: ["opposition", "key squares", "king placement"],
        };
      }

      return {
        label: isKingMove(pieceType) ? "King took the key squares" : "Pawn push was timed well",
        summary: isKingMove(pieceType)
          ? "Nice restraint. The king move respected the real rule of the position: king activity before pawn rush."
          : "Good timing. The pawn advanced only after the supporting squares were under control.",
        tags: ["key squares", "opposition", isKingMove(pieceType) ? "king activity" : "timed pawn push"],
      };

    case "rook-pawn-exceptions":
      if (quality === "mistake") {
        return {
          label: "Rook-pawn fortress misunderstood",
          summary:
            "This is a recognition lesson. The key idea is that the promotion corner holds the draw, even if the pawn looks dangerously close.",
          tags: ["rook pawn", "fortress", "wrong corner"],
        };
      }
      return {
        label: "Corner draw recognized",
        summary:
          "Good endgame awareness. You treated the corner fortress as the real story of the position instead of assuming extra material must win.",
        tags: ["rook pawn", "fortress", "draw recognition"],
      };

    case "lucena":
      if (quality === "mistake" || quality === "inaccuracy") {
        return {
          label: "Bridge idea missed",
          summary:
            "Lucena is won by building shelter from checks. The move missed that bridge idea and made the king's path less safe.",
          tags: ["lucena", "build the bridge", "king shelter"],
        };
      }
      return {
        label: "Bridge plan on track",
        summary:
          isRookMove(pieceType)
            ? "Good rook activity. In Lucena, the rook often works as a shield, not just an attacker."
            : "Good progress. The move respected the bridge idea and kept the promotion plan healthy.",
        tags: ["lucena", "build the bridge", isRookMove(pieceType) ? "rook activity" : "king shelter"],
      };

    case "philidor":
      if (quality === "mistake" || quality === "inaccuracy") {
        return {
          label: "Philidor setup abandoned",
          summary:
            "This defensive lesson is about holding the right setup until the pawn commits. The move let go of that structure too early.",
          tags: ["philidor", "third-rank defense", "active defense"],
        };
      }
      return {
        label: "Philidor defense held",
        summary:
          "Nice defensive discipline. You kept the drawing setup together instead of drifting into passive or careless checks.",
        tags: ["philidor", "third-rank defense", "hold the draw"],
      };

    default:
      return buildGenericFeedback(params);
  }
}
