"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters."),
    username: z.string().min(3, "Username must be at least 3 characters.").optional().or(z.literal("")),
    bio: z.string().max(500, "Bio must be less than 500 characters.").optional().or(z.literal("")),
    skills: z.string().optional(),
    interests: z.string().optional(),
})

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: "Not authenticated" }
    }

    const rawData = {
        full_name: formData.get("full_name"),
        username: formData.get("username"),
        bio: formData.get("bio"),
        skills: formData.get("skills"),
        interests: formData.get("interests"),
    }

    const validatedData = profileSchema.safeParse(rawData)

    if (!validatedData.success) {
        return { error: "Invalid form data. Please check your inputs." }
    }

    const { full_name, username, bio, skills, interests } = validatedData.data

    const skillsArray = skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : []
    const interestsArray = interests ? interests.split(",").map(s => s.trim()).filter(Boolean) : []

    const updateData: {
        full_name: string;
        bio: string | null;
        skills: string[];
        interests: string[];
        username?: string;
    } = {
        full_name,
        bio: bio || null,
        skills: skillsArray,
        interests: interestsArray,
    }

    if (username) {
        updateData.username = username;
    }

    const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)

    if (error) {
        if (error.code === '23505') {
            return { error: "Username is already taken." }
        }
        return { error: "Failed to update profile." }
    }

    revalidatePath("/profile")
    revalidatePath("/dashboard")
    return { success: true }
}
