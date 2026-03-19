-- Enable pg_trgm for trigram-based fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index on Creator.name (free-text search on /discover)
CREATE INDEX IF NOT EXISTS creator_name_trgm_idx
  ON "Creator" USING gin (name gin_trgm_ops);

-- GIN trigram index on Creator.handle (URL search + autocomplete)
CREATE INDEX IF NOT EXISTS creator_handle_trgm_idx
  ON "Creator" USING gin (handle gin_trgm_ops);

-- GIN index on Creator.nicheTags (array containment queries e.g. "fashion" @> nicheTags)
CREATE INDEX IF NOT EXISTS creator_niche_tags_gin_idx
  ON "Creator" USING gin ("nicheTags");

-- GIN index on Creator.platforms (array containment queries)
CREATE INDEX IF NOT EXISTS creator_platforms_gin_idx
  ON "Creator" USING gin (platforms);
