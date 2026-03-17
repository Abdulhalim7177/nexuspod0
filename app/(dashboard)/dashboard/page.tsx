import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, CheckSquare, Settings, Flame, LayoutDashboard, Bell, Activity, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

export const metadata = {
    title: "Dashboard | Nexus Pod",
}

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20">Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    )
}

async function DashboardContent() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

    const displayName = profile?.full_name?.split(" ")[0] || "Builder"

    return (
        <div className="flex-1 space-y-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent p-8 border border-border/50">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            {getGreeting()}, <span className="text-primary">{displayName}</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Ready to build? You have 0 active tasks and 0 unread messages across your Pods.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20" asChild>
                            <Link href="/pods/new">
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Create New Pod
                            </Link>
                        </Button>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-3xl rounded-full mix-blend-screen opacity-50" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-border/50 hover:border-primary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Pods</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Active workspaces</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-border/50 hover:border-blue-500/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending verification</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-border/50 hover:border-orange-500/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Momentum</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Build streak: 0 days</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-border/50 hover:border-green-500/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Network</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Pod members & contacts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                {/* Left Column: Activity Feed */}
                <Card className="glass-card border-border/50 lg:col-span-2 flex flex-col min-h-[400px]">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Recent Activity</CardTitle>
                                <CardDescription>Latest updates from your Pods and team.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/activity">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Activity className="h-8 w-8 opacity-50" />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-1">No activity yet</h3>
                        <p className="text-sm max-w-sm mb-6">
                            When you or your team members create tasks, upload files, or reach milestones, they will appear here.
                        </p>
                        <Button variant="outline" asChild>
                            <Link href="/pods">Explore Pods</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Column: Quick Actions & Up Next */}
                <div className="space-y-8">
                    <Card className="glass-card border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl group" asChild>
                                <Link href="/pods/new">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                        <PlusCircle className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm">Create Pod</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Start a new workspace</span>
                                    </div>
                                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </Button>

                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl group" asChild>
                                <Link href="/tasks">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                        <CheckSquare className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm">My Tasks</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">View your assignments</span>
                                    </div>
                                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </Button>

                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl group" asChild>
                                <Link href="/profile">
                                    <div className="w-8 h-8 rounded-lg bg-gray-500/10 text-gray-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                        <Settings className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm">Profile Settings</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Update your details</span>
                                    </div>
                                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Up Next</CardTitle>
                            <CardDescription>Your upcoming meetings and deadlines</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center py-6">
                            <p className="text-sm text-muted-foreground">Your schedule is clear.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
