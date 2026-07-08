import { Navigate, Outlet } from "react-router";

function ProtectedRoutes() {
  const session = JSON.parse(localStorage.getItem('sb-brgpmmolyighfdlfitia-auth-token'));
  console.log(session)

  if (!session) return <Navigate to={"/login"} />;

  return <Outlet />;
}

export default ProtectedRoutes;
