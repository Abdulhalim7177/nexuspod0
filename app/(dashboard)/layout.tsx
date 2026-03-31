import { Suspense } from "react";
import { Topbar } from "@/components/layout/topbar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/server";
import { ProfileCompletionCheck } from "@/components/profile-completion-check";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let completion = 0;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (profile) {
            const fields = [
                { value: profile.full_name, weight: 20 },
                { value: profile.username, weight: 20 },
                { value: profile.bio, weight: 20 },
                { value: profile.avatar_url, weight: 20 },
                { value: profile.skills && profile.skills.length > 0, weight: 10 },
                { value: profile.interests && profile.interests.length > 0, weight: 10 },
            ];

            completion = fields.reduce((acc, field) => {
                if (field.value) return acc + field.weight;
                return acc;
            }, 0);
        }
    }

    return (
        <>
            <ProfileCompletionCheck completion={completion} />
            <DashboardClient>{children}</DashboardClient>
        </>
    );
}
