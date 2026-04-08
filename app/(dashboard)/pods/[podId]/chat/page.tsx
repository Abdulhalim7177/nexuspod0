import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getOrCreatePodConversation } from "@/lib/chat/actions"
import { PodChatClient } from "./chat-client"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PodChatPageProps {
  params: Promise<{ podId: string }>
}

async function PodChatContent({ podId }: { podId: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Verify pod membership
  const { data: membership } = await supabase
    .from("pod_members")
    .select("role")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single()

  if (!membership) redirect("/pods")

  // Get or create conversation
  const { conversation, error } = await getOrCreatePodConversation(podId)

  if (error || !conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-bold">Chat not available</h2>
          <p className="text-sm text-muted-foreground">
            This pod&apos;s chat channel hasn&apos;t been initialized yet.
          </p>
        </div>
      </div>
    )
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single()

  return (
    <PodChatClient
      conversation={conversation}
      currentUserId={user.id}
      currentUserProfile={{
        full_name: profile?.full_name || "",
        avatar_url: profile?.avatar_url || null,
      }}
    />
  )
}

export default async function PodChatPage({ params }: PodChatPageProps) {
  const { podId } = await params

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Suspense
        fallback={
          <div className="h-full flex">
            <div className="w-80 border-r p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        }
      >
        <PodChatContent podId={podId} />
      </Suspense>
    </div>
  )
}
