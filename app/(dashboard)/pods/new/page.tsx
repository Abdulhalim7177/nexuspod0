import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Boxes } from "lucide-react"
import { CreatePodForm } from "./create-pod-form"

export default async function NewPodPage() {
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
