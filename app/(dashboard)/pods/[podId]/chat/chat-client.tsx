"use client"

import { useState, useEffect } from "react"
import { ChatContainer } from "@/components/chat/chat-container"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { getConversations, type Conversation } from "@/lib/chat/actions"
import { MessageSquare } from "lucide-react"

interface PodChatClientProps {
  conversation: Conversation
  currentUserId: string
  currentUserProfile: {
    full_name: string
    avatar_url: string | null
  }
}

export function PodChatClient({
  conversation,
  currentUserId,
  currentUserProfile,
}: PodChatClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState(conversation)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const result = await getConversations()
    if (!result.error) {
      setConversations(result.conversations)
    }
  }

  const handleSelectConversation = (convo: Conversation) => {
    setActiveConversation(convo)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar with all conversations */}
      <div className="w-80 shrink-0 hidden lg:flex">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversation.id}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Active chat */}
      <div className="flex-1 min-w-0">
        {activeConversation ? (
          <ChatContainer
            key={activeConversation.id}
            conversation={activeConversation}
            currentUserId={currentUserId}
            currentUserProfile={currentUserProfile}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="font-semibold">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
