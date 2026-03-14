import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { TerminalSquare, Loader2 } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const registerMutation = useRegister();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await registerMutation.mutateAsync({ data });
      login(response.token, response.user);
      setLocation("/problems");
    } catch (err: any) {
      console.error("Registration failed", err);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 glass-panel">
        <CardHeader className="space-y-4 items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <TerminalSquare className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl">Join CodeQuest</CardTitle>
            <CardDescription>Start your competitive programming journey.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {registerMutation.error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {registerMutation.error.message || "Registration failed"}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <Input placeholder="code_ninja" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input placeholder="coder@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <Input type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-6" variant="glow" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
