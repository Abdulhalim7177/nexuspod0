import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PodSettingsForm } from "./pod-settings-form"

interface PodSettingsProps {
  params: Promise<{ podId: string }>
}

export default async function PodSettingsPage({ params }: PodSettingsProps) {
  const { podId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: pod } = await supabase
    .from("pods")
    .select(`
      *,
      pod_members(
        id,
        role,
        user_id
      )
    `)
    .eq("id", podId)
    .single()

  if (!pod) {
    redirect("/pods")
  }

  const myMember = pod.pod_members?.find((m: { user_id: string }) => m.user_id === user.id)

  if (!myMember) {
    redirect("/pods")
  }

  const isFounder = myMember.role === "FOUNDER"

  if (!isFounder) {
    redirect(`/pods/${podId}`)
  }

  return <PodSettingsForm pod={pod} isFounder={isFounder} podId={podId} />
}
