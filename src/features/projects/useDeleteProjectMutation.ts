import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteProject,
  type Paginated,
  type Project,
} from "@/services/projects.services";
import { projectsKeys } from "./projects.keys";

type Ctx = {
  prev: Array<[QueryKey, Paginated<Project> | undefined]>;
};

type DeleteProjectMutation = UseMutationResult<void, Error, number, Ctx>;

export function useDeleteProjectMutation(): DeleteProjectMutation {
  const qc = useQueryClient();

  return useMutation<void, Error, number, Ctx>({
    mutationFn: (id) => deleteProject(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: projectsKeys.lists() });

      const prev = qc.getQueriesData<Paginated<Project>>({
        queryKey: projectsKeys.lists(),
      });

      for (const [key, data] of prev) {
        if (!data) continue;

        const nextItems = data.items.filter((p) => p.id !== id);
        if (nextItems.length === data.items.length) continue;

        const nextTotal = Math.max(0, data.total - 1);
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / data.limit));

        qc.setQueryData<Paginated<Project>>(key, {
          ...data,
          items: nextItems,
          total: nextTotal,
          totalPages: nextTotalPages,
        });
      }

      return { prev };
    },

    onError: (_err, _id, ctx) => {
      for (const [key, data] of ctx?.prev ?? []) {
        qc.setQueryData<Paginated<Project> | undefined>(key, data);
      }
      toast.error("Delete failed. Please try again.");
    },

    onSuccess: () => {
      toast.success("Project deleted.");
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.lists() });
    },
  });
}
