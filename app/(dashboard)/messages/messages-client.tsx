"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChatContainer } from "@/components/chat/chat-container"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import {
  getConversations,
  getPodMembersForChat,
  getOrCreateDM,
  getOrCreateProjectConversation,
  getUserProjectConversations,
  type Conversation,
} from "@/lib/chat/actions"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Search, UserPlus, Loader2, Folder } from "lucide-react"

interface MessagesClientProps {
  conversations: Conversation[]
  currentUserId: string
  currentUserProfile: {
    full_name: string
    avatar_url: string | null
  }
  podIds: string[]
}

interface PodMember {
  user_id: string
  role: string
  user: {
    id: string
    full_name: string
    avatar_url: string | null
    username: string | null
  }
}

interface ProjectChat {
  id: string
  project_id: string
  name: string | null
  pod_id: string | null
  project: {
    id: string
    title: string
    pod_id: string
  } | null
}

export function MessagesClient({
  conversations: initialConversations,
  currentUserId,
  currentUserProfile,
  podIds,
}: MessagesClientProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [podMembers, setPodMembers] = useState<PodMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [startingChat, setStartingChat] = useState<string | null>(null)
  const [projectChats, setProjectChats] = useState<ProjectChat[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const supabase = createClient()
  const typingUsersRef = useRef<Record<string, string[]>>({})

  const loadConversations = useCallback(async () => {
    const result = await getConversations()
    if (!result.error) {
      setConversations(result.conversations)
    }
  }, [])

  const loadProjectChats = useCallback(async () => {
    setLoadingProjects(true)
    const result = await getUserProjectConversations()
    if (!result.error) {
      setProjectChats(result.projects as ProjectChat[])
    }
    setLoadingProjects(false)
  }, [])

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true)
    const allMembers: PodMember[] = []
    const seenIds = new Set<string>()

    for (const podId of podIds) {
      const result = await getPodMembersForChat(podId)
      if (!result.error && result.members) {
        for (const member of result.members) {
          if (!seenIds.has(member.user_id)) {
            seenIds.add(member.user_id)
            allMembers.push(member as unknown as PodMember)
          }
        }
      }
    }

    setPodMembers(allMembers)
    setLoadingMembers(false)
  }, [podIds])

  useEffect(() => {
    if (newChatOpen && podIds.length > 0) {
      loadMembers()
      loadProjectChats()
    }
  }, [newChatOpen, podIds, loadMembers, loadProjectChats])

  // Real-time subscription for new messages and typing indicators
  useEffect(() => {
    // Listen for new messages in any conversation
    const messagesChannel = supabase
      .channel("messages-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          const newMsg = payload.new as { conversation_id: string; user_id: string }
          // Only update if it's not our own message
          if (newMsg.user_id !== currentUserId) {
            // Refresh conversations to update unread counts
            await loadConversations()
          }
        }
      )
      .subscribe()

    // Presence channel for typing indicators
    const presenceChannel = supabase.channel("messages-presence", {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState()
        // Store typing users per conversation
        const typing: Record<string, string[]> = {}
        for (const [userId, presences] of Object.entries(state)) {
          if (userId === currentUserId) continue
          for (const presence of presences as { typing?: boolean; conversation_id?: string }[]) {
            if (presence?.typing && presence.conversation_id) {
              if (!typing[presence.conversation_id]) {
                typing[presence.conversation_id] = []
              }
              typing[presence.conversation_id].push(userId)
            }
          }
        }
        typingUsersRef.current = typing
        // Force re-render by updating a state
        setConversations((prev) => [...prev])
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            typing: false,
            conversation_id: null,
          })
        }
      })

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [currentUserId, loadConversations, supabase])

  const handleStartDM = async (userId: string) => {
    setStartingChat(userId)
    const result = await getOrCreateDM(userId)
    if (result.conversationId) {
      setNewChatOpen(false)
      const refreshed = await getConversations()
      if (!refreshed.error) {
        setConversations(refreshed.conversations)
        const newConvo = refreshed.conversations.find(
          (c) => c.id === result.conversationId
        )
        if (newConvo) {
          setActiveConversation(newConvo)
        }
      }
    }
    setStartingChat(null)
  }

  const handleOpenProjectChat = async (projectChat: ProjectChat) => {
    setStartingChat(projectChat.id)
    const result = await getOrCreateProjectConversation(projectChat.project_id)
    if (result.conversation) {
      setNewChatOpen(false)
      const refreshed = await getConversations()
      if (!refreshed.error) {
        setConversations(refreshed.conversations)
        const newConvo = refreshed.conversations.find(
          (c) => c.project_id === projectChat.project_id
        )
        if (newConvo) {
          setActiveConversation(newConvo)
        }
      }
    }
    setStartingChat(null)
  }

  const filteredMembers = podMembers.filter((m) =>
    m.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get typing users for a conversation
  const getTypingUsers = (convoId: string) => {
    return typingUsersRef.current[convoId] || []
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 shrink-0 hidden md:flex">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelectConversation={setActiveConversation}
          onCreateConversation={() => setNewChatOpen(true)}
          getTypingUsers={getTypingUsers}
        />
      </div>

      {/* Active chat or empty state */}
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
            <div className="text-center space-y-4 max-w-sm">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 flex items-center justify-center mx-auto shadow-xl">
                <MessageSquare className="h-10 w-10 text-violet-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Your Messages</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Send private messages to your pod members. Start a
                  conversation or select an existing one.
                </p>
              </div>
              <Button
                onClick={() => setNewChatOpen(true)}
                className="rounded-full px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Start a DM or open a project chat
            </DialogDescription>
          </DialogHeader>

          {/* Project Chats Section */}
          {!loadingProjects && projectChats.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Project Chats
              </p>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {projectChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleOpenProjectChat(chat)}
                    disabled={startingChat === chat.id}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Folder className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {chat.project?.title || chat.name || "Project Chat"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Project Chat
                      </p>
                    </div>
                    {startingChat === chat.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loadingProjects && projectChats.length === 0 && (
            <div className="flex items-center justify-center py-4 mb-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading projects...</span>
            </div>
          )}

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members to DM..."
              className="pl-9 rounded-xl"
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto">
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No members found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMembers.map((member) => (
                  <button
                    key={member.user_id}
                    onClick={() => handleStartDM(member.user_id)}
                    disabled={startingChat === member.user_id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
                        {member.user.full_name
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {member.user.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{member.user.username || "no-username"}
                      </p>
                    </div>
                    {startingChat === member.user_id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}