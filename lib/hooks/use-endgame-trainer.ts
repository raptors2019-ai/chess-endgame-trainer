"use client";

import { useState, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import {
  queryTablebase,
  getOptimalMove,
  evaluateUserMove,
} from "@/lib/chess/tablebase";
import { buildConceptFeedback } from "@/lib/chess/concept-feedback";
import { Position } from "@/lib/chess/positions";
import { buildMoveMessage, buildCoachSystemPrompt } from "@/lib/coach-prompt";
import { getPatternById } from "@/lib/chess/patterns";
import { getProgress, getProgressSummary, recordAttempt } from "@/lib/progress";

interface MoveRecord {
  fen: string;
  san: string;
  uci: string;
  quality: string;
}

function getLessonContext(position: Position | null) {
  if (!position) return null;

  return {
    title: position.title,
    targetResult: position.targetResult,
    lessonGoal: position.lessonGoal,
    idealPlan: position.idealPlan,
    commonMistakes: position.commonMistakes,
    hintLadder: position.hintLadder,
  };
}

export function useEndgameTrainer(mode: "lesson" | "puzzle") {
  const [fen, setFen] = useState<string | null>(null);
  const [patternId, setPatternId] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
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
      whyItMatters: pattern?.whyItMatters,
      keyConcepts: pattern?.keyConcepts,
      coachGuidelines: pattern?.coachGuidelines,
      lessonTitle: position?.title,
      lessonGoal: position?.lessonGoal,
      idealPlan: position?.idealPlan,
      commonMistakes: position?.commonMistakes,
      hintLadder: position?.hintLadder,
      mode,
      progressSummary: getProgressSummary(progress),
    });
  }, [patternId, position, mode]);

  const startPosition = useCallback((newPosition: Position, newPatternId: string) => {
    setFen(newPosition.fen);
    setPatternId(newPatternId);
    setPosition(newPosition);
    setMoveHistory([]);
    setIsGameOver(false);
    setGameOverReason("");
    setIsThinking(false);
    mistakesRef.current = [];
  }, []);

  const clearPosition = useCallback(() => {
    setFen(null);
    setPatternId(null);
    setPosition(null);
    setMoveHistory([]);
    setIsGameOver(false);
    setGameOverReason("");
    setIsThinking(false);
    mistakesRef.current = [];
  }, []);

  const handleMove = useCallback(
    async (
      from: string,
      to: string,
      newFen: string,
      san: string,
      uci: string
    ): Promise<string> => {
      void from;
      void to;

      if (!fen) return "";

      const lessonContext = getLessonContext(position);
      const tbResult = await queryTablebase(fen);
      let quality = "good";
      let optimalMove = null;
      let userTablebaseMove = null;

      if (tbResult) {
        const evaluation = evaluateUserMove(tbResult, uci);
        quality = evaluation.quality;
        userTablebaseMove = evaluation.move;
        optimalMove = getOptimalMove(tbResult);

        if (quality === "mistake" || quality === "inaccuracy") {
          mistakesRef.current.push({
            fen,
            wrongMove: san,
            correctMove: optimalMove?.san || "unknown",
          });
        }
      }

      const conceptFeedback = buildConceptFeedback({
        patternId,
        position,
        fen,
        userMoveSan: san,
        userMoveUci: uci,
        quality: quality as "optimal" | "good" | "inaccuracy" | "mistake",
        tablebaseResult: tbResult,
        userTablebaseMove,
        optimalMove,
      });

      setMoveHistory((prev) => [...prev, { fen, san, uci, quality }]);

      const gameAfterUser = new Chess(newFen);
      if (gameAfterUser.isCheckmate()) {
        setFen(newFen);
        setIsGameOver(true);
        setGameOverReason("checkmate");

        if (patternId) {
          recordAttempt(
            patternId,
            position?.targetResult === "win",
            moveHistory.length + 1,
            mistakesRef.current
          );
        }

        return buildMoveMessage({
          fen: newFen,
          userMove: { san, uci, quality, conceptFeedback },
          lessonContext,
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
          recordAttempt(
            patternId,
            position?.targetResult === "draw",
            moveHistory.length + 1,
            mistakesRef.current
          );
        }

        return buildMoveMessage({
          fen: newFen,
          userMove: { san, uci, quality, conceptFeedback },
          lessonContext,
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
          gameOverReason:
            reason === "stalemate" ? "Stalemate — the game is drawn!" : "Draw",
        });
      }

      setFen(newFen);
      setIsThinking(true);
      let opponentSan = "";
      let fenForCoach = newFen;
      let opponentEndedGame = false;
      let opponentEndReason = "";

      try {
        const opponentTb = await queryTablebase(newFen);
        if (opponentTb) {
          const opponentBest = getOptimalMove(opponentTb);
          if (opponentBest) {
            const opponentGame = new Chess(newFen);
            const opponentMove = opponentGame.move({
              from: opponentBest.uci.slice(0, 2),
              to: opponentBest.uci.slice(2, 4),
              promotion:
                opponentBest.uci.length > 4 ? opponentBest.uci[4] : undefined,
            });

            if (opponentMove) {
              opponentSan = opponentMove.san;
              fenForCoach = opponentGame.fen();

              if (
                opponentGame.isCheckmate() ||
                opponentGame.isStalemate() ||
                opponentGame.isDraw()
              ) {
                opponentEndedGame = true;
                setFen(fenForCoach);
                setIsGameOver(true);
                opponentEndReason = opponentGame.isCheckmate()
                  ? "checkmate"
                  : opponentGame.isStalemate()
                    ? "stalemate"
                    : "draw";
                setGameOverReason(opponentEndReason);
                if (patternId) {
                  recordAttempt(
                    patternId,
                    opponentEndReason !== "checkmate" && position?.targetResult === "draw",
                    moveHistory.length + 1,
                    mistakesRef.current
                  );
                }
              } else {
                setFen(fenForCoach);
              }
            }
          }
        }
      } finally {
        setIsThinking(false);
      }

      return buildMoveMessage({
        fen: fenForCoach,
        userMove: { san, uci, quality, conceptFeedback },
        lessonContext,
        tablebaseAnalysis: tbResult
          ? {
              category: tbResult.category,
              dtm: tbResult.dtm,
              optimalMove: optimalMove
                ? { san: optimalMove.san, uci: optimalMove.uci, dtm: optimalMove.dtm }
                : null,
              allMoves: tbResult.moves.slice(0, 5).map((move) => ({
                san: move.san,
                uci: move.uci,
                category: move.category,
                dtm: move.dtm,
              })),
            }
          : null,
        opponentMove: opponentSan ? { san: opponentSan } : null,
        isGameOver: opponentEndedGame,
        gameOverReason: opponentEndedGame
          ? opponentEndReason === "stalemate"
            ? "Stalemate — the game is drawn!"
            : opponentEndReason === "draw"
              ? "Draw"
              : "Checkmate"
          : undefined,
      });
    },
    [fen, moveHistory.length, patternId, position]
  );

  const getInitialContext = useCallback(
    async (newPosition: Position): Promise<string> => {
      const tbResult = await queryTablebase(newPosition.fen);
      const optimalMove = tbResult ? getOptimalMove(tbResult) : null;

      const intro =
        mode === "lesson"
          ? `A new lesson position has been set up: ${newPosition.description} The training objective is to ${newPosition.targetResult === "draw" ? "hold the draw" : "convert the position"}. Introduce the concept simply, explain the plan, and tell the student what to watch for.`
          : `A new puzzle has been set up: ${newPosition.description}${tbResult?.dtm ? ` The tablebase shows mate in ${Math.abs(tbResult.dtm)}.` : ""} The training objective is to ${newPosition.targetResult === "draw" ? "hold the draw" : "convert the position"}. Present the challenge without giving away the answer, and use the hint ladder if the student asks for help.`;

      return `${buildMoveMessage({
        fen: newPosition.fen,
        lessonContext: getLessonContext(newPosition),
        tablebaseAnalysis: tbResult
          ? {
              category: tbResult.category,
              dtm: tbResult.dtm,
              optimalMove: optimalMove
                ? { san: optimalMove.san, uci: optimalMove.uci, dtm: optimalMove.dtm }
                : null,
              allMoves: tbResult.moves.slice(0, 5).map((move) => ({
                san: move.san,
                uci: move.uci,
                category: move.category,
                dtm: move.dtm,
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
    position,
    moveHistory,
    isGameOver,
    gameOverReason,
    isThinking,
    systemPrompt,
    startPosition,
    clearPosition,
    handleMove,
    getInitialContext,
  };
}
