import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { FolderKanban, Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProjectList } from "@/components/projects/project-list"
import { getPodProjects } from "@/lib/projects/actions"

interface PodProjectsPageProps {
  params: Promise<{ podId: string }>
}

export default async function PodProjectsPage({ params }: PodProjectsPageProps) {
  const { podId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: pod } = await supabase
    .from("pods")
    .select("title, npn")
    .eq("id", podId)
    .single()

  if (!pod) notFound()

  const { data: myMember } = await supabase
    .from("pod_members")
    .select("role")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single()

  if (!myMember) redirect("/pods")

  const projects = await getPodProjects(podId)
  const canCreate = ["FOUNDER", "POD_MANAGER", "TEAM_LEAD"].includes(myMember.role)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all initiatives in <span className="font-semibold text-foreground">{pod.title}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-9 bg-muted/50" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-t pt-6">
        <ProjectList podId={podId} projects={projects} canCreate={canCreate} />
      </div>
    </div>
  )
}
