import React from "react";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";
import { Trophy, Loader2, Medal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useGetLeaderboard({ limit: 50 });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-muted-foreground text-lg">The top coding minds on CodeQuest.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500" />
        
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-destructive">Failed to load leaderboard.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Level</TableHead>
                <TableHead className="text-right">Solved</TableHead>
                <TableHead className="text-right">XP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.entries.map((entry) => {
                const isCurrentUser = user?.id === entry.userId;
                return (
                  <TableRow 
                    key={entry.userId} 
                    className={`${isCurrentUser ? "bg-primary/5 hover:bg-primary/10 border-primary/20" : ""} transition-colors`}
                  >
                    <TableCell className="text-center font-display font-bold text-lg">
                      {entry.rank === 1 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> : 
                       entry.rank === 2 ? <Medal className="w-6 h-6 text-slate-300 mx-auto" /> : 
                       entry.rank === 3 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> : 
                       <span className="text-muted-foreground">{entry.rank}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-medium ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                          {entry.username}
                          {isCurrentUser && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">You</span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.level}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {entry.solvedCount}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-accent">
                      {entry.xp.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
