import { Link } from "wouter";
import { Button } from "@/components/ui";
import { Terminal, Zap, Trophy, Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium mb-8 animate-fade-in">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-foreground">Level up your coding skills</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight max-w-4xl mb-6 leading-tight">
          Master Algorithms. <br className="hidden md:block" />
          <span className="text-gradient">Dominate the Leaderboard.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          The ultimate competitive programming arena. Solve challenging problems, earn XP, maintain your daily streak, and unlock epic badges as you climb the ranks.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register">
            <Button size="lg" variant="gamified" className="w-full sm:w-auto h-14 px-8 text-lg">
              Start Coding Now
            </Button>
          </Link>
          <Link href="/problems">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-card/50 backdrop-blur-sm">
              View Problem Library
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24">
          {[
            { icon: <Terminal className="w-6 h-6 text-primary" />, title: "In-Browser Editor", desc: "Write Python and JavaScript directly in our powerful Monaco-based editor." },
            { icon: <Trophy className="w-6 h-6 text-yellow-400" />, title: "Gamified Progression", desc: "Earn XP, level up, collect rare badges, and increase your Star Rank." },
            { icon: <Flame className="w-6 h-6 text-orange-500" />, title: "Daily Quests & Streaks", desc: "Log in daily to solve the Daily Quest for bonus XP and keep your streak alive." }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl text-left hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
