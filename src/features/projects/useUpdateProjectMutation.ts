import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  updateProject,
  type Paginated,
  type Project,
} from "@/services/projects.services";
import { projectsKeys } from "./projects.keys";

type UpdateCtx = {
  prevProject: Project | undefined;
  prevLists: Array<[QueryKey, Paginated<Project> | undefined]>;
};

type UpdateProjectMutation = UseMutationResult<
  Project,
  Error,
  string,
  UpdateCtx
>;

export function useUpdateProjectMutation(id: number): UpdateProjectMutation {
  const qc = useQueryClient();

  return useMutation<Project, Error, string, UpdateCtx>({
    mutationFn: async (newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) throw new Error("Title is required");
      return updateProject(id, trimmed);
    },

    onMutate: async (newTitle) => {
      const nextTitle = newTitle.trim();

      await qc.cancelQueries({ queryKey: projectsKeys.detail(id) });
      await qc.cancelQueries({ queryKey: projectsKeys.lists() });

      const prevProject = qc.getQueryData<Project>(projectsKeys.detail(id));
      const prevLists = qc.getQueriesData<Paginated<Project>>({
        queryKey: projectsKeys.lists(),
      });

      // اگر خالی بود فقط snapshot بده برای rollback
      if (!nextTitle) return { prevProject, prevLists };

      // optimistic detail update
      qc.setQueryData<Project>(projectsKeys.detail(id), (old) =>
        old ? { ...old, title: nextTitle } : old
      );

      // optimistic update for ALL cached lists
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
      if (!ctx) return;

      qc.setQueryData<Project | undefined>(
        projectsKeys.detail(id),
        ctx.prevProject
      );

      for (const [key, data] of ctx.prevLists) {
        qc.setQueryData<Paginated<Project> | undefined>(key, data);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: projectsKeys.lists() });
    },
  });
}
