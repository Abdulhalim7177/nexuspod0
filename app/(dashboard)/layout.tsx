import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-svh bg-background overflow-hidden relative">
                <Topbar />
                {/* Using an inner div with flex-1 prevents overlap and constrains max width beautifully */}
                <div className="flex-1 w-full mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px] flex flex-col pt-6">
                    <Suspense fallback={
                        <div className="flex-1 flex flex-col items-center justify-center h-full text-muted-foreground min-h-[50vh] animate-pulse">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                            <p className="text-sm">Loading workspace...</p>
                        </div>
                    }>
                        <DashboardLayoutContent>{children}</DashboardLayoutContent>
                    </Suspense>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

// Separate component for the authenticated parts
async function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    return <>{children}</>;
}
