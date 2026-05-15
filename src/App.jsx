import { BrowserRouter, Routes, Route } from "react-router"
import ProtectedRoutes from "./ProtectedRoutes"
import MainLayout from "./layouts/MainLayout"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={'/welcome'} element/> 
          <Route path={'/login'} element/>  
          <Route path={'/register'} element/> 
          <Route path={'/onboarding'} element/>
          <Route element={<ProtectedRoutes/>}>
            <Route element={<MainLayout />}>
              <Route path={'/sets'} element={<div>Sets</div>} />
              <Route path={'/sessions'} element={<div>Sessions</div>} />
              <Route path={'/body'} element={<div>Body</div>} />
              <Route path={'/today'} element={<div>Today</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;