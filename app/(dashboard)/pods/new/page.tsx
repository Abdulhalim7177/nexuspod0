import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Boxes } from "lucide-react"
import { CreatePodForm } from "./create-pod-form"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

async function NewPodContent() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-2mx-auto mx-auto">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Boxes className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create a New Pod</h1>
              <p className="text-muted-foreground">
                Start a new workspace for you and your team
              </p>
            </div>
          </div>
        </div>

        <CreatePodForm />
      </div>
    </div>
  )
}

export default function NewPodPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2mx-auto mx-auto">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    }>
      <NewPodContent />
    </Suspense>
  )
}
