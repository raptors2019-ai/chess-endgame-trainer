"use client";

import { useState, useCallback, useRef } from "react";
import { ChessBoard } from "@/components/chess-board";
import { CoachPanel, CoachPanelHandle } from "@/components/coach-panel";
import { PatternSelector } from "@/components/pattern-selector";
import { useEndgameTrainer } from "@/lib/hooks/use-endgame-trainer";
import { getRandomPosition } from "@/lib/chess/positions";
import { EndgamePattern } from "@/lib/chess/patterns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PuzzlePage() {
  const trainer = useEndgameTrainer("puzzle");
  const [currentPattern, setCurrentPattern] = useState<EndgamePattern | null>(
    null
  );
  const [moveCount, setMoveCount] = useState(0);
  const coachRef = useRef<CoachPanelHandle>(null);

  const handleSelectPattern = useCallback(
    async (pattern: EndgamePattern) => {
      const position = getRandomPosition(pattern.id);
      if (!position) return;

      setCurrentPattern(pattern);
      setMoveCount(0);
      trainer.startPosition(position.fen, pattern.id);

      const context = await trainer.getInitialContext(
        position.fen,
        position.description
      );

      setTimeout(() => {
        coachRef.current?.sendContext(context);
      }, 100);
    },
    [trainer]
  );

  const handleMove = useCallback(
    async (
      from: string,
      to: string,
      newFen: string,
      san: string,
      uci: string
    ) => {
      setMoveCount((c) => c + 1);
      const contextMessage = await trainer.handleMove(
        from,
        to,
        newFen,
        san,
        uci
      );
      if (contextMessage) {
        coachRef.current?.sendContext(contextMessage);
      }
    },
    [trainer]
  );

  const handleNextPuzzle = useCallback(() => {
    if (!currentPattern) return;
    handleSelectPattern(currentPattern);
  }, [currentPattern, handleSelectPattern]);

  if (!trainer.fen) {
    return (
      <div className="flex-1 flex flex-col items-center px-6 py-12 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight mb-2">
            Puzzle Mode
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Choose a pattern to practice. Find the winning moves — ask your
            coach for hints if you get stuck!
          </p>
        </div>
        <PatternSelector onSelect={handleSelectPattern} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Board Column */}
      <div className="flex flex-col items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <h2 className="font-heading font-bold text-base">
            {currentPattern?.name}
          </h2>
          <Badge variant="outline" className="text-xs font-mono">
            Moves: {moveCount}
          </Badge>
          {trainer.isGameOver && (
            <Badge
              variant={
                trainer.gameOverReason === "checkmate"
                  ? "default"
                  : "destructive"
              }
              className="text-xs"
            >
              {trainer.gameOverReason === "checkmate"
                ? "Solved!"
                : trainer.gameOverReason}
            </Badge>
          )}
        </div>

        <ChessBoard
          fen={trainer.fen}
          onMove={handleMove}
          interactive={!trainer.isGameOver && !trainer.isThinking}
        />

        {trainer.isThinking && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Opponent is thinking...
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleNextPuzzle}>
            {trainer.isGameOver ? "Next Puzzle" : "Skip"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPattern(null);
              trainer.startPosition("", "");
            }}
          >
            Change Pattern
          </Button>
        </div>
      </div>

      {/* Coach Column */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 lg:h-[580px]">
        <CoachPanel ref={coachRef} systemPrompt={trainer.systemPrompt()} />
      </div>
    </div>
  );
}
