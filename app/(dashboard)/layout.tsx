import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProfileCompletionCheck } from "@/components/profile-completion-check";
import { DashboardClient } from "./dashboard-client";

async function ProfileData() {
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

    return <ProfileCompletionCheck completion={completion} />;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Suspense fallback={null}>
                <ProfileData />
            </Suspense>
            <DashboardClient>{children}</DashboardClient>
        </>
    );
}
