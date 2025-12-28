import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCreateProjectMutation } from "@/features/projects/useCreateProjectMutation";

const ProjectCreateForm = () => {
  const [title, setTitle] = useState("");
  const [, setSearchParams] = useSearchParams();

  const createMutation = useCreateProjectMutation();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;

        createMutation.mutate(trimmed, {
          onSuccess: () => {
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
          },
          onError: () => {
            toast.error("Create failed.");
          },
        });
      }}
    >
      <input
        className="flex-1 rounded-md border px-3 py-2 text-sm"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New project title..."
        disabled={createMutation.isPending}
      />
      <Button
        type="submit"
        disabled={createMutation.isPending || !title.trim()}
      >
        {createMutation.isPending ? "Creating..." : "Add"}
      </Button>
    </form>
  );
};

export default ProjectCreateForm;
