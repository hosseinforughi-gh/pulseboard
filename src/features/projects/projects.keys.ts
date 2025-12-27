export const projectsKeys = {
  all: ["projects"] as const,
  list: (params: { page: number; limit: number; q: string }) =>
    [...projectsKeys.all, "list", params] as const,
};
