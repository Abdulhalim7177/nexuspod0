import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-background to-background dark:from-purple-950/30 dark:via-background dark:to-background" />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md px-6">
        <LoginForm />
      </div>
    </div>
  );
}
