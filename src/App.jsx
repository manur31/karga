import { BrowserRouter, Routes, Route } from "react-router"
import ProtectedRoutes from "./ProtectedRoutes"
import MainLayout from "./layouts/MainLayout"
import PublicLayout from "./layouts/PublicLayout";
import Welcome from './pages/Welcome';
import Login from "./pages/Login";    
import Register from './pages/Register';
import Onboarding from "./pages/Onboarding";
import Rutinas from "./pages/Rutinas";
import Sessions from "./pages/Sessions";
import Progreso from "./pages/Progreso";
import Hoy from "./pages/Hoy";
import SetsPage from "./pages/SetsPage";
import TestPage from "./pages/TestPage";
import SetsNewPage from "./pages/SetsNewPage";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout/>}>
            <Route path={'/'} element={<Welcome/>}/> 
            <Route path={'/welcome'} element={<Welcome/>}/> 
            <Route path={'/login'} element={<Login/>}/>  
            <Route path={'/register'} element={<Register/>}/> 
            <Route path={'/onboarding'} element={<Onboarding/>}/>
            <Route path={'/forgot-password'} element={<ForgotPassword/>}/>
          </Route>
          <Route element={<ProtectedRoutes/>}>
            <Route element={<MainLayout />}>
              <Route path={"/rutinas"} element={<Rutinas/>} />
              <Route path={"/sessions"} element={<Sessions/>} />
              <Route path={"/progreso"} element={<Progreso/>} />
              <Route path={"/hoy"} element={<Hoy/>} />
              <Route path={"/profile"} element={<SetsPage/>} />
              <Route path={"/test"} element={<TestPage/>} />
              <Route path={"/sets-new"} element={<SetsNewPage/>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
