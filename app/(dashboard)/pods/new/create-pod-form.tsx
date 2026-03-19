"use client"

import { useActionState, useState, useEffect } from "react"
import { createPod } from "@/lib/pods/actions"
import { Boxes } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const initialState = {
  error: "",
  success: false,
}

function SubmitButton() {
  const [pending] = useState(false)
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
    >
      {pending ? (
        <>
          <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Boxes className="h-4 w-4" />
          Create Pod
        </>
      )}
    </button>
  )
}

export function CreatePodForm() {
  const [state, formAction, isPending] = useActionState(createPod, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      router.push("/pods")
      router.refresh()
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="p-6 space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium leading-none">
          Pod Name <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g., Nexus Builders, Product Team"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
          minLength={3}
        />
        <p className="text-sm text-muted-foreground">
          This is how your pod will appear to members
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="summary" className="text-sm font-medium leading-none">
          Description
        </label>
        <textarea
          id="summary"
          name="summary"
          placeholder="What is this pod about? What's your mission?"
          rows={4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground">
          Optional. Describe your pod&apos;s purpose
        </p>
      </div>

      {state.error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {state.error}
        </div>
      )}

      <div className="p-4 rounded-lg bg-muted/50 border">
        <h3 className="font-medium mb-2">What happens next?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Your pod will be created with a unique NPN (NP-XXXXX)</li>
          <li>• You&apos;ll be automatically added as the <strong>Founder</strong></li>
          <li>• You can invite members using invitation links</li>
          <li>• All pod data is isolated and secure</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-muted transition-colors"
        >
          Cancel
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
}
