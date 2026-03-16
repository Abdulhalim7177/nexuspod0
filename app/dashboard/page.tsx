import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Mic, 
  Headphones, 
  TrendingUp,
  PlayCircle,
  FileAudio
} from "lucide-react";

async function UserInfo() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="glass-card hover:glass-card-hover transition-all duration-300 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium truncate max-w-[200px]">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover:glass-card-hover transition-all duration-300 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium text-xs truncate max-w-[200px]">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover:glass-card-hover transition-all duration-300 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function WelcomeMessage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const firstName = user?.email?.split('@')[0] || 'User';

  const hour = new Date().getHours();
  let greeting = 'Welcome back';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)]" />
        <div className="relative z-10">
          <p className="text-sm font-medium text-primary mb-2">{greeting}</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">{firstName}</span>!
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Ready to create something amazing today? Your podcast journey continues here.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatsGrid() {
  const stats = [
    { label: 'Total Episodes', value: '0', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Listeners', value: '0', icon: Headphones, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Published', value: '0', icon: FileAudio, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Analytics', value: '0', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label}
          className="glass-card hover:glass-card-hover transition-all duration-300 border-0 shadow-lg hover:-translate-y-1"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 md:p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: 'New Episode', icon: Mic, gradient: 'from-pink-500 to-rose-500' },
    { label: 'View Analytics', icon: TrendingUp, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Settings', icon: Settings, gradient: 'from-blue-500 to-indigo-500' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, index) => (
        <button
          key={action.label}
          className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${action.gradient} text-white font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <action.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }>
        <WelcomeMessage />
      </Suspense>
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">Overview</h2>
          <QuickActions />
        </div>
        
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        }>
          <StatsGrid />
        </Suspense>
      </div>
      
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">Account Details</h2>
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        }>
          <UserInfo />
        </Suspense>
      </div>
    </div>
  );
}
