import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import { useAuthStore } from '../store/authStore.js'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const loadProfile = useAuthStore((s) => s.loadProfile)
  const [tab, setTab] = useState('personal')
  const [form, setForm] = useState({
    full_name: '', age: '', weight_kg: '', height_cm: '',
    goal: '', activity_level: '', protein_target: '', calorie_target: '',
    diet_types: [], allergies: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => { loadProfile() }, [])
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '', age: user.age || '', weight_kg: user.weight_kg || '', height_cm: user.height_cm || '',
        goal: user.goal || '', activity_level: user.activity_level || '', protein_target: user.protein_target || '',
        calorie_target: user.calorie_target || '', diet_types: user.diet_types || [], allergies: user.allergies || '',
      })
    }
  }, [user])

  const handleSave = async () => {
    setIsLoading(true)
    await useAuthStore.getState().updateProfile({
      full_name: form.full_name, age: parseInt(form.age) || 0, weight_kg: parseFloat(form.weight_kg) || 0,
      height_cm: parseFloat(form.height_cm) || 0, allergies: form.allergies,
    })
    setIsLoading(false)
  }

  const handleRecalc = async () => {
    setIsLoading(true)
    await useAuthStore.getState().updateProfile({ goal: form.goal, activity_level: form.activity_level, weight_kg: parseFloat(form.weight_kg) || 0 })
    await loadProfile()
    setIsLoading(false)
  }

  const initials = form.full_name ? form.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || 'U'
  const tabs = [{ key: 'personal', label: 'Personal info' }, { key: 'goals', label: 'Goals' }, { key: 'notifications', label: 'Notifications' }, { key: 'account', label: 'Account' }]

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="card p-5 h-fit">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-[18px] font-medium">{initials}</div>
            <div className="text-[14px] font-medium text-[#1A1A18]">{form.full_name || 'User'}</div>
            <div className="text-[12px] text-[#888780]">{user?.email}</div>
          </div>
          <div className="space-y-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`w-full text-left px-3 py-2 rounded-[8px] text-[13px] ${tab === t.key ? 'bg-[#E1F5EE] text-[#1D9E75] font-medium' : 'text-[#5F5E5A]'}`}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          {tab === 'personal' && (
            <div className="space-y-4 max-w-[480px]">
              <h2 className="text-[18px] font-medium text-[#1A1A18] mb-2">Personal info</h2>
              <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" />
              <input className="input" value={user?.email || ''} placeholder="Email" disabled />
              <div className="flex gap-3">
                <input className="input flex-1" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" />
                <input className="input flex-1" type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} placeholder="Weight (kg)" />
                <input className="input flex-1" type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} placeholder="Height (cm)" />
              </div>
              <button className="btn-primary" onClick={handleSave} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save changes'}</button>
            </div>
          )}
          {tab === 'goals' && (
            <div className="space-y-4 max-w-[480px]">
              <h2 className="text-[18px] font-medium text-[#1A1A18] mb-2">Goals</h2>
              <div className="card p-4 bg-[#F8F8F7]">
                <div className="text-[13px] text-[#888780] mb-1">Current targets</div>
                <div className="text-[14px] text-[#1A1A18]">Protein: <span className="font-medium text-[#1D9E75]">{user?.protein_target || 0}g/day</span> · Calories: <span className="font-medium">{user?.calorie_target || 0} kcal/day</span></div>
              </div>
              <div>
                <label className="section-label mb-2 block">Goal</label>
                <select className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                  <option value="">Select goal</option><option value="build muscle">Build muscle</option><option value="lose fat">Lose fat</option><option value="maintain weight">Maintain weight</option>
                </select>
              </div>
              <div>
                <label className="section-label mb-2 block">Activity level</label>
                <select className="input" value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })}>
                  <option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very active">Very active</option>
                </select>
              </div>
              <button className="btn-primary" onClick={handleRecalc} disabled={isLoading}>{isLoading ? 'Recalculating...' : 'Recalculate targets'}</button>
              <div className="pt-4 border-t border-[rgba(0,0,0,0.08)]">
                <label className="section-label mb-2 block">Manual protein override</label>
                <input className="input" type="number" value={form.protein_target} onChange={(e) => setForm({ ...form, protein_target: e.target.value })} placeholder="g/day" />
                <button className="btn-ghost mt-2" onClick={async () => { setIsLoading(true); await useAuthStore.getState().updateProfile({ protein_target: parseFloat(form.protein_target) || 0 }); setIsLoading(false) }}>Save override</button>
              </div>
            </div>
          )}
          {tab === 'notifications' && (
            <div className="space-y-4 max-w-[480px]">
              <h2 className="text-[18px] font-medium text-[#1A1A18] mb-2">Notifications</h2>
              <p className="text-[13px] text-[#888780]">Notification settings coming soon.</p>
            </div>
          )}
          {tab === 'account' && (
            <div className="space-y-4 max-w-[480px]">
              <h2 className="text-[18px] font-medium text-[#1A1A18] mb-2">Account</h2>
              <button className="btn-ghost text-[#A32D2D]" onClick={() => useAuthStore.getState().signOut()}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
