"use client";

import { useState, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import {
  queryTablebase,
  getOptimalMove,
  evaluateUserMove,
  TablebaseResult,
} from "@/lib/chess/tablebase";
import { buildMoveMessage, buildCoachSystemPrompt } from "@/lib/coach-prompt";
import { getPatternById } from "@/lib/chess/patterns";
import { getProgress, getProgressSummary, recordAttempt } from "@/lib/progress";

interface MoveRecord {
  fen: string;
  san: string;
  uci: string;
  quality: string;
}

export function useEndgameTrainer(mode: "lesson" | "puzzle") {
  const [fen, setFen] = useState<string | null>(null);
  const [patternId, setPatternId] = useState<string | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);
  const mistakesRef = useRef<{ fen: string; wrongMove: string; correctMove: string }[]>([]);

  const systemPrompt = useCallback(() => {
    const pattern = patternId ? getPatternById(patternId) : undefined;
    const progress = getProgress();
    return buildCoachSystemPrompt({
      patternName: pattern?.name,
      patternDescription: pattern?.description,
      keyConcepts: pattern?.keyConcepts,
      mode,
      progressSummary: getProgressSummary(progress),
    });
  }, [patternId, mode]);

  const startPosition = useCallback(
    (newFen: string, newPatternId: string) => {
      setFen(newFen);
      setPatternId(newPatternId);
      setMoveHistory([]);
      setIsGameOver(false);
      setGameOverReason("");
      mistakesRef.current = [];
    },
    []
  );

  const handleMove = useCallback(
    async (
      from: string,
      to: string,
      newFen: string,
      san: string,
      uci: string
    ): Promise<string> => {
      if (!fen) return "";

      // Query tablebase for the position BEFORE the user's move
      const tbResult = await queryTablebase(fen);
      let quality = "good";
      let optimalMove = null;

      if (tbResult) {
        const evaluation = evaluateUserMove(tbResult, uci);
        quality = evaluation.quality;
        optimalMove = getOptimalMove(tbResult);

        if (quality === "mistake" || quality === "inaccuracy") {
          mistakesRef.current.push({
            fen,
            wrongMove: san,
            correctMove: optimalMove?.san || "unknown",
          });
        }
      }

      setMoveHistory((prev) => [...prev, { fen, san, uci, quality }]);

      // Check if game is over after user's move
      const gameAfterUser = new Chess(newFen);
      if (gameAfterUser.isCheckmate()) {
        setFen(newFen);
        setIsGameOver(true);
        setGameOverReason("checkmate");

        if (patternId) {
          recordAttempt(patternId, true, moveHistory.length + 1, mistakesRef.current);
        }

        return buildMoveMessage({
          fen: newFen,
          userMove: { san, uci, quality },
          tablebaseAnalysis: tbResult
            ? {
                category: tbResult.category,
                dtm: tbResult.dtm,
                optimalMove: optimalMove
                  ? { san: optimalMove.san, uci: optimalMove.uci, dtm: optimalMove.dtm }
                  : null,
              }
            : null,
          isGameOver: true,
          gameOverReason: "Checkmate! You did it!",
        });
      }

      if (gameAfterUser.isStalemate() || gameAfterUser.isDraw()) {
        setFen(newFen);
        setIsGameOver(true);
        const reason = gameAfterUser.isStalemate() ? "stalemate" : "draw";
        setGameOverReason(reason);

        if (patternId) {
          recordAttempt(patternId, false, moveHistory.length + 1, mistakesRef.current);
        }

        return buildMoveMessage({
          fen: newFen,
          userMove: { san, uci, quality },
          isGameOver: true,
          gameOverReason: reason === "stalemate" ? "Stalemate — the game is drawn!" : "Draw",
        });
      }

      // Make the opponent's reply using tablebase
      setIsThinking(true);
      let opponentSan = "";

      try {
        const opponentTb = await queryTablebase(newFen);
        if (opponentTb) {
          const opponentBest = getOptimalMove(opponentTb);
          if (opponentBest) {
            const opponentGame = new Chess(newFen);
            const opponentMove = opponentGame.move({
              from: opponentBest.uci.slice(0, 2),
              to: opponentBest.uci.slice(2, 4),
              promotion: opponentBest.uci.length > 4 ? opponentBest.uci[4] : undefined,
            });

            if (opponentMove) {
              opponentSan = opponentMove.san;
              const fenAfterOpponent = opponentGame.fen();

              // Check if game over after opponent's move
              if (opponentGame.isCheckmate() || opponentGame.isStalemate() || opponentGame.isDraw()) {
                setFen(fenAfterOpponent);
                setIsGameOver(true);
                const reason = opponentGame.isCheckmate() ? "checkmate" : "draw";
                setGameOverReason(reason);
              } else {
                setFen(fenAfterOpponent);
              }
            }
          }
        }
      } finally {
        setIsThinking(false);
      }

      // Build the context message for the coach
      const newTbResult = fen ? await queryTablebase(fen) : null;

      return buildMoveMessage({
        fen: newFen,
        userMove: { san, uci, quality },
        tablebaseAnalysis: tbResult
          ? {
              category: tbResult.category,
              dtm: tbResult.dtm,
              optimalMove: optimalMove
                ? { san: optimalMove.san, uci: optimalMove.uci, dtm: optimalMove.dtm }
                : null,
              allMoves: tbResult.moves.slice(0, 5).map((m) => ({
                san: m.san,
                uci: m.uci,
                category: m.category,
                dtm: m.dtm,
              })),
            }
          : null,
        opponentMove: opponentSan ? { san: opponentSan } : null,
      });
    },
    [fen, moveHistory.length, patternId]
  );

  // Get initial context for the coach when a position is loaded
  const getInitialContext = useCallback(
    async (positionFen: string, description: string): Promise<string> => {
      const tbResult = await queryTablebase(positionFen);
      const optimalMove = tbResult ? getOptimalMove(tbResult) : null;

      const intro =
        mode === "lesson"
          ? `A new lesson position has been set up: ${description}. Please introduce this position and explain the key technique the student needs to learn.`
          : `A new puzzle has been set up: ${description}.${tbResult?.dtm ? ` It's mate in ${Math.abs(tbResult.dtm)}.` : ""} Present the challenge to the student.`;

      return `${buildMoveMessage({
        fen: positionFen,
        tablebaseAnalysis: tbResult
          ? {
              category: tbResult.category,
              dtm: tbResult.dtm,
              optimalMove: optimalMove
                ? { san: optimalMove.san, uci: optimalMove.uci, dtm: optimalMove.dtm }
                : null,
              allMoves: tbResult.moves.slice(0, 5).map((m) => ({
                san: m.san,
                uci: m.uci,
                category: m.category,
                dtm: m.dtm,
              })),
            }
          : null,
      })}\n\n${intro}`;
    },
    [mode]
  );

  return {
    fen,
    patternId,
    moveHistory,
    isGameOver,
    gameOverReason,
    isThinking,
    systemPrompt,
    startPosition,
    handleMove,
    getInitialContext,
  };
}
