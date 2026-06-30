import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import client from '../api/client.js'
import { format, parseISO } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'

export default function Progress() {
  const [range, setRange] = useState('7d')
  const [data, setData] = useState([])
  const [stats, setStats] = useState({ avgProtein: 0, hitRate: 0, bestStreak: 0, topMeal: '-' })
  const [proteinGoal, setProteinGoal] = useState(100)

  useEffect(() => { fetchData() }, [range])

  const fetchData = async () => {
    try {
      const res = await client.get(`/progress/summary?range=${range}`)
      const daily = res.data.daily || []
      setData(daily)
      const total = daily.reduce((s, d) => s + d.protein, 0)
      const avg = daily.length ? Math.round(total / daily.length) : 0
      const hit = daily.filter((d) => d.protein >= proteinGoal).length
      const hitRate = daily.length ? Math.round((hit / daily.length) * 100) : 0
      const streakRes = await client.get('/progress/streak')
      setStats({ avgProtein: avg, hitRate, bestStreak: streakRes.data.best_streak || 0, topMeal: '-' })
    } catch {}
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <div className="flex gap-2">
          {[{ key: '7d', label: 'Last 7 days' }, { key: '30d', label: '30 days' }, { key: '3m', label: '3 months' }].map((r) => (
            <button key={r.key} onClick={() => setRange(r.key)} className={`px-4 py-1.5 text-[13px] rounded-[99px] border ${range === r.key ? 'bg-[#1D9E75] text-white border-[#1D9E75]' : 'bg-white text-[#5F5E5A] border-[rgba(0,0,0,0.08)]'}`}>{r.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Average daily protein" value={`${stats.avgProtein}g`} />
        <MetricCard label="Goal hit rate" value={`${stats.hitRate}%`} sub="of days" />
        <MetricCard label="Best streak" value={`${stats.bestStreak} days`} />
        <MetricCard label="Most logged meal" value={stats.topMeal} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <div className="text-[14px] font-medium text-[#1A1A18] mb-4">Protein vs. goal</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888780' }} tickFormatter={(v) => format(parseISO(v), 'd MMM')} />
                <YAxis tick={{ fontSize: 11, fill: '#888780' }} />
                <Tooltip />
                <Line type="monotone" dataKey="protein" stroke="#1D9E75" strokeWidth={2} dot={{ r: 3, fill: '#1D9E75' }} />
                <Line type="monotone" dataKey={() => proteinGoal} stroke="#EF9F27" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-[14px] font-medium text-[#1A1A18] mb-4">Weekly calories</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888780' }} tickFormatter={(v) => format(parseISO(v), 'd MMM')} />
                <YAxis tick={{ fontSize: 11, fill: '#888780' }} />
                <Tooltip />
                <Bar dataKey="calories" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-[14px] font-medium text-[#1A1A18] mb-4">Weight trend</div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888780' }} tickFormatter={(v) => format(parseISO(v), 'd MMM')} />
              <YAxis tick={{ fontSize: 11, fill: '#888780' }} />
              <Tooltip />
              <Area type="monotone" dataKey="protein" stroke="#1D9E75" fill="#1D9E75" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageWrapper>
  )
}
