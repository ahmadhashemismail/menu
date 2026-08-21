import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Menu from './pages/menu'
import Admin from './pages/admin'



function App() {
  return (
    <>
      <nav>
        <Link to="/menu">Menu</Link>
        {' | '}
  
        <Link to="/admin">Admin</Link>

      </nav>

      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<Menu />} />
    
      </Routes>
   </>
  )
}

export default App