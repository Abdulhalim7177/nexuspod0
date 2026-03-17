"use client"

import { useState } from "react"
import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileForm({ initialData, email }: { initialData: any, email: string }) {
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateProfile(formData)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else if (result?.success) {
            setMessage({ type: 'success', text: "Profile updated successfully." })
        }

        setIsPending(false)
    }

    const initials = initialData.full_name
        ? initialData.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "NP"

    return (
        <Card className="glass-card shadow-sm border-border/50">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                    Update your profile details, skills, and bio.
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 rounded-2xl border-2 border-border/50">
                            <AvatarImage src={initialData.avatar_url} />
                            <AvatarFallback className="rounded-2xl text-2xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="font-medium text-sm">Profile Picture</h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                Avatar uploads will be available in a future update.
                            </p>
                            <Button type="button" variant="outline" size="sm" disabled>Change Avatar</Button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" name="full_name" defaultValue={initialData.full_name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" defaultValue={initialData.username || ""} placeholder="nexusbuilder" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={email} disabled className="bg-muted/50" />
                        <p className="text-xs text-muted-foreground">Your email is managed by your authentication provider.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={initialData.bio || ""}
                            placeholder="Tell us a little bit about yourself and what you're building..."
                            className="resize-none h-24"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills (comma separated)</Label>
                            <Input id="skills" name="skills" defaultValue={(initialData.skills || []).join(", ")} placeholder="React, Node.js, Design" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interests">Interests (comma separated)</Label>
                            <Input id="interests" name="interests" defaultValue={(initialData.interests || []).join(", ")} placeholder="SaaS, AI, Fintech" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 px-6 py-4">
                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto ml-auto">
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
