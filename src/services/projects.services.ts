import { http } from "@/lib/http";

export type Project = {
  id: string;
  title: string;
};

type TodoApi = {
  id: string | number;
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
    return data.map((t) => ({ id: String(t.id), title: t.title }));
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

  const items: Project[] = res.data.map((t) => ({
    id: String(t.id),
    title: t.title,
  }));

  const totalHeader = res.headers?.["x-total-count"] as string | undefined;

  const total =
    totalHeader && !Number.isNaN(Number(totalHeader))
      ? Number(totalHeader)
      : items.length;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return { items, total, totalPages, page, limit };
}

export async function getProject(id: string): Promise<Project> {
  const { data } = await http.get<TodoApi>(`/todos/${id}`);
  return { id: String(data.id), title: data.title };
}

export async function createProject(title: string): Promise<Project> {
  const { data } = await http.post<TodoApi>("/todos", {
    title,
    completed: false,
  });
  return { id: String(data.id), title: data.title };
}

export async function deleteProject(id: string): Promise<void> {
  await http.delete(`/todos/${id}`);
}

export async function updateProject(
  id: string,
  title: string
): Promise<Project> {
  const { data } = await http.patch<TodoApi>(`/todos/${id}`, { title });
  return { id: String(data.id), title: data.title };
}
