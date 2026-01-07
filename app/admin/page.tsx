"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Story, AuthorProfile, Comment } from "@/lib/types"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStoryList } from "@/components/admin/admin-story-list"
import { AdminProfileEditor } from "@/components/admin/admin-profile-editor"
import { AdminComments } from "@/components/admin/admin-comments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ADMIN_PASSWORD = "1814"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [stories, setStories] = useState<Story[]>([])
  const [profile, setProfile] = useState<AuthorProfile | null>(null)
  const [comments, setComments] = useState<Array<Comment & { story_title: string }>>([])
  const [loading, setLoading] = useState(true)

  const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost"

  useEffect(() => {
    if (!isProduction) {
      setIsAuthenticated(true)
      loadData()
    } else {
      const authStatus = sessionStorage.getItem("admin_authenticated")
      if (authStatus === "true") {
        setIsAuthenticated(true)
        loadData()
      } else {
        setLoading(false)
      }
    }
  }, [isProduction])

  const loadData = async () => {
    const supabase = createClient()

    const { data: storiesData } = await supabase.from("stories").select("*").order("created_at", { ascending: false })
    const { data: profileData } = await supabase.from("author_profile").select("*")

    const { data: commentsData } = await supabase.from("comments").select("*").order("created_at", { ascending: false })

    const storyMap = new Map((storiesData || []).map((s: any) => [s.id, s.title]))

    const commentsWithTitles = (commentsData || []).map((c: any) => ({
      ...c,
      story_title: storyMap.get(c.story_id) || "Неизвестный рассказ",
    }))

    setStories((storiesData || []) as Story[])
    setProfile((Array.isArray(profileData) ? profileData[0] : profileData) as AuthorProfile)
    setComments(commentsWithTitles)
    setLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authenticated", "true")
      setIsAuthenticated(true)
      setError("")
      loadData()
    } else {
      setError("Неверный пароль")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (isProduction && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Вход для автора</CardTitle>
            <CardDescription>Введите пароль для доступа к редактированию</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center text-lg"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full">
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Панель управления</h1>
          <p className="text-muted-foreground">Управляйте рассказами и профилем автора</p>
        </div>

        <Tabs defaultValue="stories" className="space-y-8">
          <TabsList>
            <TabsTrigger value="stories">Рассказы</TabsTrigger>
            <TabsTrigger value="profile">Профиль автора</TabsTrigger>
            <TabsTrigger value="comments">Комментарии ({comments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            <AdminStoryList stories={stories} />
          </TabsContent>

          <TabsContent value="profile">
            <AdminProfileEditor profile={profile} />
          </TabsContent>

          <TabsContent value="comments">
            <AdminComments stories={stories} allComments={comments} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
