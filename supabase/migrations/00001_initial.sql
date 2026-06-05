-- Iraqee Platform — Initial Schema
-- Extends Supabase auth.users for profiles, directory listings, events, and reviews

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  profession TEXT,
  industry TEXT,
  city TEXT,
  country TEXT,
  languages TEXT[] DEFAULT '{}',
  diaspora_status TEXT CHECK (diaspora_status IN ('first_gen', 'second_gen', 'friend_of_iraq')) DEFAULT 'first_gen',
  verification_status TEXT CHECK (verification_status IN ('unverified', 'verified', 'premium')) DEFAULT 'unverified',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. DIRECTORY LISTINGS
CREATE TABLE IF NOT EXISTS public.directory_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('professional', 'service', 'housing', 'goods', 'opportunity')),
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  category TEXT,
  subcategory TEXT,
  city TEXT,
  country TEXT,
  price_range JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  media TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.directory_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are publicly readable"
  ON public.directory_listings
  FOR SELECT
  USING (status = 'active' OR auth.uid() = profile_id);

CREATE POLICY "Users can insert their own listings"
  ON public.directory_listings
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own listings"
  ON public.directory_listings
  FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own listings"
  ON public.directory_listings
  FOR DELETE
  USING (auth.uid() = profile_id);

-- Full text search on listings
ALTER TABLE public.directory_listings
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title->>'en', '') || ' ' ||
                           coalesce(description->>'en', '') || ' ' ||
                           coalesce(array_to_string(tags, ' '), '')) ||
    to_tsvector('arabic', coalesce(title->>'ar', '') || ' ' ||
                           coalesce(description->>'ar', '') || ' ' ||
                           coalesce(array_to_string(tags, ' '), ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_directory_listings_search
  ON public.directory_listings
  USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_directory_listings_city
  ON public.directory_listings (city);

CREATE INDEX IF NOT EXISTS idx_directory_listings_country
  ON public.directory_listings (country);

CREATE INDEX IF NOT EXISTS idx_directory_listings_category
  ON public.directory_listings (category);

CREATE INDEX IF NOT EXISTS idx_directory_listings_status
  ON public.directory_listings (status);

-- 3. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  event_type TEXT NOT NULL CHECK (event_type IN ('online', 'in_person', 'hybrid')),
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  max_attendees INT,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are publicly readable"
  ON public.events
  FOR SELECT
  USING (status = 'published' OR auth.uid() = organizer_id);

CREATE POLICY "Users can create events"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events"
  ON public.events
  FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events"
  ON public.events
  FOR DELETE
  USING (auth.uid() = organizer_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_start_time
  ON public.events (start_time);

-- 4. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.directory_listings(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, target_id, listing_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_target
  ON public.reviews (target_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer
  ON public.reviews (reviewer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_target_rating
  ON public.reviews (target_id, rating);

-- 5. AUTO-UPDATE updated_at TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_directory_listings_updated_at
  BEFORE UPDATE ON public.directory_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();