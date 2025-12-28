import { Button } from "@/components/ui/button";
import { getProject } from "@/services/projects.services";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, type ChangeEvent } from "react";
import { projectsKeys } from "@/features/projects/projects.keys";
import { useUpdateProjectMutation } from "@/features/projects/useUpdateProjectMutation";
import { Input } from "@/components/ui/input";

export default function ProjectDetailsPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const isValidId = Number.isFinite(id) && id > 0;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: projectsKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: isValidId,
  });

  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(data?.title ?? "");
  }, [data?.id, data?.title]);

  const updateMutation = useUpdateProjectMutation(id);

  if (!isValidId) {
    return (
      <div className="space-y-3">
        <div className="text-sm">Invalid project id.</div>
        <Link className="text-sm underline" to="/projects">
          Back
        </Link>
      </div>
    );
  }

  if (isLoading) return <div className="text-sm">Loading...</div>;

  if (isError)
    return (
      <div className="space-y-3">
        <div className="text-sm">Failed to load project.</div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );

  const trimmed = title.trim();
  const isUnchanged = trimmed === (data?.title ?? "");

  return (
    <div className="space-y-4">
      <Link className="text-sm underline" to="/projects">
        Back
      </Link>

      <h2 className="text-xl font-semibold">Project #{data?.id}</h2>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Title</div>

        <div className="flex gap-2">
          <Input
            className="w-full"
            value={title}
            placeholder="Project title..."
            onChange={(e) => setTitle(e.target.value)}
          />

          <Button
            onClick={() => updateMutation.mutate(trimmed)}
            disabled={!trimmed || isUnchanged || updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>

        {updateMutation.isError && (
          <div className="text-sm">Update failed.</div>
        )}
        {updateMutation.isSuccess && <div className="text-sm">Saved ✅</div>}
      </div>
    </div>
  );
}
