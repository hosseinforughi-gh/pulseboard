import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

const HomePage = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Home</h2>
      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="text-sm">Welcome, {user?.name}</div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      ) : (
        <Button onClick={() => login({ id: "1", name: "Hossein" })}>
          Login (Mock)
        </Button>
      )}
    </div>
  );
};

export default HomePage;
