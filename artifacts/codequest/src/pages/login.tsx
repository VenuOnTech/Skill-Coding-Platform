import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@workspace/api-client-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { Code2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const { mutate, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: "Welcome back!", type: "success" });
        setLocation("/problems");
      },
      onError: (error) => {
        toast({ title: "Login failed", description: error.message || "Invalid credentials", type: "error" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-background pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Link href="/" className="mb-8 relative z-10">
        <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl shadow-xl shadow-primary/20">
          <Code2 className="w-10 h-10 text-white" />
        </div>
      </Link>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-card/80">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <p className="text-muted-foreground mt-2">Log in to continue your quest.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="gamified" className="w-full h-12 mt-4" disabled={isPending}>
              {isPending ? "Authenticating..." : "Log In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create one now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
