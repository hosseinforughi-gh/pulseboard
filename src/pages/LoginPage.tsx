import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type LocationState = {
  from?: Location;
};

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from;
  const redirectTo = (from as any)?.pathname
    ? `${(from as any).pathname}${(from as any).search ?? ""}${
        (from as any).hash ?? ""
      }`
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
              login({ id: "1", name: "Hossein" });
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
