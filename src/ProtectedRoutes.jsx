import { Navigate, Outlet } from "react-router";
import { useAuth } from "./hooks/queries/useAuth";

function ProtectedRoutes() {
  const { data: profile, isLoading } = useAuth()

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center">
    <div className="w-16 h-16 border-2 border-karga-orange border-t-transparent rounded-full animate-spin"></div>
  </div>
  if (!profile) return <Navigate to={"/login"} />;

  return <Outlet />;
}

export default ProtectedRoutes;
