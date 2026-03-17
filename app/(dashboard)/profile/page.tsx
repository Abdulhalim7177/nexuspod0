import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"
import { Suspense } from "react"

export const metadata = {
    title: "Profile Settings | Nexus Pod",
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20">Loading profile...</div>}>
            <ProfileContent />
        </Suspense>
    )
}

async function ProfileContent() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    if (!profile) {
        // Basic fallback if trigger failed or migration not run
        return (
            <div className="max-w-4xl mx-auto py-8 text-center text-muted-foreground">
                Profile not found. Please ensure database migrations have been applied.
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your public profile, skills, and how others see you on Nexus Pod.
                </p>
            </div>

            <ProfileForm initialData={profile} email={user.email || ""} />
        </div>
    )
}
