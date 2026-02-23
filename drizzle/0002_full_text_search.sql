-- Add tsvector column, trigger to keep it updated, and GIN index for fast search
ALTER TABLE "articles" ADD COLUMN "search_vector" tsvector;
--> statement-breakpoint

-- Create function to update search_vector from title + content
CREATE FUNCTION articles_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title, '') || ' ' || coalesce(NEW.content, ''));
  RETURN NEW;
END
$$ LANGUAGE plpgsql;
--> statement-breakpoint

-- Create trigger to update tsvector before insert or update
CREATE TRIGGER articles_search_vector_update
BEFORE INSERT OR UPDATE ON "articles"
FOR EACH ROW EXECUTE FUNCTION articles_search_vector_trigger();
--> statement-breakpoint

-- Backfill existing rows
UPDATE "articles" SET search_vector = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''));
--> statement-breakpoint

-- Create GIN index for fast full-text search
CREATE INDEX articles_search_vector_idx ON "articles" USING GIN (search_vector);
--> statement-breakpoint
