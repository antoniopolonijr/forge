-- cleanup old trigger approach
DROP TRIGGER IF EXISTS articles_search_vector_update ON articles;
DROP FUNCTION IF EXISTS articles_search_vector_trigger();
DROP INDEX IF EXISTS articles_search_vector_idx;

ALTER TABLE "articles" drop column "search_vector";--> statement-breakpoint

ALTER TABLE "articles" ADD COLUMN "search_vector" "tsvector"
GENERATED ALWAYS AS (
  to_tsvector(
    'english',
    coalesce(title,'') || ' ' || coalesce(content,'')
  )
) STORED;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "search_idx"
ON "articles" USING GIN ("search_vector");