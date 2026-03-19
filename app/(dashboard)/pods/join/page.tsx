import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Boxes, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { revalidatePath } from "next/cache"

interface JoinPageProps {
  searchParams: Promise<{ code?: string }>
}

export default async function JoinPodPage({ searchParams }: JoinPageProps) {
  const { code } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!code) {
    redirect("/pods")
  }

  const { data: invitation } = await supabase
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
    .single()

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

  const { data: existingMember } = await supabase
    .from("pod_members")
    .select("*")
    .eq("pod_id", invitation.pod_id)
    .eq("user_id", user.id)
    .single()

  if (existingMember) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="rounded-full bg-green-500/10 p-6 mb-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold">Already a Member</h1>
          <p className="text-muted-foreground">
            You are already a member of {invitation.pod?.title}.
          </p>
          <Link
            href={`/pods/${invitation.pod_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Pod
          </Link>
        </div>
      </div>
    )
  }

  async function joinPodAction() {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect("/auth/login")
    }

    await supabase
      .from("pod_members")
      .insert({
        pod_id: invitation.pod_id,
        user_id: user.id,
        role: "MEMBER",
      })

    await supabase
      .from("pod_invitations")
      .update({ used_count: invitation.used_count + 1 })
      .eq("id", invitation.id)

    revalidatePath("/pods")
    redirect(`/pods/${invitation.pod_id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="rounded-lg border bg-card p-6 text-center space-y-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
            {invitation.pod?.avatar_url ? (
              <img src={invitation.pod.avatar_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <Boxes className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">Join {invitation.pod?.title}</h1>
            <p className="text-muted-foreground mt-1">
              NPN: {invitation.pod?.npn}
            </p>
          </div>

          <p className="text-muted-foreground">
            You&apos;ve been invited to join this pod. Click below to become a member.
          </p>

          <form action={joinPodAction}>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Join Pod
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
