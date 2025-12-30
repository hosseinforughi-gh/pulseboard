import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !warnedRef.current) {
      warnedRef.current = true;
      toast.info("Please sign in to continue.");
    }
    if (isAuthenticated) warnedRef.current = false;
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
