"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().max(1000, "Description must be less than 1000 characters.").optional().or(z.literal("")),
  is_private: z.boolean().default(false),
})

export async function createProject(podId: string, formData: FormData): Promise<{ error?: string; success?: boolean; projectId?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    is_private: formData.get("is_private") === "true",
  }

  const validatedData = projectSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }

  const { title, description, is_private } = validatedData.data

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      pod_id: podId,
      title,
      description: description || '',
      is_private,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    return { error: `Failed to create project: ${error.message}` }
  }

  revalidatePath(`/pods/${podId}`)
  revalidatePath(`/pods/${podId}/projects`)
  
  return { success: true, projectId: project.id }
}

export async function updateProject(podId: string, projectId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    is_private: formData.get("is_private") === "true",
  }

  const validatedData = projectSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { error: "Invalid form data." }
  }

  const { title, description, is_private } = validatedData.data

  const { error } = await supabase
    .from("projects")
    .update({
      title,
      description: description || '',
      is_private,
    })
    .eq("id", projectId)
    .eq("pod_id", podId)

  if (error) {
    return { error: "Failed to update project." }
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function deleteProject(podId: string, projectId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("pod_id", podId)

  if (error) {
    return { error: "Failed to delete project." }
  }

  revalidatePath(`/pods/${podId}/projects`)
  redirect(`/pods/${podId}`)
}

export async function getPodProjects(podId: string) {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      *,
      created_by_profile:created_by (
        full_name,
        avatar_url
      ),
      members_count:project_members(count)
    `)
    .eq("pod_id", podId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return projects || []
}

export async function getProject(projectId: string) {
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      pod:pod_id (
        id,
        title,
        npn
      ),
      members:project_members (
        user:profiles (
          id,
          full_name,
          avatar_url,
          username
        )
      )
    `)
    .eq("id", projectId)
    .single()

  if (error) {
    console.error("Error fetching project:", error)
    return null
  }

  return project
}

export async function requestToJoinProject(podId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("project_requests")
    .insert({
      pod_id: podId,
      project_id: projectId,
      user_id: user.id,
      status: 'PENDING'
    })

  if (error) {
    return { error: "Request already sent or failed." }
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function getProjectRequests(projectId: string) {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from("project_requests")
    .select(`
      *,
      user:profiles (
        id,
        full_name,
        avatar_url,
        username
      )
    `)
    .eq("project_id", projectId)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })

  return requests || []
}

export async function manageJoinRequest(requestId: string, podId: string, projectId: string, status: 'APPROVED' | 'REJECTED') {
  const supabase = await createClient()

  // 1. Get the request to find out which user it was for
  const { data: request } = await supabase
    .from("project_requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (!request) return { error: "Request not found" }

  // 2. Update status
  const { error: updateError } = await supabase
    .from("project_requests")
    .update({ status })
    .eq("id", requestId)

  if (updateError) return { error: "Failed to update request." }

  // 3. If approved, add to project_members
  if (status === 'APPROVED') {
    const { error: memberError } = await supabase
      .from("project_members")
      .insert({
        project_id: projectId,
        user_id: request.user_id
      })
    if (memberError && memberError.code !== '23505') {
       console.error("Error adding member after approval:", memberError)
    }
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function addProjectMember(podId: string, projectId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: userId,
    })

  if (error) {
    return { error: "Failed to add member to project." }
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function removeProjectMember(podId: string, projectId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId)

  if (error) {
    return { error: "Failed to remove member from project." }
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function createProjectInvitation(podId: string, projectId: string, maxUses: number = 10, expiresInDays: number = 7) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const { data: invitation, error } = await supabase
    .from("project_invitations")
    .insert({
      pod_id: podId,
      project_id: projectId,
      max_uses: maxUses,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating project invitation:", error)
    return { error: "Failed to create invitation." }
  }

  return { invitation }
}

export async function joinProject(inviteCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: invitation, error: inviteError } = await supabase
    .from("project_invitations")
    .select("*")
    .eq("code", inviteCode.toUpperCase())
    .eq("is_active", true)
    .single()

  if (inviteError || !invitation) {
    return { error: "Invalid or expired invitation code." }
  }

  // Check if user is in the pod first
  const { data: podMember } = await supabase
    .from("pod_members")
    .select("*")
    .eq("pod_id", invitation.pod_id)
    .eq("user_id", user.id)
    .single()

  if (!podMember) {
    // Auto-join pod as MEMBER if they have a project link? 
    // Or reject? The prompt says "just like pod invite".
    // Let's auto-join pod first to make it seamless.
    const { error: joinPodError } = await supabase
      .from("pod_members")
      .insert({
        pod_id: invitation.pod_id,
        user_id: user.id,
        role: "MEMBER"
      })
    if (joinPodError && joinPodError.code !== '23505') {
       return { error: "Failed to join the parent pod." }
    }
  }

  const { data: existingMember } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", invitation.project_id)
    .eq("user_id", user.id)
    .single()

  if (existingMember) {
    return { error: "You are already a member of this project.", podId: invitation.pod_id, projectId: invitation.project_id }
  }

  const { error: memberError } = await supabase
    .from("project_members")
    .insert({
      project_id: invitation.project_id,
      user_id: user.id,
    })

  if (memberError) {
    return { error: "Failed to join project." }
  }

  await supabase
    .from("project_invitations")
    .update({ used_count: invitation.used_count + 1 })
    .eq("id", invitation.id)

  revalidatePath(`/pods/${invitation.pod_id}/projects/${invitation.project_id}`)
  return { success: true, podId: invitation.pod_id, projectId: invitation.project_id }
}
