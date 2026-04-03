"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createNotification } from "@/lib/notifications/actions"

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  due_date: z.string().optional().or(z.literal("")),
  assignees: z.array(z.string()).optional(),
})

export async function createTask(projectId: string, podId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date"),
    assignees: formData.getAll("assignees"),
  }

  const validatedData = taskSchema.safeParse(rawData)
  if (!validatedData.success) {
    console.error("Validation error:", validatedData.error.flatten())
    return { error: "Invalid form data" }
  }

  const { title, description, priority, due_date, assignees } = validatedData.data

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      pod_id: podId,
      title,
      description: description || '',
      priority,
      due_date: due_date || null,
      created_by: user.id,
      status: 'NOT_STARTED'
    })
    .select()
    .single()

  if (error) {
    console.error("Error inserting task:", error)
    return { error: error.message }
  }

  // Add assignees
  if (assignees && assignees.length > 0) {
    const assigneeData = assignees.map(userId => ({
      task_id: task.id,
      user_id: userId
    }))
    const { error: assigneeError } = await supabase.from("task_assignees").insert(assigneeData)
    if (assigneeError) {
      console.error("Error inserting assignees:", assigneeError)
    }

    // Notify assignees
    for (const userId of assignees) {
      if (userId !== user.id) {
        // Verify user is still an assignee before sending notification
        const { data: stillAssigned } = await supabase
          .from("task_assignees")
          .select("id")
          .eq("task_id", task.id)
          .eq("user_id", userId)
          .maybeSingle()
        
        if (stillAssigned) {
          await createNotification(
            userId,
            "TASK_ASSIGNED",
            "New Task Assigned",
            `You have been assigned to "${title}"`,
            `/pods/${podId}/projects/${projectId}`,
            task.id,
            "task"
          )
        }
      }
    }
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true, task }
}

export async function updateTaskStatus(taskId: string, status: string, podId: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)

  if (error) return { error: error.message }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function submitTask(taskId: string, description: string, podId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Get task info
  const { data: task } = await supabase
    .from("tasks")
    .select("title, created_by")
    .eq("id", taskId)
    .single()

  // 1. Create submission
  const { error: subError } = await supabase
    .from("task_submissions")
    .insert({
      task_id: taskId,
      submitted_by: user.id,
      description
    })

  if (subError) return { error: subError.message }

  // 2. Update task status to DONE
  await supabase
    .from("tasks")
    .update({ status: 'DONE' })
    .eq("id", taskId)

  // 3. Notify task creator
  if (task && task.created_by !== user.id) {
    await createNotification(
      task.created_by,
      "TASK_SUBMITTED",
      "Task Submitted for Review",
      `"${task.title}" has been submitted for review`,
      `/pods/${podId}/projects/${projectId}`,
      taskId,
      "task"
    )
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function reviewTask(taskId: string, submissionId: string, action: 'APPROVED' | 'CORRECTED', feedback: string, podId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Get task info
  const { data: task } = await supabase
    .from("tasks")
    .select("title, created_by")
    .eq("id", taskId)
    .single()

  // Get submitter
  const { data: submission } = await supabase
    .from("task_submissions")
    .select("submitted_by")
    .eq("id", submissionId)
    .single()

  // 1. Create review
  const { error: revError } = await supabase
    .from("task_reviews")
    .insert({
      task_id: taskId,
      submission_id: submissionId,
      reviewed_by: user.id,
      action,
      feedback
    })

  if (revError) return { error: revError.message }

  // 2. Update task status
  const newStatus = action === 'APPROVED' ? 'APPROVED' : 'ONGOING'
  await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId)

  // 3. Notify submitter (verify they're still the submitter)
  if (submission && task && submission.submitted_by !== user.id) {
    const notifyType = action === 'APPROVED' ? 'TASK_APPROVED' : 'TASK_REJECTED'
    const notifyTitle = action === 'APPROVED' ? 'Task Approved' : 'Task Needs Revision'
    const notifyBody = action === 'APPROVED' 
      ? `"${task.title}" has been approved!`
      : `"${task.title}" needs revision: ${feedback}`

    await createNotification(
      submission.submitted_by,
      notifyType,
      notifyTitle,
      notifyBody,
      `/pods/${podId}/projects/${projectId}`,
      taskId,
      "task"
    )
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function updateTaskDetails(taskId: string, details: any, podId: string, projectId: string) {
  const supabase = await createClient()
  
  // Get current task info for comparison
  const { data: oldTask } = await supabase
    .from("tasks")
    .select("title, status, priority, due_date")
    .eq("id", taskId)
    .single()

  // Get assignees
  const { data: assignees } = await supabase
    .from("task_assignees")
    .select("user_id")
    .eq("task_id", taskId)

  const { error } = await supabase
    .from("tasks")
    .update(details)
    .eq("id", taskId)

  if (error) {
    console.error("Error updating task details:", error)
    return { error: error.message }
  }

  // Notify assignees if due date changed or status changed
  if (assignees && oldTask) {
    const changes: string[] = []
    
    if (details.due_date && details.due_date !== oldTask.due_date) {
      changes.push("due date")
    }
    if (details.status && details.status !== oldTask.status) {
      changes.push("status")
    }
    if (details.priority && details.priority !== oldTask.priority) {
      changes.push("priority")
    }

    if (changes.length > 0) {
      for (const assignee of assignees) {
        // Verify assignee is still assigned before notifying
        const { data: stillAssigned } = await supabase
          .from("task_assignees")
          .select("id")
          .eq("task_id", taskId)
          .eq("user_id", assignee.user_id)
          .maybeSingle()

        if (stillAssigned) {
          await createNotification(
            assignee.user_id,
            "SYSTEM",
            "Task Updated",
            `"${oldTask.title}" ${changes.join(" and ")} updated`,
            `/pods/${podId}/projects/${projectId}`,
            taskId,
            "task"
          )
        }
      }
    }
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function editTask(taskId: string, podId: string, projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = formData.get("priority") as string
  const due_date = formData.get("due_date") as string
  const assignees = formData.getAll("assignees") as string[]

  if (!title || title.length < 3) {
    return { error: "Title must be at least 3 characters." }
  }

  // Update task fields
  const { error: updateError } = await supabase
    .from("tasks")
    .update({
      title,
      description: description || '',
      priority: priority || 'MEDIUM',
      due_date: due_date || null,
    })
    .eq("id", taskId)

  if (updateError) return { error: updateError.message }

  // Replace assignees: delete existing then insert new
  await supabase.from("task_assignees").delete().eq("task_id", taskId)

  if (assignees && assignees.length > 0) {
    const assigneeData = assignees
      .filter(userId => userId && userId.trim() !== "")
      .map(userId => ({
        task_id: taskId,
        user_id: userId
      }))
    if (assigneeData.length > 0) {
      const { error: assigneeError } = await supabase.from("task_assignees").insert(assigneeData)
      if (assigneeError) {
        console.error("Error inserting assignees:", assigneeError)
      }
    }
  }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient()
  
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assignees:task_assignees (
        user:user_id (
          id,
          full_name,
          avatar_url
        )
      ),
      submissions:task_submissions (*)
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  return tasks || []
}

export async function deleteTask(taskId: string, podId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)

  if (error) return { error: error.message }

  revalidatePath(`/pods/${podId}/projects/${projectId}`)
  return { success: true }
}
