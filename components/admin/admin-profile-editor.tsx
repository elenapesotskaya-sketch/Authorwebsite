"use client"

import type React from "react"

import type { AuthorProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AdminProfileEditorProps {
  profile: AuthorProfile
}

export function AdminProfileEditor({ profile: initialProfile }: AdminProfileEditorProps) {
  const [name, setName] = useState(initialProfile.name)
  const [bio, setBio] = useState(initialProfile.bio)
  const [about, setAbout] = useState(initialProfile.about)
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("author_profile")
      .update({
        name,
        bio,
        about,
        avatar_url: avatarUrl || null,
      })
      .eq("id", initialProfile.id)

    if (updateError) {
      setError("Не удалось сохранить профиль")
      setLoading(false)
      return
    }

    setSuccess(true)
    router.refresh()
    setLoading(false)

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Редактирование профиля автора</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Имя автора</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="KONSTANTIN POLUNIN" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Краткая биография</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Короткое описание автора"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">Подробное описание</Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Подробное описание стиля и творчества"
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Фотография автора</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="/placeholder.svg?height=400&width=400 или URL"
                  className="mb-2"
                />
                <div className="flex items-center gap-2">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("imageUpload")?.click()}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Загрузить с компьютера
                  </Button>
                </div>
              </div>
              {avatarUrl && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-border">
                  <img src={avatarUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">Профиль успешно сохранён!</p>}

          <Button onClick={handleSave} disabled={loading} size="lg">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
