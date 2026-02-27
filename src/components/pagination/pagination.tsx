import Link from "next/link";
import { Button } from "@/components/ui/button";

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  windowSize = 5,
) {
  const half = Math.floor(windowSize / 2);

  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + windowSize - 1);

  if (end - start < windowSize - 1) {
    start = Math.max(1, end - windowSize + 1);
  }

  const middlePages: number[] = [];

  for (let p = start + 1; p <= end - 1; p++) {
    middlePages.push(p);
  }

  return {
    start,
    end,
    middlePages,
    showLeftEllipsis: start > 1,
    showRightEllipsis: end < totalPages,
  };
}

export function Pagination({
  currentPage,
  totalPages,
  pageHref,
}: {
  currentPage: number;
  totalPages: number;
  pageHref: (p: number) => string;
}) {
  const { middlePages, showLeftEllipsis, showRightEllipsis } =
    getPaginationRange(currentPage, totalPages);

  return (
    <nav
      aria-label="pagination navigation"
      className="max-w-2xl mx-auto pt-8 flex gap-2 items-center justify-center"
    >
      {/* Previous */}
      {currentPage > 1 && (
        <Button asChild size="sm" variant="outline">
          <Link
            rel="prev"
            aria-label="Previous Page"
            href={pageHref(currentPage - 1)}
          >
            {"<"}
          </Link>
        </Button>
      )}

      {/* Page 1 */}
      <Button
        asChild
        size="sm"
        variant={currentPage === 1 ? "default" : "outline"}
        aria-label="Page 1"
      >
        {currentPage === 1 ? (
          <span>1</span>
        ) : (
          <Link aria-label="Go to Page 1" href="/">
            1
          </Link>
        )}
      </Button>

      {/* Left ellipsis */}
      {showLeftEllipsis && <span>...</span>}

      {/* Middle pages */}
      {middlePages.map((p) => (
        <Button
          key={p}
          asChild
          size="sm"
          variant={p === currentPage ? "default" : "outline"}
          aria-label={`Page ${p}`}
        >
          {p === currentPage ? (
            <span>{p}</span>
          ) : (
            <Link aria-label={`Go to Page ${p}`} href={pageHref(p)}>
              {p}
            </Link>
          )}
        </Button>
      ))}

      {/* Right ellipsis */}
      {showRightEllipsis && <span>...</span>}

      {/* Last page */}
      {totalPages > 1 && (
        <Button
          asChild
          size="sm"
          variant={currentPage === totalPages ? "default" : "outline"}
          aria-label={`Page ${totalPages}`}
        >
          {currentPage === totalPages ? (
            <span>{totalPages}</span>
          ) : (
            <Link
              aria-label={`Go to Page ${totalPages}`}
              href={pageHref(totalPages)}
            >
              {totalPages}
            </Link>
          )}
        </Button>
      )}

      {/* Next */}
      {currentPage < totalPages && (
        <Button asChild size="sm" variant="outline">
          <Link
            rel="next"
            aria-label="Next Page"
            href={pageHref(currentPage + 1)}
          >
            {">"}
          </Link>
        </Button>
      )}
    </nav>
  );
}
