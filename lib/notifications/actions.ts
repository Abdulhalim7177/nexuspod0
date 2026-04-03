"use server"

import { createClient } from "@/lib/supabase/server"

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_SUBMITTED'
  | 'TASK_APPROVED'
  | 'TASK_REJECTED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'CHAT_MENTION'
  | 'CHAT_MESSAGE'
  | 'PROJECT_INVITE'
  | 'POD_INVITE'
  | 'MEMBER_JOINED'
  | 'PROJECT_REQUEST'
  | 'SYSTEM'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  related_id: string | null
  related_type: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

// ─── Get Notifications ────────────────────────────────────────

export async function getNotifications(limit = 50, includeRead = false) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", notifications: [] as Notification[] }

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (!includeRead) {
    query = query.eq("is_read", false)
  }

  const { data: notifications, error } = await query

  if (error) {
    console.error("Error fetching notifications:", error)
    return { error: error.message, notifications: [] as Notification[] }
  }

  return { notifications: notifications as Notification[] }
}

// ─── Get Unread Count ──────────────────────────────────────────

export async function getUnreadNotificationCount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { count: 0 }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    console.error("Error getting unread count:", error)
    return { count: 0 }
  }

  return { count: count || 0 }
}

// ─── Mark as Read ──────────────────────────────────────────────

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  return { success: true }
}

// ─── Mark All as Read ─────────────────────────────────────────

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) return { error: error.message }

  return { success: true }
}

// ─── Delete Notification ────────────────────────────────────────

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  return { success: true }
}

// ─── Create Notification (Server-side only) ────────────────────

export async function createNotification(
  targetUserId: string,
  type: NotificationType,
  title: string,
  body?: string,
  link?: string,
  relatedId?: string,
  relatedType?: string
) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("create_notification", {
    p_user_id: targetUserId,
    p_type: type,
    p_title: title,
    p_body: body,
    p_link: link,
    p_related_id: relatedId,
    p_related_type: relatedType,
  })

  if (error) {
    console.error("Error creating notification:", error)
    return { error: error.message }
  }

  return { success: true }
}
