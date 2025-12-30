import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";

const RootLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center gap-3">
        <Link to="/" className="text-xl font-bold">
          PulseBoard
        </Link>

        <Link to="/projects">
          <Button variant="outline">Projects</Button>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user?.name}
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  qc.cancelQueries({ queryKey: ["projects"] });
                  qc.removeQueries({ queryKey: ["projects"] });
                  navigate("/", { replace: true });
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate("/login")}>Login</Button>
          )}

          <ModeToggle />
        </div>
      </header>

      <Outlet />
    </div>
  );
};

export default RootLayout;
