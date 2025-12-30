import { http } from "@/lib/http";

export type Project = {
  id: string;
  title: string;
  createdAt: string;
};

type TodoApi = {
  id: string | number;
  title: string;
  completed?: boolean;
  createdAt?: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

function mapTodoToProject(t: TodoApi): Project {
  return {
    id: String(t.id),
    title: t.title,
    createdAt: t.createdAt ?? new Date(0).toISOString(),
  };
}

/**
 * Used for places like "RecentProjects" or anywhere you want a simple list (non-paginated).
 */
export async function getProjectsAll(limit = 40): Promise<Project[]> {
  const { data } = await http.get<TodoApi[]>("/todos", {
    params: { _limit: limit },
  });

  return (data ?? []).map(mapTodoToProject);
}

/**
 * Main paginated list endpoint (supports search via `q`).
 * Works well with json-server (reads x-total-count header).
 */
export async function getProjectsPage(params: {
  page: number;
  limit: number;
  q: string;
}): Promise<Paginated<Project>> {
  const { page, limit, q } = params;

  const res = await http.get<TodoApi[]>("/todos", {
    params: {
      _page: page,
      _limit: limit,
      _sort: "createdAt",
      _order: "desc",
      ...(q.trim() ? { q: q.trim() } : {}),
    },
  });

  const items: Project[] = (res.data ?? []).map(mapTodoToProject);

  // axios typically normalizes headers to lowercase
  const totalHeader = (res.headers?.["x-total-count"] ??
    res.headers?.["X-Total-Count"]) as string | undefined;

  const total =
    totalHeader && Number.isFinite(Number(totalHeader))
      ? Number(totalHeader)
      : items.length;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return { items, total, totalPages, page, limit };
}

export async function getProject(id: string): Promise<Project> {
  const { data } = await http.get<TodoApi>(`/todos/${id}`);
  return mapTodoToProject(data);
}

export async function createProject(title: string): Promise<Project> {
  const { data } = await http.post<TodoApi>("/todos", {
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  });
  return mapTodoToProject(data);
}

export async function deleteProject(id: string): Promise<void> {
  await http.delete(`/todos/${id}`);
}

export async function updateProject(
  id: string,
  title: string
): Promise<Project> {
  const { data } = await http.patch<TodoApi>(`/todos/${id}`, { title });
  return mapTodoToProject(data);
}
