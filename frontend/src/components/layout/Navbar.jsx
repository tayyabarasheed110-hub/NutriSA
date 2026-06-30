import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'
import { Leaf, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/log', label: 'Log meal' },
    { path: '/history', label: 'History' },
    { path: '/diet-plan', label: 'Diet plan' },
    { path: '/progress', label: 'Progress' },
  ]

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[rgba(0,0,0,0.08)]">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Leaf className="w-5 h-5 text-[#1D9E75]" />
          <span className="text-[16px] font-medium text-[#1D9E75]">NutriSA</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className={`text-sm font-medium pb-1 ${location.pathname === l.path ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]' : 'text-[#5F5E5A]'}`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-xs font-medium cursor-pointer" onClick={() => navigate('/profile')}>
            {initials}
          </div>
          <button className="text-sm text-[#5F5E5A]" onClick={signOut}>Sign out</button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[rgba(0,0,0,0.08)] px-6 py-4 space-y-3">
          {links.map((l) => (
            <button key={l.path} onClick={() => { navigate(l.path); setMobileOpen(false) }} className={`block text-sm font-medium ${location.pathname === l.path ? 'text-[#1D9E75]' : 'text-[#5F5E5A]'}`}>
              {l.label}
            </button>
          ))}
          <button className="block text-sm text-[#5F5E5A]" onClick={() => { navigate('/profile'); setMobileOpen(false) }}>Profile</button>
          <button className="block text-sm text-[#5F5E5A]" onClick={signOut}>Sign out</button>
        </div>
      )}
    </nav>
  )
}
