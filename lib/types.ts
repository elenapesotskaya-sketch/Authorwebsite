export interface Story {
  id: string
  title: string
  slug: string
  description: string
  content: string
  image_url: string | null
  published: boolean
  likes_count: number
  views_count: number
  created_at: string
  updated_at: string
  story_date?: string | null
}

export interface Comment {
  id: string
  story_id: string
  author_name: string
  author_email: string
  author_identifier: string | null
  content: string
  created_at: string
}

export interface StoryLike {
  id: string
  story_id: string
  user_identifier: string
  created_at: string
}

export interface AuthorProfile {
  id: string
  name: string
  bio: string
  about: string
  avatar_url: string | null
  updated_at: string
}
