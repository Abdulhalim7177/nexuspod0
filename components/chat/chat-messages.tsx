"use client"

import { useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"
import { Loader2, MessageSquare } from "lucide-react"
import type { ChatMessage, ConversationParticipant } from "@/lib/chat/actions"

interface ChatMessagesProps {
  messages: ChatMessage[]
  currentUserId: string
  loading: boolean
  typingUsers: string[]
  participants: ConversationParticipant[]
  onLoadMore: () => Promise<void>
  hasMore: boolean
  onReply: (message: ChatMessage) => void
  compact?: boolean
}

export function ChatMessages({
  messages,
  currentUserId,
  loading,
  typingUsers,
  participants,
  onLoadMore,
  hasMore,
  onReply,
  compact = false,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isLoadingMore = useRef(false)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length])

  const handleScroll = useCallback(async () => {
    const el = scrollRef.current
    if (!el || !hasMore || isLoadingMore.current) return

    if (el.scrollTop < 100) {
      isLoadingMore.current = true
      const previousHeight = el.scrollHeight
      await onLoadMore()
      // Maintain scroll position after prepending
      requestAnimationFrame(() => {
        if (el) {
          el.scrollTop = el.scrollHeight - previousHeight
        }
        isLoadingMore.current = false
      })
    }
  }, [hasMore, onLoadMore])

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium">Loading messages...</span>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-violet-500" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Start the conversation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Send your first message to get the conversation going.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      <div className={cn("py-4", compact ? "px-3" : "px-4")}>
        {/* Load more indicator */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={onLoadMore}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5 rounded-full bg-muted/50 hover:bg-muted"
            >
              Load earlier messages
            </button>
          </div>
        )}

        {/* Grouped messages */}
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-muted/80 text-muted-foreground text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message, index) => {
              const prevMessage = index > 0 ? dayMessages[index - 1] : null
              const isSameSender = prevMessage?.user_id === message.user_id
              const isConsecutive =
                isSameSender &&
                prevMessage &&
                new Date(message.created_at).getTime() -
                  new Date(prevMessage.created_at).getTime() <
                  120000

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.user_id === currentUserId}
                  showAvatar={!isConsecutive}
                  showName={!isConsecutive && message.user_id !== currentUserId}
                  onReply={() => onReply(message)}
                  compact={compact}
                />
              )
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator
            userIds={typingUsers}
            participants={participants}
          />
        )}

        {/* Bottom anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function groupMessagesByDate(messages: ChatMessage[]): Record<string, ChatMessage[]> {
  const groups: Record<string, ChatMessage[]> = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const msg of messages) {
    const msgDate = new Date(msg.created_at)
    let dateKey: string

    if (isSameDay(msgDate, today)) {
      dateKey = "Today"
    } else if (isSameDay(msgDate, yesterday)) {
      dateKey = "Yesterday"
    } else {
      dateKey = msgDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    }

    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(msg)
  }

  return groups
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}
