"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserCircle, AlertCircle, ArrowRight } from "lucide-react"

export function ProfileCompletionCheck({ completion }: { completion: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Show modal if completion < 50% and not already on profile page
    if (completion < 50 && pathname !== "/profile") {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [completion, pathname])

  const handleComplete = () => {
    setIsOpen(false)
    router.push("/profile")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] border-primary/20 shadow-2xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Your builder profile is only <span className="font-bold text-foreground">{completion}%</span> complete. 
            A complete profile helps you build trust in the Nexus Pod network.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Profile Strength</span>
              <span className="text-primary">{completion}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary transition-all duration-500 ease-out" 
                 style={{ width: `${completion}%` }} 
               />
            </div>
          </div>
          
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 flex gap-3 items-start">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-[12px] text-yellow-700 leading-tight">
              You must reach at least <span className="font-bold">50%</span> profile completion to access all workspace features.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleComplete} 
            className="w-full gap-2 font-bold shadow-lg shadow-primary/20"
          >
            Go to Profile <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
