import { Button } from "@/components/ui/button";
import { createProject } from "@/services/projects.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { projectsKeys } from "@/features/projects/projects.keys";

const ProjectCreateForm = () => {
  const [title, setTitle] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (t: string) => createProject(t),

    onSuccess: () => {
      toast.success("Project created.");
      setTitle("");

      // برو صفحه 1 و سرچ رو پاک کن که کاربر ببینه
      const sp = new URLSearchParams(searchParams);
      sp.delete("q");
      sp.set("page", "1");
      setSearchParams(sp, { replace: true });

      // مهم: همه لیست‌ها رو refresh کن
      qc.invalidateQueries({ queryKey: projectsKeys.all, exact: false });
    },

    onError: () => {
      toast.error("Create failed.");
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
