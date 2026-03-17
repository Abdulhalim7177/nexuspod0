"use client";

import {
    LayoutDashboard,
    CheckSquare,
    FolderKanban,
    Boxes,
    MessageCircle,
    Lightbulb,
    Trophy,
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
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
    {
        label: "Overview",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "My Tasks", href: "/tasks", icon: CheckSquare, badge: 3 },
        ],
    },
    {
        label: "Workspace",
        items: [
            { 
                title: "My Pods", 
                href: "/pods", 
                icon: Boxes,
                items: [
                    { title: "All Pods", href: "/pods", icon: Boxes },
                    { title: "Create Pod", href: "/pods/new", icon: Plus },
                ]
            },
            { 
                title: "Projects", 
                href: "/projects", 
                icon: FolderKanban,
                items: [
                    { title: "All Projects", href: "/projects", icon: FolderKanban },
                    { title: "Create Project", href: "/projects/new", icon: Plus },
                ]
            },
        ],
    },
    {
        label: "Collaboration",
        items: [
            { title: "Messages", href: "/messages", icon: MessageCircle, badge: 5 },
        ],
    },
    {
        label: "Growth",
        items: [
            { title: "Opportunities", href: "/opportunities", icon: Lightbulb },
            { title: "Momentum", href: "/momentum", icon: Zap },
            { title: "Leaderboard", href: "/leaderboard", icon: Trophy },
            { title: "Audit Logs", href: "/audit-logs", icon: Target },
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

export const podNavigationConfig: NavGroup[] = [
    {
        label: "Pod",
        items: [
            { title: "Overview", href: "/pods/[podId]", icon: LayoutDashboard },
            { title: "Momentum", href: "/pods/[podId]/momentum", icon: Zap },
            { title: "Members", href: "/pods/[podId]/members", icon: Users },
        ],
    },
    {
        label: "Projects",
        items: [
            { title: "All Projects", href: "/pods/[podId]/projects", icon: FolderKanban },
            { title: "Create Project", href: "/pods/[podId]/projects/new", icon: Plus },
        ],
    },
    {
        label: "Collaboration",
        items: [
            { title: "Chat", href: "/pods/[podId]/chat", icon: MessageCircle },
            { title: "Notes", href: "/pods/[podId]/notes", icon: FileText },
        ],
    },
    {
        label: "Insights",
        items: [
            { title: "Opportunities", href: "/pods/[podId]/opportunities", icon: Lightbulb },
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
