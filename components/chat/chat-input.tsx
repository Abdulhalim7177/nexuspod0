"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Send,
  Paperclip,
  Smile,
  X,
  Image as ImageIcon,
  FileText,
  Mic,
  Reply,
} from "lucide-react"
import type { ChatMessage } from "@/lib/chat/actions"

interface ChatInputProps {
  onSend: (content: string) => Promise<void>
  onTyping: (isTyping: boolean) => void
  replyTo?: ChatMessage | null
  onCancelReply?: () => void
  compact?: boolean
}

export function ChatInput({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  compact = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Focus textarea when reply is set
  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus()
    }
  }, [replyTo])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  const handleSend = async () => {
    if (!message.trim() || sending) return

    setSending(true)
    try {
      await onSend(message)
      setMessage("")
      onTyping(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Typing indicator
    onTyping(true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 2000)
  }

  return (
    <div className="border-t bg-background/95 backdrop-blur-sm">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-dashed">
          <Reply className="h-3.5 w-3.5 text-violet-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">
              Replying to {replyTo.user?.full_name || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {replyTo.content || "File message"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onCancelReply}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "flex items-end gap-2",
          compact ? "px-3 py-2" : "px-4 py-3"
        )}
      >
        {/* Attachment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl",
                compact ? "h-8 w-8" : "h-9 w-9"
              )}
            >
              <Paperclip className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-44">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <ImageIcon className="h-4 w-4 text-green-500" /> Photo / Video
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4 text-blue-500" /> Document
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Mic className="h-4 w-4 text-red-500" /> Voice Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn(
              "resize-none border rounded-2xl bg-muted/30 focus-visible:ring-1 focus-visible:ring-violet-500/50 pr-10",
              compact
                ? "min-h-[36px] max-h-[80px] text-sm py-2 px-3"
                : "min-h-[44px] max-h-[120px] py-3 px-4"
            )}
            rows={1}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1 h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          size="icon"
          className={cn(
            "shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20 transition-all",
            compact ? "h-8 w-8" : "h-9 w-9",
            message.trim()
              ? "scale-100 opacity-100"
              : "scale-95 opacity-50"
          )}
        >
          <Send className={cn("text-white", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </Button>
      </div>
    </div>
  )
}
