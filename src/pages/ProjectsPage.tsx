import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import DeleteProjectButton from "@/features/projects/DeleteProjectButton";
import ProjectCreateForm from "@/features/projects/ProjectCreateForm";
import { useDeleteProjectMutation } from "@/features/projects/useDeleteProjectMutation";
import { useProjectsList } from "@/features/projects/useProjectsList";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export default function ProjectsPage() {
  const {
    items,
    isLoading,
    isFetching,
    isError,
    error,
    searchInput,
    setSearchInput,
    page,
    totalPages,
    paginationItems,
    setPage,
    refetch,
  } = useProjectsList();
  const deleteMutation = useDeleteProjectMutation();
  const deletingId = deleteMutation.variables;

  const canPrev = page > 1 && !isFetching;
  const canNext = page < totalPages && !isFetching;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  if (isLoading) return <div className="text-sm">Loading...</div>;

  if (isError)
    return (
      <div className="space-y-3">
        <div className="text-sm">
          {error?.message ?? "Something went wrong."}
        </div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Projects</h2>

      <div className="mb-2">
        <ProjectCreateForm />
      </div>

      <div className="flex items-center gap-2">
        <Input
          className="max-w-sm"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search projects..."
        />
        {isFetching && (
          <span className="text-xs text-muted-foreground">Loading…</span>
        )}
      </div>

      {items.length === 0 && (
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

            <DeleteProjectButton
              title={p.title}
              isDeleting={deleteMutation.isPending && deletingId === p.id}
              onConfirm={() => deleteMutation.mutate(p.id)}
            />
          </li>
        ))}
      </ul>

      {items.length > 0 && totalPages > 1 && (
        <Pagination className="mt-4 flex justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={!canPrev ? undefined : () => setPage(page - 1)}
                aria-disabled={!canPrev}
                className={!canPrev ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {paginationItems.map((it, idx) =>
              it === "ellipsis" ? (
                <PaginationItem key={`e-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={it}>
                  <PaginationLink
                    isActive={it === page}
                    onClick={isFetching ? undefined : () => setPage(it)}
                    aria-disabled={isFetching}
                    className={
                      isFetching ? "pointer-events-none opacity-50" : ""
                    }
                  >
                    {it}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={!canNext ? undefined : () => setPage(page + 1)}
                aria-disabled={!canNext}
                className={!canNext ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
