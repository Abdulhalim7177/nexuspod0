"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, FileText, Image, Upload, Loader2 } from "lucide-react"

interface FileUploadProps {
  bucket?: string
  onUploadComplete?: (url: string, fileName: string, fileSize: number, mimeType: string) => void
  onError?: (error: string) => void
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  multiple?: boolean
  className?: string
  disabled?: boolean
}

export function FileUpload({
  bucket = "files",
  onUploadComplete,
  onError,
  maxSize = 50 * 1024 * 1024, // 50MB default
  acceptedTypes,
  multiple = false,
  className,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const supabase = createClient()

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      setUploading(true)
      setProgress(0)

      const uploadedUrls: string[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]

        // Validate size
        if (file.size > maxSize) {
          onError?.(`File "${file.name}" exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`)
          continue
        }

        // Validate type
        if (acceptedTypes && acceptedTypes.length > 0) {
          const isAccepted = acceptedTypes.some((type) => {
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", ""))
            }
            return file.type === type
          })
          if (!isAccepted) {
            onError?.(`File "${file.name}" is not an accepted file type`)
            continue
          }
        }

        try {
          const fileExt = file.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `${bucket}/${fileName}`

          // Upload with progress simulation
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (error) {
            throw error
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

          uploadedUrls.push(urlData.publicUrl)
          setProgress(Math.round(((i + 1) / fileArray.length) * 100))
        } catch (err) {
          console.error("Upload error:", err)
          onError?.(`Failed to upload "${file.name}"`)
        }
      }

      setUploading(false)
      setProgress(0)

      if (uploadedUrls.length > 0) {
        const file = fileArray[0]
        onUploadComplete?.(
          uploadedUrls[0],
          file.name,
          file.size,
          file.type
        )
      }
    },
    [bucket, maxSize, acceptedTypes, supabase, onUploadComplete, onError]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled || uploading) return

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        if (multiple) {
          handleUpload(files)
        } else {
          handleUpload([files[0]])
        }
      }
    },
    [disabled, uploading, multiple, handleUpload]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        if (multiple) {
          handleUpload(files)
        } else {
          handleUpload([files[0]])
        }
      }
      // Reset input
      e.target.value = ""
    },
    [multiple, handleUpload]
  )

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-4 transition-colors",
          dragActive
            ? "border-violet-500 bg-violet-500/10"
            : "border-border hover:border-violet-500/50",
          (disabled || uploading) && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes?.join(",")}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm font-medium">Uploading...</p>
              <Progress value={progress} className="w-full max-w-[200px]" />
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Max {Math.round(maxSize / 1024 / 1024)}MB
                  {acceptedTypes && ` • ${acceptedTypes.join(", ")}`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface FileAttachmentProps {
  url: string
  fileName: string
  fileSize?: number
  mimeType?: string
  onRemove?: () => void
  compact?: boolean
}

export function FileAttachment({
  url,
  fileName,
  fileSize,
  mimeType,
  onRemove,
  compact = false,
}: FileAttachmentProps) {
  const isImage = mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {isImage ? (
          <Image className="h-4 w-4 text-violet-500" />
        ) : (
          <FileText className="h-4 w-4 text-violet-500" />
        )}
        <span className="truncate max-w-[150px]">{fileName}</span>
        {fileSize && (
          <span className="text-muted-foreground text-xs">
            ({formatFileSize(fileSize)})
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
      {isImage ? (
        <img
          src={url}
          alt={fileName}
          className="h-12 w-12 rounded-lg object-cover"
        />
      ) : (
        <div className="h-12 w-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
          {getFileIcon(mimeType || "")}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        {fileSize && (
          <p className="text-xs text-muted-foreground">
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
