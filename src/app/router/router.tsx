import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../providers/RootLayout";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";
import ProtectedRoute from "./ProtectedRoute";
import RouteErrorPage from "@/pages/RouteErrorPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/projects", element: <ProjectsPage /> },
          { path: "/projects/:id", element: <ProjectDetailsPage /> },
        ],
      },
    ],
  },
]);
export default router;
