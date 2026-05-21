import { Navigate, Outlet } from "react-router";

function ProtectedRoutes() {
  const USER_SECCION = false;

  if (USER_SECCION) return <Navigate to={"/login"} />;

  return <Outlet />;
}

export default ProtectedRoutes;
