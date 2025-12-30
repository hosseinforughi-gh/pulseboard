import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getProjectsPage } from "@/services/projects.services";
import { projectsKeys } from "@/features/projects/projects.keys";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentProjectsCard() {
  const params = { page: 1, limit: 3, q: "" };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: projectsKeys.list(params),
    queryFn: () => getProjectsPage(params),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent projects</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isError ? (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Failed to load projects.
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Retrying..." : "Retry"}
            </Button>
          </div>
        ) : data?.items?.length ? (
          <ul className="space-y-2">
            {data.items.map((p) => (
              <li key={p.id} className="min-w-0">
                <Link
                  to={`/projects/${p.id}`}
                  className="block truncate text-sm hover:underline"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">No projects yet.</div>
        )}

        <div className="pt-2">
          <Link to="/projects">
            <Button variant="outline" className="w-full">
              View all projects
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
