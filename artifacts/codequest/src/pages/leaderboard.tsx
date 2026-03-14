import { useState } from "react";
import { useGetLeaderboard, useGetWeeklyLeaderboard } from "@workspace/api-client-react";
import { Card, Badge } from "@/components/ui";
import { StarRank, StreakDisplay } from "@/components/GamificationComponents";
import { Trophy, Medal, Star, Flame, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const [tab, setTab] = useState<"global" | "weekly">("global");
  
  const { data: globalData, isLoading: globalLoading } = useGetLeaderboard({ page: 1, limit: 50 }, { query: { enabled: tab === "global" } });
  const { data: weeklyData, isLoading: weeklyLoading } = useGetWeeklyLeaderboard({ page: 1, limit: 50 }, { query: { enabled: tab === "weekly" } });

  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(234,179,8,0.5)]"><Trophy className="w-4 h-4" /></div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold"><Medal className="w-4 h-4" /></div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold"><Medal className="w-4 h-4" /></div>;
    return <div className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground">{rank}</div>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold mb-4">Arena Rankings</h1>
        <p className="text-lg text-muted-foreground">Compete globally or dominate the weekly challenges.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-card border border-border p-1 rounded-xl inline-flex shadow-lg">
          <button 
            className={cn("px-8 py-2.5 rounded-lg font-semibold transition-all", tab === "global" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}
            onClick={() => setTab("global")}
          >
            Global Hall of Fame
          </button>
          <button 
            className={cn("px-8 py-2.5 rounded-lg font-semibold transition-all", tab === "weekly" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}
            onClick={() => setTab("weekly")}
          >
            Weekly Clash
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        {tab === "weekly" && weeklyData && (
          <div className="bg-muted/30 border-b border-border p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
            <CalendarRange className="w-4 h-4" />
            Week of {new Date(weeklyData.weekStart).toLocaleDateString()} – {new Date(weeklyData.weekEnd).toLocaleDateString()}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-background/50">
                <th className="p-5 font-medium text-muted-foreground w-20 text-center">Rank</th>
                <th className="p-5 font-medium text-muted-foreground">Developer</th>
                <th className="p-5 font-medium text-muted-foreground text-center">Stars</th>
                {tab === "global" && <th className="p-5 font-medium text-muted-foreground text-center">Streak</th>}
                <th className="p-5 font-medium text-muted-foreground text-right">{tab === "global" ? "Total XP" : "Weekly XP"}</th>
                <th className="p-5 font-medium text-muted-foreground text-right">{tab === "global" ? "Solved" : "Weekly Solved"}</th>
                <th className="p-5 font-medium text-muted-foreground text-center">Level</th>
              </tr>
            </thead>
            <tbody>
              {tab === "global" && (globalLoading ? (
                 <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading ranks...</td></tr>
              ) : globalData?.entries.map((user) => (
                <tr key={user.userId} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4 flex justify-center">{renderRankIcon(user.rank)}</td>
                  <td className="p-4 font-bold text-foreground">{user.username}</td>
                  <td className="p-4"><div className="flex justify-center"><StarRank rank={user.starRank} /></div></td>
                  <td className="p-4"><div className="flex justify-center">{user.streak > 0 ? <StreakDisplay streak={user.streak} /> : <span className="text-muted-foreground opacity-30">-</span>}</div></td>
                  <td className="p-4 text-right font-mono text-primary font-bold">{user.xp.toLocaleString()}</td>
                  <td className="p-4 text-right text-muted-foreground">{user.solvedCount}</td>
                  <td className="p-4 text-center"><Badge variant="outline" className="bg-card">Lvl {user.level}</Badge></td>
                </tr>
              )))}

              {tab === "weekly" && (weeklyLoading ? (
                 <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading weekly ranks...</td></tr>
              ) : weeklyData?.entries.length === 0 ? (
                 <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">No submissions this week yet. Be the first!</td></tr>
              ) : weeklyData?.entries.map((user) => (
                <tr key={user.userId} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4 flex justify-center">{renderRankIcon(user.rank)}</td>
                  <td className="p-4 font-bold text-foreground">{user.username}</td>
                  <td className="p-4"><div className="flex justify-center"><StarRank rank={user.starRank} /></div></td>
                  <td className="p-4 text-right font-mono text-primary font-bold">+{user.xpThisWeek}</td>
                  <td className="p-4 text-right text-muted-foreground">+{user.solvedThisWeek}</td>
                  <td className="p-4 text-center"><Badge variant="outline" className="bg-card">Lvl {user.level}</Badge></td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
