import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ podId: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

  if (!member || member.role !== "FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const { title, summary } = body

  const { error } = await supabase
    .from("pods")
    .update({ title, summary })
    .eq("id", podId)

  if (error) {
    return NextResponse.json({ error: "Failed to update pod" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { podId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { data: pod } = await supabase
    .from("pods")
    .select("founder_id")
    .eq("id", podId)
    .single()

  if (!pod || pod.founder_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { error } = await supabase
    .from("pods")
    .delete()
    .eq("id", podId)

  if (error) {
    return NextResponse.json({ error: "Failed to delete pod" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
