import { BrowserRouter, Routes, Route } from "react-router"
import ProtectedRoutes from "./ProtectedRoutes"

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
            <Route path={'/sets'} element/>
            <Route path={'/sessions'} element/>
            <Route path={'/body'} element/>
            <Route path={'/today'} element/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
