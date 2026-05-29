import { Navigate, Outlet } from "react-router";
import { useAuth } from "./hooks/queries/useAuth";

function ProtectedRoutes() {
  const { data: profile, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!profile) return <Navigate to={"/login"} />;

  return <Outlet />;
}

export default ProtectedRoutes;
