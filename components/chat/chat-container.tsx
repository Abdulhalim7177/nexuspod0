"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { ChatHeader } from "./chat-header"
import {
  getMessages,
  sendMessage,
  markAsRead,
  type ChatMessage,
  type Conversation,
  type ConversationParticipant,
  getConversationParticipants,
} from "@/lib/chat/actions"

interface ChatContainerProps {
  conversation: Conversation
  currentUserId: string
  currentUserProfile?: {
    full_name: string
    avatar_url: string | null
  }
  className?: string
  compact?: boolean
}

export function ChatContainer({
  conversation,
  currentUserId,
  className,
  compact = false,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [participants, setParticipants] = useState<ConversationParticipant[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const loadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)
  const supabaseRef = useRef(createClient())

  const loadMessages = useCallback(async () => {
    setLoading(true)
    const result = await getMessages(conversation.id, 50)
    if (!result.error) {
      setMessages(result.messages)
      hasMoreRef.current = result.messages.length === 50
    }
    setLoading(false)
  }, [conversation.id])

  const loadParticipants = useCallback(async () => {
    const result = await getConversationParticipants(conversation.id)
    if (!result.error) {
      setParticipants(result.participants)
    }
  }, [conversation.id])

  // Initial load and realtime subscriptions
  useEffect(() => {
    loadMessages()
    loadParticipants()
    markAsRead(conversation.id)

    // Set up realtime subscription for new messages
    const supabase = supabaseRef.current
    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage
          // Fetch the user data for the new message
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", newMsg.user_id)
            .single()

          const enrichedMsg: ChatMessage = {
            ...newMsg,
            user: userData || undefined,
          }

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, enrichedMsg]
          })

          // Mark as read if not own message
          if (newMsg.user_id !== currentUserId) {
            markAsRead(conversation.id)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const updatedMsg = payload.new as ChatMessage
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m
            )
          )
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id
          setMessages((prev) => prev.filter((m) => m.id !== deletedId))
        }
      )
      .subscribe()

    // Presence channel for typing indicators
    const presenceChannel = supabase.channel(`presence:${conversation.id}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState()
        const online = Object.keys(state)
        setOnlineUsers(online)

        // Extract typing users
        const typing = Object.entries(state)
          .filter(([userId, presences]) => {
            if (userId === currentUserId) return false
            const presence = presences[0] as { typing?: boolean; online_at?: string } | undefined
            return presence?.typing === true
          })
          .map(([userId]) => userId)
        setTypingUsers(typing)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await presenceChannel.track({
              online_at: new Date().toISOString(),
              typing: false,
            })
          } catch (err) {
            console.error("Presence track error:", err)
          }
        }
      })

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(presenceChannel)
    }
  }, [conversation.id, currentUserId, loadMessages, loadParticipants])

  const loadMoreMessages = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current || messages.length === 0)
      return
    loadingMoreRef.current = true

    const oldestMessage = messages[0]
    const result = await getMessages(conversation.id, 50, oldestMessage.created_at)

    if (!result.error && result.messages.length > 0) {
      setMessages((prev) => [...result.messages, ...prev])
      hasMoreRef.current = result.messages.length === 50
    } else {
      hasMoreRef.current = false
    }

    loadingMoreRef.current = false
  }, [conversation.id, messages])

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim()) return
      await sendMessage(conversation.id, content, replyTo?.id)
      setReplyTo(null)
    },
    [conversation.id, replyTo]
  )

  // Handle typing - use a separate typing channel
  const handleTyping = useCallback(
    async (isTyping: boolean) => {
      if (!currentUserId || !supabaseRef.current) return
      
      try {
        const supabase = supabaseRef.current
        const typingChannel = supabase.channel(`typing:${conversation.id}`)
        
        await typingChannel.track({
          user_id: currentUserId,
          is_typing: isTyping,
        })
      } catch (err) {
        // Silently ignore typing errors
      }
    },
    [conversation.id, currentUserId]
  )

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background",
        className
      )}
    >
      <ChatHeader
        conversation={conversation}
        participants={participants}
        onlineUsers={onlineUsers}
        currentUserId={currentUserId}
        compact={compact}
      />

      <ChatMessages
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        typingUsers={typingUsers}
        participants={participants}
        onLoadMore={loadMoreMessages}
        hasMore={hasMoreRef.current}
        onReply={setReplyTo}
        compact={compact}
      />

      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        compact={compact}
      />
    </div>
  )
}
