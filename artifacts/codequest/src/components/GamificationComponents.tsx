import { Star, Flame } from "lucide-react";
import { Badge as ApiBadge } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function StarRank({ rank, className }: { rank: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} title={`Star Rank: ${rank}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-4 h-4 transition-all duration-300",
            star <= rank 
              ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" 
              : "fill-transparent text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export function StreakDisplay({ streak, className }: { streak: number; className?: string }) {
  if (streak === 0) return null;
  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold shadow-[0_0_10px_rgba(249,115,22,0.1)]", className)}>
      <Flame className="w-4 h-4 fill-orange-500 animate-pulse" />
      <span>{streak}</span>
    </div>
  );
}

export function BadgeCard({ badge }: { badge: ApiBadge }) {
  const isEarned = badge.earned;
  
  const rarityConfig = {
    common: "from-slate-500/20 to-slate-400/5 border-slate-500/30 text-slate-300",
    rare: "from-blue-500/20 to-blue-400/5 border-blue-500/30 text-blue-300",
    epic: "from-purple-500/20 to-purple-400/5 border-purple-500/30 text-purple-300",
    legendary: "from-amber-500/20 to-amber-400/5 border-amber-500/30 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        isEarned ? "bg-gradient-to-br hover:-translate-y-1 hover:shadow-xl " + rarityConfig[badge.rarity] : "bg-card/50 border-border/50 grayscale opacity-50"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("text-4xl drop-shadow-lg", isEarned && "animate-glow")}>{badge.icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{badge.rarity}</span>
      </div>
      <h4 className={cn("font-bold mb-1 text-lg", isEarned ? "text-foreground" : "text-muted-foreground")}>{badge.name}</h4>
      <p className="text-sm opacity-80 leading-relaxed">{badge.description}</p>
      
      {isEarned && badge.earnedAt && (
        <div className="mt-4 text-xs opacity-50 font-mono">
          Earned: {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
