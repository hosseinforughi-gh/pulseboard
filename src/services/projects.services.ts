import { http } from "@/lib/http";

export type Project = {
  id: number;
  title: string;
};

export async function getProjects(): Promise<Project[]> {
  const { data } = await http.get<any[]>("/todos?_limit=8");
  return data.map((t) => ({ id: t.id, title: t.title }));
}
