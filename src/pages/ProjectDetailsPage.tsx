import { Button } from "@/components/ui/button";
import {
  getProject,
  updateProject,
  type Project,
} from "@/services/projects.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

export default function ProjectDetailsPage() {
  const qc = useQueryClient();
  const { id: idParam } = useParams();
  const id = Number(idParam);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => getProject(id),
    enabled: Number.isFinite(id),
  });

  const [title, setTitle] = useState("");

  useEffect(() => {
    if (data?.title) setTitle(data.title);
  }, [data?.title]);
  const updateMutation = useMutation({
    mutationFn: (newTitle: string) => updateProject(id, newTitle),

    // ✅ optimistic update
    onMutate: async (newTitle) => {
      // جلوی رفرش همزمان رو بگیر
      await qc.cancelQueries({ queryKey: ["projects", id] });
      await qc.cancelQueries({ queryKey: ["projects"] });

      // snapshot برای rollback
      const prevProject = qc.getQueryData<Project>(["projects", id]);
      const prevList = qc.getQueryData<Project[]>(["projects"]);

      // update فوری جزئیات
      qc.setQueryData<Project>(["projects", id], (old) =>
        old ? { ...old, title: newTitle } : old
      );

      // update فوری لیست
      qc.setQueryData<Project[]>(["projects"], (old) =>
        old?.map((p) => (p.id === id ? { ...p, title: newTitle } : p))
      );

      return { prevProject, prevList };
    },

    // اگر خطا شد rollback
    onError: (_err, _newTitle, ctx) => {
      if (ctx?.prevProject) qc.setQueryData(["projects", id], ctx.prevProject);
      if (ctx?.prevList) qc.setQueryData(["projects"], ctx.prevList);
    },

    // بعد از اتمام، sync با سرور
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["projects", id] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

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
