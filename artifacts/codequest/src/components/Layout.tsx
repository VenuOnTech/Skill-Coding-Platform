import React from "react";
import { Link, useLocation } from "wouter";
import { Code2, Trophy, User, LogOut, TerminalSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const navLinks = [
    { href: "/problems", label: "Problems", icon: Code2 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <TerminalSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">CodeQuest</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.startsWith(link.href);
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-white/10 text-white" 
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                  <span className="text-xs text-accent font-bold px-1.5 py-0.5 rounded-full bg-accent/10">Lvl {user.level}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => { logout(); setLocation("/"); }}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLocation("/login")}>Log in</Button>
                <Button variant="glow" onClick={() => setLocation("/register")}>Sign up</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
