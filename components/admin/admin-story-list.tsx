"use client"

import type { Story } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { StoryEditor } from "@/components/admin/story-editor"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface AdminStoryListProps {
  stories: Story[]
}

export function AdminStoryList({ stories: initialStories }: AdminStoryListProps) {
  const [stories, setStories] = useState(initialStories ?? [])
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCreate = () => {
    setIsCreating(true)
    setEditingStory(null)
  }

  const handleEdit = (story: Story) => {
    setEditingStory(story)
    setIsCreating(false)
  }

  const handleClose = () => {
    setEditingStory(null)
    setIsCreating(false)
  }

  const handleSave = (updatedStory: Story) => {
    if (isCreating) {
      setStories([updatedStory, ...stories])
    } else {
      setStories(stories.map((s) => (s.id === updatedStory.id ? updatedStory : s)))
    }
    handleClose()
  }

  const handleDelete = async (story: Story) => {
    if (!confirm(`Вы уверены, что хотите удалить рассказ "${story.title}"? Это действие нельзя отменить.`)) {
      return
    }

    setDeletingId(story.id)
    try {
      const supabase = createClient()

      console.log("[v0] Deleting story:", story.id)

      const { error } = await supabase.from("stories").delete().eq("id", story.id)

      if (error) {
        console.error("[v0] Delete error:", error)
        toast({
          title: "Ошибка",
          description: `Не удалось удалить рассказ: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      // Remove from local state
      setStories(stories.filter((s) => s.id !== story.id))

      toast({
        title: "Рассказ удален",
        description: `Рассказ "${story.title}" успешно удален.`,
      })
    } catch (error) {
      console.error("[v0] Delete exception:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить рассказ",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (editingStory || isCreating) {
    return <StoryEditor story={editingStory} onSave={handleSave} onCancel={handleClose} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-semibold text-primary">Управление рассказами</h2>
        <Button onClick={handleCreate}>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать рассказ
        </Button>
      </div>

      <div className="grid gap-4">
        {stories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Рассказов пока нет. Создайте первый рассказ!</p>
            </CardContent>
          </Card>
        ) : (
          stories.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {story.title}
                      {!story.published && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Черновик</span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{story.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(story)}>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(story)}
                      disabled={deletingId === story.id}
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      {deletingId === story.id ? "Удаление..." : "Удалить"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {story.published ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                    <span>{story.published ? "Опубликовано" : "Не опубликовано"}</span>
                  </div>
                  <span>❤️ {story.likes_count}</span>
                  <span>👁️ {story.views_count}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
