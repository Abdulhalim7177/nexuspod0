import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";

async function UserNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground hidden md:block">
        {user.email}
      </span>
      <LogoutButton />
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-background to-background dark:from-purple-950/20 dark:via-background dark:to-background" />
      
      <main className="relative min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col gap-8 items-center">
          <nav className="w-full sticky top-0 z-50 glass-nav">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center p-4 px-5">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="gradient-text">NexusPod</span>
              </Link>
              <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
                <UserNav />
              </Suspense>
            </div>
          </nav>
          
          <div className="flex-1 flex flex-col gap-8 max-w-6xl w-full p-5">
            {children}
          </div>

          <footer className="w-full border-t border-border/50 py-8">
            <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">NexusPod. All rights reserved.</p>
              <ThemeSwitcher />
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
