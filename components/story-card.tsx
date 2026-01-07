"use client"

import type { Story } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface StoryCardProps {
  story: Story
  showEditButton?: boolean
  onEdit?: (story: Story) => void
}

export function StoryCard({ story, showEditButton = false, onEdit }: StoryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group">
      <Link href={`/story/${story.slug}`} className="flex-1 flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={story.image_url || "/placeholder.svg?height=400&width=600"}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="flex-1 pt-6">
          <h3 className="text-xl font-serif font-semibold mb-3 text-primary text-balance">{story.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{story.description}</p>
          {story.story_date && (
            <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{story.story_date}</span>
            </div>
          )}
          {!story.story_date && story.created_at && (
            <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {new Date(story.created_at).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground w-full">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{story.likes_count}</span>
            </div>
            <div className="flex items-center gap-1">
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
              <span>{story.views_count}</span>
            </div>
            {showEditButton && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={(e) => {
                  e.preventDefault()
                  onEdit(story)
                }}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Редактировать
              </Button>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}
