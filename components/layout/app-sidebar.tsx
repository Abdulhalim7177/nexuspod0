"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Sparkles,
    LogOut,
    ChevronsUpDown,
    ChevronDown,
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
import { unifiedNavigationConfig, noPodNavigationConfig, type NavItem, type NavGroup } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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
    mobileOpen?: boolean;
    onMobileOpenChange?: (open: boolean) => void;
}

export function AppSidebar({
    collapsed,
    onToggle,
    className,
    hideToggle,
    fixed = true,
    onNavigate,
    mobileOpen,
    onMobileOpenChange,
}: AppSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [pods, setPods] = useState<{id: string; title: string; npn: string}[]>([]);
    const [selectedPod, setSelectedPod] = useState<{id: string; title: string; npn: string} | null>(null);
    const [loading, setLoading] = useState(true);
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [taskCount, setTaskCount] = useState(0);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = (label: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(label)) {
                next.delete(label);
            } else {
                next.add(label);
            }
            return next;
        });
    };

    // Extract podId from URL if present
    const podIdMatch = pathname.match(/\/pods\/([^\/]+)/);
    const currentPodId = podIdMatch ? podIdMatch[1] : null;

    useEffect(() => {
        const supabase = createClient();
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, avatar_url")
                    .eq("id", authUser.id)
                    .maybeSingle();

                const { data: podMemberships } = await supabase
                    .from("pod_members")
                    .select("pod_id, pods!inner(id, title, npn)")
                    .eq("user_id", authUser.id);

                setUser({
                    email: authUser.email || "",
                    full_name: profile?.full_name || "",
                    avatar_url: profile?.avatar_url || "",
                });

                if (podMemberships && podMemberships.length > 0) {
                    const podsData = podMemberships.map((m: any) => Array.isArray(m.pods) ? m.pods[0] : m.pods).filter(Boolean);
                    setPods(podsData);
                    
                    // Set selected pod based on current URL or first available
                    if (currentPodId) {
                        const current = podsData.find(p => p.id === currentPodId);
                        if (current) setSelectedPod(current);
                    } else if (podsData.length > 0) {
                        setSelectedPod(podsData[0]);
                    }
                }

                // Fetch assigned task count (excluding DONE and APPROVED)
                const { count } = await supabase
                    .from("task_assignees")
                    .select("task_id, tasks!inner(id, status)", { count: "exact", head: true })
                    .eq("user_id", authUser.id)
                    .not("tasks.status", "in", '("DONE","APPROVED")');
                setTaskCount(count || 0);
            }
            setLoading(false);
        };
        fetchUser();
    }, [currentPodId]);

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

    if (loading) {
        const skeletonContent = (
            <>
                <div className="flex h-14 shrink-0 items-center border-b border-border/30 px-2">
                    <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                </div>
                <div className="flex-1 p-2 space-y-2">
                    <div className="h-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 bg-muted rounded animate-pulse" />
                </div>
            </>
        );

        return (
            <>
                <aside
                    className={cn(
                        "flex h-svh flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm transition-all duration-200",
                        fixed ? "fixed left-0 top-0 z-50 hidden md:flex" : "relative z-50 hidden md:flex",
                    collapsed ? "w-16" : "w-56",
                        className
                    )}
                >
                    {skeletonContent}
                </aside>
                {mobileOpen !== undefined && onMobileOpenChange && (
                    <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
                        <SheetContent side="left" className="p-0 md:hidden">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation Menu</SheetTitle>
                                <SheetDescription>Access your workspace navigation</SheetDescription>
                            </SheetHeader>
                            <div className="flex h-svh w-full flex-col border-r-0 bg-background">
                                {skeletonContent}
                            </div>
                        </SheetContent>
                    </Sheet>
                )}
            </>
        )
    }

    const hasPods = pods.length > 0
    
    // Use unified config when user has pods, noPod config otherwise
    let activeConfig: NavGroup[] = noPodNavigationConfig;
    if (hasPods) {
        // Use currentPodId from URL, fall back to selectedPod
        const podIdForNav = currentPodId || selectedPod?.id || '';
        activeConfig = unifiedNavigationConfig.map(group => ({
            ...group,
            items: group.items.map(item => ({
                ...item,
                href: item.href.replace('[podId]', podIdForNav),
                // Inject live task count badge on "My Tasks"
                badge: item.title === "My Tasks" && taskCount > 0 ? taskCount : item.badge,
            }))
        }));
    }

    const sidebarContent = (
        <>
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/30 px-2">
                {!collapsed && (
                    <Link href="/pods" className="flex items-center gap-2 ml-1">
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
                    <Link href="/pods" className="mx-auto">
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
            {!collapsed && hasPods && (
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
                                    onClick={() => {
                                        setSelectedPod(pod);
                                        router.push(`/pods/${pod.id}`);
                                    }}
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
                {activeConfig.map((group) => {
                    const isGroupCollapsed = collapsedGroups.has(group.label);
                    return (
                        <div key={group.label} className="pb-1">
                            {!collapsed && (
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase px-3 py-1.5 rounded-md hover:bg-muted/50 hover:text-muted-foreground transition-colors"
                                >
                                    <span>{group.label}</span>
                                    <ChevronDown
                                        className={`h-3 w-3 transition-transform duration-200 ${
                                            isGroupCollapsed ? "-rotate-90" : ""
                                        }`}
                                    />
                                </button>
                            )}
                            <div
                                className={`space-y-0.5 overflow-hidden transition-all duration-200 ${
                                    collapsed || !isGroupCollapsed
                                        ? "max-h-[1000px] opacity-100 mt-0.5"
                                        : "max-h-0 opacity-0"
                                }`}
                            >
                                {group.items.map((item) => (
                                    <NavLink 
                                        key={item.href} 
                                        item={item} 
                                        pathname={pathname} 
                                        collapsed={collapsed} 
                                        onNavigate={onNavigate}
                                        onAction={(action) => {
                                            if (action === "create-project") setCreateProjectOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Project Modal */}
            <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    {currentPodId && (
                        <CreateProjectForm 
                            podId={currentPodId} 
                            onSuccess={() => setCreateProjectOpen(false)} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Footer - User */}
            <div className="mt-auto shrink-0 border-t border-border/30 p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start h-auto p-2 rounded-xl hover:bg-accent/50 ${collapsed ? 'justify-center' : ''}`}
                        >
                            <Avatar className={`rounded-lg border-2 border-primary/20 ${collapsed ? 'h-8 w-8' : 'h-9 w-9'}`}>
                                <AvatarImage src={user?.avatar_url || undefined} alt={displayName} />
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
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "flex h-svh flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm transition-all duration-200",
                    fixed ? "fixed left-0 top-0 z-50 hidden md:flex" : "relative z-50 hidden md:flex",
                    collapsed ? "w-16" : "w-64",
                    className
                )}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            {mobileOpen !== undefined && onMobileOpenChange && (
                <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
                    <SheetContent side="left" className="p-0 md:hidden">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Navigation Menu</SheetTitle>
                            <SheetDescription>Access your workspace navigation</SheetDescription>
                        </SheetHeader>
                        <div className="flex h-svh w-full flex-col border-r-0 bg-background/95 backdrop-blur-sm">
                            {sidebarContent}
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </>
    );
}

function NavLink({
    item,
    pathname,
    collapsed,
    onNavigate,
    onAction,
}: {
    item: NavItem;
    pathname: string;
    collapsed: boolean;
    onNavigate?: () => void;
    onAction?: (action: string) => void;
}) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const isCreateAction = item.action === "create-project";

    const handleClick = (e: React.MouseEvent) => {
        if (isCreateAction && onAction) {
            e.preventDefault();
            onAction("create-project");
            if (onNavigate) onNavigate();
        } else if (onNavigate) {
            onNavigate();
        }
    };
    
    return (
        <Link
            href={isCreateAction ? "#" : item.href}
            onClick={handleClick}
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
