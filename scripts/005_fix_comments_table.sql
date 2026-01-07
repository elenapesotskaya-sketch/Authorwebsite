-- Remove email field from comments table since we only need name
ALTER TABLE comments DROP COLUMN IF EXISTS author_email;

-- Update RLS policy to allow public deletion of comments
DROP POLICY IF EXISTS "admin_comments_delete" ON comments;

CREATE POLICY "comments_public_delete" ON comments
  FOR DELETE
  USING (true);
