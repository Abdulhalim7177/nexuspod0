import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense, ElementType } from "react";
import { Sparkles, ShieldCheck, CheckSquare, Lightbulb, Flame, Users, History, ArrowRight } from "lucide-react";

function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-background to-background dark:from-purple-950/30 dark:via-background dark:to-background" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 flex flex-col items-center text-center py-20 md:py-32 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          The African Founder Ecosystem
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
          <span className="gradient-text">Nexus Pod</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          A unified workspace connecting African founders, breaking isolation, and turning momentum into measurable progress. Build together, ship faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link
            href="/auth/sign-up"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
          >
            Create Your Pod
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 border border-border bg-background/60 backdrop-blur-sm font-semibold rounded-xl hover:bg-accent transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: ElementType; title: string; description: string; delay: number }) {
  return (
    <div
      className="group glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary mb-4 group-hover:scale-110 transition-transform w-fit">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Features() {
  const features = [
    { icon: ShieldCheck, title: 'Pod Isolation', description: 'Dedicated, private workspaces (Pods) for your startup to operate securely and efficiently.' },
    { icon: CheckSquare, title: 'Task Lifecycle', description: 'Unique Verification Loop ensures tasks are truly done—reverting silently completed work.' },
    { icon: Lightbulb, title: 'Opportunity Engine', description: 'Post and discover collaboration, funding, and talent across the entire Nexus Network.' },
    { icon: Flame, title: 'Momentum Scores', description: 'Gamified productivity tracks your Pod’s build streak and turns action into measurable momentum.' },
    { icon: Users, title: 'Team Collaboration', description: 'Real-time chat, voice notes, and structured team management right within your Pod.' },
    { icon: History, title: 'Audit Logs', description: 'Immutable timeline of all actions to eliminate blame culture and ensure absolute accountability.' },
  ];

  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to build</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Powerful features to help your startup execute, collaborate, and grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 100} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CTA() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-blue-600 p-12 md:p-16 text-center">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to build your Pod?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
              Join ambitious founders building the future of Africa on Nexus Pod.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
            >
              Start Building Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="w-full flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
          <div className="max-w-6xl mx-auto flex justify-between items-center p-4 px-5">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="gradient-text">Nexus Pod</span>
            </Link>
            {!hasEnvVars ? (
              <p className="text-sm text-yellow-500">Configure environment variables</p>
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

        <div className="pt-16">
          <HeroSection />
          <Features />
          <CTA />
        </div>

        <footer className="border-t border-border/50 py-8">
          <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Nexus Pod. All rights reserved.</p>
            <ThemeSwitcher />
          </div>
        </footer>
      </div>
    </main>
  );
}
