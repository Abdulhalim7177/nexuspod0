"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Copy, Check, Link as LinkIcon, Crown, Shield, User, Trash2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Member {
  id: string
  role: string
  user_id: string
  joined_at: string
  user: {
    id: string
    full_name: string | null
    avatar_url: string | null
    username: string | null
  }
}

interface Invitation {
  id: string
  code: string
  max_uses: number
  used_count: number
  expires_at: string | null
}

interface PodMembersClientProps {
  pod: any
  currentUserId: string
  podId: string
  canInvite: boolean
  isFounder: boolean
  invitations: Invitation[]
}

export function PodMembersClient({ pod, currentUserId, podId, canInvite, isFounder, invitations }: PodMembersClientProps) {
  const [copied, setCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<{id: string; role: string} | null>(null)
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)

  const generateLink = async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    
    const response = await fetch(`/api/pods/${podId}/invitations`, {
      method: "POST",
    })
    const data = await response.json()
    
    if (data.code) {
      setInviteLink(`${baseUrl}/pods/join?code=${data.code}`)
      setDialogOpen(true)
    }
  }

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openInviteDialog = (invite: Invitation) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    setInviteLink(`${baseUrl}/pods/join?code=${invite.code}`)
    setSelectedInvitation(invite)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSelectedInvitation(null)
  }

  const deleteInvitation = async (invitationId: string) => {
    await fetch(`/api/pods/${podId}/invitations/${invitationId}`, {
      method: "DELETE",
    })
    window.location.reload()
  }

  const confirmDeleteMember = () => {
    if (memberToDelete) {
      handleRemove(memberToDelete.id)
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
    }
  }

  const openDeleteDialog = (member: Member) => {
    setMemberToDelete({ id: member.id, role: member.role })
    setDeleteDialogOpen(true)
  }

  const handleRemove = async (memberId: string) => {
    await fetch(`/api/pods/${podId}/members/${memberId}`, {
      method: "DELETE",
    })
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/pods/${podId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pod
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Members
          </h1>
          <p className="text-muted-foreground">
            {pod.pod_members?.length || 0} member{(pod.pod_members?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {canInvite && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Invite Members</h2>
          
          <Dialog open={dialogOpen} onOpenChange={closeDialog}>
            <DialogTrigger asChild>
              <button
                onClick={generateLink}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Generate Invite Link
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Link Generated</DialogTitle>
                <DialogDescription>
                  Share this link with people you want to invite to your pod.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 mt-4">
                <input
                  type="text"
                  readOnly
                  value={inviteLink || ""}
                  className="flex-1 bg-transparent text-sm font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              {selectedInvitation && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uses:</span>
                    <span>{selectedInvitation.used_count}/{selectedInvitation.max_uses}</span>
                  </div>
                  {selectedInvitation.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className={new Date(selectedInvitation.expires_at) < new Date() ? "text-red-500" : ""}>
                        {new Date(selectedInvitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between mt-4">
                {selectedInvitation && isFounder && (
                  <button
                    onClick={() => deleteInvitation(selectedInvitation.id)}
                    className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium ml-auto"
                >
                  Done
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {invitations && invitations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Active Invitations</h3>
              <div className="space-y-2">
                {invitations.map((invite: Invitation) => {
                  const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date()
                  const isMaxed = invite.used_count >= invite.max_uses
                  
                  return (
                    <div 
                      key={invite.id} 
                      className={`flex items-center justify-between p-3 rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors ${isExpired || isMaxed ? 'opacity-50' : ''}`}
                      onClick={() => openInviteDialog(invite)}
                    >
                      <div className="flex items-center gap-3">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <code className="text-sm font-mono">{invite.code}</code>
                        {isExpired && <span className="text-xs text-red-500">(Expired)</span>}
                        {isMaxed && <span className="text-xs text-orange-500">(Maxed)</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{invite.used_count}/{invite.max_uses}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">All Members</h2>
        </div>
        <div className="divide-y">
          {pod.pod_members?.map((member: Member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {member.role[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {member.role} Member
                    {member.user_id === currentUserId && (
                      <span className="text-muted-foreground text-sm ml-2">(you)</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <RoleBadge role={member.role} />
                {isFounder && member.user_id !== currentUserId && (
                  <button
                    onClick={() => openDeleteDialog(member)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this {memberToDelete?.role} from the pod? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="px-4 py-2 border rounded-md hover:bg-muted transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteMember}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium"
            >
              Remove Member
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const icons: Record<string, any> = {
    FOUNDER: Crown,
    POD_MANAGER: Shield,
    TEAM_LEAD: User,
    MEMBER: User,
  }
  
  const colors: Record<string, string> = {
    FOUNDER: "bg-yellow-500/10 text-yellow-500",
    POD_MANAGER: "bg-purple-500/10 text-purple-500",
    TEAM_LEAD: "bg-blue-500/10 text-blue-500",
    MEMBER: "bg-muted text-muted-foreground",
  }

  const Icon = icons[role] || User
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${colors[role]}`}>
      <Icon className="h-3 w-3" />
      {role.replace('_', ' ')}
    </span>
  )
}
