import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ podId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { podId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { data: member } = await supabase
    .from("pod_members")
    .select("role")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single()

  if (!member || !["FOUNDER", "POD_MANAGER"].includes(member.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: invitation, error } = await supabase
    .from("pod_invitations")
    .insert({
      pod_id: podId,
      max_uses: 10,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 })
  }

  return NextResponse.json({ code: invitation.code })
}
