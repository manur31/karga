import { BrowserRouter, Routes, Route } from "react-router";
import ProtectedRoutes from "./ProtectedRoutes";
import MainLayout from "./layouts/MainLayout";
import PublicLayout from "./layouts/PublicLayout";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Sets from "./pages/Sets";
import Sessions from "./pages/Sessions";
import Body from "./pages/Body";
import Today from "./pages/Today";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path={"/"} element={<Welcome />} />
            <Route path={"/welcome"} element={<Welcome />} />
            <Route path={"/login"} element={<Login />} />
            <Route path={"/register"} element={<Register />} />
            <Route path={"/onboarding"} element={<Onboarding />} />
            <Route path={"/forgot-password"} element={<ErrorPage title="Recuperar contraseña" redirectTo="/login" suffix=" al Login" />} />
            <Route path={"*"} element={<ErrorPage />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route element={<MainLayout />}>
              <Route path={"/rutinas"} element={<Sets />} />
              <Route path={"/sessions"} element={<Sessions />} />
              <Route path={"/progreso"} element={<Body />} />
              <Route path={"/hoy"} element={<Today />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
