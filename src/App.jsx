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
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route element={<MainLayout />}>
              <Route path={"/sets"} element={<Sets />} />
              <Route path={"/sessions"} element={<Sessions />} />
              <Route path={"/body"} element={<Body />} />
              <Route path={"/today"} element={<Today />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
