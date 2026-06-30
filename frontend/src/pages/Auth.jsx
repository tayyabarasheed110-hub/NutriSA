import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { Leaf, Check } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    if (mode === 'login') {
      const res = await signIn(email, password)
      if (res.ok) navigate('/dashboard')
      else setError(res.error)
    } else {
      const res = await signUp(email, password)
      if (res.ok) setMode('login')
      else setError(res.error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[45%] bg-[#1D9E75] flex-col justify-center px-16 text-white">
        <Leaf className="w-12 h-12 mb-6" />
        <h1 className="text-[22px] font-medium text-white mb-4">Track what you actually eat.</h1>
        <p className="text-white/80 text-[16px] leading-relaxed mb-8">
          Built for South Asian meals. Log in Urdu or English. Scan your plate.
        </p>
        <div className="space-y-3">
          {['Understands katori, roti, karahi', 'South Asian food database', 'Personalised protein goals'].map((f) => (
            <div key={f} className="flex items-center gap-2 text-white/90 text-[14px]">
              <Check className="w-4 h-4" />{f}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-[400px]">
          <div className="flex justify-center mb-6"><Leaf className="w-8 h-8 text-[#1D9E75]" /></div>
          <h2 className="text-[18px] font-medium text-[#1A1A18] mb-6">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <div className="text-[13px] text-[#A32D2D]">{error}</div>}
            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[0.5px] bg-[rgba(0,0,0,0.08)]" />
            <span className="text-[12px] text-[#888780]">or</span>
            <div className="flex-1 h-[0.5px] bg-[rgba(0,0,0,0.08)]" />
          </div>

          <button className="btn-ghost w-full flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="text-[14px]">Continue with Google</span>
          </button>

          <div className="mt-6 text-center text-[13px] text-[#5F5E5A]">
            {mode === 'login' ? (
              <>Don't have an account? <button className="text-[#1D9E75] font-medium" onClick={() => { setMode('signup'); setError('') }}>Sign up</button></>
            ) : (
              <>Already have an account? <button className="text-[#1D9E75] font-medium" onClick={() => { setMode('login'); setError('') }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
