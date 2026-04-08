"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Plus,
  Lock,
  MessageCircle,
  Users,
  FolderKanban,
} from "lucide-react"
import { useState } from "react"
import type { Conversation } from "@/lib/chat/actions"

interface ChatSidebarProps {
  conversations: Conversation[]
  activeConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
  onCreateConversation?: () => void
  className?: string
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  className,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = conversations.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group by type
  const podChats = filtered.filter((c) => c.type === "POD")
  const projectChats = filtered.filter((c) => c.type === "PROJECT")
  const dmChats = filtered.filter((c) => c.type === "DM")
  const groupChats = filtered.filter(
    (c) => c.type === "GROUP" || c.type === "TEAM"
  )

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-background/95 backdrop-blur-sm",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg tracking-tight">Messages</h2>
          {onCreateConversation && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={onCreateConversation}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="h-9 pl-9 rounded-xl bg-muted/30 border-none text-sm focus-visible:ring-1 focus-visible:ring-violet-500/50"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Start a chat or join a pod
            </p>
          </div>
        ) : (
          <div className="py-2">
            {podChats.length > 0 && (
              <ConversationGroup
                title="Pod Chats"
                conversations={podChats}
                activeId={activeConversationId}
                onSelect={onSelectConversation}
              />
            )}
            {projectChats.length > 0 && (
              <ConversationGroup
                title="Project Chats"
                conversations={projectChats}
                activeId={activeConversationId}
                onSelect={onSelectConversation}
              />
            )}
            {dmChats.length > 0 && (
              <ConversationGroup
                title="Direct Messages"
                conversations={dmChats}
                activeId={activeConversationId}
                onSelect={onSelectConversation}
              />
            )}
            {groupChats.length > 0 && (
              <ConversationGroup
                title="Groups"
                conversations={groupChats}
                activeId={activeConversationId}
                onSelect={onSelectConversation}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationGroup({
  title,
  conversations,
  activeId,
  onSelect,
  getTypingUsers,
}: {
  title: string
  conversations: Conversation[]
  activeId?: string
  onSelect: (c: Conversation) => void
  getTypingUsers?: (convoId: string) => string[]
}) {
  return (
    <div className="mb-2">
      <div className="px-4 py-1.5">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          {title}
        </span>
      </div>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeId}
          onClick={() => onSelect(conversation)}
          typingUsers={getTypingUsers?.(conversation.id) || []}
        />
      ))}
    </div>
  )
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  typingUsers = [],
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  typingUsers?: string[]
}) {
  const displayName =
    conversation.name ||
    (conversation.type === "DM" ? "Direct Message" : "Chat")

  const lastMessageTime = conversation.last_message
    ? formatRelativeTime(conversation.last_message.created_at)
    : formatRelativeTime(conversation.updated_at)

  const lastMessagePreview = conversation.last_message
    ? conversation.last_message.type === "SYSTEM"
      ? conversation.last_message.content
      : conversation.last_message.type === "FILE"
        ? "📎 File"
        : conversation.last_message.type === "VOICE"
          ? "🎤 Voice note"
          : truncate(conversation.last_message.content || "", 40)
    : "No messages yet"

  const isDM = conversation.type === "DM"

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
        isActive
          ? "bg-violet-500/10 border-r-2 border-violet-500"
          : "hover:bg-muted/30"
      )}
    >
      {/* Avatar */}
      {isDM ? (
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
          {conversation.is_private ? (
            <Lock className="h-4 w-4 text-violet-500" />
          ) : conversation.type === "PROJECT" ? (
            <FolderKanban className="h-4 w-4 text-violet-500" />
          ) : conversation.type === "DM" ? (
            <MessageCircle className="h-4 w-4 text-violet-500" />
          ) : (
            <Users className="h-4 w-4 text-violet-500" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={cn(
              "text-sm truncate",
              isActive ? "font-semibold" : "font-medium"
            )}
          >
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
            {lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between">
          {typingUsers.length > 0 ? (
            <p className="text-xs text-violet-500 font-medium italic truncate">
              typing...
            </p>
          ) : (
            <p
              className={cn(
                "text-xs truncate",
                conversation.unread_count && conversation.unread_count > 0
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {lastMessagePreview}
            </p>
          )}
          {conversation.unread_count && conversation.unread_count > 0 && (
            <Badge className="h-5 min-w-5 px-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-bold shrink-0 ml-2">
              {conversation.unread_count > 99
                ? "99+"
                : conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max) + "..."
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "now"
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
