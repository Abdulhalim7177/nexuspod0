"use client";

import {
    LayoutDashboard,
    CheckSquare,
    FolderKanban,
    Boxes,
    MessageCircle,
    Mail,
    Lightbulb,
    UserCircle,
    Settings,
    Users,
    FileText,
    Plus,
    Zap,
    Target,
    GitBranch,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
    items?: NavItem[];
    action?: string;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export const noPodNavigationConfig: NavGroup[] = [
    {
        label: "Account",
        items: [
            { title: "Profile", href: "/profile", icon: UserCircle },
            { title: "Settings", href: "/settings", icon: Settings },
        ],
    },
];

export const unifiedNavigationConfig: NavGroup[] = [
    {
        label: "Overview",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "My Tasks", href: "/tasks", icon: CheckSquare },
        ],
    },
    {
        label: "Workspace",
        items: [
            { title: "Pods", href: "/pods", icon: Boxes },
            { title: "All Projects", href: "/pods/[podId]/projects", icon: FolderKanban },
            { title: "Create Project", href: "#", icon: Plus, action: "create-project" },
        ],
    },
    {
        label: "Pod",
        items: [
            { title: "Overview", href: "/pods/[podId]", icon: LayoutDashboard },
            { title: "Momentum", href: "/pods/[podId]/momentum", icon: Zap },
            { title: "Members", href: "/pods/[podId]/members", icon: Users },
        ],
    },
    {
        label: "Collaboration",
        items: [
            { title: "Chat", href: "/pods/[podId]/chat", icon: MessageCircle },
            { title: "Messages", href: "/messages", icon: Mail },
            { title: "Notes", href: "/pods/[podId]/notes", icon: FileText },
            { title: "Opportunities", href: "/pods/[podId]/opportunities", icon: Lightbulb },
        ],
    },
    {
        label: "Insights",
        items: [
            { title: "Audit Logs", href: "/pods/[podId]/audit-logs", icon: Target },
        ],
    },
    {
        label: "Settings",
        items: [
            { title: "Pod Settings", href: "/pods/[podId]/settings", icon: Settings },
            { title: "Integrations", href: "/pods/[podId]/integrations", icon: GitBranch },
        ],
    },
];
