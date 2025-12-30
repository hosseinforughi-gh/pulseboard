import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>404 — Page not found</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            The page you’re looking for doesn’t exist or has been moved.
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/">
              <Button>Go home</Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline">Go to projects</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
