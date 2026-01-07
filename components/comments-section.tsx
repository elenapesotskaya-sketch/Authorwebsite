"use client"

import type React from "react"

import type { Comment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CommentsSectionProps {
  storyId: string
  comments: Comment[]
  isAdminMode?: boolean
}

export function CommentsSection({ storyId, comments: initialComments, isAdminMode = false }: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userIdentifier, setUserIdentifier] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    let identifier = localStorage.getItem("user_identifier")
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("user_identifier", identifier)
    }
    setUserIdentifier(identifier)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error: submitError } = await supabase
      .from("comments")
      .insert({
        story_id: storyId,
        author_name: name,
        content: content,
        author_identifier: userIdentifier,
      })
      .select()

    if (submitError) {
      console.log("[v0] Comment submit error:", submitError)
      setError("Не удалось отправить комментарий. Попробуйте снова.")
      setLoading(false)
      return
    }

    if (data && Array.isArray(data) && data.length > 0) {
      setComments([data[0] as Comment, ...comments])
      setName("")
      setContent("")
    }

    setLoading(false)
    router.refresh()
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) {
      return
    }

    const previousComments = comments
    setComments(comments.filter((c) => c.id !== commentId))

    const supabase = createClient()
    const { error: deleteError } = await supabase.from("comments").delete().eq("id", commentId)

    if (deleteError) {
      console.log("[v0] Delete error:", deleteError)
      alert("Не удалось удалить комментарий")
      setComments(previousComments)
      return
    }

    console.log("[v0] Comment deleted successfully:", commentId)
  }

  const canDeleteComment = (comment: Comment) => {
    return isAdminMode || comment.author_identifier === userIdentifier
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold mb-6 text-primary flex items-center gap-2">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Комментарии ({comments.length})
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Оставить комментарий</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <Label htmlFor="content">Комментарий</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Поделитесь своими мыслями о рассказе..."
                  rows={4}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Отправка..." : "Отправить комментарий"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Пока нет комментариев. Будьте первым!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{comment.author_name}</p>
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
                  {canDeleteComment(comment) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(comment.id)}
                      className="text-muted-foreground hover:text-destructive"
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
                  )}
                </div>
                <p className="text-foreground leading-relaxed">{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
