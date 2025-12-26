import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProjectsList } from "@/features/projects/useProjectsList";

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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
