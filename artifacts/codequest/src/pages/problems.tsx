import { useState } from "react";
import { Link } from "wouter";
import { useGetProblems, useGetDailyQuest, GetProblemsDifficulty } from "@workspace/api-client-react";
import { Card, Badge, Input, Button } from "@/components/ui";
import { Search, Zap, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Problems() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<GetProblemsDifficulty | "">("");

  const { data, isLoading } = useGetProblems({
    search: search || undefined,
    difficulty: difficulty ? difficulty : undefined,
  });

  const { data: dailyQuest } = useGetDailyQuest();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold mb-4">Problem Library</h1>
        <p className="text-lg text-muted-foreground">Select a challenge, write code, and earn XP.</p>
      </div>

      {dailyQuest && !dailyQuest.completed && !search && !difficulty && (
        <Link href={`/problems/${dailyQuest.problemId}`}>
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-background to-card border border-cyan-500/30 p-1 mb-8 shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)] cursor-pointer hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.4)] transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 mix-blend-screen pointer-events-none" />
            <div className="relative bg-card/80 backdrop-blur-xl rounded-[1.35rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-cyan-400 fill-cyan-400/20 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-foreground">Daily Quest</h2>
                    <Badge variant="quest">+{dailyQuest.bonusXp} Bonus XP</Badge>
                  </div>
                  <p className="text-muted-foreground">{dailyQuest.problemTitle} • {dailyQuest.topic}</p>
                </div>
              </div>
              <Button variant="gamified" className="w-full md:w-auto shrink-0 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/25 pointer-events-none">
                Accept Quest <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Link>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            className="pl-10 h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-12 rounded-xl border-2 border-border bg-background px-4 text-sm focus:outline-none focus:border-primary cursor-pointer w-full md:w-48"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as GetProblemsDifficulty | "")}
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-4 font-medium text-muted-foreground w-12">Status</th>
                <th className="p-4 font-medium text-muted-foreground">Title</th>
                <th className="p-4 font-medium text-muted-foreground">Difficulty</th>
                <th className="p-4 font-medium text-muted-foreground">Topic</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading problems...</td>
                </tr>
              ) : data?.problems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No problems found matching criteria.</td>
                </tr>
              ) : (
                data?.problems.map((prob) => (
                  <tr key={prob.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors group">
                    <td className="p-4">
                      {prob.solvedCount > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted" />
                      )}
                    </td>
                    <td className="p-4 font-medium">
                      <Link href={`/problems/${prob.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                        {prob.id}. {prob.title}
                        {prob.isDailyQuest && (
                          <span title="Daily Quest">
                            <Zap className="w-4 h-4 text-cyan-400" aria-label="Daily Quest" />
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge variant={prob.difficulty.toLowerCase() as any}>{prob.difficulty}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{prob.topic}</td>
                    <td className="p-4 text-right text-muted-foreground">
                      {prob.acceptanceRate ? `${prob.acceptanceRate.toFixed(1)}%` : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
