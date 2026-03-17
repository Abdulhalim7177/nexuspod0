"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LogOut, ChevronsUpDown, Settings, User } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
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
import { navigationConfig } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface UserProfile {
    email: string;
    full_name: string;
    avatar_url: string;
}

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);

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

                setUser({
                    email: authUser.email || "",
                    full_name: profile?.full_name || "",
                    avatar_url: profile?.avatar_url || "",
                });
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
        <Sidebar collapsible="icon" className="border-r border-border/40 shrink-0">
            {/* Header — Logo & Brand */}
            <SidebarHeader className="border-b border-border/40 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-accent/50 rounded-xl transition-colors">
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white shadow-sm shadow-primary/20">
                                    <Sparkles className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-bold text-base tracking-tight">Nexus Pod</span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Workspace
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content — Navigation Groups */}
            <SidebarContent className="px-2 pt-4">
                {navigationConfig.map((group) => (
                    <SidebarGroup key={group.label} className="pb-4">
                        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 tracking-tight uppercase px-3">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent className="pt-2">
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive =
                                        pathname === item.href ||
                                        pathname.startsWith(item.href + "/");
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className={`rounded-lg h-9 font-medium transition-all ${isActive
                                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    }`}
                                            >
                                                <Link href={item.href} className="flex items-center gap-3 px-3">
                                                    <item.icon className={`size-4 ${isActive ? "text-primary" : "opacity-70"}`} />
                                                    <span className="text-sm">{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* Footer — User Account */}
            <SidebarFooter className="border-t border-border/40 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent rounded-xl hover:bg-accent/50 transition-colors"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg border border-border/50">
                                        <AvatarImage src={user?.avatar_url} alt={displayName} />
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                                        <span className="truncate font-semibold">{displayName}</span>
                                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-border/50 shadow-xl"
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
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
