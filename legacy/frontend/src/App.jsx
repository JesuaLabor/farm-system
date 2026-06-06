import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import FarmerDashboard from './pages/farmer/Dashboard'
import BuyerDashboard from './pages/buyer/Dashboard'
import LGUDashboard from './pages/lgu/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

const ROLE_ROUTES = {
  farmer: '/farmer',
  buyer: '/buyer',
  lgu_officer: '/lgu',
  expert: '/lgu',
  admin: '/admin',
}

function PrivateRoute({ children, allowedRoles }) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && user && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { token, user, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token && !user) fetchMe()
  }, [token])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          user ? <Navigate to={ROLE_ROUTES[user.role] || '/login'} replace />
               : <Navigate to="/login" replace />
        } />

        <Route path="/farmer/*" element={
          <PrivateRoute allowedRoles={['farmer']}><FarmerDashboard /></PrivateRoute>
        } />
        <Route path="/buyer/*" element={
          <PrivateRoute allowedRoles={['buyer']}><BuyerDashboard /></PrivateRoute>
        } />
        <Route path="/lgu/*" element={
          <PrivateRoute allowedRoles={['lgu_officer', 'expert']}><LGUDashboard /></PrivateRoute>
        } />
        <Route path="/admin/*" element={
          <PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
