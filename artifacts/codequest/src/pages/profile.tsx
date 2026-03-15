import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetSubmissionHistory } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { User, Target, Zap, Activity, Clock, Loader2, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const { data: history, isLoading } = useGetSubmissionHistory(
    undefined,
    { query: { enabled: !!user } as any }
  );

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <User className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Not Authenticated</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your profile and submissions.</p>
        <Link href="/login" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium">Log in</Link>
      </div>
    );
  }

  const stats = [
    { label: "Current Level", value: user.level, icon: Target, color: "text-blue-500" },
    { label: "Total XP", value: user.xp.toLocaleString(), icon: Zap, color: "text-amber-500" },
    { label: "Problems Solved", value: user.solvedCount, icon: Activity, color: "text-green-500" },
    { label: "Global Rank", value: user.rank ? `#${user.rank}` : "Unranked", icon: Trophy, color: "text-purple-500" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20 border-4 border-background">
          <span className="text-4xl font-bold text-white">{user.username.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{user.username}</h1>
          <p className="text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-background border border-border shadow-sm ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-display font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !history?.submissions.length ? (
            <div className="p-10 text-center text-muted-foreground">No submissions yet. Go solve some problems!</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Runtime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.submissions.map((sub) => {
                  const isAccepted = sub.status === "Accepted";
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDate(sub.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/problems/${sub.problemId}`} className="font-medium hover:text-primary">
                          {sub.problemTitle}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">{sub.language}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold text-sm ${isAccepted ? "text-green-500" : "text-destructive"}`}>
                          {sub.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground text-sm">
                        {sub.runtime ? `${sub.runtime}ms` : "--"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
