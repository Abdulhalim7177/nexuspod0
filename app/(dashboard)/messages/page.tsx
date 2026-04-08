import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getConversations } from "@/lib/chat/actions"
import { MessagesClient } from "./messages-client"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

async function MessagesContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { conversations } = await getConversations()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single()

  // Get all pod members for starting new DMs
  const { data: podMemberships } = await supabase
    .from("pod_members")
    .select("pod_id")
    .eq("user_id", user.id)

  const podIds = podMemberships?.map((m) => m.pod_id) || []

  return (
    <MessagesClient
      conversations={conversations}
      currentUserId={user.id}
      currentUserProfile={{
        full_name: profile?.full_name || "",
        avatar_url: profile?.avatar_url || null,
      }}
      podIds={podIds}
    />
  )
}

export default function MessagesPage() {
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
        <MessagesContent />
      </Suspense>
    </div>
  )
}
