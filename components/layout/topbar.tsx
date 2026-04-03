"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { usePathname } from "next/navigation";
import { Bell, PanelLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const routeTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/tasks": "My Tasks",
    "/pods": "My Pods",
    "/projects": "Projects",
    "/messages": "Messages",
    "/notifications": "Notifications",
    "/opportunities": "Opportunities",
    "/leaderboard": "Leaderboard",
    "/profile": "Profile Settings",
    "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
    // Exact match first
    if (routeTitles[pathname]) return routeTitles[pathname];

    // Check parent routes
    for (const [route, title] of Object.entries(routeTitles)) {
        if (pathname.startsWith(route + "/")) return title;
    }

    return "Workspace";
}

export function Topbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
    const pathname = usePathname();
    const title = getPageTitle(pathname);

    return (
        <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center gap-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <div className="flex items-center gap-3">
                {onOpenSidebar && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={onOpenSidebar}
                    >
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>
                )}
                <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
                {/* Global Search Placeholder (Interactive look) */}
                <div className="hidden md:flex relative max-w-sm mr-2 group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <div className="h-9 w-64 rounded-md border border-input/50 bg-muted/20 px-3 py-1 text-sm shadow-sm transition-colors flex items-center pl-9 text-muted-foreground cursor-pointer hover:border-border hover:bg-accent/50">
                        Search...
                        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>

                <NotificationBell />

                <div className="h-5 w-px bg-border/60 mx-1" />

                <ThemeSwitcher />
            </div>
        </header>
    );
}
