"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  User as UserIcon,
  MessageSquare,
  Calendar,
  Trash2,
  Pencil
} from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { updateTaskStatus, deleteTask } from "@/lib/tasks/actions"
import { CreateTaskForm } from "./create-task-form"
import { EditTaskForm } from "./edit-task-form"
import { TaskDetailDialog } from "./task-detail-dialog"
import { createClient } from "@/lib/supabase/client"

interface Task {
  id: string
  title: string
  description: string | null
  status: 'NOT_STARTED' | 'ONGOING' | 'DONE' | 'APPROVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  due_date: string | null
  created_by: string
  created_at: string
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

interface Member {
  user_id: string
  user: {
    full_name: string | null
  }
}

interface TaskBoardProps {
  projectId: string
  podId: string
  initialTasks: Task[]
  canManage: boolean
  isProjectManager: boolean
  members: Member[]
  currentUserId: string
}

const COLUMNS = [
  { id: 'NOT_STARTED', title: 'Backlog', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  { id: 'ONGOING', title: 'In Progress', icon: ArrowRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'DONE', title: 'Done / Review', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'APPROVED', title: 'Approved', icon: AlertCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
]

const PRIORITY_COLORS = {
  LOW: "bg-slate-500/10 text-slate-600",
  MEDIUM: "bg-blue-500/10 text-blue-600",
  HIGH: "bg-orange-500/10 text-orange-600",
  URGENT: "bg-red-500/10 text-red-600",
}

export function TaskBoard({ projectId, podId, initialTasks, canManage, isProjectManager, members, currentUserId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`project_tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task
            setTasks(prev => {
              if (prev.some(t => t.id === newTask.id)) return prev
              return [newTask, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task
            setTasks(prev => prev.map(t => 
              t.id === updatedTask.id ? { ...t, ...updatedTask } : t
            ))
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  const canChangeTaskStatus = (task: Task): boolean => {
    if (task.created_by === currentUserId) return true
    if (isProjectManager) return true
    return task.assignees?.some(a => a.user.id === currentUserId) ?? false
  }

  const canEditTask = (task: Task): boolean => {
    if (task.created_by === currentUserId) return true
    if (isProjectManager) return true
    return false
  }

  const canDeleteTask = (task: Task): boolean => {
    if (task.created_by === currentUserId) return true
    if (isProjectManager) return true
    return false
  }

  const moveTask = async (taskId: string, newStatus: string) => {
    // Optimistic update
    const previousTasks = [...tasks]
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
    )
    setTasks(updatedTasks)

    const result = await updateTaskStatus(taskId, newStatus, podId, projectId)
    if (result.error) {
       setTasks(previousTasks)
       alert("Failed to update task status: " + result.error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    const previousTasks = [...tasks]
    setTasks(prev => prev.filter(t => t.id !== taskId))

    const result = await deleteTask(taskId, podId, projectId)
    if (result.error) {
      setTasks(previousTasks)
      alert("Failed to delete task: " + result.error)
    }
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const taskId = draggableId
    const newStatus = destination.droppableId

    moveTask(taskId, newStatus)
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground/90 uppercase tracking-widest text-xs">Project Board</h2>
          <Badge variant="outline" className="font-mono bg-background/50">{tasks.length} Tasks</Badge>
        </div>
        
        {canManage && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>Add a new task to the project board.</DialogDescription>
              </DialogHeader>
              <CreateTaskForm 
                projectId={projectId} 
                podId={podId} 
                members={members}
                onSuccess={() => setIsCreateOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        )}
        {canManage && (
          <Button size="sm" className="gap-2 font-bold shadow-lg shadow-primary/10 h-9" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full min-h-[500px]">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col gap-3 h-full">
              <div className={`flex items-center justify-between p-3 rounded-xl ${column.bg} border border-primary/5 backdrop-blur-sm`}>
                <div className="flex items-center gap-2">
                  <column.icon className={`h-4 w-4 ${column.color}`} />
                  <span className="font-black text-[10px] tracking-[0.1em] uppercase opacity-80">{column.title}</span>
                </div>
                <Badge variant="secondary" className="bg-background/50 text-[10px] font-bold">
                  {tasks.filter(t => t.status === column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 space-y-3 p-2 rounded-2xl bg-muted/20 border border-dashed ${snapshot.isDraggingOver ? 'border-primary/40 bg-muted/40' : 'border-primary/5'} transition-colors min-h-[300px]`}
                  >
                    {tasks
                      .filter(t => t.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!canChangeTaskStatus(task)}>
                          {(provided, snapshot) => (
                            <Card 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group hover:border-primary/40 transition-all shadow-sm cursor-pointer active:scale-[0.98] border-primary/5 ${snapshot.isDragging ? 'rotate-2 shadow-xl border-primary/60 bg-background scale-105 z-50' : 'bg-background/60 backdrop-blur-md'}`}
                              onClick={() => setSelectedTask(task)}
                            >
                              <CardHeader className="p-3 pb-2 space-y-0">
                                <div className="flex items-start justify-between gap-2">
                                  <Badge className={`text-[9px] px-1.5 h-4 font-black border-none tracking-tighter ${PRIORITY_COLORS[task.priority]}`}>
                                    {task.priority}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      {canEditTask(task) && (
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingTask(task)
                                          }}
                                        >
                                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Task
                                        </DropdownMenuItem>
                                      )}
                                      {canChangeTaskStatus(task) && COLUMNS.filter(c => c.id !== task.status).map(c => (
                                        <DropdownMenuItem key={c.id} onClick={() => moveTask(task.id, c.id)}>
                                          Move to {c.title}
                                        </DropdownMenuItem>
                                      ))}
                                      {!canChangeTaskStatus(task) && !canEditTask(task) && (
                                        <DropdownMenuItem disabled className="text-muted-foreground">
                                          No actions available
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      {canDeleteTask(task) ? (
                                        <DropdownMenuItem 
                                          className="text-red-600 focus:text-red-600"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteTask(task.id)
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Task
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem disabled className="text-muted-foreground">
                                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Task
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <CardTitle className="text-sm font-bold leading-tight mt-2 line-clamp-2 text-foreground/90">
                                  {task.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-0 space-y-3">
                                {task.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between pt-2 border-t border-dashed border-primary/10">
                                  <div className="flex -space-x-2">
                                    {task.assignees && task.assignees.length > 0 ? (
                                      task.assignees.map((a, i) => (
                                        <Avatar key={i} className="h-6 w-6 border-2 border-background shadow-sm">
                                          <AvatarImage src={a.user.avatar_url || undefined} />
                                          <AvatarFallback className="text-[8px] font-black">
                                            {a.user.full_name.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))
                                    ) : (
                                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                                        <UserIcon className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold tracking-tighter">
                                    {task.due_date && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1 bg-primary/5 px-1.5 py-0.5 rounded-md text-primary">
                                      <MessageSquare className="h-3 w-3" />
                                      0
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update task details, priority, due date, and assignment.</DialogDescription>
            </DialogHeader>
            <EditTaskForm
              taskId={editingTask.id}
              podId={podId}
              projectId={projectId}
              members={members}
              initialData={{
                title: editingTask.title,
                description: editingTask.description,
                priority: editingTask.priority,
                due_date: editingTask.due_date,
                assigneeId: editingTask.assignees?.[0]?.user?.id || "",
              }}
              onSuccess={() => setEditingTask(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUserId={currentUserId}
          podId={podId}
          projectId={projectId}
          canApprove={isProjectManager}
        />
      )}
    </div>
  )
}
