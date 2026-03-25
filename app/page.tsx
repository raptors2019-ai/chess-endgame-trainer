import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      {/* Hero */}
      <div className="max-w-lg w-full text-center mb-12">
        <div className="text-6xl mb-6">♔</div>
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-3 text-foreground">
          Master the Endgame
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
          Learn essential checkmate patterns with an AI coach that explains
          every move in plain English. No engine jargon — just clear concepts.
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl w-full">
        <Link href="/lesson" className="group">
          <div className="bg-card border border-border rounded-xl p-6 h-full transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
            <div className="text-3xl mb-3">📖</div>
            <h2 className="font-heading text-lg font-bold mb-1.5">Learn</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Step-by-step lessons on checkmate patterns. Your coach explains
              the technique as you play each move.
            </p>
          </div>
        </Link>

        <Link href="/puzzle" className="group">
          <div className="bg-card border border-border rounded-xl p-6 h-full transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
            <div className="text-3xl mb-3">🧩</div>
            <h2 className="font-heading text-lg font-bold mb-1.5">Practice</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Test your skills with puzzles. Find the winning moves — ask for
              hints when you get stuck.
            </p>
          </div>
        </Link>
      </div>

      <Link
        href="/progress"
        className="mt-8 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        View your progress →
      </Link>

      {/* Subtle feature list */}
      <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
        <span>♜ Rook mates</span>
        <span>♛ Queen mates</span>
        <span>♝ Bishop pairs</span>
        <span>♞ Knight + Bishop</span>
        <span>♟ Pawn endgames</span>
      </div>
    </div>
  );
}
