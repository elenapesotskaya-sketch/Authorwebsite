import { createClient } from "@/lib/supabase/server"
import type { Story } from "@/lib/types"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Pagination } from "@/components/pagination"
import Link from "next/link"

export const revalidate = 0

export default async function AllStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; order?: string }>
}) {
  const { page, order } = await searchParams
  const currentPage = page ? Math.max(1, Number.parseInt(page)) : 1
  const itemsPerPage = 20
  const sortOrder = order === "desc" ? "desc" : "asc"
  const isDescending = sortOrder === "desc"

  try {
    const supabase = await createClient()

    const { data: stories, error: storiesError } = await supabase
      .from("stories")
      .select("*")
      .eq("published", true)
      .order("story_date", { ascending: !isDescending })

    if (storiesError) {
      throw new Error(`Failed to load stories: ${storiesError.message}`)
    }

    const parseYear = (dateStr: string | null): number => {
      if (!dateStr) return new Date().getFullYear()

      const parts = dateStr.trim().split(".")
      if (parts.length === 2) {
        const year = Number.parseInt(parts[1].trim())
        return isNaN(year) ? new Date().getFullYear() : year
      }

      return new Date().getFullYear()
    }

    // Group stories by year
    const storiesByYear = (stories || []).reduce(
      (acc, story) => {
        const year = parseYear(story.story_date)
        if (!acc[year]) {
          acc[year] = []
        }
        acc[year].push(story)
        return acc
      },
      {} as Record<number, Story[]>,
    )

    const sortedYears = Object.keys(storiesByYear)
      .map(Number)
      .sort((a, b) => (isDescending ? b - a : a - b))

    // Flatten to list for pagination
    const flatList: Array<{ year: number; story: Story; index: number }> = []
    sortedYears.forEach((year) => {
      storiesByYear[year].forEach((story, idx) => {
        flatList.push({ year, story, index: idx + 1 })
      })
    })

    const totalPages = Math.ceil(flatList.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = flatList.slice(startIndex, endIndex)

    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />

        <div
          className="relative text-white py-12 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: "url('/abstract-nature-landscape-mountains-forest-serene.jpg')",
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Все рассказы</h1>

              <Link
                href={`/stories?order=${isDescending ? "asc" : "desc"}${currentPage > 1 ? `&page=${currentPage}` : ""}`}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                title={isDescending ? "От ранних к поздним" : "От поздних к ранним"}
              >
                <span className="text-sm text-white">Сортировка</span>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isDescending ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  )}
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 bg-neutral-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              {sortedYears.map((year) => {
                const yearStories = storiesByYear[year]
                const firstInView = paginatedItems.find((item) => item.year === year)

                if (!firstInView) return null

                return (
                  <div key={year} className="space-y-4 bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-300 pb-2">{year}</h2>
                    <ol className="space-y-3 list-none">
                      {yearStories.map((story, idx) => {
                        const globalIndex = flatList.findIndex((item) => item.story.id === story.id)
                        const isInCurrentPage = globalIndex >= startIndex && globalIndex < endIndex

                        if (!isInCurrentPage) return null

                        return (
                          <li key={story.id}>
                            <Link
                              href={`/story/${story.slug}`}
                              className="flex items-start gap-3 hover:text-slate-800 transition-colors group text-slate-600"
                            >
                              <span className="text-slate-400 font-mono text-sm mt-1 flex-shrink-0 w-8">
                                {idx + 1}.
                              </span>
                              <span className="group-hover:underline">{story.title}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                )
              })}
            </div>

            <div className="mt-12">
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error("[v0] Stories list error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ошибка загрузки</h1>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Неизвестная ошибка"}</p>
        </div>
      </div>
    )
  }
}
