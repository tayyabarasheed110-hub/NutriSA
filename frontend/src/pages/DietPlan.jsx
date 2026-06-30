import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import client from '../api/client.js'
import { useAuthStore } from '../store/authStore.js'
import { Loader2, Check } from 'lucide-react'

export default function DietPlan() {
  const user = useAuthStore((s) => s.user)
  const loadProfile = useAuthStore((s) => s.loadProfile)
  const [plan, setPlan] = useState([])
  const [loading, setLoading] = useState(false)
  const [groceries, setGroceries] = useState([])

  useEffect(() => { loadProfile(); fetchPlan() }, [])

  const fetchPlan = async () => {
    try { const res = await client.get('/diet-plan/current'); if (res.data?.plan_data?.length > 0) { setPlan(res.data.plan_data); buildGroceries(res.data.plan_data) } } catch {}
  }

  const buildGroceries = (planData) => {
    const cats = { Proteins: [], Grains: [], Vegetables: [], Dairy: [] }
    planData.forEach((day) => {
      Object.values(day.meals || {}).forEach((meal) => {
        const name = meal.name.toLowerCase()
        if (name.includes('egg') || name.includes('chicken') || name.includes('fish') || name.includes('paneer') || name.includes('dal') || name.includes('chana')) cats.Proteins.push(meal.name)
        else if (name.includes('roti') || name.includes('rice') || name.includes('paratha') || name.includes('oats') || name.includes('atta')) cats.Grains.push(meal.name)
        else if (name.includes('salad') || name.includes('vegetable') || name.includes('bhindi') || name.includes('aloo')) cats.Vegetables.push(meal.name)
        else if (name.includes('lassi') || name.includes('milk') || name.includes('dahi') || name.includes('raita')) cats.Dairy.push(meal.name)
        else cats.Proteins.push(meal.name)
      })
    })
    const items = []
    Object.keys(cats).forEach((cat) => { const unique = [...new Set(cats[cat])]; unique.forEach((name) => items.push({ name, category: cat, checked: false })) })
    setGroceries(items)
  }

  const generate = async () => { setLoading(true); try { const res = await client.post('/diet-plan/generate'); setPlan(res.data.plan); buildGroceries(res.data.plan) } catch {}; setLoading(false) }
  const toggleGrocery = (i) => setGroceries((g) => g.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item))

  const proteinTarget = user?.protein_target || 100
  const weight = user?.weight_kg || 70
  const goal = user?.goal || 'maintain weight'
  const activity = user?.activity_level || 'moderate'

  return (
    <PageWrapper>
      <div className="card p-5 mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div className="text-[14px] text-[#5F5E5A]">Based on: {weight}kg · Goal: {goal} · Activity: {activity} · Target: {proteinTarget}g protein/day</div>
        <button className="btn-primary" onClick={generate} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Generate plan'}</button>
      </div>

      {plan.length === 0 && !loading && <div className="text-center text-[13px] text-[#888780] py-12">No diet plan yet. Click generate to create one.</div>}

      {plan.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {plan.map((day) => (
            <div key={day.day} className="card p-5">
              <div className="text-[14px] font-medium text-[#1A1A18] mb-3">{day.day}</div>
              <div className="space-y-2">
                {Object.entries(day.meals).map(([meal, data]) => (
                  <div key={meal} className="flex items-center justify-between py-1.5 border-b border-[rgba(0,0,0,0.08)] last:border-0">
                    <div className="flex items-center gap-2">{data.protein >= 20 && <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />}<span className="text-[13px] text-[#5F5E5A]">{data.name}</span></div>
                    <span className="text-[12px] font-mono text-[#888780]">{data.protein}g</span>
                  </div>
                ))}
              </div>
              <div className="text-[12px] text-[#888780] mt-3 pt-2 border-t border-[rgba(0,0,0,0.08)]">Total ~{day.total_protein}g protein</div>
            </div>
          ))}
        </div>
      )}

      {groceries.length > 0 && (
        <div className="card p-5">
          <div className="text-[14px] font-medium text-[#1A1A18] mb-4">Grocery list</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Proteins', 'Grains', 'Vegetables', 'Dairy'].map((cat) => (
              <div key={cat}>
                <div className="section-label mb-2">{cat}</div>
                <div className="space-y-2">
                  {groceries.filter((g) => g.category === cat).map((g, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${g.checked ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-[rgba(0,0,0,0.14)]'}`} onClick={() => toggleGrocery(groceries.indexOf(g))}>{g.checked && <Check className="w-3 h-3 text-white" />}</div>
                      <span className={`text-[13px] ${g.checked ? 'text-[#888780] line-through' : 'text-[#5F5E5A]'}`}>{g.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
