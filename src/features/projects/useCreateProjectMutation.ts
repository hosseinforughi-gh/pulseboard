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
  const params = key?.[2];
  if (!params || typeof params !== "object") return true;
  const q = String((params as any).q ?? "").trim();
  return !q;
}

export function useCreateProjectMutation(): CreateProjectMutation {
  const qc = useQueryClient();

  return useMutation<Project, Error, string, CreateCtx>({
    mutationFn: (t: string) => {
      const title = t.trim();
      if (!title) return Promise.reject(new Error("Title is required"));
      return createProject(title);
    },

    onMutate: async (rawTitle) => {
      const nextTitle = rawTitle.trim();
      const tempId = `temp-${Date.now()}`; // id موقت

      const tempProject: Project = {
        id: tempId,
        title: nextTitle,
        createdAt: new Date().toISOString(),
      };

      await qc.cancelQueries({ queryKey: projectsKeys.lists() });

      const prevLists = qc.getQueriesData<Paginated<Project>>({
        queryKey: projectsKeys.lists(),
      });

      // optimistic insert فقط برای list هایی که q ندارن و فقط page=1
      if (nextTitle) {
        for (const [key, data] of prevLists) {
          if (!data) continue;
          if (!hasNoQ(key)) continue;

          const params = (key[2] ?? {}) as {
            page?: number;
            limit?: number;
            q?: string;
          };
          const page = params.page ?? data.page;
          if (page !== 1) continue;

          const limit = params.limit ?? data.limit;
          const nextItems = [tempProject, ...data.items];
          const trimmedItems = nextItems.slice(0, limit);

          const nextTotal = data.total + 1;
          const nextTotalPages = Math.max(1, Math.ceil(nextTotal / limit));

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
      const lists = qc.getQueriesData<Paginated<Project>>({
        queryKey: projectsKeys.lists(),
      });

      for (const [key, data] of lists) {
        if (!data) continue;
        if (!hasNoQ(key)) continue;

        const params = (key[2] ?? {}) as {
          page?: number;
          limit?: number;
          q?: string;
        };
        const page = params.page ?? data.page;
        if (page !== 1) continue;

        const idx = data.items.findIndex((p) => p.id === ctx?.tempId);
        if (idx === -1) continue;

        const nextItems = [...data.items];
        nextItems[idx] = created;

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
