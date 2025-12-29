import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useLocation, useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname as string | undefined;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Home</h2>
      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="text-sm">Welcome, {user?.name}</div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
          >
            Logout
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => {
            login({ id: "1", name: "Hossein" });
            navigate(from ?? "/projects", { replace: true });
          }}
        >
          Login (Mock)
        </Button>
      )}
    </div>
  );
};

export default HomePage;
