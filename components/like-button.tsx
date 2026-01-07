"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  storyId: string
  initialLikes: number
}

export function LikeButton({ storyId, initialLikes }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user already liked this story
    const checkLiked = async () => {
      const userIdentifier = getUserIdentifier()
      const supabase = createClient()

      const { data } = await supabase
        .from("story_likes")
        .select("id")
        .eq("story_id", storyId)
        .eq("user_identifier", userIdentifier)
        .single()

      setLiked(!!data)
    }

    checkLiked()
  }, [storyId])

  const getUserIdentifier = () => {
    // Use localStorage to create a persistent user identifier
    let identifier = localStorage.getItem("user_identifier")
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("user_identifier", identifier)
    }
    return identifier
  }

  const handleLike = async () => {
    setLoading(true)
    const userIdentifier = getUserIdentifier()
    const supabase = createClient()

    if (liked) {
      // Unlike
      const { error } = await supabase
        .from("story_likes")
        .delete()
        .eq("story_id", storyId)
        .eq("user_identifier", userIdentifier)

      if (!error) {
        setLiked(false)
        setLikes(likes - 1)
        router.refresh()
      }
    } else {
      // Like
      const { error } = await supabase.from("story_likes").insert({
        story_id: storyId,
        user_identifier: userIdentifier,
      })

      if (!error) {
        setLiked(true)
        setLikes(likes + 1)
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <Button onClick={handleLike} disabled={loading} variant={liked ? "default" : "outline"} size="lg" className="gap-2">
      <svg
        className={`h-5 w-5 ${liked ? "fill-current" : ""}`}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {liked ? "Вам понравился этот рассказ" : "Понравился рассказ?"}
      <span className="ml-2">({likes})</span>
    </Button>
  )
}
