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
import ProjectCreateForm from "@/features/projects/ProjectCreateForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "@/services/projects.services";
import DeleteProjectButton from "@/features/projects/DeleteProjectButton";
import type { Project } from "@/services/projects.services";
import { toast } from "sonner";

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

  const qc = useQueryClient();

  const deleteMutation = useMutation<void, Error, number, { prev?: Project[] }>(
    {
      mutationFn: (id) => deleteProject(id),

      onMutate: async (id) => {
        await qc.cancelQueries({ queryKey: ["projects"] });
        const prev = qc.getQueryData<Project[]>(["projects"]);
        qc.setQueryData<Project[]>(["projects"], (old) =>
          (old ?? []).filter((p) => p.id !== id)
        );
        qc.removeQueries({ queryKey: ["projects", String(id)] });
        return { prev };
      },

      onError: (_err, _id, ctx) => {
        if (ctx?.prev) qc.setQueryData(["projects"], ctx.prev);
        toast.error("Delete failed. Please try again.");
      },

      onSuccess: () => {
        toast.success("Project deleted.");
      },

      onSettled: () => {
        // qc.invalidateQueries({ queryKey: ["projects"] });
      },
    }
  );

  const deletingId = deleteMutation.variables as number | undefined;

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
      <div className="mb-2">
        <ProjectCreateForm />
      </div>
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
            <DeleteProjectButton
              title={p.title}
              isDeleting={deleteMutation.isPending && deletingId === p.id}
              onConfirm={() => deleteMutation.mutate(p.id)}
            />
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
