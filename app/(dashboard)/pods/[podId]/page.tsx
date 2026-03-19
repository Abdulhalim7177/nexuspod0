import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Boxes, Users, FolderKanban, MessageCircle, Calendar, Settings, Zap } from "lucide-react"

interface PodPageProps {
  params: Promise<{ podId: string }>
}

export default async function PodOverviewPage({ params }: PodPageProps) {
  const { podId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // First just get the pod
  const { data: pod } = await supabase
    .from("pods")
    .select("*")
    .eq("id", podId)
    .single()

  if (!pod) {
    console.log("Pod not found for id:", podId)
    redirect("/pods")
  }

  // Get members separately
  const { data: members } = await supabase
    .from("pod_members")
    .select("*")
    .eq("pod_id", podId)

  const myMember = members?.find((m: any) => m.user_id === user.id)

  if (!myMember) {
    console.log("User not a member. User:", user.id, "Members:", members)
    redirect("/pods")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            {pod.avatar_url ? (
              <img src={pod.avatar_url} alt={pod.title} className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <Boxes className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{pod.title}</h1>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                {pod.npn}
              </span>
            </div>
            {pod.summary && (
              <p className="text-muted-foreground mt-1">{pod.summary}</p>
            )}
          </div>
        </div>
        <Link
          href={`/pods/${podId}/settings`}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href={`/pods/${podId}/members`}
          className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{members?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Members</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/pods/${podId}/projects`}
          className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/pods/${podId}/chat`}
          className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Chat</p>
              <p className="text-sm text-muted-foreground">Start talking</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/pods/${podId}/momentum`}
          className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Momentum</p>
              <p className="text-sm text-muted-foreground">Track progress</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Members</h2>
          {members && members.length > 0 ? (
            <div className="space-y-3">
              {members.slice(0, 5).map((member: any) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {member.role[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.role}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {member.role.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
              {members.length > 5 && (
                <Link
                  href={`/pods/${podId}/members`}
                  className="text-sm text-primary hover:underline"
                >
                  View all {members.length} members →
                </Link>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No members yet</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href={`/pods/${podId}/projects/new`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
            >
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
              <span>Create New Project</span>
            </Link>
            <Link
              href={`/pods/${podId}/members`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Invite Members</span>
            </Link>
            <Link
              href={`/pods/${podId}/chat`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span>Open Pod Chat</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Pod Info</h2>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(pod.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Role</span>
            <span className="font-medium capitalize">{myMember.role.replace('_', ' ').toLowerCase()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
