import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import MealRow from '../components/ui/MealRow.jsx'
import client from '../api/client.js'
import { format, parseISO } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

export default function History() {
  const [range, setRange] = useState('today')
  const [meals, setMeals] = useState([])
  const [grouped, setGrouped] = useState({})
  const [summary, setSummary] = useState({})
  const [chartData, setChartData] = useState([])
  const [proteinGoal, setProteinGoal] = useState(100)

  useEffect(() => { fetchData() }, [range])

  const fetchData = async () => {
    const today = new Date()
    let from = '', to = ''
    if (range === 'today') { from = format(today, 'yyyy-MM-dd'); to = format(today, 'yyyy-MM-dd') }
    else if (range === 'week') { const s = new Date(today); s.setDate(today.getDate() - 6); from = format(s, 'yyyy-MM-dd'); to = format(today, 'yyyy-MM-dd') }
    else if (range === 'month') { const s = new Date(today.getFullYear(), today.getMonth(), 1); from = format(s, 'yyyy-MM-dd'); to = format(today, 'yyyy-MM-dd') }
    else { from = '2020-01-01'; to = format(today, 'yyyy-MM-dd') }
    try {
      const res = await client.get(`/meal/history?from=${from}&to=${to}`)
      const data = res.data.meals || []
      setMeals(data)
      groupByDate(data)
      if (range === 'week') buildChart(data)
    } catch {}
  }

  const groupByDate = (data) => {
    const g = {}, s = {}
    data.forEach((m) => {
      const d = m.created_at?.slice(0, 10)
      if (!d) return
      g[d] = g[d] || []
      g[d].push(m)
    })
    Object.keys(g).forEach((d) => { s[d] = { protein: 0, calories: 0 }; g[d].forEach((m) => { s[d].protein += m.protein || 0; s[d].calories += m.calories || 0 }) })
    setGrouped(g)
    setSummary(s)
  }

  const buildChart = (data) => {
    const days = {}
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days[format(d, 'yyyy-MM-dd')] = { protein: 0 } }
    data.forEach((m) => { const d = m.created_at?.slice(0, 10); if (days[d]) days[d].protein += m.protein || 0 })
    setChartData(Object.keys(days).map((k) => ({ date: format(parseISO(k), 'EEE'), protein: days[k].protein, goal: proteinGoal })))
  }

  const handleDelete = async (id) => { try { await client.delete(`/meal/${id}`); fetchData() } catch {} }
  const dates = Object.keys(grouped).sort().reverse()
  const hitDays = chartData.filter((d) => d.protein >= proteinGoal).length

  return (
    <PageWrapper>
      <div className="mb-6">
        <div className="flex gap-2">
          {[{ key: 'today', label: 'Today' }, { key: 'week', label: 'This week' }, { key: 'month', label: 'This month' }, { key: 'custom', label: 'Custom' }].map((r) => (
            <button key={r.key} onClick={() => setRange(r.key)} className={`px-4 py-1.5 text-[13px] rounded-[99px] border ${range === r.key ? 'bg-[#1D9E75] text-white border-[#1D9E75]' : 'bg-white text-[#5F5E5A] border-[rgba(0,0,0,0.08)]'}`}>{r.label}</button>
          ))}
        </div>
      </div>

      {range === 'week' && chartData.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="text-[14px] font-medium text-[#1A1A18] mb-4">Weekly protein</div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888780' }} />
                <YAxis tick={{ fontSize: 12, fill: '#888780' }} />
                <Tooltip />
                <ReferenceLine y={proteinGoal} stroke="#A32D2D" strokeDasharray="4 4" />
                <Bar dataKey="protein" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3"><div className="badge bg-[#E1F5EE] text-[#1D9E75]">{hitDays} of 7 days hit your protein target</div></div>
        </div>
      )}

      <div className="space-y-6">
        {dates.length === 0 && <div className="text-center text-[13px] text-[#888780] py-12">No meals found for this range.</div>}
        {dates.map((date) => (
          <div key={date}>
            <div className="text-[13px] font-medium text-[#5F5E5A] pb-2 border-b border-[rgba(0,0,0,0.08)] mb-2">{format(parseISO(date), 'EEEE, d MMMM yyyy')}</div>
            <div className="card p-4">
              {grouped[date].map((m) => <MealRow key={m.id} name={m.name} time={m.created_at?.slice(11, 16)} protein={m.protein} calories={m.calories} source={m.source} onOptions={() => handleDelete(m.id)} />)}
              <div className="text-right text-[12px] text-[#5F5E5A] pt-2 mt-2 border-t border-[rgba(0,0,0,0.08)]">
                Total: <span className="text-[#1D9E75] font-medium">{Math.round(summary[date]?.protein || 0)}g protein</span> · {Math.round(summary[date]?.calories || 0)} kcal
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
