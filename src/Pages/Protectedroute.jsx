

import { Navigate, Outlet } from 'react-router-dom'

function Protectedroute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children || <Outlet />
}

export default Protectedroute