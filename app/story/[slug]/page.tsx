import { createClient } from "@/lib/supabase/server"
import type { Story, Comment } from "@/lib/types"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoryContent } from "@/components/story-content"
import { LikeButton } from "@/components/like-button"
import { CommentsSection } from "@/components/comments-section"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export const revalidate = 0

async function getStory(slug: string): Promise<{ story: Story | null; comments: Comment[] }> {
  const supabase = await createClient()

  console.log("[v0] Looking for story with slug:", slug)

  const { data: stories, error } = await supabase.from("stories").select("*").eq("slug", slug).eq("published", true)

  console.log("[v0] Query result:", { stories, error })

  if (!stories || stories.length === 0) {
    console.log("[v0] Story not found")
    return { story: null, comments: [] }
  }

  const story = stories[0]

  // Increment view count
  await supabase
    .from("stories")
    .update({ views_count: story.views_count + 1 })
    .eq("id", story.id)

  // Get comments
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("story_id", story.id)
    .order("created_at", { ascending: false })

  return { story: story as Story, comments: (comments as Comment[]) || [] }
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { story, comments } = await getStory(slug)

  if (!story) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <Button variant="ghost" className="mb-6">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Вернуться к рассказам
              </Button>
            </Link>

            {story.image_url && (
              <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={story.image_url || "/placeholder.svg"}
                  alt={story.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-primary text-balance">
                {story.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">{story.description}</p>
              <div className="flex items-center gap-6 text-muted-foreground border-y border-border py-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span>{story.views_count} просмотров</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{story.likes_count} лайков</span>
                </div>
              </div>
            </header>

            <StoryContent content={story.content} />

            <div className="mt-8 pt-8 border-t border-border">
              <LikeButton storyId={story.id} initialLikes={story.likes_count} />
            </div>

            <div className="mt-12">
              <CommentsSection storyId={story.id} comments={comments} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
