import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useGetProblem, useSubmitCode, useRunCode, SubmitCodeRequestLanguage } from "@workspace/api-client-react";
import Editor from "@monaco-editor/react";
import { Button, Badge, Card } from "@/components/ui";
import { Play, Send, Zap, CheckCircle2, XCircle, Clock, Activity, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useCelebrationStore } from "@/hooks/use-celebration";
import { useAuth } from "@/contexts/AuthContext";

export default function ProblemDetail() {
  const [, params] = useRoute("/problems/:id");
  const problemId = parseInt(params?.id || "0", 10);

  const { data: problem, isLoading } = useGetProblem(problemId, {
    query: { enabled: !!problemId } as any,
  });

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<SubmitCodeRequestLanguage>("python");
  const [activeTab, setActiveTab] = useState<"description" | "results">("description");
  const [runResult, setRunResult] = useState<any>(null);

  const { user, updateLocalUser } = useAuth();
  const { showLevelUp, showBadges } = useCelebrationStore();

  useEffect(() => {
    if (problem && !code) {
      setCode(problem.starterCode[language]);
    }
  }, [problem, language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as SubmitCodeRequestLanguage;
    setLanguage(newLang);
    if (problem) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const runMutation = useRunCode({
    mutation: {
      onSuccess: (data) => {
        setRunResult({ type: "run", data });
        setActiveTab("results");
        toast({ title: data.allPassed ? "Sample Tests Passed!" : "Some tests failed", type: data.allPassed ? "success" : "error" });
      },
      onError: (err: any) => toast({ title: "Run Failed", description: err.message, type: "error" }),
    },
  });

  const submitMutation = useSubmitCode({
    mutation: {
      onSuccess: (data) => {
        setRunResult({ type: "submit", data });
        setActiveTab("results");

        if (data.status === "Accepted") {
          toast({ title: "Accepted!", description: `Passed ${data.passedCount}/${data.totalCount} test cases.`, type: "success" });

          if (data.xpEarned > 0 || data.bonusXpEarned > 0) {
            const totalXp = data.xpEarned + data.bonusXpEarned;
            toast({ title: `Earned +${totalXp} XP!`, type: "gamification" });

            updateLocalUser({
              xp: (user?.xp || 0) + totalXp,
              streak: data.newStreak,
              ...(data.newStarRank ? { starRank: data.newStarRank } : {}),
            });
          }

          if (data.isDailyQuest && data.bonusXpEarned > 0) {
            toast({ title: "Daily Quest Complete!", description: `+${data.bonusXpEarned} Bonus XP`, type: "gamification" });
          }

          if (data.streakUpdated) {
            toast({ title: "🔥 Streak Extended!", description: `You're on a ${data.newStreak} day streak!`, type: "gamification" });
          }

          if (data.newStarRank) {
            toast({ title: "⭐ Star Rank Upgraded!", description: "You've earned a new star!", type: "gamification" });
          }

          if (data.levelUp && data.newLevel) {
            showLevelUp(data.newLevel - 1, data.newLevel);
          } else if (data.newBadges && data.newBadges.length > 0) {
            showBadges(data.newBadges as any);
          }
        } else {
          toast({ title: "Submission Failed", description: data.status, type: "error" });
        }
      },
      onError: (err: any) => toast({ title: "Submission Error", description: err.message, type: "error" }),
    },
  });

  if (isLoading || !problem) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 flex flex-col border-r border-border bg-card/30">
        <div className="flex border-b border-border bg-background">
          <button
            className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === "description" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === "results" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
            onClick={() => setActiveTab("results")}
          >
            Results
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === "description" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-3">{problem.id}. {problem.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Badge variant={problem.difficulty.toLowerCase() as any}>{problem.difficulty}</Badge>
                  <Badge variant="secondary">{problem.topic}</Badge>
                  {problem.isDailyQuest && (
                    <Badge variant="quest" className="ml-2">
                      <Zap className="w-3 h-3 mr-1" /> Daily Quest (+{problem.bonusXp} XP)
                    </Badge>
                  )}
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, "<br/>") }} />
              </div>

              {problem.examples.map((ex, i) => (
                <div key={i} className="mt-8">
                  <h3 className="font-bold text-foreground mb-2">Example {i + 1}:</h3>
                  <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm border border-border/50">
                    <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
                    <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
                    {ex.explanation && <div className="mt-2 text-muted-foreground"><span className="text-foreground/70">Explanation:</span> {ex.explanation}</div>}
                  </div>
                </div>
              ))}

              {problem.constraints && (
                <div className="mt-8">
                  <h3 className="font-bold text-foreground mb-2">Constraints:</h3>
                  <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm border border-border/50">
                    <div dangerouslySetInnerHTML={{ __html: problem.constraints.replace(/\n/g, "<br/>") }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "results" && runResult && (
            <div className="space-y-6 animate-fade-in">
              {runResult.type === "submit" && (
                <div className={cn("p-6 rounded-2xl border flex flex-col items-center text-center", runResult.data.status === "Accepted" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400")}>
                  {runResult.data.status === "Accepted" ? <Trophy className="w-12 h-12 mb-3" /> : <XCircle className="w-12 h-12 mb-3" />}
                  <h2 className="text-2xl font-bold mb-1">{runResult.data.status}</h2>
                  <p className="opacity-80 mb-4">{runResult.data.passedCount} / {runResult.data.totalCount} test cases passed</p>

                  {runResult.data.status === "Accepted" && (
                    <div className="flex gap-4">
                      <Badge variant="outline" className="bg-background/50 py-1.5"><Activity className="w-4 h-4 mr-2" /> +{runResult.data.xpEarned} XP</Badge>
                      {runResult.data.bonusXpEarned > 0 && (
                        <Badge variant="quest" className="py-1.5"><Zap className="w-4 h-4 mr-2" /> +{runResult.data.bonusXpEarned} Bonus XP</Badge>
                      )}
                      <Badge variant="outline" className="bg-background/50 py-1.5"><Clock className="w-4 h-4 mr-2" /> {runResult.data.runtime?.toFixed(2)}ms</Badge>
                    </div>
                  )}
                </div>
              )}

              <h3 className="font-bold text-lg border-b border-border pb-2">Test Cases</h3>
              <div className="space-y-4">
                {runResult.data.results.map((res: any, i: number) => (
                  <Card key={i} className={cn("overflow-hidden border-l-4", res.passed ? "border-l-green-500" : "border-l-red-500")}>
                    <div className="bg-muted/30 p-3 px-4 flex items-center justify-between">
                      <div className="font-medium flex items-center gap-2">
                        {res.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        Case {i + 1}
                      </div>
                      {res.time && <span className="text-xs text-muted-foreground">{res.time}ms</span>}
                    </div>
                    {!res.passed && (
                      <div className="p-4 font-mono text-sm space-y-3 bg-background">
                        <div>
                          <div className="text-muted-foreground mb-1">Input:</div>
                          <div className="bg-muted/50 p-2 rounded">{res.input}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Expected:</div>
                          <div className="bg-muted/50 p-2 rounded">{res.expectedOutput}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Actual:</div>
                          <div className="bg-red-500/10 text-red-400 p-2 rounded border border-red-500/20">{res.actualOutput || "No output"}</div>
                        </div>
                        {res.error && (
                          <div>
                            <div className="text-muted-foreground mb-1">Error:</div>
                            <div className="bg-red-500/10 text-red-400 p-2 rounded border border-red-500/20 whitespace-pre-wrap">{res.error}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Editor */}
      <div className="w-full md:w-1/2 flex flex-col bg-background">
        <div className="flex items-center justify-between p-2 border-b border-border bg-card/50">
          <select
            className="bg-secondary text-secondary-foreground border-none text-sm rounded-lg px-3 py-1.5 focus:ring-0 outline-none cursor-pointer"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript</option>
          </select>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => runMutation.mutate({ data: { problemId, code, language } })} disabled={runMutation.isPending || submitMutation.isPending}>
              <Play className="w-4 h-4 mr-1.5" /> Run
            </Button>
            <Button variant="gamified" size="sm" onClick={() => submitMutation.mutate({ data: { problemId, code, language } })} disabled={runMutation.isPending || submitMutation.isPending}>
              <Send className="w-4 h-4 mr-1.5" /> Submit
            </Button>
          </div>
        </div>

        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "Fira Code",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              roundedSelection: false,
              overviewRulerBorder: false,
            }}
          />
          {(runMutation.isPending || submitMutation.isPending) && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="glass-panel px-6 py-4 rounded-full flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="font-medium text-foreground">Executing Code...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
