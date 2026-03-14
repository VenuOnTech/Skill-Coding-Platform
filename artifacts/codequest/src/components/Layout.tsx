import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui";
import { Code2, LogOut, User, Trophy, LayoutDashboard } from "lucide-react";
import { StarRank, StreakDisplay } from "./GamificationComponents";
import { Toaster } from "./Toaster";
import { CelebrationOverlay } from "./CelebrationOverlay";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    { href: "/problems", label: "Problems", icon: <Code2 className="w-4 h-4 mr-2" /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="bg-gradient-to-br from-primary to-accent p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">CodeQuest</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <StreakDisplay streak={user.streak} />
                <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border h-8">
                  <StarRank rank={user.starRank} />
                  <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="font-semibold text-sm">{user.username}</span>
                  </Link>
                </div>
                <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" className="ml-2">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:flex">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="gamified">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <Toaster />
      <CelebrationOverlay />
    </div>
  );
}
