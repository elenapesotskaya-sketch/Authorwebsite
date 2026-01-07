"use client"

import type React from "react"

import type { Story } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface StoryEditorProps {
  story: Story | null
  onSave: (story: Story) => void
  onCancel: () => void
}

export function StoryEditor({ story, onSave, onCancel }: StoryEditorProps) {
  const [title, setTitle] = useState(story?.title || "")
  const [slug, setSlug] = useState(story?.slug || "")
  const [description, setDescription] = useState(story?.description || "")
  const [content, setContent] = useState(story?.content || "")
  const [imageUrl, setImageUrl] = useState(story?.image_url || "")
  const [published, setPublished] = useState(story?.published ?? true)
  const [storyDate, setStoryDate] = useState(story?.story_date || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!story) {
      setSlug(generateSlug(value))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      // Convert to base64 for display
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError("Не удалось загрузить изображение")
      setUploadingImage(false)
    }
  }

  const getImageUrl = () => {
    if (imageUrl) return imageUrl
    // Auto-generate placeholder with query based on title and description
    const query = encodeURIComponent(`${title} ${description}`.slice(0, 100))
    return `/placeholder.svg?height=600&width=800&query=${query}`
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Пожалуйста, введите название рассказа")
      return
    }
    if (!slug.trim()) {
      setError("Пожалуйста, введите URL-адрес")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const storyData = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || "Рассказ от Константина Полунина",
      content: content.trim() || "",
      image_url: getImageUrl(),
      published,
      story_date: storyDate.trim() || null,
    }

    console.log("[v0] Saving story:", storyData)

    try {
      if (story) {
        const { error: updateError } = await supabase.from("stories").update(storyData).eq("id", story.id)

        console.log("[v0] Update completed, error:", updateError)

        if (updateError) {
          console.error("[v0] Update error:", updateError.message)
          setError(`Не удалось сохранить рассказ: ${updateError.message}`)
          setLoading(false)
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 100))

        const { data: freshData, error: selectError } = await supabase.from("stories").select("*").eq("id", story.id)

        console.log("[v0] Fresh data fetched:", freshData)

        if (selectError) {
          console.error("[v0] Select error:", selectError.message)
          setError(`Не удалось получить обновленные данные: ${selectError.message}`)
          setLoading(false)
          return
        }

        if (!freshData || !Array.isArray(freshData) || freshData.length === 0) {
          console.error("[v0] No data returned from select")
          // Still consider it a success if update worked
          const fullStory: Story = {
            ...storyData,
            id: story.id,
            created_at: story.created_at,
          } as Story
          onSave(fullStory)
        } else {
          const updatedStory = freshData[0] as Story
          console.log("[v0] Story updated successfully:", updatedStory)
          onSave(updatedStory)
        }
      } else {
        const { data, error: insertError } = await supabase.from("stories").insert([storyData]).select()

        console.log("[v0] Insert response:", { data, error: insertError })

        if (insertError) {
          console.error("[v0] Insert error:", insertError.message)
          setError(`Не удалось создать рассказ: ${insertError.message}`)
          setLoading(false)
          return
        }

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.error("[v0] No data returned from insert")
          setError("Не удалось создать рассказ: данные не вернулись")
          setLoading(false)
          return
        }

        const newStory = data[0] as Story
        console.log("[v0] Story created successfully:", newStory)
        onSave(newStory)
      }

      router.refresh()
      setLoading(false)
    } catch (err) {
      console.error("[v0] Save error:", err)
      setError(`Произошла ошибка при сохранении: ${err instanceof Error ? err.message : "Неизвестная ошибка"}`)
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault()
      applyFormatting("**")
    } else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault()
      applyFormatting("*")
    }
  }

  const applyFormatting = (symbol: "**" | "*") => {
    const textarea = contentTextareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    if (selectedText) {
      // Wrap selected text
      const beforeText = content.substring(0, start)
      const afterText = content.substring(end)
      const formattedText = `${symbol}${selectedText}${symbol}`
      const newContent = beforeText + formattedText + afterText

      setContent(newContent)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + symbol.length, end + symbol.length)
      }, 0)
    } else {
      // Insert formatting markers at cursor
      const beforeText = content.substring(0, start)
      const afterText = content.substring(start)
      const placeholder = symbol === "**" ? "жирный текст" : "курсив"
      const formattedText = `${symbol}${placeholder}${symbol}`
      const newContent = beforeText + formattedText + afterText

      setContent(newContent)

      // Select placeholder text
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + symbol.length, start + symbol.length + placeholder.length)
      }, 0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel}>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад
        </Button>
        <h2 className="text-2xl font-serif font-semibold text-primary">
          {story ? "Редактировать рассказ" : "Создать рассказ"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о рассказе</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Название рассказа"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL-адрес (slug) *</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-adres-rasskaza" />
            <p className="text-xs text-muted-foreground">Используется в адресе страницы: /story/{slug}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Краткое описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание рассказа для превью"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Полный текст</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting("**")}
                  title="Жирный (Ctrl+B)"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h12M6 6h12M6 18h12" />
                  </svg>
                  <span className="ml-1 font-bold">B</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting("*")}
                  title="Курсив (Ctrl+I)"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6l4 12M7 18h10M9 6h6" />
                  </svg>
                  <span className="ml-1 italic">I</span>
                </Button>
              </div>
            </div>
            <Textarea
              ref={contentTextareaRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Полный текст рассказа. Используйте **жирный** и *курсив* для форматирования, или нажмите Ctrl+B и Ctrl+I"
              rows={12}
            />
            <p className="text-xs text-muted-foreground">
              Форматирование: **жирный текст** и *курсив*. Горячие клавиши: Ctrl+B (жирный), Ctrl+I (курсив)
            </p>
          </div>

          <div className="space-y-4">
            <Label>Изображение</Label>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {uploadingImage ? "Загрузка..." : "Загрузить с компьютера"}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Или введите URL изображения</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Если не указано, изображение будет создано автоматически на основе названия и описания
              </p>
            </div>

            {(imageUrl || title) && (
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Предпросмотр изображения:</p>
                <div className="relative h-48 bg-muted rounded overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg
                          className="h-12 w-12 mx-auto mb-2 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
                          <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2} />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15l-5-5L5 21" />
                        </svg>
                        <p className="text-sm text-muted-foreground">Изображение будет создано автоматически</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storyDate">Дата создания рассказа</Label>
            <Input
              id="storyDate"
              value={storyDate}
              onChange={(e) => setStoryDate(e.target.value)}
              placeholder="12.2021 или 01.2024"
            />
            <p className="text-xs text-muted-foreground">
              Необязательное поле. Формат: месяц.год (например: 12.2021 или 01.2024)
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <Label htmlFor="published" className="cursor-pointer">
                Опубликовать рассказ
              </Label>
              <p className="text-sm text-muted-foreground">Опубликованные рассказы видны на сайте</p>
            </div>
            <Switch id="published" checked={published} onCheckedChange={setPublished} />
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={loading} size="lg">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              {loading ? "Сохранение..." : "Сохранить и опубликовать"}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
