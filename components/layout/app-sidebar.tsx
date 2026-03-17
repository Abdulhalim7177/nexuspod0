"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Sparkles,
    LogOut,
    ChevronsUpDown,
    Settings,
    User,
    Search,
    Plus,
    Boxes,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { navigationConfig, type NavItem } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface UserProfile {
    email: string;
    full_name: string;
    avatar_url: string;
}

interface AppSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    className?: string;
    hideToggle?: boolean;
    fixed?: boolean;
    onNavigate?: () => void;
}

export function AppSidebar({
    collapsed,
    onToggle,
    className,
    hideToggle,
    fixed = true,
    onNavigate,
}: AppSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [pods, setPods] = useState<{id: string; title: string; npn: string}[]>([]);
    const [selectedPod, setSelectedPod] = useState<{id: string; title: string; npn: string} | null>(null);

    useEffect(() => {
        const supabase = createClient();
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, avatar_url")
                    .eq("id", authUser.id)
                    .single();

                const { data: podMemberships } = await supabase
                    .from("pod_members")
                    .select("pod_id, pods!inner(id, title, npn)")
                    .eq("user_id", authUser.id)
                    .limit(5);

                setUser({
                    email: authUser.email || "",
                    full_name: profile?.full_name || "",
                    avatar_url: profile?.avatar_url || "",
                });

                if (podMemberships && podMemberships.length > 0) {
                    const podsData = podMemberships.map((m: any) => m.pods).filter(Boolean);
                    setPods(podsData);
                    if (podsData.length > 0) {
                        setSelectedPod(podsData[0]);
                    }
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <aside
            className={cn(
                "flex h-svh flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm transition-all duration-200",
                fixed ? "fixed left-0 top-0 z-50 hidden md:block" : "relative z-50",
                collapsed ? "w-16" : "w-64",
                className
            )}
        >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/30 px-2">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2 ml-1">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
                            <Sparkles className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left leading-tight">
                            <span className="font-bold text-sm tracking-tight">Nexus Pod</span>
                            <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                                Workspace
                            </span>
                        </div>
                    </Link>
                )}
                {collapsed && (
                    <Link href="/dashboard" className="mx-auto">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
                            <Sparkles className="size-4" />
                        </div>
                    </Link>
                )}
            </div>

            {/* Search - Hidden when collapsed */}
            {!collapsed && (
                <div className="shrink-0 p-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground/70" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="h-9 pl-9 pr-9 bg-muted/50 border-none rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-primary/50"
                        />
                    </div>
                </div>
            )}

            {/* Pod Selector - Hidden when collapsed */}
            {!collapsed && pods.length > 0 && (
                <div className="shrink-0 px-2 pb-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between h-9 px-3 text-sm font-medium bg-muted/30 hover:bg-muted/50 border-dashed rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <Boxes className="size-4 text-purple-500" />
                                    <span className="truncate">{selectedPod?.title || "Select Pod"}</span>
                                </div>
                                <ChevronsUpDown className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[220px]">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Your Pods</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {pods.map((pod) => (
                                <DropdownMenuItem 
                                    key={pod.id}
                                    onClick={() => setSelectedPod(pod)}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Boxes className="size-4 text-purple-500" />
                                    <div className="flex flex-col">
                                        <span>{pod.title}</span>
                                        <span className="text-xs text-muted-foreground">{pod.npn}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href="/pods/new" className="flex items-center gap-2">
                                    <Plus className="size-4" />
                                    Create New Pod
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Navigation */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                {navigationConfig.map((group) => (
                    <div key={group.label} className="pb-3">
                        <div className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase px-3 mb-1">
                            {!collapsed && group.label}
                        </div>
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavLink 
                                    key={item.href} 
                                    item={item} 
                                    pathname={pathname} 
                                    collapsed={collapsed} 
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer - User */}
            <div className="mt-auto shrink-0 border-t border-border/30 p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start h-auto p-2 rounded-xl hover:bg-accent/50 ${collapsed ? 'justify-center' : ''}`}
                        >
                            <Avatar className={`rounded-lg border-2 border-primary/20 ${collapsed ? 'h-8 w-8' : 'h-9 w-9'}`}>
                                <AvatarImage src={user?.avatar_url} alt={displayName} />
                                <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-sm font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{displayName}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[220px] rounded-xl border-border/50 shadow-xl"
                        side="bottom"
                        align="end"
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                                <Link href="/profile">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                                <Link href="/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 rounded-lg">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Toggle Button */}
            {!hideToggle && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className={cn(
                        "absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-accent",
                        collapsed ? "top-6" : ""
                    )}
                >
                    {collapsed ? (
                        <PanelLeft className="h-3 w-3" />
                    ) : (
                        <PanelLeftClose className="h-3 w-3" />
                    )}
                </Button>
            )}
        </aside>
    );
}

function NavLink({
    item,
    pathname,
    collapsed,
    onNavigate,
}: {
    item: NavItem;
    pathname: string;
    collapsed: boolean;
    onNavigate?: () => void;
}) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    
    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg h-11 font-medium transition-all duration-200 ${
                collapsed ? 'justify-center px-0' : 'px-3'
            } ${
                isActive
                    ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
            title={collapsed ? item.title : undefined}
        >
            <item.icon className={`size-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
            {!collapsed && (
                <>
                    <span className="text-sm flex-1">{item.title}</span>
                    {item.badge && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">
                            {item.badge}
                        </Badge>
                    )}
                </>
            )}
        </Link>
    );
}
