-- Create stories table with all fields for the author website
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create likes table to track individual likes
CREATE TABLE IF NOT EXISTS public.story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL, -- Can be email or session ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_identifier)
);

-- Create author profile table
CREATE TABLE IF NOT EXISTS public.author_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  about TEXT NOT NULL,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_profile ENABLE ROW LEVEL SECURITY;

-- Public read access for stories (everyone can view published stories)
CREATE POLICY "stories_public_read"
  ON public.stories FOR SELECT
  USING (published = true);

-- Public read access for comments
CREATE POLICY "comments_public_read"
  ON public.comments FOR SELECT
  USING (true);

-- Public insert for comments (anyone can comment)
CREATE POLICY "comments_public_insert"
  ON public.comments FOR INSERT
  WITH CHECK (true);

-- Public read access for likes count
CREATE POLICY "likes_public_read"
  ON public.story_likes FOR SELECT
  USING (true);

-- Public insert for likes (anyone can like)
CREATE POLICY "likes_public_insert"
  ON public.story_likes FOR INSERT
  WITH CHECK (true);

-- Public delete for likes (anyone can unlike)
CREATE POLICY "likes_public_delete"
  ON public.story_likes FOR DELETE
  USING (true);

-- Public read access for author profile
CREATE POLICY "author_profile_public_read"
  ON public.author_profile FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_slug ON public.stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_published ON public.stories(published);
CREATE INDEX IF NOT EXISTS idx_comments_story_id ON public.comments(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON public.story_likes(story_id);

-- Create function to update story likes count
CREATE OR REPLACE FUNCTION update_story_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update likes count
DROP TRIGGER IF EXISTS story_likes_count_trigger ON public.story_likes;
CREATE TRIGGER story_likes_count_trigger
  AFTER INSERT OR DELETE ON public.story_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_likes_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS stories_updated_at_trigger ON public.stories;
CREATE TRIGGER stories_updated_at_trigger
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
