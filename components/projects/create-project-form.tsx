"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import { createProject } from "@/lib/projects/actions"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Globe } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().max(1000, {
    message: "Description must not exceed 1000 characters.",
  }).optional().or(z.literal("")),
  is_private: z.boolean().default(false),
})

interface CreateProjectFormProps {
  podId: string
  onSuccess?: () => void
}

export function CreateProjectForm({ podId, onSuccess }: CreateProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      is_private: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("description", values.description || "")
    formData.append("is_private", String(values.is_private))

    const result = await createProject(podId, formData)

    if (result.success) {
      form.reset()
      if (onSuccess) onSuccess()
      router.push(`/pods/${podId}/projects/${result.projectId}`)
    } else {
      console.error(result.error)
      // Displaying error in console as requested, 
      // though a toast would be better for UX
    }
    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Project Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Marketing Campaign Q2" className="h-12 border-primary/10 focus-visible:ring-primary/30" {...field} />
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
              <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is this project about?" 
                  className="resize-none min-h-[100px] border-primary/10 focus-visible:ring-primary/30" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_private"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-primary/10 p-4 bg-muted/30">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2 text-base">
                  {field.value ? (
                    <><Lock className="h-4 w-4 text-yellow-600" /> Private Project</>
                  ) : (
                    <><Globe className="h-4 w-4 text-green-600" /> Public Project</>
                  )}
                </FormLabel>
                <FormDescription className="text-xs">
                  {field.value 
                    ? "Only invited members can access this project." 
                    : "Everyone in the Pod can see and contribute."}
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
        <Button type="submit" className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Create Project"
          )}
        </Button>
      </form>
    </Form>
  )
}
