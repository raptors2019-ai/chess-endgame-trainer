"use client";

import { useState, useCallback, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";

interface ChessBoardProps {
  fen: string;
  onMove?: (
    from: string,
    to: string,
    newFen: string,
    san: string,
    uci: string
  ) => void | Promise<void>;
  onGameOver?: (result: "checkmate" | "stalemate" | "draw") => void;
  interactive?: boolean;
  orientation?: "white" | "black";
}

export function ChessBoard({
  fen,
  onMove,
  onGameOver,
  interactive = true,
  orientation = "white",
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);

  const game = useMemo(() => {
    const g = new Chess();
    g.load(fen);
    return g;
  }, [fen]);

  const legalMovesForSquare = useMemo(() => {
    if (!selectedSquare) return {};
    const moves = game.moves({ square: selectedSquare, verbose: true });
    const styles: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      styles[move.to] = {
        background:
          game.get(move.to as Square)
            ? "radial-gradient(circle, rgba(0,0,0,0.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,0.15) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });
    return styles;
  }, [selectedSquare, game]);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(255, 255, 0, 0.3)",
      };
    }
    return { ...styles, ...legalMovesForSquare };
  }, [selectedSquare, legalMovesForSquare]);

  const tryMove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!interactive || isSubmittingMove) return false;

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // auto-promote to queen for simplicity
        });

        if (!move) return false;

        const uci = move.from + move.to + (move.promotion || "");
        setSelectedSquare(null);
        setIsSubmittingMove(true);
        Promise.resolve(onMove?.(move.from, move.to, game.fen(), move.san, uci)).catch(
          (error) => {
            console.error("Move handling failed:", error);
            setIsSubmittingMove(false);
          }
        );

        if (game.isCheckmate()) {
          onGameOver?.("checkmate");
        } else if (game.isStalemate()) {
          onGameOver?.("stalemate");
        } else if (game.isDraw()) {
          onGameOver?.("draw");
        }

        return true;
      } catch {
        return false;
      }
    },
    [game, interactive, isSubmittingMove, onMove, onGameOver]
  );

  return (
    <div className="rounded-lg overflow-hidden shadow-lg" style={{ width: 480, height: 480 }}>
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: interactive && !isSubmittingMove,
          squareStyles: customSquareStyles,
          darkSquareStyle: { backgroundColor: "#779952" },
          lightSquareStyle: { backgroundColor: "#edeed1" },
          animationDurationInMs: 200,
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            return tryMove(sourceSquare, targetSquare);
          },
          onSquareClick: ({ square }) => {
            if (!interactive || isSubmittingMove) return;

            if (selectedSquare) {
              const success = tryMove(selectedSquare, square);
              if (!success) {
                const piece = game.get(square as Square);
                if (piece && piece.color === game.turn()) {
                  setSelectedSquare(square as Square);
                } else {
                  setSelectedSquare(null);
                }
              }
            } else {
              const piece = game.get(square as Square);
              if (piece && piece.color === game.turn()) {
                setSelectedSquare(square as Square);
              }
            }
          },
        }}
      />
    </div>
  );
}
