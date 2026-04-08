"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Boxes, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PodSettingsFormProps {
  pod: {
    title: string
    summary?: string | null
    npn: string
  }
  isFounder: boolean
  podId: string
}

export function PodSettingsForm({ pod, isFounder, podId }: PodSettingsFormProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    const { error } = await fetch(`/api/pods/${podId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: formData.get("title"),
        summary: formData.get("summary"),
      }),
    }).then(r => r.json()).catch(() => ({ error: "Failed to update" }))

    setSaving(false)
    
    if (error) {
      setError(error)
    } else {
      router.refresh()
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    const { error } = await fetch(`/api/pods/${podId}`, {
      method: 'DELETE',
    }).then(r => r.json()).catch(() => ({ error: "Failed to delete" }))

    if (error) {
      setError(error)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    } else {
      router.push("/pods")
    }
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

      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Boxes className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pod Settings</h1>
              <p className="text-muted-foreground">
                Manage your pod details
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-6 border-b space-y-4">
          <h2 className="text-lg font-semibold mb-4">General Information</h2>
          
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Pod Name</label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={pod.title}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-medium">Description</label>
            <textarea
              id="summary"
              name="summary"
              defaultValue={pod.summary || ""}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <span className="text-sm text-muted-foreground">
              NPN: <span className="font-mono font-medium">{pod.npn}</span>
            </span>
          </div>
        </form>

        {isFounder && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete a pod, there is no going back. All projects, tasks, 
              messages, and files will be permanently deleted.
            </p>
            
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm hover:bg-destructive/90 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Pod
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
