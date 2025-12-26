import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProjectsList } from "@/features/projects/useProjectsList";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export default function ProjectsPage() {
  const {
    items,
    q,
    setQuery,
    isLoading,
    isError,
    refetch,
    page,
    totalPages,
    goToPage,
    totalFiltered,
  } = useProjectsList();

  if (isLoading) return <div className="text-sm">Loading...</div>;

  if (isError)
    return (
      <div className="space-y-3">
        <div className="text-sm">Something went wrong.</div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Projects</h2>

      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        value={q}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects..."
      />

      {totalFiltered === 0 && (
        <div className="text-sm text-muted-foreground">No results.</div>
      )}

      <ul className="space-y-2">
        {items.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <Link
              to={`/projects/${p.id}`}
              className="min-w-0 flex-1 truncate hover:underline"
            >
              {p.title}
            </Link>

            {/* اینجا delete/edit دکمه‌ها */}
          </li>
        ))}
      </ul>
      {totalFiltered > 0 && totalPages > 1 && (
        <Pagination className="mt-4 flex justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={page === 1 ? undefined : () => goToPage(page - 1)}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === page}
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={
                  page === totalPages ? undefined : () => goToPage(page + 1)
                }
                aria-disabled={page === totalPages}
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
