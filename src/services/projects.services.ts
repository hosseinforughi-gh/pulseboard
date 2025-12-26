import { http } from "@/lib/http";

export type Project = {
  id: number;
  title: string;
};
type TodoApi = {
  id: number;
  title: string;
};

export async function getProjects(): Promise<Project[]> {
  const { data } = await http.get<TodoApi[]>("/todos?_limit=40");
  return data.map((t) => ({ id: t.id, title: t.title }));
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
