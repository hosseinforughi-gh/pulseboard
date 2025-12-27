import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import ProjectCreateForm from "@/features/projects/ProjectCreateForm";
import DeleteProjectButton from "@/features/projects/DeleteProjectButton";

import { useProjectsList } from "@/features/projects/useProjectsList";
import { projectsKeys } from "@/features/projects/projects.keys";
import { deleteProject } from "@/services/projects.services";
import { useDeleteProjectMutation } from "@/features/projects/useDeleteProjectMutation";

export default function ProjectsPage() {
  const {
    data,
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

  const items = data?.items ?? [];

  const deleteMutation = useDeleteProjectMutation();
  const deletingId = deleteMutation.variables as number | undefined;

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
        <input
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
                onClick={page === 1 ? undefined : () => setPage(page - 1)}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
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
                    onClick={() => setPage(it)}
                  >
                    {it}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={
                  page === totalPages ? undefined : () => setPage(page + 1)
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
