"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Hash,
  Users,
  MoreVertical,
  Phone,
  Video,
  Search,
  Pin,
  Info,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Conversation, ConversationParticipant } from "@/lib/chat/actions"

interface ChatHeaderProps {
  conversation: Conversation
  participants: ConversationParticipant[]
  onlineUsers: string[]
  currentUserId: string
  compact?: boolean
}

export function ChatHeader({
  conversation,
  participants,
  onlineUsers,
  currentUserId,
  compact = false,
}: ChatHeaderProps) {
  const otherOnline = onlineUsers.filter((id) => id !== currentUserId)
  const isDM = conversation.type === "DM"

  const displayName = conversation.name || getDefaultName(conversation)
  const subtitle = getSubtitle(conversation, participants, otherOnline)

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b bg-background/95 backdrop-blur-sm",
        compact ? "px-3 py-2" : "px-4 py-3"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isDM ? (
          <div className="relative">
            <Avatar className={cn("shrink-0", compact ? "h-8 w-8" : "h-10 w-10")}>
              <AvatarImage src={conversation.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
                {displayName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {otherOnline.length > 0 && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
        ) : (
          <div
            className={cn(
              "shrink-0 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20",
              compact ? "h-8 w-8" : "h-10 w-10"
            )}
          >
            {conversation.is_private ? (
              <Lock className={cn("text-violet-500", compact ? "h-4 w-4" : "h-5 w-5")} />
            ) : (
              <Hash className={cn("text-violet-500", compact ? "h-4 w-4" : "h-5 w-5")} />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-semibold truncate",
              compact ? "text-sm" : "text-base"
            )}
          >
            {displayName}
          </h3>
          {subtitle && (
            <p
              className={cn(
                "text-muted-foreground truncate",
                compact ? "text-[10px]" : "text-xs"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!compact && (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Video className="h-4 w-4" />
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Info className="h-4 w-4" /> Conversation Info
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Pin className="h-4 w-4" /> Pinned Messages
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Search className="h-4 w-4" /> Search Messages
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Users className="h-4 w-4" />{" "}
              {participants.length} Members
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function getDefaultName(conversation: Conversation): string {
  switch (conversation.type) {
    case "POD":
      return "Pod Chat"
    case "PROJECT":
      return "Project Chat"
    case "DM":
      return "Direct Message"
    case "GROUP":
      return "Group Chat"
    default:
      return "Chat"
  }
}

function getSubtitle(
  conversation: Conversation,
  participants: ConversationParticipant[],
  onlineUsers: string[]
): string {
  const count = participants.length
  const onlineCount = onlineUsers.length

  if (conversation.type === "DM") {
    return onlineCount > 0 ? "Online" : "Last seen recently"
  }

  const parts: string[] = []
  parts.push(`${count} member${count !== 1 ? "s" : ""}`)
  if (onlineCount > 0) {
    parts.push(`${onlineCount} online`)
  }

  return parts.join(" · ")
}
