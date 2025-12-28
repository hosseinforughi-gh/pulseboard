import { Button } from "@/components/ui/button";
import {
  createProject,
  type Paginated,
  type Project,
} from "@/services/projects.services";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { projectsKeys } from "@/features/projects/projects.keys";

type CreateCtx = {
  prevLists: Array<[QueryKey, Paginated<Project> | undefined]>;
  tempId: number;
};

function hasNoQ(key: QueryKey) {
  // key شکلش: ["projects","list", {page, limit, q}]
  // ما فقط وقتی q خالیه optimistic insert می‌کنیم
  const params = key?.[2] as { q?: string } | undefined;
  const q = (params?.q ?? "").trim();
  return !q;
}

const ProjectCreateForm = () => {
  const [title, setTitle] = useState("");
  const [, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation<Project, Error, string, CreateCtx>({
    mutationFn: (t: string) => createProject(t),

    onMutate: async (rawTitle) => {
      const nextTitle = rawTitle.trim();
      const tempId = -Date.now(); // id موقت

      await qc.cancelQueries({ queryKey: projectsKeys.lists() });

      const prevLists = qc.getQueriesData<Paginated<Project>>({
        queryKey: projectsKeys.lists(),
      });

      // optimistic insert فقط برای list هایی که q ندارن
      for (const [key, data] of prevLists) {
        if (!data) continue;
        if (!hasNoQ(key)) continue;

        // فقط صفحه 1 رو insert کن (چون sort desc و آیتم جدید باید اول باشه)
        const params = key[2] as { page?: number; limit: number; q: string };
        if ((params?.page ?? data.page) !== 1) continue;

        const nextItems = [{ id: tempId, title: nextTitle }, ...data.items];

        // اگر بیشتر از limit شد، آخرین آیتم رو بنداز بیرون
        const trimmedItems = nextItems.slice(0, data.limit);

        const nextTotal = data.total + 1;
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / data.limit));

        qc.setQueryData<Paginated<Project>>(key, {
          ...data,
          items: trimmedItems,
          total: nextTotal,
          totalPages: nextTotalPages,
          page: 1,
        });
      }

      return { prevLists, tempId };
    },

    onError: (_err, _title, ctx) => {
      for (const [key, data] of ctx?.prevLists ?? []) {
        qc.setQueryData<Paginated<Project> | undefined>(key, data);
      }
      toast.error("Create failed.");
    },

    onSuccess: (created, _title, ctx) => {
      toast.success("Project created.");
      setTitle("");

      // برو صفحه 1 و سرچ رو پاک کن که کاربر ببینه
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          sp.delete("q");
          sp.set("page", "1");
          return sp;
        },
        { replace: true }
      );

      // tempId رو با آیتم واقعی جایگزین کن
      const lists = qc.getQueriesData<Paginated<Project>>({
        queryKey: projectsKeys.lists(),
      });

      for (const [key, data] of lists) {
        if (!data) continue;
        if (!hasNoQ(key)) continue;

        const params = key[2] as { page?: number; limit: number; q: string };
        if ((params?.page ?? data.page) !== 1) continue;

        const nextItems = data.items.map((p) =>
          p.id === ctx?.tempId ? created : p
        );

        qc.setQueryData<Paginated<Project>>(key, {
          ...data,
          items: nextItems,
        });
      }
    },

    onSettled: () => {
      // sync نهایی با سرور (به‌خصوص برای total/pages دقیق)
      qc.invalidateQueries({ queryKey: projectsKeys.lists() });
    },
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
