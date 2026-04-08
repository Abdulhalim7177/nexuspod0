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

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
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
        <h1 className="text-3xl font-bold gradient-text mb-2">Join NexusPod</h1>
        <p className="text-muted-foreground">Create your account to get started.</p>
      </div>
      
      <div className="glass-card rounded-2xl p-1">
        <form onSubmit={handleSignUp} className="p-6 space-y-5">
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
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repeat-password" className="text-sm font-medium">Confirm Password</Label>
            <Input
              id="repeat-password"
              type="password"
              placeholder="Confirm your password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
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
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-primary font-medium hover:underline underline-offset-4 transition-all">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
