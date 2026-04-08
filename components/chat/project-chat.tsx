"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatContainer } from "@/components/chat/chat-container"
import { getOrCreateProjectConversation, type Conversation } from "@/lib/chat/actions"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2, RefreshCw } from "lucide-react"

interface ProjectChatProps {
  projectId: string
  currentUserId: string
  currentUserProfile: {
    full_name: string
    avatar_url: string | null
  }
}

export function ProjectChat({
  projectId,
  currentUserId,
  currentUserProfile,
}: ProjectChatProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConversation = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getOrCreateProjectConversation(projectId)
    if (result.error) {
      setError(result.error)
    } else {
      setConversation(result.conversation)
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium">Loading chat...</span>
        </div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="h-[600px] border border-dashed rounded-xl flex flex-col items-center justify-center bg-muted/10">
        <div className="text-center p-8 border rounded-2xl bg-background shadow-xl border-primary/10 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-bold mb-2">Project Chat</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error?.includes("relation")
              ? "Chat tables need to be created. Run migration 019 in your Supabase SQL Editor."
              : error || "Unable to load chat."}
          </p>
          <Button
            variant="outline"
            className="w-full font-bold uppercase tracking-widest text-[10px] mt-2 gap-2"
            onClick={loadConversation}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] border rounded-xl overflow-hidden bg-background">
      <ChatContainer
        conversation={conversation}
        currentUserId={currentUserId}
        currentUserProfile={currentUserProfile}
        compact
      />
    </div>
  )
}
