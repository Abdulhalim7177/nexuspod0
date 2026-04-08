import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Boxes, Users, FolderKanban, MessageCircle, Calendar, Settings, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { ProjectList } from "@/components/projects/project-list"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PodPageProps {
  params: Promise<{ podId: string }>
}

async function PodContent({ params }: { params: Promise<{ podId: string }> }) {
  const { podId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 1. Get the pod details
  const { data: pod } = await supabase
    .from("pods")
    .select("*")
    .eq("id", podId)
    .single()

  if (!pod) {
    notFound()
  }

  // 2. Get my membership status
  const { data: myMember } = await supabase
    .from("pod_members")
    .select("role")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single()

  if (!myMember) {
    redirect("/pods")
  }

  // 3. Get projects
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      members_count:project_members(count)
    `)
    .eq("pod_id", podId)
    .order("created_at", { ascending: false })
    .limit(6)

  // 4. Get total projects count
  const { count: totalProjects } = await supabase
    .from("projects")
    .select("*", { count: 'exact', head: true })
    .eq("pod_id", podId)

  // 5. Get members with profiles
  const { data: membersWithProfiles } = await supabase
    .from("pod_members")
    .select(`
      *,
      user:profiles (
        full_name,
        avatar_url,
        username
      )
    `)
    .eq("pod_id", podId)
    .order("joined_at", { ascending: false })

  const canCreate = ["FOUNDER", "POD_MANAGER", "TEAM_LEAD"].includes(myMember.role)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border shadow-sm">
            {pod.avatar_url ? (
              <img src={pod.avatar_url} alt={pod.title} className="h-full w-full object-cover" />
            ) : (
              <Boxes className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{pod.title}</h1>
              <Badge variant="outline" className="font-mono bg-background shadow-sm border-primary/20 text-primary">
                {pod.npn}
              </Badge>
            </div>
            {pod.summary && (
              <p className="text-muted-foreground mt-1 max-w-2xl">{pod.summary}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href={`/pods/${podId}/settings`}>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Link
          href={`/pods/${podId}/members`}
          className="group p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{membersWithProfiles?.length || 0}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Members</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/pods/${podId}/projects`}
          className="group p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderKanban className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProjects || 0}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Projects</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/pods/${podId}/chat`}
          className="group p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Chat</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Collaboration</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/pods/${podId}/momentum`}
          className="group p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Momentum</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Active Projects</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/pods/${podId}/projects`}>View All <FolderKanban className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <ProjectList podId={podId} projects={projects || []} canCreate={canCreate} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your pod projects and members.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4 opacity-10" />
            <p className="text-sm">No activity records found for this pod yet.</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Members</CardTitle>
            </CardHeader>
            <CardContent>
              {membersWithProfiles && membersWithProfiles.length > 0 ? (
                <div className="space-y-4">
                  {membersWithProfiles.slice(0, 5).map((member: { id: string, role: string, user: { avatar_url?: string, full_name?: string } }) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border shadow-sm">
                        {member.user?.avatar_url && (
                          <AvatarImage src={member.user.avatar_url} alt={member.user.full_name || 'User'} />
                        )}
                        <AvatarFallback className="text-[10px] bg-primary/5 font-bold">
                          {member.user?.full_name?.substring(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-none truncate">
                          {member.user?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 capitalize font-medium">
                          {member.role.replace('_', ' ').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {membersWithProfiles.length > 5 && (
                    <Button variant="link" size="sm" className="px-0 h-auto text-xs text-primary font-bold" asChild>
                      <Link href={`/pods/${podId}/members`}>
                        View all {membersWithProfiles.length} members →
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No members found</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Pod Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Established</span>
                <span className="font-bold">{new Date(pod.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Current Role</span>
                <Badge variant="secondary" className="h-5 px-1.5 capitalize bg-background border-primary/20 text-[10px] font-bold">
                  {myMember.role.replace('_', ' ').toLowerCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PodOverviewPage({ params }: PodPageProps) {
  return (
    <Suspense fallback={<div className="p-8 space-y-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>}>
      <PodContent params={params} />
    </Suspense>
  )
}
