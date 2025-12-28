import { Button } from "@/components/ui/button";
import {
  getProject,
  updateProject,
  type Paginated,
  type Project,
} from "@/services/projects.services";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, type ChangeEvent } from "react";
import { projectsKeys } from "@/features/projects/projects.keys";

type UpdateCtx = {
  prevProject?: Project;
  prevLists: Array<[QueryKey, Paginated<Project> | undefined]>;
};

export default function ProjectDetailsPage() {
  const qc = useQueryClient();
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
  }, [data?.title]);

  const updateMutation = useMutation<Project, Error, string, UpdateCtx>({
    mutationFn: (newTitle: string) => updateProject(id, newTitle),

    onMutate: async (newTitle) => {
      const nextTitle = newTitle.trim();
      if (!nextTitle) return { prevLists: [] };

      // cancel detail + all lists
      await qc.cancelQueries({ queryKey: projectsKeys.detail(id) });
      await qc.cancelQueries({ queryKey: projectsKeys.lists() });

      // snapshots
      const prevProject = qc.getQueryData<Project>(projectsKeys.detail(id));
      const prevLists = qc.getQueriesData<Paginated<Project>>({
        queryKey: projectsKeys.lists(),
      });

      // optimistic detail update
      qc.setQueryData<Project>(projectsKeys.detail(id), (old) =>
        old ? { ...old, title: nextTitle } : old
      );

      // optimistic update for ALL cached lists (all pages / q)
      for (const [key, data] of prevLists) {
        if (!data) continue;

        const nextItems = data.items.map((p) =>
          p.id === id ? { ...p, title: nextTitle } : p
        );

        qc.setQueryData<Paginated<Project>>(key, {
          ...data,
          items: nextItems,
        });
      }

      return { prevProject, prevLists };
    },

    onError: (_err, _newTitle, ctx) => {
      // rollback detail
      if (ctx?.prevProject) {
        qc.setQueryData<Project>(projectsKeys.detail(id), ctx.prevProject);
      }

      // rollback lists
      for (const [key, data] of ctx?.prevLists ?? []) {
        qc.setQueryData<Paginated<Project> | undefined>(key, data);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: projectsKeys.lists() });
    },
  });

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
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={title}
            placeholder="Project title..."
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
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
