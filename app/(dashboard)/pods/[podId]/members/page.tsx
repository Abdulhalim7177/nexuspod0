import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PodMembersClient } from "./members-client"

interface PodMembersProps {
  params: Promise<{ podId: string }>
}

export default async function PodMembersPage({ params }: PodMembersProps) {
  const { podId } = await params
  console.log("Members page - podId:", podId)
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  console.log("Members page - user:", user?.id)

  if (!user) {
    console.log("Members page - redirecting to login")
    redirect("/auth/login")
  }

  console.log("Members page - fetching pod")
  const { data: pod } = await supabase
    .from("pods")
    .select("*")
    .eq("id", podId)
    .single()

  console.log("Members page - pod:", pod?.id)

  if (!pod) {
    console.log("Members page - pod not found, redirecting to pods")
    redirect("/pods")
  }

  console.log("Members page - fetching members")
  const { data: members } = await supabase
    .from("pod_members")
    .select("*")
    .eq("pod_id", podId)

  console.log("Members page - members count:", members?.length)

  const myMember = members?.find((m: any) => m.user_id === user.id)
  console.log("Members page - myMember:", myMember)

  if (!myMember) {
    console.log("Members page - not a member, redirecting to pods")
    redirect("/pods")
  }

  const canInvite = myMember.role === "FOUNDER" || myMember.role === "POD_MANAGER"
  const isFounder = myMember.role === "FOUNDER"

  const { data: invitations } = await supabase
    .from("pod_invitations")
    .select("*")
    .eq("pod_id", podId)
    .order("created_at", { ascending: false })

  const podWithMembers = {
    ...pod,
    pod_members: members || []
  }

  console.log("Members page - rendering client component")

  return (
    <PodMembersClient
      pod={podWithMembers}
      currentUserId={user.id}
      podId={podId}
      canInvite={canInvite}
      isFounder={isFounder}
      invitations={invitations || []}
    />
  )
}
