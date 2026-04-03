"use client"

import type { ConversationParticipant } from "@/lib/chat/actions"

interface TypingIndicatorProps {
  userIds: string[]
  participants: ConversationParticipant[]
}

export function TypingIndicator({ userIds, participants }: TypingIndicatorProps) {
  const typingNames = userIds
    .map((id) => {
      const p = participants.find((p) => p.user_id === id)
      return p?.user?.full_name?.split(" ")[0] || "Someone"
    })
    .slice(0, 3)

  const label =
    typingNames.length === 1
      ? `${typingNames[0]} is typing`
      : typingNames.length === 2
        ? `${typingNames[0]} and ${typingNames[1]} are typing`
        : `${typingNames[0]} and ${typingNames.length - 1} others are typing`

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="flex items-center gap-1 bg-muted/60 rounded-2xl rounded-bl-md px-3 py-2">
        <div className="flex gap-0.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
          {label}
        </span>
      </div>
    </div>
  )
}
