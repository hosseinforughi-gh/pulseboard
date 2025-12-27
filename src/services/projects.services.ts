import { http } from "@/lib/http";

export type Project = {
  id: number;
  title: string;
};
type TodoApi = {
  id: number;
  title: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

export function getProjects(): Promise<Project[]>;
export function getProjects(params: {
  page: number;
  limit: number;
  q: string;
}): Promise<Paginated<Project>>;

export async function getProjects(params?: {
  page: number;
  limit: number;
  q: string;
}): Promise<Project[] | Paginated<Project>> {
  if (!params) {
    const { data } = await http.get<TodoApi[]>("/todos", {
      params: { _limit: 40 },
    });
    return data.map((t) => ({ id: t.id, title: t.title }));
  }
  const { page, limit, q } = params;

  const res = await http.get<TodoApi[]>("/todos", {
    params: {
      _page: page,
      _limit: limit,
      _sort: "id",
      _order: "desc",
      ...(q.trim() ? { q: q.trim() } : {}),
    },
  });
  const items: Project[] = res.data.map((t) => ({ id: t.id, title: t.title }));
  const totalHeader = res.headers?.["x-total-count"] as string | undefined;

  const total =
    totalHeader && !Number.isNaN(Number(totalHeader))
      ? Number(totalHeader)
      : items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return { items, total, totalPages, page, limit };
}

export async function getProject(id: number): Promise<Project> {
  const { data } = await http.get<TodoApi>(`/todos/${id}`);
  return { id: data.id, title: data.title };
}

export async function createProject(title: string) {
  const { data } = await http.post<TodoApi>("/todos", {
    title,
    completed: false,
  });
  return { id: data.id, title: data.title };
}

export async function deleteProject(id: number): Promise<void> {
  await http.delete(`/todos/${id}`);
}

export async function updateProject(
  id: number,
  title: string
): Promise<Project> {
  const { data } = await http.patch<TodoApi>(`/todos/${id}`, { title });
  return { id: data.id, title: data.title };
}
