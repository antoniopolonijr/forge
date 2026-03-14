CREATE TABLE "article_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" serial NOT NULL,
	"url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_images" ADD CONSTRAINT "article_images_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;