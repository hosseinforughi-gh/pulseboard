import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  createProject,
  type Paginated,
  type Project,
} from "@/services/projects.services";
import { projectsKeys } from "./projects.keys";

type CreateCtx = {
  prevLists: Array<[QueryKey, Paginated<Project> | undefined]>;
  tempId: string;
};

type CreateProjectMutation = UseMutationResult<
  Project,
  Error,
  string,
  CreateCtx
>;

function hasNoQ(key: QueryKey) {
  // key شکلش: ["projects","list", {page, limit, q}]
  const params = key?.[2] as { q?: string } | undefined;
  const q = (params?.q ?? "").trim();
  return !q;
}

export function useCreateProjectMutation(): CreateProjectMutation {
  const qc = useQueryClient();

  return useMutation<Project, Error, string, CreateCtx>({
    mutationFn: (t: string) => createProject(t),

    onMutate: async (rawTitle) => {
      const nextTitle = rawTitle.trim();
      const tempId = `temp-${Date.now()}`; // id موقت

      await qc.cancelQueries({ queryKey: projectsKeys.lists() });

      const prevLists = qc.getQueriesData<Paginated<Project>>({
        queryKey: projectsKeys.lists(),
      });

      // optimistic insert فقط برای list هایی که q ندارن و فقط page=1
      if (nextTitle) {
        for (const [key, data] of prevLists) {
          if (!data) continue;
          if (!hasNoQ(key)) continue;

          const params = key[2] as { page?: number; limit: number; q: string };
          if ((params?.page ?? data.page) !== 1) continue;

          const nextItems = [{ id: tempId, title: nextTitle }, ...data.items];
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
      }

      return { prevLists, tempId };
    },

    onError: (_err, _title, ctx) => {
      for (const [key, data] of ctx?.prevLists ?? []) {
        qc.setQueryData<Paginated<Project> | undefined>(key, data);
      }
    },

    onSuccess: (created, _title, ctx) => {
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
      qc.invalidateQueries({ queryKey: projectsKeys.lists() });
    },
  });
}
