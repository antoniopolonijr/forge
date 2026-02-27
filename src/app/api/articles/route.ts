import { NextResponse } from "next/server";
import { DEFAULT_PAGE_SIZE, getArticlesByPage } from "@/lib/data/articles";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
    const limit =
      parseInt(
        url.searchParams.get("limit") || String(DEFAULT_PAGE_SIZE),
        10,
      ) || DEFAULT_PAGE_SIZE;

    const result = await getArticlesByPage(page, limit);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("/api/articles error", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}
