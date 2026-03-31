import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Boxes, Plus, ArrowRight, KeyRound } from "lucide-react"

export const metadata = {
    title: "Dashboard | Nexus Pod",
}

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: podMembership } = await supabase
        .from("pod_members")
        .select("pod_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

    if (!podMembership) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="max-w-md w-full text-center space-y-8">
                    <div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <Boxes className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Welcome to Nexus Pod</h1>
                        <p className="text-muted-foreground mt-2">
                            You need to join or create a pod to get started
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/pods/new"
                            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all text-lg font-semibold"
                        >
                            <Plus className="h-5 w-5" />
                            Create a New Pod
                        </Link>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <form action="/pods/join" method="GET" className="space-y-2">
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="Enter invitation code"
                                    className="w-full pl-10 pr-4 py-4 rounded-xl border bg-background"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 w-full px-6 py-4 border-2 border-dashed rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-lg font-semibold"
                            >
                                Join with Code
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Create a pod to start building with your team, or ask for an invitation code to join an existing pod.
                    </p>
                </div>
            </div>
        )
    }

    redirect(`/pods/${podMembership.pod_id}`)
}
