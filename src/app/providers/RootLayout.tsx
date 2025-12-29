import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";

const RootLayout = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

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
                  qc.removeQueries({ queryKey: ["projects"] });
                  navigate("/", { replace: true });
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                // اگر وسط یه مسیر protected بود، بعد لاگین برگرده همونجا
                login({ id: "1", name: "Hossein" });
                navigate(
                  (location.state as any)?.from?.pathname ?? "/projects",
                  {
                    replace: true,
                  }
                );
              }}
            >
              Login
            </Button>
          )}

          <ModeToggle />
        </div>
      </header>

      <Outlet />
    </div>
  );
};

export default RootLayout;
