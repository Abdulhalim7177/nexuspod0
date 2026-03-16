import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Sparkles, Mic, Headphones, BarChart3, Users, Globe, ArrowRight } from "lucide-react";

function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-background to-background dark:from-purple-950/30 dark:via-background dark:to-background" />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      
      <div className="relative z-10 flex flex-col items-center text-center py-20 md:py-32 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          The future of podcasting
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
          <span className="gradient-text">NexusPod</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Create, manage, and share your podcasts with the world. 
          Beautiful tools for modern podcasters.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link
            href="/auth/sign-up"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
          >
            Get Started Free
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

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) {
  return (
    <div 
      className="group glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function Features() {
  const features = [
    { icon: Mic, title: 'Record & Create', description: 'Professional recording tools to create stunning podcast episodes.' },
    { icon: Headphones, title: 'Hosting', description: 'Global CDN hosting with unlimited bandwidth and storage.' },
    { icon: Users, title: 'Audience Growth', description: 'Built-in analytics to understand and grow your audience.' },
    { icon: BarChart3, title: 'Analytics', description: 'Detailed insights into your podcast performance.' },
    { icon: Globe, title: 'Distribution', description: 'Publish to all major platforms with one click.' },
    { icon: Sparkles, title: 'Monetization', description: 'Multiple ways to earn from your content.' },
  ];

  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Powerful features to help you create, publish, and grow your podcast.
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
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to start your podcast?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Join thousands of creators who trust NexusPod for their podcast needs.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
            >
              Create Your Account
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
              <span className="gradient-text">NexusPod</span>
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
            <p className="text-sm text-muted-foreground">NexusPod. All rights reserved.</p>
            <ThemeSwitcher />
          </div>
        </footer>
      </div>
    </main>
  );
}
