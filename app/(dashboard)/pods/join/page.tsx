import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Boxes, ArrowRight, CheckCircle, AlertCircle, FolderKanban } from "lucide-react"
import { revalidatePath } from "next/cache"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface JoinPageProps {
  searchParams: Promise<{ code?: string }>
}

interface InvitationData {
  id: string
  code: string
  expires_at: string | null
  used_count: number
  max_uses: number
  project_id?: string
  pod_id?: string
  project?: {
    id: string
    title: string
    pod: {
      id: string
      title: string
      npn: string
      avatar_url: string | null
    }
  }
  pod?: {
    id: string
    title: string
    npn: string
    avatar_url: string | null
  }
}

async function JoinPodContent({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams
  const supabase = await createClient()

  if (!code) {
    redirect("/pods")
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isProjectInvite = code.startsWith("PR-")

  let invitation: InvitationData | null = null

  if (isProjectInvite) {
    const { data } = await supabase
      .from("project_invitations")
      .select(`
        *,
        project:projects(
          id,
          title,
          pod:pods(
            id,
            title,
            npn,
            avatar_url
          )
        )
      `)
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle()
    invitation = data as InvitationData | null
  } else {
    const { data } = await supabase
      .from("pod_invitations")
      .select(`
        *,
        pod:pods(
          id,
          title,
          npn,
          avatar_url
        )
      `)
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle()
    invitation = data as InvitationData | null
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-6 mb-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          </div>
          <h1 className="text-2xl font-bold">Invalid Invitation</h1>
          <p className="text-muted-foreground">
            This invitation code is invalid or has expired.
          </p>
          <Link
            href="/pods"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to My Pods
          </Link>
        </div>
      </div>
    )
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-6 mb-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          </div>
          <h1 className="text-2xl font-bold">Invitation Expired</h1>
          <p className="text-muted-foreground">
            This invitation has expired. Please ask for a new one.
          </p>
          <Link
            href="/pods"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to My Pods
          </Link>
        </div>
      </div>
    )
  }

  if (invitation.used_count >= invitation.max_uses) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-6 mb-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          </div>
          <h1 className="text-2xl font-bold">Invitation Max Uses Reached</h1>
          <p className="text-muted-foreground">
            This invitation has reached its maximum number of uses.
          </p>
          <Link
            href="/pods"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to My Pods
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect(`/auth/login?redirect=/pods/join?code=${code}`)
  }

  // Check existing membership
  let alreadyMember = false
  if (isProjectInvite) {
    const { data } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", invitation.project_id)
      .eq("user_id", user.id)
      .single()
    alreadyMember = !!data
  } else {
    const { data } = await supabase
      .from("pod_members")
      .select("*")
      .eq("pod_id", invitation.pod_id)
      .eq("user_id", user.id)
      .single()
    alreadyMember = !!data
  }

  if (alreadyMember) {
    const targetUrl = isProjectInvite 
      ? `/pods/${invitation.pod_id}/projects/${invitation.project_id}`
      : `/pods/${invitation.pod_id}`

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="rounded-full bg-green-500/10 p-6 mb-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold">Already a Member</h1>
          <p className="text-muted-foreground">
            You are already a member of {isProjectInvite ? invitation.project?.title : invitation.pod?.title}.
          </p>
          <Link
            href={targetUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to {isProjectInvite ? "Project" : "Pod"}
          </Link>
        </div>
      </div>
    )
  }

  const joinAction = async () => {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect("/auth/login")
    }

    if (isProjectInvite) {
      // 1. Ensure Pod member
      const { data: podMember } = await supabase
        .from("pod_members")
        .select("*")
        .eq("pod_id", invitation.pod_id)
        .eq("user_id", user.id)
        .single()
      
      if (!podMember) {
        await supabase
          .from("pod_members")
          .insert({
            pod_id: invitation.pod_id,
            user_id: user.id,
            role: "MEMBER"
          })
      }

      // 2. Join Project
      await supabase
        .from("project_members")
        .insert({
          project_id: invitation.project_id,
          user_id: user.id
        })

      await supabase
        .from("project_invitations")
        .update({ used_count: (invitation.used_count || 0) + 1 })
        .eq("id", invitation.id)

      revalidatePath(`/pods/${invitation.pod_id}/projects/${invitation.project_id}`)
      redirect(`/pods/${invitation.pod_id}/projects/${invitation.project_id}`)
    } else {
      await supabase
        .from("pod_members")
        .insert({
          pod_id: invitation.pod_id,
          user_id: user.id,
          role: "MEMBER",
        })

      await supabase
        .from("pod_invitations")
        .update({ used_count: (invitation.used_count || 0) + 1 })
        .eq("id", invitation.id)

      revalidatePath("/pods")
      redirect(`/pods/${invitation.pod_id}`)
    }
  }

  const pod = isProjectInvite ? invitation.project?.pod : invitation.pod

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="rounded-lg border bg-card p-6 text-center space-y-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto overflow-hidden">
            {pod?.avatar_url ? (
              <img src={pod.avatar_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              isProjectInvite ? <FolderKanban className="h-8 w-8 text-primary" /> : <Boxes className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">
              Join {isProjectInvite ? invitation.project?.title : invitation.pod?.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isProjectInvite ? `Inside ${pod?.title} (${pod?.npn})` : `NPN: ${pod?.npn}`}
            </p>
          </div>

          <p className="text-muted-foreground">
            You&apos;ve been invited to join this {isProjectInvite ? "project" : "pod"}. Click below to become a member.
          </p>

          <form action={joinAction}>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Join {isProjectInvite ? "Project" : "Pod"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <Link
            href="/pods"
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function JoinPodPage({ searchParams }: JoinPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="rounded-lg border bg-card p-6 text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-lg mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    }>
      <JoinPodContent searchParams={searchParams} />
    </Suspense>
  )
}
