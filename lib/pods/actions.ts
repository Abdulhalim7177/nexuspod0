"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"
import { createNotification } from "@/lib/notifications/actions"

const podSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  summary: z.string().max(500, "Summary must be less than 500 characters.").optional().or(z.literal("")),
})

export async function createPod(prevState: { error?: string; success?: boolean } | null, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("User error:", userError)
    return { error: "Not authenticated" }
  }

  const rawData = {
    title: formData.get("title"),
    summary: formData.get("summary"),
  }

  const validatedData = podSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }

  const { title, summary } = validatedData.data

  // Insert pod first
  const { data: pod, error } = await supabase
    .from("pods")
    .insert({
      title,
      summary: summary || '',
      founder_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating pod:", JSON.stringify(error))
    return { error: `Failed to create pod: ${error.message}` }
  }

  // Insert founder as pod member (ignore if already exists - trigger may have done it)
  const { error: memberError } = await supabase
    .from("pod_members")
    .insert({
      pod_id: pod.id,
      user_id: user.id,
      role: "FOUNDER",
    })

  // Ignore duplicate key error - means trigger already added them
  if (memberError && memberError.code !== '23505') {
    console.error("Error adding founder to pod_members:", memberError)
  }

  revalidatePath("/pods")
  return { success: true }
}

export async function updatePod(podId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  const rawData = {
    title: formData.get("title"),
    summary: formData.get("summary"),
  }

  const validatedData = podSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: "Invalid form data." }
  }

  const { title, summary } = validatedData.data

  const { error } = await supabase
    .from("pods")
    .update({
      title,
      summary: summary || '',
    })
    .eq("id", podId)

  if (error) {
    return { error: "Failed to update pod." }
  }

  revalidatePath(`/pods/${podId}`)
  revalidatePath(`/pods/${podId}/settings`)
  return { success: true }
}

export async function deletePod(podId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("pods")
    .delete()
    .eq("id", podId)
    .eq("founder_id", user.id)

  if (error) {
    return { error: "Failed to delete pod." }
  }

  revalidatePath("/pods")
  redirect("/pods")
}

export async function createInvitation(podId: string, maxUses: number = 10, expiresInDays: number = 7) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const { data: invitation, error } = await supabase
    .from("pod_invitations")
    .insert({
      pod_id: podId,
      max_uses: maxUses,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: "Failed to create invitation." }
  }

  revalidatePath(`/pods/${podId}/members`)
  return { invitation }
}

export async function joinPod(inviteCode: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("pod_invitations")
    .select("*")
    .eq("code", inviteCode.toUpperCase())
    .eq("is_active", true)
    .single()

  if (inviteError || !invitation) {
    return { error: "Invalid or expired invitation code." }
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return { error: "Invitation has expired." }
  }

  if (invitation.used_count >= invitation.max_uses) {
    return { error: "Invitation has reached maximum uses." }
  }

  const { data: existingMember } = await supabase
    .from("pod_members")
    .select("*")
    .eq("pod_id", invitation.pod_id)
    .eq("user_id", user.id)
    .single()

  if (existingMember) {
    return { error: "You are already a member of this pod." }
  }

  const { error: memberError } = await supabase
    .from("pod_members")
    .insert({
      pod_id: invitation.pod_id,
      user_id: user.id,
      role: "MEMBER",
    })

  if (memberError) {
    return { error: "Failed to join pod." }
  }

  // Get pod info for notification
  const { data: pod } = await supabase
    .from("pods")
    .select("title")
    .eq("id", invitation.pod_id)
    .single()

  // Notify all existing pod members about new member
  const { data: existingMembers } = await supabase
    .from("pod_members")
    .select("user_id")
    .eq("pod_id", invitation.pod_id)
    .neq("user_id", user.id)

  if (existingMembers && pod) {
    for (const member of existingMembers) {
      await createNotification(
        member.user_id,
        "MEMBER_JOINED",
        "New Member Joined",
        `${user.email} joined your pod "${pod.title}"`,
        `/pods/${invitation.pod_id}`,
        invitation.pod_id,
        "pod"
      )
    }
  }

  await supabase
    .from("pod_invitations")
    .update({ used_count: invitation.used_count + 1 })
    .eq("id", invitation.id)

  revalidatePath("/pods")
  return { success: true, podId: invitation.pod_id }
}

export async function updateMemberRole(podId: string, memberId: string, newRole: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("pod_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("pod_id", podId)

  if (error) {
    return { error: "Failed to update role." }
  }

  revalidatePath(`/pods/${podId}/members`)
  return { success: true }
}

export async function removeMember(podId: string, memberId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("pod_members")
    .delete()
    .eq("id", memberId)
    .eq("pod_id", podId)

  if (error) {
    return { error: "Failed to remove member." }
  }

  revalidatePath(`/pods/${podId}/members`)
  return { success: true }
}

export async function getUserPods() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: pods } = await supabase
    .from("pods")
    .select(`
      *,
      pod_members!inner(
        id,
        role,
        user_id,
        joined_at,
        user:user_id(
          id,
          full_name,
          avatar_url,
          username
        )
      )
    `)
    .eq("pod_members.user_id", user.id)
    .order("created_at", { ascending: false })

  return pods || []
}

export async function getPodWithMembers(podId: string) {
  const supabase = await createClient()

  const { data: pod } = await supabase
    .from("pods")
    .select(`
      *,
      pod_members(
        id,
        role,
        joined_at,
        user:user_id(
          id,
          full_name,
          avatar_url,
          username
        )
      )
    `)
    .eq("id", podId)
    .single()

  return pod
}

export async function getPodInvitations(podId: string) {
  const supabase = await createClient()

  const { data: invitations } = await supabase
    .from("pod_invitations")
    .select("*")
    .eq("pod_id", podId)
    .order("created_at", { ascending: false })

  return invitations || []
}

export async function getInvitationByCode(code: string) {
  const supabase = await createClient()

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

  return invitation
}
