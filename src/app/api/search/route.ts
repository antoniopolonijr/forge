import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/db";

type SearchRow = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  rank: number | string;
};

const SEARCH_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();

    // early return
    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const res = await sql`
      WITH query AS (
        SELECT plainto_tsquery('english', ${q}) AS q
      )
      SELECT
        a.id,
        a.title,
        a.slug,
        a.summary,
        a.content,
        ts_rank(a.search_vector, query.q) AS rank
      FROM articles a, query
      WHERE a.search_vector @@ query.q
      ORDER BY rank DESC
      LIMIT ${SEARCH_LIMIT};
    `;

    const results = (res as SearchRow[]).map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      summary: r.summary,
      content: r.content,
      rank: Number(r.rank ?? 0),
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("🔴 Search route failed:", err);
    return NextResponse.json({ error: "search_failed" }, { status: 500 });
  }
}
