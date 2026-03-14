import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import Editor from "@monaco-editor/react";
import { useGetProblem, useRunCode, useSubmitCode, RunCodeRequestLanguage, SubmitCodeRequestLanguage } from "@workspace/api-client-react";
import { Badge, Button } from "@/components/ui";
import { Play, Send, Loader2, CheckCircle2, XCircle, Clock, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProblemDetail() {
  const [, params] = useRoute("/problems/:id");
  const id = Number(params?.id);
  const { user } = useAuth();
  
  const { data: problem, isLoading, error } = useGetProblem(id);
  
  const [language, setLanguage] = useState<RunCodeRequestLanguage>("python");
  const [code, setCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");
  const [outputTab, setActiveOutputTab] = useState<"testcases" | "result">("testcases");

  const runCodeMutation = useRunCode();
  const submitCodeMutation = useSubmitCode();

  useEffect(() => {
    if (problem) {
      setCode(language === "python" ? problem.starterCode.python : problem.starterCode.javascript);
    }
  }, [problem, language]);

  const handleRun = async () => {
    if (!code) return;
    setActiveOutputTab("result");
    await runCodeMutation.mutateAsync({ data: { problemId: id, code, language } });
  };

  const handleSubmit = async () => {
    if (!code || !user) return; // Need auth check visually
    setActiveOutputTab("result");
    await submitCodeMutation.mutateAsync({ data: { problemId: id, code, language: language as SubmitCodeRequestLanguage } });
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error || !problem) return <div className="flex-1 flex items-center justify-center text-destructive">Failed to load problem.</div>;

  const renderResult = () => {
    if (runCodeMutation.isPending || submitCodeMutation.isPending) {
      return <div className="p-6 flex items-center gap-3 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Executing code...</div>;
    }

    if (submitCodeMutation.data) {
      const res = submitCodeMutation.data;
      const isAccepted = res.status === "Accepted";
      return (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isAccepted ? "text-green-500" : "text-destructive"}`}>
              {isAccepted ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              {res.status}
            </h3>
            {isAccepted && <Badge variant="default" className="bg-green-500/20 text-green-500 border-none">+{res.xpEarned} XP</Badge>}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>Passed: <span className="text-foreground font-mono">{res.passedCount}/{res.totalCount}</span></div>
            {res.runtime && <div>Runtime: <span className="text-foreground font-mono">{res.runtime}ms</span></div>}
          </div>
        </div>
      );
    }

    if (runCodeMutation.data) {
      const res = runCodeMutation.data;
      return (
        <div className="p-4 space-y-6 max-h-[300px] overflow-y-auto">
          {res.results.map((tc, idx) => (
            <div key={idx} className="space-y-2 bg-background p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 font-medium">
                {tc.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
                Case {idx + 1}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 font-mono text-xs">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Input:</div>
                  <div className="bg-muted p-2 rounded">{tc.input}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Expected:</div>
                  <div className="bg-muted p-2 rounded">{tc.expectedOutput}</div>
                </div>
                {!tc.passed && tc.actualOutput && (
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <div className="text-destructive">Actual:</div>
                    <div className="bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">{tc.actualOutput}</div>
                  </div>
                )}
                {tc.error && (
                  <div className="col-span-1 md:col-span-2 space-y-1 mt-2">
                    <div className="text-destructive font-bold">Error:</div>
                    <div className="bg-destructive/10 text-destructive p-3 rounded border border-destructive/20 overflow-x-auto whitespace-pre-wrap">{tc.error}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="p-6 text-muted-foreground flex flex-col items-center justify-center h-full gap-2">
        <Info className="w-8 h-8 opacity-50" />
        <p>Run your code to see results here.</p>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Pane - Description */}
      <div className="w-full md:w-5/12 flex flex-col border-r border-border bg-card">
        <div className="flex items-center gap-6 px-4 border-b border-border bg-background/50 h-12 shrink-0">
          <button onClick={() => setActiveTab("description")} className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === "description" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Description</button>
          <button onClick={() => setActiveTab("submissions")} className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === "submissions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Submissions</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "description" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{problem.id}. {problem.title}</h1>
                <div className="flex items-center gap-3">
                  <Badge variant={problem.difficulty.toLowerCase() as any}>{problem.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{problem.topic}</span>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none text-muted-foreground prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                {/* Normally we'd use a markdown renderer, assuming plain text / simple HTML for now */}
                <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br/>') }} />
              </div>

              {problem.examples.map((ex, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="font-semibold text-foreground">Example {i + 1}:</h3>
                  <div className="bg-muted p-4 rounded-xl font-mono text-sm space-y-1">
                    <div><span className="text-muted-foreground font-bold">Input:</span> {ex.input}</div>
                    <div><span className="text-muted-foreground font-bold">Output:</span> {ex.output}</div>
                    {ex.explanation && <div><span className="text-muted-foreground font-bold">Explanation:</span> {ex.explanation}</div>}
                  </div>
                </div>
              ))}

              {problem.constraints && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Constraints:</h3>
                  <div className="bg-muted p-4 rounded-xl font-mono text-sm">
                    <div dangerouslySetInnerHTML={{ __html: problem.constraints.replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "submissions" && (
            <div className="text-center text-muted-foreground pt-10">
              {user ? "View your submission history in your profile." : "Login to view submissions."}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Editor & Console */}
      <div className="w-full md:w-7/12 flex flex-col bg-background relative">
        <div className="flex items-center justify-between px-4 border-b border-border h-12 shrink-0 bg-card/50">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as RunCodeRequestLanguage)}
            className="bg-transparent text-sm font-medium focus:outline-none focus:ring-0 text-foreground"
          >
            <option value="python" className="bg-background">Python 3</option>
            <option value="javascript" className="bg-background">JavaScript (Node)</option>
          </select>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleRun} disabled={runCodeMutation.isPending || submitCodeMutation.isPending}>
              <Play className="w-4 h-4 mr-1.5" /> Run
            </Button>
            <Button size="sm" variant="glow" onClick={handleSubmit} disabled={runCodeMutation.isPending || submitCodeMutation.isPending}>
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
              fontFamily: "'Fira Code', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              roundedSelection: false,
            }}
          />
        </div>

        {/* Output Console Pane */}
        <div className="h-64 border-t border-border flex flex-col bg-card shrink-0">
          <div className="flex items-center gap-4 px-4 border-b border-border h-10 shrink-0 bg-background/50">
            <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Console</div>
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveOutputTab("testcases")} className={`text-sm ${outputTab === "testcases" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>Testcases</button>
              <button onClick={() => setActiveOutputTab("result")} className={`text-sm ${outputTab === "result" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>Result</button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            {outputTab === "testcases" ? (
              <div className="p-4 overflow-y-auto h-full space-y-4">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-xs text-muted-foreground font-bold">Case {i+1}</div>
                    <div className="font-mono text-sm bg-background p-2 rounded border border-border">{ex.input}</div>
                  </div>
                ))}
              </div>
            ) : (
              renderResult()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
