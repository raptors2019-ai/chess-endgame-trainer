import type { Metadata } from "next";
import { DM_Sans, Libre_Baskerville } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chess Endgame Trainer",
  description: "Learn chess endgame patterns with an AI coach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${libreBaskerville.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <nav className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-2xl">♔</span>
              <span className="font-heading font-bold text-base tracking-tight text-foreground">
                Endgame Trainer
              </span>
            </Link>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              <Link
                href="/lesson"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all"
              >
                Learn
              </Link>
              <Link
                href="/puzzle"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all"
              >
                Practice
              </Link>
              <Link
                href="/progress"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all"
              >
                Progress
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
