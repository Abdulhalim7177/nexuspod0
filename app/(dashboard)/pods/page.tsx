import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, Boxes, Users, Calendar } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

async function PodsContent() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // First, get the pod IDs the user belongs to
  const { data: userPodMemberships } = await supabase
    .from("pod_members")
    .select("pod_id")
    .eq("user_id", user.id)

  const podIds = userPodMemberships?.map(m => m.pod_id) || []

  if (podIds.length === 0) {
    redirect("/dashboard")
  }

  // Then fetch those pods with ALL their members (for accurate member count)
  const { data: pods } = await supabase
    .from("pods")
    .select(`
      *,
      pod_members(
        id,
        role,
        user_id
      )
    `)
    .in("id", podIds)
    .order("created_at", { ascending: false })

  if (!pods || pods.length === 0) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Pods</h1>
          <p className="text-muted-foreground">
            Your workspaces and teams
          </p>
        </div>
        <Link
          href="/pods/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Pod
        </Link>
      </div>

      {(!pods || pods.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Boxes className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No pods yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first pod to start building with your team. 
            Pods are your workspace for projects, tasks, and collaboration.
          </p>
          <Link
            href="/pods/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Your First Pod
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pods.map((pod: { id: string, title: string, npn: string, avatar_url?: string | null, pod_members?: { user_id: string }[] }) => {
            const myMember = pod.pod_members?.find((m: { user_id: string }) => m.user_id === user.id)
            const memberCount = pod.pod_members?.length || 0
            
            return (
              <Link
                key={pod.id}
                href={`/pods/${pod.id}`}
                className="group block"
              >
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:border-primary/50">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {pod.avatar_url ? (
                          <img 
                            src={pod.avatar_url} 
                            alt={pod.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <Boxes className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {pod.npn}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {pod.title}
                    </h3>
                    {pod.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {pod.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(pod.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {myMember && (
                    <div className="px-6 py-3 bg-muted/50 border-t rounded-b-lg flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {myMember.role.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
        <h3 className="font-medium mb-2">Join a Pod</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Have an invitation code? Enter it below to join a pod.
        </p>
        <form action="/pods/join" method="GET" className="flex gap-2">
          <input
            type="text"
            name="code"
            placeholder="Enter invitation code"
            className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  )
}

export default function PodsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    }>
      <PodsContent />
    </Suspense>
  )
}
