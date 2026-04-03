"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from "@/lib/notifications/actions"
import { Bell, MessageSquare, CheckCircle, XCircle, Clock, Users, Folder, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    const result = await getNotifications(20, true)
    if (!result.error) {
      setNotifications(result.notifications)
    }
    setLoading(false)
  }, [])

  const loadUnreadCount = useCallback(async () => {
    const result = await getUnreadNotificationCount()
    setUnreadCount(result.count)
  }, [])

  useEffect(() => {
    loadUnreadCount()
    loadNotifications()
  }, [loadUnreadCount, loadNotifications])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setUnreadCount((prev) => prev + 1)
          setNotifications((prev) => [newNotif, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    )
    setUnreadCount(0)
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId)
    const notif = notifications.find((n) => n.id === notificationId)
    if (notif && !notif.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const handleNotificationClick = async (notification: Notification) => {
    const isChatNotification = notification.type === "CHAT_MESSAGE" || notification.type === "CHAT_MENTION"
    const isTaskNotification = notification.type?.startsWith("TASK_")
    const isProjectNotification = notification.type === "PROJECT_INVITE" || notification.type === "PROJECT_REQUEST"
    const isPodNotification = notification.type === "POD_INVITE" || notification.type === "MEMBER_JOINED"
    
    // Always mark as read
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    // For chat notifications - navigate to exact chat location
    if (isChatNotification && notification.related_id) {
      await deleteNotification(notification.id)
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      
      // Get conversation details to determine where to navigate
      if (notification.related_type === "conversation" && notification.related_id) {
        // Fetch conversation to get type and IDs
        const { data: convo } = await supabase
          .from("chat_conversations")
          .select("type, pod_id, project_id")
          .eq("id", notification.related_id)
          .single()
        
        if (convo) {
          if (convo.type === "DM") {
            // For DM, go to messages page
            router.push("/messages")
          } else if (convo.type === "PROJECT" && convo.project_id) {
            router.push(`/pods/${convo.pod_id}/projects/${convo.project_id}/chat`)
          } else if (convo.type === "POD" && convo.pod_id) {
            router.push(`/pods/${convo.pod_id}/chat`)
          } else {
            router.push("/messages")
          }
        } else {
          router.push("/messages")
        }
      } else {
        router.push("/messages")
      }
      setOpen(false)
      return
    }

    // For task, project, pod notifications - delete them entirely after clicking
    if (isTaskNotification || isProjectNotification || isPodNotification) {
      await deleteNotification(notification.id)
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    }

    // Navigate to the appropriate page
    if (notification.link) {
      router.push(notification.link)
      setOpen(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <CheckCircle className="h-4 w-4 text-violet-500" />
      case "TASK_SUBMITTED":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "TASK_APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "TASK_REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "TASK_DUE_SOON":
      case "TASK_OVERDUE":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "CHAT_MENTION":
      case "CHAT_MESSAGE":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "PROJECT_INVITE":
      case "POD_INVITE":
        return <Folder className="h-4 w-4 text-amber-500" />
      case "MEMBER_JOINED":
        return <Users className="h-4 w-4 text-green-500" />
      case "PROJECT_REQUEST":
        return <Folder className="h-4 w-4 text-amber-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const notificationContent = (
                  <div className={cn("flex-1 min-w-0", notification.is_read && "opacity-60")}>
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span className="font-medium text-sm truncate">
                        {notification.title}
                      </span>
                    </div>
                    {notification.body && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                )

                const actions = (
                  <div className="flex items-center gap-1">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-red-500"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                )

                if (notification.link || notification.type === "CHAT_MESSAGE" || notification.type === "CHAT_MENTION") {
                  return (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="flex items-start gap-3 p-3 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {notificationContent}
                      {actions}
                    </DropdownMenuItem>
                  )
                }

                return (
                  <DropdownMenuItem key={notification.id} className="flex items-start gap-3 p-3 cursor-pointer">
                    {notificationContent}
                    {actions}
                  </DropdownMenuItem>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
