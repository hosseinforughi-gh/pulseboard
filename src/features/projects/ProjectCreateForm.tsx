import { Button } from "@/components/ui/button";
import { createProject } from "@/services/projects.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const ProjectCreateForm = () => {
  const [title, setTitle] = useState("");
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (t: string) => createProject(t),
    onSuccess: () => {
      setTitle("");
      qc.invalidateQueries({ queryKey: ["projects"] });
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
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New project title..."
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Add"}
      </Button>
    </form>
  );
};

export default ProjectCreateForm;
