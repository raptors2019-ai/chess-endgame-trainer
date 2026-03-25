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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PuzzlePage() {
  const trainer = useEndgameTrainer("puzzle");
  const [currentPattern, setCurrentPattern] = useState<EndgamePattern | null>(
    null
  );
  const [moveCount, setMoveCount] = useState(0);
  const [coachSessionKey, setCoachSessionKey] = useState("puzzle-empty");
  const coachRef = useRef<CoachPanelHandle>(null);

  const handleSelectPattern = useCallback(
    async (pattern: EndgamePattern) => {
      const position = getRandomPosition(pattern.id);
      if (!position) return;

      setCurrentPattern(pattern);
      setMoveCount(0);
      trainer.startPosition(position, pattern.id);
      setCoachSessionKey(`puzzle-${pattern.id}-${position.fen}-${Date.now()}`);

      const context = await trainer.getInitialContext(position);

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
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-12 max-w-4xl mx-auto">
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
    <div className="flex-1 flex flex-col lg:flex-row gap-5 sm:gap-6 p-4 sm:p-6 max-w-6xl mx-auto w-full">
      {/* Board Column */}
      <div className="flex flex-col items-center gap-4 shrink-0 w-full lg:w-auto">
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <h2 className="font-heading font-bold text-base text-center">
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
          key={trainer.fen}
          fen={trainer.fen}
          onMove={handleMove}
          interactive={!trainer.isGameOver && !trainer.isThinking}
        />

        {trainer.isThinking && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Opponent is thinking...
          </p>
        )}

        <Card className="w-full max-w-[480px]" size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Puzzle Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <p className="font-medium text-foreground">
                {trainer.position?.targetResult === "draw"
                  ? "Objective: hold the draw"
                  : "Objective: convert the position"}
              </p>
              <p className="mt-1 text-muted-foreground">
                {trainer.position?.lessonGoal}
              </p>
            </div>
            <Separator />
            <div>
              <p className="font-medium text-foreground">What to look for</p>
              <p className="mt-1 text-muted-foreground">
                {trainer.position?.idealPlan}
              </p>
            </div>
            {trainer.latestMove?.conceptFeedback && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-foreground">
                    Latest takeaway: {trainer.latestMove.conceptFeedback.label}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {trainer.latestMove.conceptFeedback.summary}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {trainer.latestMove.conceptFeedback.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2 flex-wrap justify-center">
          <Button variant="outline" size="sm" onClick={handleNextPuzzle}>
            {trainer.isGameOver ? "Next Puzzle" : "Skip"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPattern(null);
              trainer.clearPosition();
              setCoachSessionKey("puzzle-empty");
            }}
          >
            Change Pattern
          </Button>
        </div>
      </div>

      {/* Coach Column */}
      <div className="flex-1 min-h-[320px] h-[420px] sm:h-[500px] lg:min-h-0 lg:h-[580px]">
        <CoachPanel
          key={coachSessionKey}
          ref={coachRef}
          systemPrompt={trainer.systemPrompt()}
        />
      </div>
    </div>
  );
}
