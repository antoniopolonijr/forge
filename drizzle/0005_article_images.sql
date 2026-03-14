-- add table for storing multiple images per article

CREATE TABLE IF NOT EXISTS "article_images" (
  "id" serial PRIMARY KEY,
  "article_id" integer NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  "url" text NOT NULL,
  "position" integer NOT NULL DEFAULT 0
);

-- copy existing single-image data into new table (if any)
INSERT INTO "article_images" (article_id, url, position)
SELECT id, image_url, 0
FROM articles
WHERE image_url IS NOT NULL;

-- we keep the old articles.image_url column for compatibility but it is
-- no longer authoritative; it may be removed in a future migration.
-- we will not drop it here to avoid breaking existing code until it is
-- fully migrated.
