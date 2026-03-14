import React, { useState } from "react";
import { Link } from "wouter";
import { useGetProblems, GetProblemsDifficulty } from "@workspace/api-client-react";
import { Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button } from "@/components/ui";
import { Search, Filter, Loader2, CheckCircle2 } from "lucide-react";

export default function Problems() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<GetProblemsDifficulty | undefined>(undefined);
  
  const { data, isLoading, error } = useGetProblems({
    search: search || undefined,
    difficulty,
    limit: 50,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Problem Library</h1>
          <p className="text-muted-foreground mt-1">Select a challenge and start coding.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search problems..." 
              className="pl-9 w-64 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="h-10 rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            value={difficulty || ""}
            onChange={(e) => setDifficulty(e.target.value as GetProblemsDifficulty || undefined)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-destructive">Failed to load problems.</div>
        ) : data?.problems.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground">No problems found matching your criteria.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead className="text-right">Acceptance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.problems.map((prob) => (
                <TableRow key={prob.id} className="group cursor-pointer">
                  <TableCell className="text-center">
                    {/* Placeholder for actual solved status from user profile */}
                    <div className="w-5 h-5 rounded-full border border-muted-foreground/30 mx-auto flex items-center justify-center group-hover:border-primary/50 transition-colors" />
                  </TableCell>
                  <TableCell>
                    <Link href={`/problems/${prob.id}`} className="font-medium hover:text-primary transition-colors block">
                      {prob.id}. {prob.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={prob.difficulty.toLowerCase() as any}>
                      {prob.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {prob.topic}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {prob.acceptanceRate ? `${prob.acceptanceRate}%` : '--'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
