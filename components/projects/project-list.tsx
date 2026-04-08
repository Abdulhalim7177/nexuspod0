import { 
  FolderKanban, 
  Lock, 
  Globe, 
  Users, 
  Calendar,
  MoreVertical,
  Plus
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { CreateProjectForm } from "./create-project-form"

interface Project {
  id: string
  title: string
  description: string | null
  is_private: boolean
  created_at: string
  members_count?: { count: number }[]
}

interface ProjectListProps {
  podId: string
  projects: Project[]
  canCreate?: boolean
}

export function ProjectList({ podId, projects, canCreate }: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {canCreate && (
        <Dialog>
          <DialogTrigger asChild>
            <button className="h-full min-h-[160px] flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium">New Project</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <CreateProjectForm podId={podId} />
          </DialogContent>
        </Dialog>
      )}

      {projects.map((project) => (
        <Card key={project.id} className="group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base line-clamp-1">
                  <Link 
                    href={`/pods/${podId}/projects/${project.id}`}
                    className="hover:underline"
                  >
                    {project.title}
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {project.is_private ? (
                    <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-1.5 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <Lock className="h-2.5 w-2.5" /> Private
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-1.5 bg-green-500/10 text-green-600 border-green-500/20">
                      <Globe className="h-2.5 w-2.5" /> Public
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/pods/${podId}/projects/${project.id}`}>View Project</Link>
                </DropdownMenuItem>
                {canCreate && (
                  <DropdownMenuItem>Project Settings</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
              {project.description || "No description provided."}
            </p>
          </CardContent>
          <CardFooter className="pt-0 flex items-center justify-between text-[11px] text-muted-foreground border-t mt-2 pt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.members_count?.[0]?.count || 0} Members
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
            {/* Placeholder for progress */}
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '0%' }} />
              </div>
              <span>0%</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
