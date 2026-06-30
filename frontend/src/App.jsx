import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore.js'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LogMeal from './pages/LogMeal.jsx'
import History from './pages/History.jsx'
import DietPlan from './pages/DietPlan.jsx'
import Progress from './pages/Progress.jsx'
import Profile from './pages/Profile.jsx'

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token)
  const loadProfile = useAuthStore((s) => s.loadProfile)
  useEffect(() => { if (token) loadProfile() }, [token])
  if (!token) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/log" element={<RequireAuth><LogMeal /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
        <Route path="/diet-plan" element={<RequireAuth><DietPlan /></RequireAuth>} />
        <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
