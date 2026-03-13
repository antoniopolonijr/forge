import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  summary: text("summary"),
  imageUrl: text("image_url"), // legacy single-image column, kept for now
  searchVector: tsvector("search_vector").generatedAlwaysAs(
    () =>
      sql`to_tsvector(
        'english',
        coalesce(title,'') || ' ' || coalesce(content,'')
      )`,
  ),
  published: boolean("published").default(false).notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => usersSync.id),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// new table for associated images
export const articleImages = pgTable("article_images", {
  id: serial("id").primaryKey(),
  articleId: serial("article_id")
    .notNull()
    .references(() => articles.id, {
      onDelete: "cascade",
    }),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
});

const schema = { articles, articleImages };
export default schema;

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

export type ArticleImage = typeof articleImages.$inferSelect;

export const usersSync = pgTable("usersSync", {
  id: text("id").primaryKey(), // Stack Auth user ID
  name: text("name"),
  email: text("email"),
});
export type User = typeof usersSync.$inferSelect;
