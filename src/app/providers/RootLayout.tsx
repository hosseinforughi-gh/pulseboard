import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RootLayout = () => {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center gap-3">
        <Link to="/" className="text-xl font-bold">
          PulseBoard
        </Link>
        <Link to="/projects">
          <Button variant="outline">Projects</Button>
        </Link>
      </header>
      <Outlet />
    </div>
  );
};

export default RootLayout;
