import { createClient } from "@/lib/supabase/server"
import type { AuthorProfile, Story } from "@/lib/types"
import { AuthorHero } from "@/components/author-hero"
import { StoryGrid } from "@/components/story-grid"
import { SearchBar } from "@/components/search-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Pagination } from "@/components/pagination"

export const revalidate = 0

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; page?: string }>
}) {
  const { search, sort, page } = await searchParams

  const currentPage = page ? Math.max(1, Number.parseInt(page)) : 1
  const itemsPerPage = 9

  try {
    const supabase = await createClient()

    console.log("[v0] Fetching author profile...")
    const { data: profile, error: profileError } = await supabase.from("author_profile").select("*")

    if (profileError) {
      console.error("[v0] Profile error:", profileError)
      throw new Error(`Failed to load profile: ${profileError.message}`)
    }

    console.log("[v0] Fetching stories...")
    let query = supabase.from("stories").select("*").eq("published", true)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data: stories, error: storiesError } = await query

    if (storiesError) {
      console.error("[v0] Stories error:", storiesError)
      throw new Error(`Failed to load stories: ${storiesError.message}`)
    }

    let sortedStories = stories || []
    if (sort === "date") {
      const parseStoryDate = (dateStr: string | null): Date => {
        if (!dateStr) return new Date() // Stories without date are considered newest

        // Handle format: "MM.YYYY" or "M.YYYY"
        const parts = dateStr.trim().split(".")
        if (parts.length === 2) {
          const monthPart = parts[0].trim()
          const yearPart = parts[1].trim()

          let month = 0
          const year = Number.parseInt(yearPart)

          if (isNaN(year)) {
            console.warn(`[v0] Invalid year in story_date: ${dateStr}`)
            return new Date()
          }

          // Try parsing as number first (01, 12, etc)
          const monthNum = Number.parseInt(monthPart)
          if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
            month = monthNum - 1 // JS months are 0-indexed
          } else {
            // Try parsing as month name
            const monthNames = [
              "январь",
              "февраль",
              "март",
              "апрель",
              "май",
              "июнь",
              "июль",
              "август",
              "сентябрь",
              "октябрь",
              "ноябрь",
              "декабрь",
            ]
            const monthIndex = monthNames.findIndex((m) => m.toLowerCase().startsWith(monthPart.toLowerCase()))
            if (monthIndex !== -1) {
              month = monthIndex
            } else {
              console.warn(`[v0] Invalid month in story_date: ${dateStr}`)
              return new Date()
            }
          }

          return new Date(year, month, 1)
        }

        console.warn(`[v0] Invalid story_date format: ${dateStr}`)
        return new Date()
      }

      sortedStories = [...sortedStories].sort((a, b) => {
        const dateA = parseStoryDate(a.story_date)
        const dateB = parseStoryDate(b.story_date)

        // Sort from newest to oldest (descending)
        return dateB.getTime() - dateA.getTime()
      })

      console.log("[v0] Sorted by date (newest first)")
    } else {
      sortedStories = [...sortedStories].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      console.log("[v0] Sorted by popularity (likes)")
    }

    console.log("[v0] Loaded", sortedStories.length, "stories")

    const totalPages = Math.ceil(sortedStories.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedStories = sortedStories.slice(startIndex, endIndex)

    console.log(`[v0] Page ${currentPage} of ${totalPages} (showing ${paginatedStories.length} stories)`)

    const profileData = Array.isArray(profile) && profile.length > 0 ? profile[0] : profile

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AuthorHero profile={profileData as AuthorProfile} />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto mb-8">
              <SearchBar initialSearch={search} initialSort={sort || "likes"} />
            </div>
            <StoryGrid stories={paginatedStories as Story[]} />
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error("[v0] Page error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Page</h1>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
        </div>
      </div>
    )
  }
}
