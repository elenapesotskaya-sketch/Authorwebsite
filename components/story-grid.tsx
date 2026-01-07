import type { Story } from "@/lib/types"
import { StoryCard } from "@/components/story-card"

interface StoryGridProps {
  stories: Story[] | null
}

export function StoryGrid({ stories }: StoryGridProps) {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-muted-foreground">Рассказы не найдены</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}
