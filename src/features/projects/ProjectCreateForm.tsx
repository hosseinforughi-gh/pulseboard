import { Button } from "@/components/ui/button";
import { createProject } from "@/services/projects.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const ProjectCreateForm = () => {
  const [title, setTitle] = useState("");
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (t: string) => createProject(t),
    onSuccess: () => {
      setTitle("");
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created.");
    },
    onError: () => toast.error("Create failed."),
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
