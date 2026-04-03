"use server"

import { createClient } from "@/lib/supabase/server"

export type ConversationType = "POD" | "PROJECT" | "TEAM" | "DM" | "GROUP"

export interface ChatMessage {
  id: string
  conversation_id: string
  user_id: string
  content: string | null
  type: "TEXT" | "FILE" | "VOICE" | "SYSTEM"
  file_url: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  reply_to: string | null
  is_pinned: boolean
  is_edited: boolean
  read_by: string[]
  created_at: string
  updated_at: string
  user?: {
    full_name: string
    avatar_url: string | null
  }
  reply_message?: {
    id: string
    content: string | null
    user_id: string
    user?: {
      full_name: string
    }
  }
}

export interface Conversation {
  id: string
  type: ConversationType
  pod_id: string | null
  project_id: string | null
  team_id: string | null
  name: string | null
  avatar_url: string | null
  is_private: boolean
  created_at: string
  updated_at: string
  participants?: ConversationParticipant[]
  last_message?: ChatMessage
  unread_count?: number
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  is_admin: boolean
  last_read_at: string
  joined_at: string
  user?: {
    full_name: string
    avatar_url: string | null
    username: string | null
  }
}

// ─── Get Messages ────────────────────────────────────────────

export async function getMessages(
  conversationId: string,
  limit = 50,
  before?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", messages: [] as ChatMessage[] }

  let query = supabase
    .from("chat_messages")
    .select(`
      *,
      user:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt("created_at", before)
  }

  const { data: messages, error } = await query

  if (error) {
    console.error("Error fetching messages:", error)
    return { error: error.message, messages: [] as ChatMessage[] }
  }

  // Reverse to get chronological order
  const chronological = (messages || []).reverse()

  // Fetch reply-to messages
  const replyToIds = chronological
    .filter((m) => m.reply_to)
    .map((m) => m.reply_to)

  let replyMessages: Record<string, { id: string; content: string | null; user_id: string; user?: { full_name: string } }> = {}
  if (replyToIds.length > 0) {
    const { data: replies } = await supabase
      .from("chat_messages")
      .select("id, content, user_id, user:user_id(full_name)")
      .in("id", replyToIds)

    if (replies) {
      replyMessages = Object.fromEntries(replies.map((r) => [r.id, r]))
    }
  }

  const enriched = chronological.map((m) => ({
    ...m,
    reply_message: m.reply_to ? replyMessages[m.reply_to] : undefined,
  }))

  return { messages: enriched as ChatMessage[] }
}

// ─── Send Message ────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  content: string,
  replyTo?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  if (!content.trim()) return { error: "Message cannot be empty" }

  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      content: content.trim(),
      type: "TEXT",
      reply_to: replyTo || null,
    })
    .select(`
      *,
      user:user_id (
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error("Error sending message:", error)
    return { error: error.message }
  }

  return { success: true, message }
}

// ─── Send File Message ──────────────────────────────────────

export async function sendFileMessage(
  conversationId: string,
  fileUrl: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  content?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const isVoice = mimeType.startsWith("audio/")
  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      content: content || null,
      type: isVoice ? "VOICE" : "FILE",
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  return { success: true, message }
}

// ─── Edit Message ────────────────────────────────────────────

export async function editMessage(messageId: string, newContent: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("chat_messages")
    .update({
      content: newContent.trim(),
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  return { success: true }
}

// ─── Delete Message ──────────────────────────────────────────

export async function deleteMessage(messageId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("id", messageId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  return { success: true }
}

// ─── Mark as Read ────────────────────────────────────────────

export async function markAsRead(conversationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Update participant's last_read_at
  const { error } = await supabase
    .from("chat_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  // Update messages read_by array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: msgError } = await (supabase as any).rpc(
    "mark_messages_read",
    {
      p_conversation_id: conversationId,
      p_user_id: user.id,
    }
  )

  // If RPC doesn't exist, do it manually
  if (msgError) {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("id, read_by")
      .eq("conversation_id", conversationId)
      .not("read_by", "cs", `{${user.id}}`)

    if (messages) {
      for (const msg of messages) {
        const updatedReadBy = [...(msg.read_by || []), user.id]
        await supabase
          .from("chat_messages")
          .update({ read_by: updatedReadBy })
          .eq("id", msg.id)
      }
    }
  }

  return { success: true }
}

// ─── Get Conversations for User ──────────────────────────────

export async function getConversations() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", conversations: [] as Conversation[] }

  const { data: participations, error } = await supabase
    .from("chat_participants")
    .select(`
      conversation_id,
      last_read_at,
      conversation:conversation_id (
        id, type, pod_id, project_id, name, avatar_url, is_private, created_at, updated_at
      )
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching conversations:", error)
    return { error: error.message, conversations: [] as Conversation[] }
  }

  const conversations: Conversation[] = []

  for (const p of participations || []) {
    const convo = p.conversation as unknown as Conversation | null
    if (!convo) continue

    // Get last message
    const { data: lastMsg } = await supabase
      .from("chat_messages")
      .select("id, content, type, user_id, created_at, user:user_id(full_name)")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get unread count
    const { count } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", convo.id)
      .gt("created_at", p.last_read_at || "1970-01-01")
      .neq("user_id", user.id)

    // Get participant info for DM display name
    let displayName = convo.name
    if (convo.type === "DM") {
      const { data: otherParticipant } = await supabase
        .from("chat_participants")
        .select("user:user_id(full_name, avatar_url)")
        .eq("conversation_id", convo.id)
        .neq("user_id", user.id)
        .maybeSingle()

      if (otherParticipant?.user) {
        const otherUser = Array.isArray(otherParticipant.user)
          ? (otherParticipant.user[0] as { full_name: string; avatar_url: string | null } | undefined)
          : (otherParticipant.user as { full_name: string; avatar_url: string | null } | undefined)
        if (otherUser) {
          displayName = otherUser.full_name
          convo.avatar_url = otherUser.avatar_url
        }
      }
    }

    conversations.push({
      ...convo,
      name: displayName,
      last_message: (lastMsg as unknown as ChatMessage) || undefined,
      unread_count: count || 0,
    })
  }

  // Sort by last message or updated_at
  conversations.sort((a, b) => {
    const dateA = a.last_message?.created_at || a.updated_at
    const dateB = b.last_message?.created_at || b.updated_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  return { conversations }
}

// ─── Get or Create Pod Conversation ────────────────────────

export async function getOrCreatePodConversation(podId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", conversation: null as Conversation | null }

  // Check if conversation exists
  const { data: existing } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("pod_id", podId)
    .eq("type", "POD")
    .maybeSingle()

  if (existing) {
    return { conversation: existing as Conversation }
  }

  // Get pod info
  const { data: pod } = await supabase
    .from("pods")
    .select("id, title, founder_id")
    .eq("id", podId)
    .single()

  if (!pod) return { error: "Pod not found", conversation: null }

  // Create conversation
  const { data: convo, error: createError } = await supabase
    .from("chat_conversations")
    .insert({
      type: "POD",
      pod_id: podId,
      name: pod.title + " — General",
    })
    .select()
    .single()

  if (createError) {
    console.error("Error creating pod conversation:", createError)
    return { error: createError.message, conversation: null }
  }

  // Add all pod members as participants
  const { data: members } = await supabase
    .from("pod_members")
    .select("user_id, role")
    .eq("pod_id", podId)

  if (members && members.length > 0) {
    const participants = members.map((m) => ({
      conversation_id: convo.id,
      user_id: m.user_id,
      is_admin: m.role === "FOUNDER" || m.role === "POD_MANAGER",
    }))

    await supabase.from("chat_participants").insert(participants)
  }

  return { conversation: convo as Conversation }
}

// ─── Get Pod Conversation (read-only) ──────────────────────────

export async function getPodConversation(podId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", conversation: null as Conversation | null }

  const { data: conversation, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("pod_id", podId)
    .eq("type", "POD")
    .maybeSingle()

  if (error) return { error: error.message, conversation: null }
  if (!conversation) return { error: "Conversation not found", conversation: null }

  return { conversation: conversation as Conversation }
}

// ─── Get or Create Project Conversation ────────────────────────

export async function getOrCreateProjectConversation(projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", conversation: null as Conversation | null }

  // Check if conversation exists
  const { data: existing } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("project_id", projectId)
    .eq("type", "PROJECT")
    .maybeSingle()

  if (existing) {
    return { conversation: existing as Conversation }
  }

  // Get project info
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, pod_id, created_by")
    .eq("id", projectId)
    .single()

  if (!project) return { error: "Project not found", conversation: null }

  // Create conversation
  const { data: convo, error: createError } = await supabase
    .from("chat_conversations")
    .insert({
      type: "PROJECT",
      pod_id: project.pod_id,
      project_id: projectId,
      name: project.title + " — Chat",
    })
    .select()
    .single()

  if (createError) {
    console.error("Error creating project conversation:", createError)
    return { error: createError.message, conversation: null }
  }

  // Add project members as participants
  const { data: projMembers } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId)

  // Also get all pod members if project is public
  const { data: projectInfo } = await supabase
    .from("projects")
    .select("is_private")
    .eq("id", projectId)
    .single()

  let participantUserIds: string[] = []

  if (projectInfo?.is_private && projMembers) {
    participantUserIds = projMembers.map((m) => m.user_id)
  } else {
    // For public projects, add all pod members
    const { data: podMembers } = await supabase
      .from("pod_members")
      .select("user_id, role")
      .eq("pod_id", project.pod_id)

    participantUserIds = podMembers?.map((m) => m.user_id) || []
  }

  // Ensure creator is included
  if (project.created_by && !participantUserIds.includes(project.created_by)) {
    participantUserIds.push(project.created_by)
  }

  if (participantUserIds.length > 0) {
    const participants = participantUserIds.map((userId) => ({
      conversation_id: convo.id,
      user_id: userId,
      is_admin: userId === project.created_by,
    }))

    await supabase.from("chat_participants").insert(participants)
  }

  return { conversation: convo as Conversation }
}

// ─── Get Project Conversation (read-only) ──────────────────────

export async function getProjectConversation(projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", conversation: null as Conversation | null }

  const { data: conversation, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("project_id", projectId)
    .eq("type", "PROJECT")
    .maybeSingle()

  if (error) return { error: error.message, conversation: null }
  if (!conversation) return { error: "Conversation not found", conversation: null }

  return { conversation: conversation as Conversation }
}

// ─── Get or Create DM ────────────────────────────────────────

export async function getOrCreateDM(otherUserId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", conversationId: null }

  const { data, error } = await supabase.rpc("get_or_create_dm", {
    other_user_id: otherUserId,
  })

  if (error) {
    console.error("Error creating DM:", error)
    return { error: error.message, conversationId: null }
  }

  return { conversationId: data as string }
}

// ─── Get Conversation Participants ───────────────────────────

export async function getConversationParticipants(conversationId: string) {
  const supabase = await createClient()

  const { data: participants, error } = await supabase
    .from("chat_participants")
    .select(`
      *,
      user:user_id (
        full_name,
        avatar_url,
        username
      )
    `)
    .eq("conversation_id", conversationId)

  if (error) return { error: error.message, participants: [] as ConversationParticipant[] }

  return { participants: participants as ConversationParticipant[] }
}

// ─── Get Pod Members (for starting new DMs) ──────────────────

export async function getPodMembersForChat(podId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", members: [] }

  const { data: members, error } = await supabase
    .from("pod_members")
    .select(`
      user_id,
      role,
      user:user_id (
        id,
        full_name,
        avatar_url,
        username
      )
    `)
    .eq("pod_id", podId)
    .neq("user_id", user.id)

  if (error) return { error: error.message, members: [] }

  return { members }
}

// ─── Toggle Pin ──────────────────────────────────────────────

export async function togglePinMessage(messageId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: message } = await supabase
    .from("chat_messages")
    .select("is_pinned")
    .eq("id", messageId)
    .single()

  if (!message) return { error: "Message not found" }

  const { error } = await supabase
    .from("chat_messages")
    .update({ is_pinned: !message.is_pinned })
    .eq("id", messageId)

  if (error) return { error: error.message }

  return { success: true, is_pinned: !message.is_pinned }
}
