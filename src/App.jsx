import { BrowserRouter, Routes, Route } from "react-router"
import ProtectedRoutes from "./ProtectedRoutes"
import MainLayout from "./layouts/MainLayout"
import PublicLayout from "./layouts/PublicLayout";
import Welcome from './pages/Welcome';
import Login from "./pages/Login";    
import Register from './pages/Register';
import Onboarding from "./pages/Onboarding";

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
          </Route>
          <Route element={<ProtectedRoutes/>}>
            <Route element={<MainLayout />}>
              <Route path={"/sets"} element={<div>Sets</div>} />
              <Route path={"/sessions"} element={<div>Sessions</div>} />
              <Route path={"/body"} element={<div>Body</div>} />
              <Route path={"/today"} element={<div>Today</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
