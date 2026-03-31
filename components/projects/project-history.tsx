import { createClient } from "@/lib/supabase/server"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  FileText, 
  CheckCircle2, 
  Settings, 
  UserPlus, 
  Trash2,
  Clock
} from "lucide-react"

interface ProjectHistoryProps {
  projectId: string
}

export async function ProjectHistory({ projectId }: ProjectHistoryProps) {
  const supabase = await createClient()

  const { data: logs } = await supabase
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'TASK_CREATED': return <FileText className="h-3.5 w-3.5 text-blue-500" />
      case 'TASK_APPROVED': return <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
      case 'TASK_STATUS_CHANGED': return <Settings className="h-3.5 w-3.5 text-blue-500" />
      case 'TASK_UPDATED': return <Settings className="h-3.5 w-3.5 text-orange-500" />
      case 'TASK_DELETED': return <Trash2 className="h-3.5 w-3.5 text-red-500" />
      case 'PROJECT_UPDATED': return <Settings className="h-3.5 w-3.5 text-orange-500" />
      case 'MEMBER_ADDED': return <UserPlus className="h-3.5 w-3.5 text-green-500" />
      case 'MEMBER_REMOVED': return <Trash2 className="h-3.5 w-3.5 text-red-500" />
      default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const formatAction = (log: any) => {
    const actor = log.user?.full_name || "Unknown"
    const entity = log.entity_type.toLowerCase()
    
    switch (log.action) {
      case 'TASK_CREATED': return `created a new ${entity}`
      case 'TASK_APPROVED': return `approved the ${entity}`
      case 'TASK_STATUS_CHANGED': return `changed status of ${entity} to ${log.new_values?.status || 'updated'}`
      case 'TASK_UPDATED': return `updated ${entity} details`
      case 'TASK_DELETED': return `deleted a ${entity}`
      case 'PROJECT_UPDATED': return `updated ${entity} settings`
      case 'MEMBER_ADDED': return `added a member to the ${entity}`
      case 'MEMBER_REMOVED': return `removed a member from the ${entity}`
      default: return `performed an action on ${entity}`
    }
  }

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[1.125rem] before:-z-10 before:h-full before:w-px before:bg-gradient-to-b before:from-primary/20 before:via-muted before:to-transparent">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {log.user?.full_name || "Nexus System"} 
                      <span className="ml-1 font-medium text-muted-foreground">{formatAction(log)}</span>
                    </p>
                    <time className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                      {new Date(log.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  {log.new_values?.title && (
                    <div className="rounded-lg bg-muted/30 p-2 border border-primary/5">
                       <p className="text-[11px] font-bold text-primary/80 uppercase tracking-tighter line-clamp-1">{log.new_values.title}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed rounded-2xl opacity-50">
              <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">No Activity Logged</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
