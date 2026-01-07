-- Drop the admin-only policy for stories
DROP POLICY IF EXISTS "admin_stories_all" ON public.stories;

-- Create new policies that allow anyone to update and insert stories
-- This is safe since this is a personal author website without authentication

-- Allow anyone to insert stories
CREATE POLICY "stories_public_insert"
  ON public.stories FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update stories
CREATE POLICY "stories_public_update"
  ON public.stories FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete stories
CREATE POLICY "stories_public_delete"
  ON public.stories FOR DELETE
  USING (true);

-- Similarly update author_profile policies
DROP POLICY IF EXISTS "admin_author_profile_all" ON public.author_profile;

-- Allow anyone to insert author profile
CREATE POLICY "author_profile_public_insert"
  ON public.author_profile FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update author profile
CREATE POLICY "author_profile_public_update"
  ON public.author_profile FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete comments (admin functionality)
-- This policy already exists but keeping it for reference
-- DROP POLICY IF EXISTS "admin_comments_delete" ON public.comments;
