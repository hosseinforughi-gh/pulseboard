import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentProjectsCard from "@/features/projects/RecentProjectsCard";

const HomePage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">PulseBoard</h1>
        <p className="text-muted-foreground">
          A tiny project dashboard to practice React Query, Zustand, routing,
          and polished UI with shadcn.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What you can do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Browse projects with pagination and search</li>
              <li>Create with optimistic UI updates</li>
              <li>Edit project title with inline save</li>
              <li>Delete with confirmation dialog</li>
              <li>Protected routes + persisted auth</li>
            </ul>
          </CardContent>
        </Card>

        <RecentProjectsCard />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tech stack</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          React + TypeScript • React Router • TanStack Query • Zustand •
          Tailwind • shadcn/ui
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
