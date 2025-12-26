import { Button } from "@/components/ui/button";
import { createProject, type Project } from "@/services/projects.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type Ctx = {
  prev?: Project[];
  tempId?: number;
};

const ProjectCreateForm = () => {
  const [title, setTitle] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation<Project, Error, string, Ctx>({
    mutationFn: (t) => createProject(t),

    onMutate: async (t) => {
      const trimmed = t.trim();
      if (!trimmed) return {};

      // 1) stop in-flight fetches
      await qc.cancelQueries({ queryKey: ["projects"] });

      // 2) snapshot
      const prev = qc.getQueryData<Project[]>(["projects"]);

      // 3) optimistic add
      const tempId = Date.now();
      const optimistic: Project = { id: tempId, title: trimmed };

      qc.setQueryData<Project[]>(["projects"], (old) => [
        optimistic,
        ...(old ?? []),
      ]);

      // 4) reset UI input
      setTitle("");

      // 5) go to page 1 and clear filter so user SEE the new item
      const sp = new URLSearchParams(searchParams);
      sp.delete("q");
      sp.set("page", "1");
      setSearchParams(sp, { replace: true });

      return { prev, tempId };
    },

    onError: (_err, _title, ctx) => {
      // rollback optimistic cache
      if (ctx?.prev) qc.setQueryData(["projects"], ctx.prev);
      toast.error("Create failed.");
    },

    onSuccess: (created, _title, ctx) => {
      // replace temp item with server item (id)
      if (ctx?.tempId != null) {
        qc.setQueryData<Project[]>(["projects"], (old) => {
          const list = old ?? [];
          return list.map((p) => (p.id === ctx.tempId ? created : p));
        });
      }
      toast.success("Project created.");
    },

    // با jsonplaceholder بهتره invalidate نکنیم چون آیتم برمی‌پره/پایدار نیست
    // اگر بعداً بک‌اند واقعی داشتی، اینو روشن کن:
    // onSettled: () => {
    //   qc.invalidateQueries({ queryKey: ["projects"] });
    // },
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        mutate(trimmed);
      }}
    >
      <input
        className="flex-1 rounded-md border px-3 py-2 text-sm"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New project title..."
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending || !title.trim()}>
        {isPending ? "Creating..." : "Add"}
      </Button>
    </form>
  );
};

export default ProjectCreateForm;
