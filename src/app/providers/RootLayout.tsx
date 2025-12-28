import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

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
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default RootLayout;
