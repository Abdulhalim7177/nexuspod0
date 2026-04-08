"use client"

import { useState, useEffect } from "react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  Send,
  RotateCcw,
  CheckCircle,
  FileText,
  Paperclip,
  CheckSquare,
  Plus,
  Trash2,
  X
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { submitTask, reviewTask, updateTaskDetails } from "@/lib/tasks/actions"
import { Separator } from "@/components/ui/separator"

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  created_at: string
  due_date: string | null
  sub_tasks?: SubTask[]
  attachments?: string[]
  assignees?: {
    user: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }[]
  submissions?: {
    id: string
    created_at: string
    description: string
  }[]
}

interface TaskDetailSheetProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  podId: string
  projectId: string
  canApprove: boolean
}

export function TaskDetailSheet({ 
  task, 
  isOpen, 
  onClose, 
  currentUserId,
  podId,
  projectId,
  canApprove
}: TaskDetailSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionNote, setSubmissionReviewNote] = useState("")
  const [view, setView] = useState<'DETAILS' | 'SUBMIT' | 'REVIEW'>('DETAILS')
  const [newSubTask, setNewSubTask] = useState("")
  const [subTasks, setSubTasks] = useState<SubTask[]>((task.sub_tasks as SubTask[]) || [])

  useEffect(() => {
    setSubTasks((task.sub_tasks as SubTask[]) || [])
  }, [task.id, task.sub_tasks])

  const isAssignee = task.assignees?.some((a: { user: { id: string } }) => a.user.id === currentUserId)
  const latestSubmission = task.submissions?.[0]
  const attachments = (task.attachments as string[]) || []

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const result = await submitTask(task.id, submissionNote, podId, projectId)
    if (result.success) {
      onClose()
    }
    setIsSubmitting(false)
  }

  const handleReview = async (action: 'APPROVED' | 'CORRECTED') => {
    if (!latestSubmission) return
    setIsSubmitting(true)
    const result = await reviewTask(task.id, latestSubmission.id, action, submissionNote, podId, projectId)
    if (result.success) {
      onClose()
    }
    setIsSubmitting(false)
  }

  const handleAddSubTask = async () => {
    if (!newSubTask.trim()) return
    const newTask = { id: crypto.randomUUID(), title: newSubTask, completed: false }
    const updatedSubTasks = [...subTasks, newTask]
    setSubTasks(updatedSubTasks)
    setNewSubTask("")
    await updateTaskDetails(task.id, { sub_tasks: updatedSubTasks }, podId, projectId)
  }

  const toggleSubTask = async (id: string) => {
    const updatedSubTasks = subTasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    )
    setSubTasks(updatedSubTasks)
    await updateTaskDetails(task.id, { sub_tasks: updatedSubTasks }, podId, projectId)
  }

  const removeSubTask = async (id: string) => {
    const updatedSubTasks = subTasks.filter(st => st.id !== id)
    setSubTasks(updatedSubTasks)
    await updateTaskDetails(task.id, { sub_tasks: updatedSubTasks }, podId, projectId)
  }

  const PRIORITY_COLORS: Record<string, string> = {
    LOW: "bg-slate-500/10 text-slate-600",
    MEDIUM: "bg-blue-500/10 text-blue-600",
    HIGH: "bg-orange-500/10 text-orange-600",
    URGENT: "bg-red-500/10 text-red-600",
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-4 pr-6 text-left">
          <div className="flex items-center gap-2">
            <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
            <Badge variant="outline" className="uppercase font-bold tracking-tighter text-[10px]">
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          <SheetTitle className="text-2xl font-bold tracking-tight leading-tight">
            {task.title}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {task.description || "No description provided."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-muted/30 border border-dashed">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <User className="h-3 w-3" /> Assignees
              </span>
              <div className="flex -space-x-2">
                {task.assignees?.map((a: { user: { id: string, avatar_url: string | null, full_name: string } }) => (
                  <Avatar key={a.user.id} className="h-7 w-7 border-2 border-background">
                    <AvatarImage src={a.user.avatar_url} />
                    <AvatarFallback className="text-[8px] font-bold">
                      {a.user.full_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )) || <span className="text-xs text-muted-foreground italic">Unassigned</span>}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Due Date
              </span>
              <p className="text-sm font-bold">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
              </p>
            </div>
          </div>

          <Separator className="bg-primary/5" />

          {/* Sub-tasks Section */}
          <div className="space-y-4">
             <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <CheckSquare className="h-3.5 w-3.5" /> Sub-tasks
              <Badge variant="secondary" className="text-[9px] h-4 font-bold ml-auto bg-primary/5 text-primary">
                {subTasks.filter(st => st.completed).length}/{subTasks.length}
              </Badge>
            </h4>
            
            <div className="space-y-2.5">
              {subTasks.map((st) => (
                <div key={st.id} className="flex items-center gap-3 group animate-in slide-in-from-left-2 duration-300">
                  <Checkbox 
                    checked={st.completed} 
                    onCheckedChange={() => toggleSubTask(st.id)}
                    className="h-4 w-4 rounded-sm border-primary/20"
                  />
                  <span className={`text-sm flex-1 ${st.completed ? 'text-muted-foreground line-through decoration-primary/30' : 'text-foreground/90 font-medium'}`}>
                    {st.title}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                    onClick={() => removeSubTask(st.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Input 
                  placeholder="Add a sub-task..." 
                  className="h-9 text-xs bg-muted/20 border-primary/5 focus-visible:ring-primary/20"
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                />
                <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleAddSubTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-primary/5" />

          {/* Attachments Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Paperclip className="h-3.5 w-3.5" /> Attachments
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {attachments.map((url, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs font-bold truncate">
                  <div className="flex items-center gap-2 truncate pr-4">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    <span className="truncate opacity-70">{url.split('/').pop()}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full h-10 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold gap-2 text-[10px] uppercase tracking-widest">
                <Plus className="h-3.5 w-3.5" /> Upload Resource
              </Button>
            </div>
          </div>

          <Separator className="bg-primary/5" />

          {/* Activity/Review Loop Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> Execution Loop
            </h4>

            {view === 'DETAILS' && (
              <div className="space-y-4">
                {latestSubmission ? (
                  <div className="p-4 rounded-xl border bg-green-500/5 border-green-500/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Latest Submission</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(latestSubmission.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm italic text-muted-foreground">&quot;{latestSubmission.description}&quot;</p>
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-xl opacity-50">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs font-bold uppercase tracking-widest">Awaiting Submission</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {isAssignee && task.status !== 'DONE' && task.status !== 'APPROVED' && (
                    <Button className="flex-1 gap-2 font-bold" onClick={() => setView('SUBMIT')}>
                      <Send className="h-4 w-4" /> Submit for Review
                    </Button>
                  )}
                  {canApprove && task.status === 'DONE' && (
                    <Button className="flex-1 gap-2 font-bold bg-purple-600 hover:bg-purple-700" onClick={() => setView('REVIEW')}>
                      <CheckCircle className="h-4 w-4" /> Review Submission
                    </Button>
                  )}
                </div>
              </div>
            )}

            {view === 'SUBMIT' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Submission Notes</label>
                  <Textarea 
                    placeholder="Describe what you completed and provide relevant links..." 
                    className="min-h-[120px] bg-muted/20"
                    value={submissionNote}
                    onChange={(e) => setSubmissionReviewNote(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 font-bold" onClick={() => setView('DETAILS')}>Cancel</Button>
                  <Button 
                    className="flex-1 font-bold bg-primary" 
                    disabled={isSubmitting || !submissionNote}
                    onClick={handleSubmit}
                  >
                    Confirm Submission
                  </Button>
                </div>
              </div>
            )}

            {view === 'REVIEW' && (latestSubmission ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 rounded-xl bg-muted/50 border space-y-2 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Assignee Note</span>
                  <p className="text-sm">{latestSubmission.description}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Review Feedback</label>
                  <Textarea 
                    placeholder="Provide feedback or reasons for approval/correction..." 
                    className="min-h-[100px] bg-muted/20 border-purple-500/20"
                    value={submissionNote}
                    onChange={(e) => setSubmissionReviewNote(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 font-bold border-orange-500/50 text-orange-600 hover:bg-orange-500/5 gap-2"
                    disabled={isSubmitting}
                    onClick={() => handleReview('CORRECTED')}
                  >
                    <RotateCcw className="h-4 w-4" /> Needs Correction
                  </Button>
                  <Button 
                    className="flex-1 font-bold bg-purple-600 hover:bg-purple-700 gap-2" 
                    disabled={isSubmitting}
                    onClick={() => handleReview('APPROVED')}
                  >
                    <CheckCircle className="h-4 w-4" /> Approve & Close
                  </Button>
                </div>
                <Button variant="ghost" className="w-full text-xs font-bold uppercase opacity-50" onClick={() => setView('DETAILS')}>Back</Button>
              </div>
            ) : null)}
          </div>
        </div>

        <SheetFooter className="mt-auto border-t pt-6 sticky bottom-0 bg-background">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <Clock className="h-3 w-3" /> Created {new Date(task.created_at).toLocaleDateString()}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
