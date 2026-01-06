-- Update histories table structure to match TypeScript types
-- Rename columns to match the expected naming convention

-- Rename columns
ALTER TABLE public.histories 
  RENAME COLUMN media_id TO tmdb_id;

ALTER TABLE public.histories 
  RENAME COLUMN type TO content_type;

ALTER TABLE public.histories 
  RENAME COLUMN last_position TO progress;

ALTER TABLE public.histories 
  RENAME COLUMN season TO season_number;

ALTER TABLE public.histories 
  RENAME COLUMN episode TO episode_number;

-- Add watched_at column (for tracking last watch time)
ALTER TABLE public.histories 
  ADD COLUMN IF NOT EXISTS watched_at timestamp with time zone DEFAULT now();

-- Update the unique constraint to use new column names
ALTER TABLE public.histories 
  DROP CONSTRAINT IF EXISTS histories_user_id_media_id_type_season_episode_key;

ALTER TABLE public.histories 
  ADD CONSTRAINT histories_user_id_tmdb_id_content_type_season_episode_key 
  UNIQUE (user_id, tmdb_id, content_type, season_number, episode_number);

-- Update the check constraint
ALTER TABLE public.histories 
  DROP CONSTRAINT IF EXISTS histories_type_check;

ALTER TABLE public.histories 
  ADD CONSTRAINT histories_content_type_check 
  CHECK (content_type = ANY (ARRAY['movie'::text, 'tv'::text]));

-- Drop old index and create new one with updated column names
DROP INDEX IF EXISTS histories_user_updated_idx;
CREATE INDEX histories_user_updated_idx ON public.histories (user_id, updated_at DESC);

-- Update watchlist table to match
ALTER TABLE public.watchlist 
  RENAME COLUMN type TO content_type;

ALTER TABLE public.watchlist 
  DROP CONSTRAINT IF EXISTS watchlist_type_check;

ALTER TABLE public.watchlist 
  ADD CONSTRAINT watchlist_content_type_check 
  CHECK (content_type = ANY (ARRAY['movie'::text, 'tv'::text]));

-- Update watchlist primary key constraint
ALTER TABLE public.watchlist 
  DROP CONSTRAINT IF EXISTS watchlist_pkey;

ALTER TABLE public.watchlist 
  ADD CONSTRAINT watchlist_pkey 
  PRIMARY KEY (user_id, id, content_type);
