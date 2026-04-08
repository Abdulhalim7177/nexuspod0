"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  UserPlus, 
  Trash2, 
  Lock, 
  Globe,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProject, deleteProject, addProjectMember, removeProjectMember } from "@/lib/projects/actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional().or(z.literal("")),
  is_private: z.boolean(),
})

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

interface ProjectSettingsProps {
  project: {
    id: string
    title: string
    description: string | null
    is_private: boolean
    members?: ProjectMember[]
  }
  podId: string
  podMembers: PodMember[]
}

export function ProjectSettings({ project, podId, podMembers }: ProjectSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title,
      description: project.description || "",
      is_private: project.is_private ?? false,
    },
  })

  useEffect(() => {
    form.reset({
      title: project.title,
      description: project.description || "",
      is_private: project.is_private ?? false,
    })
  }, [project.title, project.description, project.is_private, form])

  async function onUpdate(values: z.infer<typeof projectSchema>) {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("description", values.description || "")
    formData.append("is_private", String(values.is_private))

    const result = await updateProject(podId, project.id, formData)
    if (result.success) {
      // Show success toast
    }
    setIsLoading(false)
  }

  const handleAddMember = async (userId: string) => {
    await addProjectMember(podId, project.id, userId)
  }

  const handleRemoveMember = async (userId: string) => {
    await removeProjectMember(podId, project.id, userId)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* General Settings */}
      <Card className="border-primary/10 shadow-sm overflow-hidden">
        <div className="h-1 bg-primary/20" />
        <CardHeader>
          <CardTitle className="text-xl font-bold">General Settings</CardTitle>
          <CardDescription>Update project information and visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">Project Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 bg-muted/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px] bg-muted/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_private"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-primary/5 p-4 bg-muted/10">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2 font-bold uppercase tracking-tight text-xs">
                        {field.value ? <Lock className="h-3.5 w-3.5 text-yellow-600" /> : <Globe className="h-3.5 w-3.5 text-green-600" />}
                        {field.value ? "Private Project" : "Public Project"}
                      </FormLabel>
                      <FormDescription className="text-[10px] font-medium">
                        {field.value
                          ? "Private projects are only visible to specific members and pod managers."
                          : "Public projects are visible to all members of this pod."}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="font-bold uppercase tracking-widest text-[10px] px-8 h-10 shadow-lg shadow-primary/10">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Member Management */}
      <Card className="border-primary/10 shadow-sm overflow-hidden">
        <div className="h-1 bg-blue-500/20" />
        <CardHeader>
          <CardTitle className="text-xl font-bold">Project Team</CardTitle>
          <CardDescription>Manage who has access to this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Select onValueChange={handleAddMember}>
              <SelectTrigger className="flex-1 bg-muted/20 border-primary/5 h-11">
                <SelectValue placeholder="Add member to project..." />
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
            <Button variant="outline" className="h-11 px-4 border-dashed">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {project.members?.map((member: ProjectMember) => (
              <div key={member.user.id} className="flex items-center justify-between p-3 rounded-xl border border-primary/5 bg-background/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border-2 border-primary/10 shadow-sm">
                    <AvatarImage src={member.user.avatar_url} />
                    <AvatarFallback className="font-black text-xs">
                      {member.user.full_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold leading-none mb-1">{member.user.full_name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">@{member.user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveMember(member.user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!project.members || project.members.length === 0) && (
              <div className="text-center py-8 border border-dashed rounded-xl opacity-50">
                <p className="text-xs font-black uppercase tracking-[0.2em]">No Specific Members</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/5 shadow-none overflow-hidden">
        <div className="h-1 bg-red-500/40" />
        <CardHeader>
          <CardTitle className="text-red-600 text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/70 font-medium">Permanently delete this project and all its tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            className="font-bold uppercase tracking-widest text-[10px] px-8"
            disabled={isDeleting}
            onClick={async () => {
              if (confirm("Are you sure? This cannot be undone.")) {
                setIsDeleting(true)
                await deleteProject(podId, project.id)
              }
            }}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Delete Project"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
