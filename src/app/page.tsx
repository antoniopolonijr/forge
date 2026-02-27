import Link from "next/link";
import { redirect } from "next/navigation";
import { Pagination } from "@/components/pagination/pagination";
import { Button } from "@/components/ui/button";
import { WikiCard } from "@/components/ui/wiki-card";
import { DEFAULT_PAGE_SIZE, getArticlesByPage } from "@/lib/data/articles";
import { formatRelativeOrAbsolute } from "@/lib/utils/time";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  const rawPage = params.page;
  const currentPage = Number(rawPage ?? "1");

  // Invalid values ​​→ return to home
  if (!Number.isFinite(currentPage) || currentPage < 1) {
    redirect("/");
  }

  // normalize page=1
  if (rawPage === "1") {
    redirect("/");
  }

  function pageHref(p: number) {
    return p <= 1 ? "/" : `?page=${p}`;
  }

  const { articles, total } = await getArticlesByPage(
    currentPage,
    DEFAULT_PAGE_SIZE,
  );

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));
  const isOutOfRange = currentPage > totalPages;

  return (
    <div>
      <main className="max-w-2xl mx-auto flex flex-col gap-6">
        {isOutOfRange ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-xl font-semibold">No articles on this page</h2>
            <p className="text-sm text-muted-foreground mt-2">
              The page you are looking for does not exist.
            </p>

            <div className="flex gap-3 mt-6">
              <Button asChild variant="outline">
                <Link href="/">Go to first page</Link>
              </Button>

              {totalPages > 1 && (
                <Button asChild>
                  <Link href={pageHref(totalPages)}>
                    Go to last page ({totalPages})
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          articles.map(
            ({ title, id, createdAt, author, summary, content, imageUrl }) => (
              <WikiCard
                title={title}
                author={author ? author : "Unknown"}
                date={formatRelativeOrAbsolute(createdAt, "en")}
                summary={summary ?? `${content.substring(0, 194)}...`}
                imageUrl={imageUrl}
                href={`/wiki/${id}`}
                key={id}
              />
            ),
          )
        )}
      </main>

      {!isOutOfRange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageHref={pageHref}
        />
      )}
    </div>
  );
}
