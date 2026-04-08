"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { manageJoinRequest } from "@/lib/projects/actions"

interface ProjectRequestsListProps {
  requests: any[]
  podId: string
  projectId: string
}

export function ProjectRequestsList({ requests: initialRequests, podId, projectId }: ProjectRequestsListProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAction = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(requestId)
    const result = await manageJoinRequest(requestId, podId, projectId, status)
    if (result.success) {
      setRequests(prev => prev.filter(r => r.id !== requestId))
    }
    setProcessingId(null)
  }

  if (requests.length === 0) return null

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 mb-2 px-1">Pending Requests</h4>
      {requests.map((request) => (
        <div key={request.id} className="flex items-center justify-between p-3 rounded-xl border border-orange-500/20 bg-orange-500/5 animate-in fade-in slide-in-from-right-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-orange-500/20">
              <AvatarImage src={request.user.avatar_url} />
              <AvatarFallback className="text-[10px] font-bold bg-orange-500/10 text-orange-700">
                {request.user.full_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[11px] font-bold truncate leading-none">{request.user.full_name}</p>
              <p className="text-[9px] text-orange-600/70 font-medium uppercase tracking-wider mt-1">Requesting Access</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-4">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-green-600 hover:bg-green-500/10"
              disabled={!!processingId}
              onClick={() => handleAction(request.id, 'APPROVED')}
            >
              {processingId === request.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-red-600 hover:bg-red-500/10"
              disabled={!!processingId}
              onClick={() => handleAction(request.id, 'REJECTED')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
