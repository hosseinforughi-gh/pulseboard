import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RouteErrorPage() {
  const error = useRouteError();

  let title = "Something went wrong";
  let description = "An unexpected error occurred.";
  let status: number | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = `${error.status} ${error.statusText}`;
    description =
      typeof error.data === "string" ? error.data : "The page failed to load.";
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {status ? (
            <div className="text-sm text-muted-foreground">
              Status: {status}
            </div>
          ) : null}

          <div className="text-sm text-muted-foreground break-words">
            {description}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <Link to="/">
              <Button variant="outline">Go home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
