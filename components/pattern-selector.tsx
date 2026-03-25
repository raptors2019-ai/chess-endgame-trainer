"use client";

import { PATTERNS, EndgamePattern } from "@/lib/chess/patterns";
import { Badge } from "@/components/ui/badge";

interface PatternSelectorProps {
  onSelect: (pattern: EndgamePattern) => void;
}

const difficultyConfig = {
  beginner: {
    label: "Beginner",
    className: "bg-chess-green-light text-chess-green-dark border-chess-green/20",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-chess-amber/10 text-chess-amber border-chess-amber/20",
  },
  advanced: {
    label: "Advanced",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const patternIcons: Record<string, string> = {
  "kq-vs-k": "♛",
  "kr-vs-k": "♜",
  "kp-vs-k": "♟",
  "rook-pawn-exceptions": "♟",
  lucena: "♜",
  philidor: "♜",
};

const trackLabels: Record<EndgamePattern["track"], string> = {
  "basic-mates": "Basic Mates",
  "pawn-endgames": "Pawn Endgames",
  "rook-endgames": "Rook Endgames",
};

export function PatternSelector({ onSelect }: PatternSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {PATTERNS.map((pattern) => {
        const diff = difficultyConfig[pattern.difficulty];
        return (
          <button
            key={pattern.id}
            onClick={() => onSelect(pattern)}
            className="text-left bg-card border border-border rounded-xl p-5 transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">
                {patternIcons[pattern.id] || "♔"}
              </span>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {trackLabels[pattern.track]}
                </Badge>
                <Badge variant="outline" className={`text-xs ${diff.className}`}>
                  {diff.label}
                </Badge>
              </div>
            </div>
            <h3 className="font-heading font-bold text-sm mb-1">
              {pattern.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {pattern.whyItMatters}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pattern.keyConcepts.slice(0, 2).map((concept) => (
                <span
                  key={concept}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {concept}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
