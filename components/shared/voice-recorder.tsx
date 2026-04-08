"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Mic, StopCircle, Play, Pause, Trash2, Loader2 } from "lucide-react"

interface VoiceRecorderProps {
  bucket?: string
  onRecordingComplete?: (url: string, duration: number) => void
  onError?: (error: string) => void
  maxDuration?: number // in seconds
  className?: string
  disabled?: boolean
}

export function VoiceRecorder({
  bucket = "voice-notes",
  onRecordingComplete,
  onError,
  maxDuration = 60, // 60 seconds default
  className,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const supabase = createClient()

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)
    } catch (err) {
      console.error("Microphone permission denied:", err)
      setHasPermission(false)
    }
  }, [])

  useEffect(() => {
    requestPermission()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [requestPermission])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error("Failed to start recording:", err)
      onError?.("Failed to access microphone")
    }
  }, [maxDuration, onError])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const playRecording = useCallback(() => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }, [audioUrl, isPlaying])

  const discardRecording = useCallback(() => {
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
  }, [audioUrl])

  const uploadRecording = useCallback(async () => {
    if (!audioUrl || !audioUrl.startsWith("blob:")) return

    setIsUploading(true)

    try {
      const response = await fetch(audioUrl)
      const audioBlob = await response.blob()
      
      const fileExt = "webm"
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${bucket}/${fileName}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, audioBlob, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onRecordingComplete?.(urlData.publicUrl, recordingTime)
      discardRecording()
    } catch (err) {
      console.error("Upload error:", err)
      onError?.("Failed to upload voice note")
    } finally {
      setIsUploading(false)
    }
  }, [audioUrl, bucket, recordingTime, supabase, onRecordingComplete, onError, discardRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Hidden audio element for playback
  audioRef.current = audioUrl
    ? new Audio(audioUrl)
    : null

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false)
    }
  }, [audioUrl])

  if (disabled) return null

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!audioUrl ? (
        <>
          {isRecording ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-mono text-red-500">
                  {formatTime(recordingTime)}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {formatTime(maxDuration)}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-red-500/20 text-red-500 hover:bg-red-500/10"
                onClick={stopRecording}
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={startRecording}
              disabled={!hasPermission}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <>
          <audio ref={audioRef} src={audioUrl} />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={playRecording}
            >
              {isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
            <span className="text-xs font-mono text-muted-foreground">
              {formatTime(recordingTime)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-500"
            onClick={discardRecording}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="h-8 bg-violet-600 hover:bg-violet-700"
            onClick={uploadRecording}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </>
      )}
    </div>
  )
}
