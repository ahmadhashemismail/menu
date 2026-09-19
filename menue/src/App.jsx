import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'

import Admin from './pages/admin'

import Header from './pages/mainpage'

function App() {
  const location = useLocation()
  const ismain = location.pathname === '/mainpage' || location.pathname === '/'

  return (
    <>
      {/* Only show the top nav on non-menu pages (admin, etc.).
          The menu page has its own hero header. */}
      {ismain && (
        <Header />)}

      <Routes>
        <Route path="mainpage/admin" element={<Admin />} />
        <Route path="/" element={<Navigate to="/mainpage" replace />} />

      </Routes>
    </>
  )
}

export default App