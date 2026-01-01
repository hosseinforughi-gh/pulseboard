import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FromLocation = { pathname: string; search?: string; hash?: string };
type LocationState = {
  from?: FromLocation;
};

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const from = state?.from;
  const redirectTo = from
    ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
    : "/projects";

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            For this demo, click the button to sign in.
          </div>

          <Button
            className="w-full"
            onClick={() => {
              login({ id: "1", name: "Demo User" });
              toast.success("Logged in");
              navigate(redirectTo, { replace: true });
            }}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
