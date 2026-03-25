"use client";

import { useState } from "react";
import { getProgress, Progress, getWeakPatterns } from "@/lib/progress";
import { getPatternById, PATTERNS } from "@/lib/chess/patterns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProgressPage() {
  const [progress] = useState<Progress>(() => getProgress());

  if (!progress) return null;

  const weakPatterns = getWeakPatterns(progress);
  const hasAnyProgress = Object.keys(progress.patterns).length > 0;

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-12 max-w-3xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-2">
          Your Progress
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your endgame training journey.
        </p>
      </div>

      {hasAnyProgress && (
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-3xl font-bold font-mono text-foreground">
                {progress.totalSessions}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-3xl font-bold font-mono text-foreground">
                {progress.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-3xl font-bold font-mono text-foreground">
                {Object.values(progress.patterns).reduce(
                  (sum, p) => sum + p.solved,
                  0
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Puzzles Solved
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {weakPatterns.length > 0 && (
        <Card className="w-full mb-8 border-chess-amber/30 bg-chess-amber/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">
              Needs Practice
            </CardTitle>
            <CardDescription className="text-xs">
              These patterns have a success rate below 50%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {weakPatterns.map((id) => {
                const pattern = getPatternById(id);
                return pattern ? (
                  <Badge
                    key={id}
                    variant="outline"
                    className="text-chess-amber border-chess-amber/30"
                  >
                    {pattern.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="mb-8" />

      <div className="w-full space-y-3">
        {PATTERNS.map((pattern) => {
          const p = progress.patterns[pattern.id];
          const rate =
            p && p.attempted > 0
              ? Math.round((p.solved / p.attempted) * 100)
              : null;

          return (
            <Card key={pattern.id}>
              <CardHeader className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-heading">
                      {pattern.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {pattern.pieces}
                    </CardDescription>
                  </div>
                  {p ? (
                    <div className="text-right">
                      <p className="text-sm font-mono font-medium">
                        {p.solved}/{p.attempted}
                        <span className="text-muted-foreground ml-1.5">
                          ({rate}%)
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Last: {p.lastPracticed}
                      </p>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs text-muted-foreground"
                    >
                      Not started
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
