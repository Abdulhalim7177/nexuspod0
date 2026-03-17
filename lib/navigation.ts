"use client";

import {
    LayoutDashboard,
    CheckSquare,
    FolderKanban,
    Boxes,
    MessageCircle,
    Bell,
    Lightbulb,
    Trophy,
    UserCircle,
    Settings,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
    {
        label: "Main",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "My Tasks", href: "/tasks", icon: CheckSquare },
        ],
    },
    {
        label: "Workspace",
        items: [
            { title: "My Pods", href: "/pods", icon: Boxes },
            { title: "Projects", href: "/projects", icon: FolderKanban },
        ],
    },
    {
        label: "Communication",
        items: [
            { title: "Messages", href: "/messages", icon: MessageCircle },
            { title: "Notifications", href: "/notifications", icon: Bell },
        ],
    },
    {
        label: "Discover",
        items: [
            { title: "Opportunities", href: "/opportunities", icon: Lightbulb },
            { title: "Leaderboard", href: "/leaderboard", icon: Trophy },
        ],
    },
    {
        label: "Account",
        items: [
            { title: "Profile", href: "/profile", icon: UserCircle },
            { title: "Settings", href: "/settings", icon: Settings },
        ],
    },
];
