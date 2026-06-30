import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { Leaf, Dumbbell, Target, Scale, ChevronRight } from 'lucide-react'

export default function Onboarding() {
  const navigate = useNavigate()
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '', age: '', sex: '', weight_kg: '', height_cm: '',
    goal: '', activity_level: 'moderate', diet_types: [], allergies: '',
  })
  const [targets, setTargets] = useState({ protein: 0, calories: 0 })
  const [isLoading, setIsLoading] = useState(false)

  const calcTargets = () => {
    const w = parseFloat(form.weight_kg) || 0
    const base = { 'build muscle': 1.6, 'lose fat': 1.2, 'maintain weight': 1.0 }[form.goal] || 1.0
    const mult = { sedentary: 0.9, light: 1.0, moderate: 1.05, active: 1.1, 'very active': 1.15 }[form.activity_level] || 1.0
    const protein = Math.round(base * w * mult / 5) * 5
    return { protein, calories: Math.round(2200 * mult) }
  }

  const handleNext = () => {
    if (step === 2) setTargets(calcTargets())
    setStep((s) => s + 1)
  }
  const toggleDiet = (d) => setForm((f) => ({ ...f, diet_types: f.diet_types.includes(d) ? f.diet_types.filter((x) => x !== d) : [...f.diet_types, d] }))
  const handleFinish = async () => {
    setIsLoading(true)
    await updateProfile({
      ...form, age: parseInt(form.age) || 0, weight_kg: parseFloat(form.weight_kg) || 0,
      height_cm: parseFloat(form.height_cm) || 0, protein_target: targets.protein, calorie_target: targets.calories,
    })
    setIsLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[480px]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-5 h-5 text-[#1D9E75]" />
          <span className="text-[16px] font-medium text-[#1D9E75]">NutriSA</span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full ${s === step ? 'bg-[#1D9E75]' : s < step ? 'bg-[#1D9E75]/40' : 'bg-[rgba(0,0,0,0.08)]'}`} />
          ))}
        </div>
        <div className="card p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-medium text-[#1A1A18] mb-1">About you</h2>
              <input className="input" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <input className="input" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              <div className="flex gap-2">
                {['Male', 'Female', 'Prefer not to say'].map((s) => (
                  <button key={s} onClick={() => setForm({ ...form, sex: s })} className={`flex-1 py-2 text-[13px] rounded-[8px] border ${form.sex === s ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#1D9E75]' : 'border-[rgba(0,0,0,0.08)] text-[#5F5E5A]'}`}>{s}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <input className="input flex-1" type="number" placeholder="Weight (kg)" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
                <input className="input flex-1" type="number" placeholder="Height (cm)" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} />
              </div>
              <button className="btn-primary w-full mt-2" onClick={handleNext} disabled={!form.full_name || !form.age || !form.sex || !form.weight_kg || !form.height_cm}>
                Next <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-medium text-[#1A1A18] mb-1">Your goal</h2>
              <div className="grid grid-cols-3 gap-3">
                {[{ key: 'build muscle', label: 'Build muscle', icon: Dumbbell }, { key: 'lose fat', label: 'Lose fat', icon: Scale }, { key: 'maintain weight', label: 'Maintain', icon: Target }].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setForm({ ...form, goal: key })} className={`flex flex-col items-center gap-2 p-4 rounded-[8px] border transition ${form.goal === key ? 'border-[#1D9E75] bg-[#E1F5EE]' : 'border-[rgba(0,0,0,0.08)]'}`}>
                    <Icon className={`w-5 h-5 ${form.goal === key ? 'text-[#1D9E75]' : 'text-[#888780]'}`} />
                    <span className={`text-[12px] font-medium ${form.goal === key ? 'text-[#1D9E75]' : 'text-[#5F5E5A]'}`}>{label}</span>
                  </button>
                ))}
              </div>
              <div>
                <label className="section-label mb-2 block">Activity level</label>
                <select className="input" value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })}>
                  <option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very active">Very active</option>
                </select>
              </div>
              <button className="btn-primary w-full mt-2" onClick={handleNext} disabled={!form.goal}>Calculate my targets</button>
              {targets.protein > 0 && (
                <div className="text-[13px] text-[#5F5E5A] mt-2">
                  Your daily protein target: <span className="font-medium text-[#1D9E75]">{targets.protein}g</span>
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-medium text-[#1A1A18] mb-1">Preferences</h2>
              <div>
                <label className="section-label mb-2 block">Diet type</label>
                <div className="flex flex-wrap gap-2">
                  {['Omnivore', 'Vegetarian', 'Vegan', 'Halal', 'Jain'].map((d) => (
                    <button key={d} onClick={() => toggleDiet(d)} className={`px-3 py-1.5 text-[13px] rounded-[8px] border ${form.diet_types.includes(d) ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#1D9E75]' : 'border-[rgba(0,0,0,0.08)] text-[#5F5E5A]'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <input className="input" placeholder="Allergies (optional)" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
              <button className="btn-primary w-full mt-2" onClick={handleFinish} disabled={isLoading}>{isLoading ? 'Saving...' : 'Go to dashboard'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
