-- Create admin users table for CMS authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin policies for stories (only admins can edit)
CREATE POLICY "admin_stories_all"
  ON public.stories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin policies for author profile (only admins can edit)
CREATE POLICY "admin_author_profile_all"
  ON public.author_profile FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin policies for comments (admins can delete)
CREATE POLICY "admin_comments_delete"
  ON public.comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Function to create admin trigger
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Note: To make a user an admin, insert their auth.users id into admin_users table manually
-- Example: INSERT INTO public.admin_users (id, email) VALUES ('user-uuid-here', 'admin@example.com');
