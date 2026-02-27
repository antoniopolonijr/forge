import { desc, eq } from "drizzle-orm";
import redis from "@/cache";
import db from "@/db/index";
import { articles, usersSync } from "@/db/schema";

export const DEFAULT_PAGE_SIZE = 10;

// The list view selects only a subset of Article fields and adds the author's
// resolved name. Use a dedicated type for the list response.
export type ArticleList = {
  id: number;
  title: string;
  createdAt: string;
  summary: string | null;
  content: string;
  author: string | null;
  imageUrl?: string | null;
};

export type ArticleWithAuthor = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  author: string | null;
};

export async function getArticlesByPage(
  page: number = 1,
  limit: number = DEFAULT_PAGE_SIZE,
): Promise<{ articles: ArticleList[]; total: number; hasMore: boolean }> {
  // Validate inputs
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, Math.min(limit, 100)); // Max 100 items per page

  const offset = (validPage - 1) * validLimit;

  try {
    const cacheKey = `articles:page:${validPage}:limit:${validLimit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        if (typeof cached === "string") {
          return JSON.parse(cached);
        }
        return cached as {
          articles: ArticleList[];
          total: number;
          hasMore: boolean;
        };
      } catch (err) {
        // Fallthrough to fetch fresh data if cache is corrupted
        console.warn("Failed to parse cached page, refetching", err);
      }
    }

    // Get total count (simple but reliable approach)
    const totalRows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.published, true));
    const total = totalRows.length;

    // Get paginated articles
    const response = await db
      .select({
        title: articles.title,
        id: articles.id,
        createdAt: articles.createdAt,
        summary: articles.summary,
        content: articles.content,
        author: usersSync.name,
        imageUrl: articles.imageUrl,
      })
      .from(articles)
      .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(validLimit)
      .offset(offset);

    const hasMore = offset + validLimit < total;

    const payload = {
      articles: response as unknown as ArticleList[],
      total,
      hasMore,
    };

    // Cache the page for a short time
    try {
      await redis.set(cacheKey, JSON.stringify(payload), { ex: 60 });
    } catch (err) {
      console.warn("Failed to set articles page cache", err);
    }

    return payload;
  } catch (error) {
    console.error("Error fetching paginated articles:", error);
    return {
      articles: [],
      total: 0,
      hasMore: false,
    };
  }
}

export async function getArticleById(
  id: number,
): Promise<ArticleWithAuthor | null> {
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .where(eq(articles.id, id))
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));
  // Cast the DB response to the shape we selected above.
  return response[0] ? (response[0] as unknown as ArticleWithAuthor) : null;
}
