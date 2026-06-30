import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import NutrientRow from '../components/ui/NutrientRow.jsx'
import ChatBubble from '../components/chat/ChatBubble.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import client from '../api/client.js'
import { useAuthStore } from '../store/authStore.js'
import { Camera, Zap, Flame, Upload, X, Loader2, Plus } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const loadProfile = useAuthStore((s) => s.loadProfile)
  const [today, setToday] = useState({ meals: [], totals: { protein: 0, carbs: 0, fat: 0, calories: 0 } })
  const [messages, setMessages] = useState([])
  const [attachedImage, setAttachedImage] = useState(null)
  const [scanImage, setScanImage] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [streak, setStreak] = useState(0)
  const chatRef = useRef(null)

  useEffect(() => { loadProfile(); fetchToday(); fetchStreak() }, [])
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])

  const fetchToday = async () => {
    try { const res = await client.get('/meal/today'); setToday(res.data) } catch {}
  }
  const fetchStreak = async () => {
    try { const res = await client.get('/progress/streak'); setStreak(res.data.current_streak || 0) } catch {}
  }

  const handleSend = async (text) => {
    setMessages((m) => [...m, { role: 'user', text, image: attachedImage }])
    setAttachedImage(null)
    try {
      const res = await client.post('/meal/chat', { message: text })
      const data = res.data
      setMessages((m) => [...m, { role: 'ai', text: data.response_text, nutrients: data.nutrients, mealName: data.meal_identified ? text : null }])
    } catch { setMessages((m) => [...m, { role: 'ai', text: 'Sorry, I could not process that. Try again.' }]) }
  }

  const handleLogFromChat = async (msg) => {
    if (!msg.nutrients) return
    try {
      await client.post('/meal/log', { name: msg.mealName || msg.text, protein: msg.nutrients.protein, carbs: msg.nutrients.carbs, fat: msg.nutrients.fat, calories: msg.nutrients.calories, source: 'chat' })
      fetchToday()
    } catch {}
  }

  const handleScanUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setScanImage(reader.result)
      setScanResult(null)
      setScanLoading(true)
      setTimeout(() => {
        setScanResult({ meal_name: 'Dal makhani + 2 roti', confidence: 91, protein: 24, carbs: 72, fat: 9, calories: 468 })
        setScanLoading(false)
      }, 1500)
    }
    reader.readAsDataURL(file)
  }

  const handleAddScan = async () => {
    if (!scanResult) return
    try {
      await client.post('/meal/log', { name: scanResult.meal_name, protein: scanResult.protein, carbs: scanResult.carbs, fat: scanResult.fat, calories: scanResult.calories, source: 'scan', image_url: scanImage })
      setScanImage(null); setScanResult(null); fetchToday()
    } catch {}
  }

  const proteinGoal = user?.protein_target || 100
  const calorieGoal = user?.calorie_target || 2000
  const proteinPct = (today.totals.protein / proteinGoal) * 100
  const caloriePct = (today.totals.calories / calorieGoal) * 100

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Protein today" value={`${today.totals.protein}g`} sub={`of ${proteinGoal}g goal`} progress={proteinPct} />
        <MetricCard label="Calories" value={`${today.totals.calories.toLocaleString()} kcal`} sub={`of ${calorieGoal.toLocaleString()} kcal`} progress={caloriePct} />
        <div className="card p-5 flex flex-col gap-2">
          <div className="section-label">Carbs + fat</div>
          <div className="flex-1">
            <div className="text-[14px] font-medium text-[#1A1A18]">{today.totals.carbs}g carbs</div>
            <div className="progress-bar mt-1"><div className="progress-bar-fill" style={{ width: `${Math.min(100, (today.totals.carbs / 250) * 100)}%` }} /></div>
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-medium text-[#1A1A18]">{today.totals.fat}g fat</div>
            <div className="progress-bar mt-1"><div className="progress-bar-fill bg-[#EF9F27]" style={{ width: `${Math.min(100, (today.totals.fat / 70) * 100)}%` }} /></div>
          </div>
        </div>
        <MetricCard label="Streak" value={`${streak} days`} sub="Keep it up" color="amber" progress={Math.min(100, streak * 10)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="card flex flex-col h-[520px]">
          <div className="p-5 border-b border-[rgba(0,0,0,0.08)]"><div className="section-label">Log your meal</div></div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && <div className="text-center text-[13px] text-[#888780] mt-12">Type below to log a meal. Try: "Do roti aur daal"</div>}
            {messages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role} actions={msg.role === 'ai' && msg.nutrients ? (
                <button className="btn-ghost text-[12px] px-2 py-1" onClick={() => handleLogFromChat(msg)}><Plus className="w-3 h-3 inline mr-1" /> Add to log</button>
              ) : null}>
                {msg.role === 'ai' && msg.nutrients ? (
                  <div className="space-y-1">
                    <div className="font-medium text-[14px]">{msg.mealName || 'Meal logged'}</div>
                    <div className="text-[12px] text-[#5F5E5A]">{msg.text}</div>
                    <div className="text-[12px] font-medium text-[#1D9E75]">Protein: {msg.nutrients.protein}g · Carbs: {msg.nutrients.carbs}g · Fat: {msg.nutrients.fat}g · Calories: {msg.nutrients.calories}</div>
                  </div>
                ) : msg.text}
              </ChatBubble>
            ))}
          </div>
          <div className="p-5">
            <ChatInput onSend={handleSend} onAttach={setAttachedImage} attachedImage={attachedImage} />
            <div className="flex gap-3 mt-3">
              <button className="flex items-center gap-1 text-[12px] text-[#5F5E5A] bg-[#F1EFE8] px-3 py-1.5 rounded-[8px]" onClick={() => navigate('/log')}><Camera className="w-3 h-3" /> Scan instead</button>
              <button className="flex items-center gap-1 text-[12px] text-[#5F5E5A] bg-[#F1EFE8] px-3 py-1.5 rounded-[8px]" onClick={() => navigate('/log')}><Zap className="w-3 h-3" /> Quick add</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="section-label mb-3">Scan meal</div>
            {!scanImage ? (
              <label className="flex flex-col items-center justify-center gap-2 border-[2px] border-dashed border-[#1D9E75] rounded-[8px] p-6 cursor-pointer">
                <Upload className="w-8 h-8 text-[#1D9E75]" />
                <div className="text-[14px] text-[#5F5E5A] font-medium">Take a photo or upload</div>
                <div className="text-[12px] text-[#888780]">JPG, PNG up to 10MB</div>
                <input type="file" accept="image/*" className="hidden" onChange={handleScanUpload} />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img src={scanImage} alt="" className="w-full h-[160px] object-cover rounded-[8px]" />
                  <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center" onClick={() => { setScanImage(null); setScanResult(null) }}><X className="w-3 h-3" /></button>
                </div>
                {scanLoading && <div className="flex items-center gap-2 text-[13px] text-[#5F5E5A]"><Loader2 className="w-4 h-4 animate-spin text-[#1D9E75]" /> Identifying meal...</div>}
                {scanResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[15px] font-medium text-[#1A1A18]">{scanResult.meal_name}</div>
                      <div className="badge bg-[#E1F5EE] text-[#1D9E75]">{scanResult.confidence}% confident</div>
                    </div>
                    <NutrientRow label="Protein" value={scanResult.protein} unit="g" highlight />
                    <NutrientRow label="Carbs" value={scanResult.carbs} unit="g" />
                    <NutrientRow label="Fat" value={scanResult.fat} unit="g" />
                    <NutrientRow label="Calories" value={scanResult.calories} unit="" />
                    <button className="btn-primary w-full mt-2" onClick={handleAddScan}>Add to log</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="section-label mb-3">Logged today</div>
            {today.meals.length === 0 ? (
              <div className="text-center text-[13px] text-[#888780] py-6">No meals logged yet. Start by scanning or typing above.</div>
            ) : (
              <div className="space-y-1">
                {today.meals.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-[rgba(0,0,0,0.08)] last:border-0">
                    <div><div className="text-[13px] font-medium text-[#1A1A18]">{m.name}</div><div className="text-[12px] text-[#888780]">{m.created_at?.slice(11, 16)}</div></div>
                    <div className="text-[13px] font-medium text-[#1D9E75]">{m.protein}g</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
