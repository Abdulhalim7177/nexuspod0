"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Reply,
  MoreHorizontal,
  Trash2,
  Edit3,
  Copy,
  Pin,
  FileText,
  Check,
  CheckCheck,
} from "lucide-react"
import { editMessage, deleteMessage, togglePinMessage } from "@/lib/chat/actions"
import type { ChatMessage } from "@/lib/chat/actions"

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
  showAvatar: boolean
  showName: boolean
  onReply: () => void
  compact?: boolean
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showName,
  onReply,
  compact = false,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content || "")
  const [showActions, setShowActions] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const time = new Date(message.created_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const handleEdit = async () => {
    if (!editContent.trim()) return
    await editMessage(message.id, editContent)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await deleteMessage(message.id)
  }

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content)
    }
  }

  const handlePin = async () => {
    await togglePinMessage(message.id)
  }

  // System messages
  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-muted/50 text-muted-foreground text-[10px] font-medium px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    )
  }

  // File messages
  const isFile = message.type === "FILE"
  const isVoice = message.type === "VOICE"

  return (
    <div
      className={cn(
        "group flex gap-2 mb-0.5",
        isOwn ? "flex-row-reverse" : "flex-row",
        showAvatar ? "mt-3" : "mt-px"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar placeholder for alignment */}
      {!isOwn && (
        <div className={cn("shrink-0", compact ? "w-7" : "w-8")}>
          {showAvatar && (
            <Avatar className={cn("ring-2 ring-background", compact ? "h-7 w-7" : "h-8 w-8")}>
              <AvatarImage src={message.user?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-[10px] font-bold">
                {message.user?.full_name?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      {/* Message content */}
      <div
        className={cn(
          "flex flex-col max-w-[75%] min-w-0",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {/* Sender name */}
        {showName && !isOwn && (
          <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1 ml-1">
            {message.user?.full_name || "Unknown"}
          </span>
        )}

        {/* Reply reference */}
        {message.reply_to && message.reply_message && (
          <div
            className={cn(
              "mb-1 px-3 py-1.5 rounded-lg border-l-2 text-xs max-w-full",
              isOwn
                ? "bg-violet-500/10 border-violet-500 mr-1"
                : "bg-muted/50 border-violet-500/50 ml-1"
            )}
          >
            <p className="text-[10px] font-bold text-violet-500 mb-0.5">
              {message.reply_message.user?.full_name || "Unknown"}
            </p>
            <p className="text-muted-foreground truncate text-[11px]">
              {message.reply_message.content || "File message"}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-2xl break-words",
            compact ? "px-3 py-1.5" : "px-3.5 py-2",
            isOwn
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md"
              : "bg-muted/60 text-foreground rounded-bl-md",
            message.is_pinned && "ring-1 ring-yellow-500/50"
          )}
        >
          {/* File attachment */}
          {(isFile || isVoice) && message.file_url && (
            <div
              className={cn(
                "mb-2 rounded-lg overflow-hidden border",
                isOwn ? "border-white/20" : "border-border"
              )}
            >
              {message.mime_type?.startsWith("image/") ? (
                <Image
                  src={message.file_url!}
                  alt={message.file_name || "Image"}
                  width={400}
                  height={240}
                  className="max-w-full h-auto object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-2 p-2",
                    isOwn ? "bg-white/10" : "bg-muted/30"
                  )}
                >
                  <FileText className="h-5 w-5 shrink-0 opacity-70" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {message.file_name || "File"}
                    </p>
                    {message.file_size && (
                      <p
                        className={cn(
                          "text-[10px]",
                          isOwn ? "text-white/60" : "text-muted-foreground"
                        )}
                      >
                        {formatFileSize(message.file_size)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text content */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-transparent text-sm outline-none resize-none min-h-[40px]"
                autoFocus
              />
              <div className="flex gap-1 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] rounded-md"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    "h-6 text-[10px] rounded-md",
                    isOwn
                      ? "bg-white/20 hover:bg-white/30 text-white"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                  )}
                  onClick={handleEdit}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            message.content && (
              <p
                className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap",
                  compact && "text-[13px]"
                )}
              >
                {message.content}
                {message.is_edited && (
                  <span
                    className={cn(
                      "text-[9px] ml-1.5 opacity-60 italic",
                    )}
                  >
                    (edited)
                  </span>
                )}
              </p>
            )
          )}

          {/* Pin indicator */}
          {message.is_pinned && (
            <div
              className={cn(
                "absolute -top-1.5 -right-1.5",
                "h-4 w-4 rounded-full bg-yellow-500 flex items-center justify-center"
              )}
            >
              <Pin className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Timestamp and read receipts */}
        <div
          className={cn(
            "flex items-center gap-1.5 mt-0.5",
            isOwn ? "mr-1" : "ml-1"
          )}
        >
          <span className="text-[9px] text-muted-foreground/70 font-medium">
            {time}
          </span>
          {isOwn && (
            <span className="text-muted-foreground/50">
              {message.read_by && message.read_by.length > 0 ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Hover actions */}
      {showActions && (
        <div
          className={cn(
            "flex items-center gap-0.5 z-10",
            isOwn ? "mr-1" : "ml-1"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={onReply}
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer text-xs">
                <Copy className="h-3.5 w-3.5" /> Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePin} className="gap-2 cursor-pointer text-xs">
                <Pin className="h-3.5 w-3.5" /> {message.is_pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              {isOwn && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditContent(message.content || "")
                      setIsEditing(true)
                    }}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="gap-2 cursor-pointer text-xs text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
