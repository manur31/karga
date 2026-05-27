import { Navigate, Outlet } from "react-router";
import { useAuth } from "./hooks/queries/useAuth";

function ProtectedRoutes() {
  // const { data: profile } = useAuth()

  // if (!profile) return <Navigate to={"/login"} />;

  // return <Outlet />;
  
  return <div>Protected Routes</div>;
}

export default ProtectedRoutes;
