import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ podId: string; memberId: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { podId, memberId } = await params
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

  if (!member || member.role !== "FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { error } = await supabase
    .from("pod_members")
    .delete()
    .eq("id", memberId)
    .eq("pod_id", podId)

  if (error) {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
