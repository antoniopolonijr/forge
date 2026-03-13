"use server";

import { eq } from "drizzle-orm";
import summarizeArticle from "@/ai/summarize";
import { invalidateArticlesCache } from "@/cache/utils";
import { authorizeUserToEditArticle } from "@/db/authz";
import db from "@/db/index";
import { articleImages, articles } from "@/db/schema";
import { ensureUserExists } from "@/db/sync-user";
import { stackServerApp } from "@/stack/server";

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrls?: string[];
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrls?: string[];
};

export async function createArticle(data: CreateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  await ensureUserExists(user);

  console.log("✨ createArticle called:", data);

  // Try to generate summary, but continue without it if it fails (e.g., in tests)
  let summary: string | undefined;
  try {
    summary = await summarizeArticle(data.title || "", data.content || "");
  } catch (error) {
    console.warn("⚠️ Failed to generate AI summary:", error);
    summary = undefined;
  }

  const response = await db
    .insert(articles)
    .values({
      title: data.title,
      content: data.content,
      slug: `${Date.now()}`,
      published: true,
      authorId: user.id,
      imageUrl: data.imageUrls?.[0] ?? undefined,
      summary,
    })
    .returning({ id: articles.id });

  await invalidateArticlesCache();
  const articleId = response[0]?.id;

  // if image URLs provided, insert into article_images table
  if (articleId && data.imageUrls && data.imageUrls.length > 0) {
    const rows = data.imageUrls.map((url, idx) => ({
      articleId,
      url,
      position: idx,
    }));
    await db.insert(articleImages).values(rows);
  }

  return { success: true, message: "Article create logged", id: articleId };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("❌ Forbidden");
  }

  console.log("📝 updateArticle called:", { id, ...data });

  // Try to generate summary, but continue without it if it fails (e.g., in tests)
  let summary: string | undefined;
  try {
    summary = await summarizeArticle(data.title || "", data.content || "");
  } catch (error) {
    console.warn("⚠️ Failed to generate AI summary:", error);
    summary = undefined;
  }

  const _response = await db
    .update(articles)
    .set({
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrls?.[0] ?? null,
      summary: summary ?? undefined,
    })
    .where(eq(articles.id, +id));

  // update images: wipe old ones and insert new list
  if (data.imageUrls) {
    await db.delete(articleImages).where(eq(articleImages.articleId, +id));
    if (data.imageUrls.length > 0) {
      const rows = data.imageUrls.map((url, idx) => ({
        articleId: +id,
        url,
        position: idx,
      }));
      await db.insert(articleImages).values(rows);
    }
  }

  await invalidateArticlesCache();

  return { success: true, message: `Article ${id} update logged` };
}

export async function deleteArticle(id: string) {
  const user = await stackServerApp.getUser();

  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  const articleId = Number(id);

  if (!(await authorizeUserToEditArticle(user.id, articleId))) {
    throw new Error("❌ Forbidden");
  }

  console.log("🗑️ deleteArticle called:", articleId);

  await db.delete(articles).where(eq(articles.id, articleId));

  await invalidateArticlesCache();

  return {
    success: true,
    message: `Article ${articleId} delete logged (stub)`,
  };
}
