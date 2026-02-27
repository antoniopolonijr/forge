import redis from "@/cache";

export async function invalidateArticlesCache() {
  try {
    const keys = await redis.keys("articles:*");

    if (!Array.isArray(keys) || keys.length === 0) {
      return;
    }

    await redis.del(...keys);
  } catch (err) {
    console.warn("Failed to invalidate articles cache", err);
  }
}
