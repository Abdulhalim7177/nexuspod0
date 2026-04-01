import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { 
  FolderKanban, 
  Lock, 
  Globe, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Settings,
  ArrowRight,
  ShieldAlert,
  Users2,
  BarChart3,
  Target,
  TrendingUp,
  AlertCircle,
  Zap,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { getProject, getProjectRequests, requestToJoinProject } from "@/lib/projects/actions"
import { getProjectTasks } from "@/lib/tasks/actions"
import { TaskBoard } from "@/components/tasks/task-board"
import { ProjectSettings } from "@/components/projects/project-settings"
import { ProjectHistory } from "@/components/projects/project-history"
import { ProjectInviteButton } from "@/components/projects/project-invite-button"
import { ProjectRequestsList } from "@/components/projects/project-requests-list"
import { ProjectMemberManager } from "@/components/projects/project-member-manager"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProjectPageProps {
  params: Promise<{
    podId: string
    projectId: string
  }>
}

async function ProjectContent({ podId, projectId }: { podId: string, projectId: string }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const project = await getProject(projectId)
  if (!project || project.pod_id !== podId) notFound()

  // 1. Get Pod Members for Context
  const { data: rawPodMembers } = await supabase
    .from("pod_members")
    .select("user_id, role")
    .eq("pod_id", podId)

  const podUserIds = rawPodMembers?.map(m => m.user_id) || []
  const { data: podProfiles } = podUserIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, avatar_url, username").in("id", podUserIds)
    : { data: [] as any[] }

  const podMembers = (rawPodMembers || []).map(m => ({
    user_id: m.user_id,
    role: m.role,
    user: podProfiles?.find(p => p.id === m.user_id) || { id: m.user_id, full_name: "Unknown", avatar_url: null, username: "unknown" }
  }))

  const myPodMember = podMembers?.find((m: any) => m.user_id === user.id)
  const isProjectMember = project.members?.some((m: any) => m.user.id === user.id)
  
  // 2. Permission logic
  const isProjectCreator = project.created_by === user.id
  const isAdmin = ["FOUNDER", "POD_MANAGER"].includes(myPodMember?.role || "") || isProjectCreator
  const canManageTasks = ["FOUNDER", "POD_MANAGER", "TEAM_LEAD"].includes(myPodMember?.role || "") || isProjectCreator
  const isPublicProject = !project.is_private

  // 3. Handle Restricted Access: Only for PRIVATE projects when user is NOT a member AND NOT an admin
  // Public projects are accessible to all pod members
  if (!isPublicProject && !isProjectMember && !isAdmin) {
    // Check if there's a pending request
    const { data: pendingRequest } = await supabase
      .from("project_requests")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .eq("status", "PENDING")
      .single()

    async function handleJoinRequest() {
      "use server"
      await requestToJoinProject(podId, projectId)
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="h-24 w-24 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-2xl shadow-yellow-500/10">
          <ShieldAlert className="h-10 w-10 text-yellow-600" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Only project members can access this area. You are a member of the pod, but you need to join this specific project to view tasks and collaborate.
          </p>
        </div>
        {pendingRequest ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 font-bold uppercase tracking-widest text-[10px]">
            <Clock className="h-3.5 w-3.5" /> Request Pending Approval
          </div>
        ) : (
          <form action={handleJoinRequest}>
            <Button size="lg" className="rounded-full px-8 font-bold shadow-xl shadow-primary/20 gap-2">
              Request to Join Project <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    )
  }

  // 4. Authorized Access - Get data
  const tasks = await getProjectTasks(projectId)
  const pendingRequests = isAdmin ? await getProjectRequests(projectId) : []
  const doneTasks = tasks.filter(t => t.status === 'APPROVED' || t.status === 'DONE').length

  // Fetch audit logs for history
  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select(`
      *,
      user:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border shadow-sm">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
              {project.is_private ? (
                <Badge variant="secondary" className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px] font-bold">
                  <Lock className="h-3 w-3" /> PRIVATE
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-bold">
                  <Globe className="h-3.5 w-3.5" /> PUBLIC
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs mt-1 font-medium">{project.pod.title} <span className="mx-1 opacity-30">/</span> {project.pod.npn}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest mr-2">
              Admin Mode
            </div>
          )}
          {isAdmin && (
            <ProjectInviteButton 
              podId={podId} 
              projectId={projectId} 
              projectTitle={project.title} 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="tasks" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <TabsList className="bg-muted/50 p-1 self-start overflow-x-auto max-w-full flex-nowrap">
                <TabsTrigger value="tasks" className="gap-1 text-[8px] sm:text-xs font-bold uppercase tracking-wider data-[state=active]:shadow-sm whitespace-nowrap px-2 sm:px-3">
                  <ListTodo className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Board
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-1 text-[8px] sm:text-xs font-bold uppercase tracking-wider data-[state=active]:shadow-sm whitespace-nowrap px-2 sm:px-3">
                  <Users2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Team
                </TabsTrigger>
                <TabsTrigger value="overview" className="gap-1 text-[8px] sm:text-xs font-bold uppercase tracking-wider data-[state=active]:shadow-sm whitespace-nowrap px-2 sm:px-3">
                  <LayoutDashboard className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Brief
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1 text-[8px] sm:text-xs font-bold uppercase tracking-wider data-[state=active]:shadow-sm whitespace-nowrap px-2 sm:px-3">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> History
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="settings" className="gap-1 text-[8px] sm:text-xs font-bold uppercase tracking-wider data-[state=active]:shadow-sm text-orange-600 data-[state=active]:text-orange-600 whitespace-nowrap px-2 sm:px-3">
                    <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Settings
                  </TabsTrigger>
                )}
                <TabsTrigger value="chat" className="gap-1 text-[8px] sm:text-xs font-bold uppercase tracking-wider data-[state=active]:shadow-sm whitespace-nowrap px-2 sm:px-3">
                  <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Chat
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-xs font-bold">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted/30 border border-dashed">
                   <span className="text-muted-foreground">PROG</span>
                   <span className="text-primary">{tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0}%</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                  <span className="text-green-500">{doneTasks}</span>
                  <span>/</span>
                  <span>{tasks.length} DONE</span>
                </div>
              </div>
            </div>

            <TabsContent value="tasks" className="mt-0">
              <TaskBoard 
                projectId={projectId} 
                podId={podId} 
                initialTasks={tasks} 
                canManage={canManageTasks}
                isProjectManager={isAdmin}
                members={podMembers || []}
                currentUserId={user.id}
              />
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <ProjectMemberManager 
                project={project}
                podId={podId}
                podMembers={podMembers || []}
                isAdmin={isAdmin}
                currentUserId={user.id}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <ProjectHistory logs={auditLogs || []} />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="settings" className="mt-0">
                <ProjectSettings 
                  project={project} 
                  podId={podId} 
                  podMembers={podMembers || []} 
                />
              </TabsContent>
            )}

            <TabsContent value="overview" className="space-y-6 mt-0">
              {/* Project Description */}
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="pb-3 border-b border-dashed mb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Project Brief
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {project.description || "No description provided for this project."}
                  </p>
                </CardContent>
              </Card>

              {/* Progress Overview */}
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="pb-3 border-b border-dashed mb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary">
                      {tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0}%
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {doneTasks} of {tasks.length} tasks completed
                    </span>
                  </div>
                  <Progress 
                    value={tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0} 
                    className="h-2.5"
                  />
                </CardContent>
              </Card>

              {/* Task Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-primary/10 shadow-sm">
                  <CardContent className="pt-4 pb-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total</span>
                    </div>
                    <span className="text-2xl font-bold">{tasks.length}</span>
                  </CardContent>
                </Card>
                <Card className="border-green-500/10 shadow-sm">
                  <CardContent className="pt-4 pb-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-green-600">Done</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{doneTasks}</span>
                  </CardContent>
                </Card>
                <Card className="border-blue-500/10 shadow-sm">
                  <CardContent className="pt-4 pb-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Active</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length}
                    </span>
                  </CardContent>
                </Card>
                <Card className="border-orange-500/10 shadow-sm">
                  <CardContent className="pt-4 pb-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600">Pending</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {tasks.filter(t => t.status === 'PENDING' || t.status === 'TODO').length}
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Project Details */}
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="pb-3 border-b border-dashed mb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                      <div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-bold">
                          ACTIVE
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visibility</span>
                      <div>
                        {project.is_private ? (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px] font-bold gap-1">
                            <Lock className="h-2.5 w-2.5" /> Private
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-bold gap-1">
                            <Globe className="h-2.5 w-2.5" /> Public
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Team Size</span>
                      <p className="font-bold flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" /> {project.members?.length || 0} Members
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Created</span>
                      <p className="font-bold flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" /> {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project Lead</span>
                      <p className="font-bold">
                        {podMembers?.find(m => m.user_id === project.created_by)?.user?.full_name || "Nexus Lead"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pod</span>
                      <p className="font-bold">{project.pod?.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <div className="h-[600px] border border-dashed rounded-xl flex flex-col items-center justify-center bg-muted/10">
                <div className="text-center p-8 border rounded-2xl bg-background shadow-xl border-primary/10 max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Project Comm-Link</h3>
                  <Button variant="outline" className="w-full font-bold uppercase tracking-widest text-[10px] mt-4">
                    Initialize Channel
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Context Sidebar */}
        <div className="space-y-6">
          {isAdmin && pendingRequests.length > 0 && (
            <ProjectRequestsList requests={pendingRequests} podId={podId} projectId={projectId} />
          )}

          <Card className="border-primary/10 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" /> STATUS
                </span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-bold">
                  ACTIVE
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> LEAD
                </span>
                <span className="font-bold text-[11px] text-primary underline underline-offset-4 decoration-primary/30 cursor-pointer uppercase tracking-tighter">
                  {podMembers?.find(m => m.user_id === project.created_by)?.user?.full_name || "Nexus Lead"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 border-b border-dashed mb-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Project Team</CardTitle>
              {isAdmin && (
                <div className="h-6 w-6 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                   <Users2 className="h-3.5 w-3.5" />
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {project.members && project.members.length > 0 ? (
                  project.members.map((m: any) => (
                    <div key={m.user.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-primary/10 shadow-sm">
                        <AvatarImage src={m.user.avatar_url} />
                        <AvatarFallback className="text-[10px] font-bold bg-primary/5">
                          {m.user.full_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate leading-none mb-1">{m.user.full_name}</p>
                        <p className="text-[9px] text-muted-foreground truncate uppercase font-medium tracking-wider">@{m.user.username}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-muted-foreground text-center py-4 italic">No members assigned.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-sm bg-muted/10">
            <CardHeader className="pb-3 border-b border-dashed mb-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Other Pod Members</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {podMembers
                  ?.filter((pm: any) => !project.members?.some((m: any) => m.user.id === pm.user_id))
                  .slice(0, 5)
                  .map((m: any) => (
                  <div key={m.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={m.user.avatar_url} />
                        <AvatarFallback className="text-[8px]">{m.user.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-medium truncate max-w-[80px]">{m.user.full_name}</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] h-4 px-1 opacity-50 uppercase">{m.role.replace('_', ' ')}</Badge>
                  </div>
                ))}
                {podMembers?.filter((pm: any) => !project.members?.some((m: any) => m.user.id === pm.user_id)).length === 0 && (
                  <p className="text-[10px] text-center text-muted-foreground">Entire pod is in this project.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { podId, projectId } = await params
  return (
    <Suspense fallback={<div className="p-8 space-y-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>}>
      <ProjectContent podId={podId} projectId={projectId} />
    </Suspense>
  )
}
