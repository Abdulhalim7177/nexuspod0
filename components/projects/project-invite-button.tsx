"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Copy, Check, Loader2, Link as LinkIcon } from "lucide-react"
import { createProjectInvitation } from "@/lib/projects/actions"

interface ProjectInviteButtonProps {
  podId: string
  projectId: string
  projectTitle: string
}

export function ProjectInviteButton({ podId, projectId, projectTitle }: ProjectInviteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerateInvite = async () => {
    setIsLoading(true)
    const result = await createProjectInvitation(podId, projectId)
    
    if (result.invitation) {
      const baseUrl = window.location.origin
      const link = `${baseUrl}/pods/join?code=${result.invitation.code}`
      setInviteLink(link)
    }
    setIsLoading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 px-4 font-bold shadow-lg shadow-primary/20">
          Invite to Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {projectTitle}</DialogTitle>
          <DialogDescription>
            Generate a link to invite members to this project. They will automatically join the pod if they aren&apos;t members.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!inviteLink ? (
            <Button 
              onClick={handleGenerateInvite} 
              disabled={isLoading}
              className="w-full font-bold uppercase tracking-widest text-xs h-11"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
              Generate Invite Link
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="h-11 bg-muted/50 font-mono text-xs"
                />
              </div>
              <Button size="icon" onClick={copyToClipboard} className="h-11 w-11 shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
