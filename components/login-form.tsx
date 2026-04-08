"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
      <div className="flex flex-col items-center text-center mb-2">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white mb-4 shadow-lg shadow-primary/25">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">NexusPod</h1>
        <p className="text-muted-foreground">Welcome back! Sign in to continue.</p>
      </div>
      
      <div className="glass-card rounded-2xl p-1">
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-shake">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium rounded-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link
              href="/auth/sign-up"
              className="text-primary font-medium hover:underline underline-offset-4 transition-all"
            >
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
