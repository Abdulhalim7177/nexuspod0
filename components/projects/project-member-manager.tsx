"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  Mail
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addProjectMember, removeProjectMember } from "@/lib/projects/actions"
import { Badge } from "@/components/ui/badge"

interface ProjectMember {
  user: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
}

interface PodMember {
  user_id: string
  user: {
    full_name: string
    username: string
  }
}

interface ProjectMemberManagerProps {
  project: {
    id: string
    created_by: string
    members?: ProjectMember[]
  }
  podId: string
  podMembers: PodMember[]
  isAdmin: boolean
  currentUserId: string
}

export function ProjectMemberManager({ project, podId, podMembers, isAdmin, currentUserId }: ProjectMemberManagerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddMember = async (userId: string) => {
    setIsLoading(true)
    await addProjectMember(podId, project.id, userId)
    setIsLoading(false)
  }

  const handleRemoveMember = async (userId: string) => {
    if (confirm("Remove this member from the project?")) {
      setIsLoading(true)
      await removeProjectMember(podId, project.id, userId)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card className="border-primary/10 bg-primary/5 shadow-none border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/70">Add Team Member</CardTitle>
            <CardDescription className="text-xs">Invite pod members to collaborate on this project.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select onValueChange={handleAddMember} disabled={isLoading}>
                <SelectTrigger className="flex-1 bg-background border-primary/10 h-11">
                  <SelectValue placeholder="Select a pod member..." />
                </SelectTrigger>
                <SelectContent>
                  {podMembers
                    .filter(pm => !project.members?.some((m: ProjectMember) => m.user.id === pm.user_id))
                    .map(pm => (
                      <SelectItem key={pm.user_id} value={pm.user_id}>
                        {pm.user.full_name} (@{pm.user.username})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-11 px-4 border-dashed border-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.members?.map((member: ProjectMember) => {
          const isMe = member.user.id === currentUserId
          const isCreator = project.created_by === member.user.id

          return (
            <Card key={member.user.id} className="border-primary/5 bg-card/50 backdrop-blur-sm group hover:border-primary/20 transition-all shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                        <AvatarImage src={member.user.avatar_url} />
                        <AvatarFallback className="font-black text-sm bg-primary/5">
                          {member.user.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isCreator && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 border-2 border-background flex items-center justify-center shadow-sm">
                          <ShieldCheck className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold leading-none">{member.user.full_name}</p>
                        {isMe && <Badge className="text-[8px] h-3.5 px-1 bg-primary/10 text-primary border-none font-black">YOU</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">@{member.user.username}</p>
                    </div>
                  </div>
                  
                  {isAdmin && !isCreator && !isMe && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-dashed border-primary/5 flex items-center justify-between">
                   <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Connect</span>
                      <span className="flex items-center gap-1">
                        {isCreator ? (
                          <span className="text-orange-600 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Project Lead</span>
                        ) : (
                          <span className="flex items-center gap-1">Collaborator</span>
                        )}
                      </span>
                   </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {(!project.members || project.members.length === 0) && (
        <div className="text-center py-20 border border-dashed rounded-2xl bg-muted/5 opacity-50">
          <Loader2 className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-xs font-black uppercase tracking-[0.2em]">Initial Team Not Found</p>
        </div>
      )}
    </div>
  )
}
