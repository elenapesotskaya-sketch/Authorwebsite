"use client"
import type { Comment, Story } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AdminCommentsProps {
  stories: Story[]
  allComments: Array<Comment & { story_title: string }>
}

export function AdminComments({ stories, allComments: initialComments }: AdminCommentsProps) {
  const [comments, setComments] = useState(initialComments)
  const [filter, setFilter] = useState<string>("all")
  const router = useRouter()

  const handleDelete = async (commentId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) {
      return
    }

    const previousComments = comments
    setComments(comments.filter((c) => c.id !== commentId))

    try {
      const supabase = createClient()
      const { error } = await supabase.from("comments").delete().eq("id", commentId)

      if (error) {
        console.error("[v0] Delete error:", error)
        alert("Не удалось удалить комментарий")
        setComments(previousComments)
        return
      }

      console.log("[v0] Comment deleted successfully:", commentId)
    } catch (error) {
      console.error("[v0] Delete exception:", error)
      alert("Произошла ошибка при удалении")
      setComments(previousComments)
    }
  }

  const filteredComments = filter === "all" ? comments : comments.filter((c) => c.story_id === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-semibold text-primary">Все комментарии ({comments.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background"
        >
          <option value="all">Все рассказы</option>
          {stories.map((story) => (
            <option key={story.id} value={story.id}>
              {story.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Нет комментариев</p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{comment.author_name}</p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-primary font-medium mb-2">К рассказу: {comment.story_title}</p>
                    <p className="text-foreground leading-relaxed">{comment.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-destructive ml-4"
                    title="Удалить комментарий"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
