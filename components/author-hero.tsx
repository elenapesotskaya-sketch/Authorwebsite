import type { AuthorProfile } from "@/lib/types"
import Image from "next/image"

interface AuthorHeroProps {
  profile: AuthorProfile | null
}

export function AuthorHero({ profile }: AuthorHeroProps) {
  if (!profile) return null

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-shrink-0">
              <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-primary/20">
                <Image
                  src={profile.avatar_url || "/placeholder.svg?height=400&width=400"}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-primary text-balance">
                {profile.name}
              </h1>
              <p className="text-lg md:text-xl mb-6 leading-relaxed text-foreground">{profile.bio}</p>
              <div className="bg-card/50 p-6 rounded-lg border border-border">
                <h2 className="text-xl font-serif font-semibold mb-3 text-primary">Об авторе</h2>
                <p className="leading-relaxed text-muted-foreground">{profile.about}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
