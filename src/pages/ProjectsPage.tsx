import { Button } from "@/components/ui/button";
import { getProjects } from "@/services/projects.services";
import { useQuery } from "@tanstack/react-query";

const ProjectsPage = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
  if (isLoading) return <div className="text-sm">Loading...</div>;

  if (isError)
    return (
      <div className="space-y-3">
        <div className="text-sm">Something went wrong.</div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Projects</h2>
      <ul className="space-y-2">
        {data?.map((p) => (
          <li key={p.id} className="rounded-lg border p-3">
            {p.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsPage;
