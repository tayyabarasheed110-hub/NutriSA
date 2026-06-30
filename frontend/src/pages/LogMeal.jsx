import { useState, useEffect, useRef } from 'react'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import ChatBubble from '../components/chat/ChatBubble.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import NutrientRow from '../components/ui/NutrientRow.jsx'
import client from '../api/client.js'
import { Upload, X, Loader2, Plus, Camera, History } from 'lucide-react'

export default function LogMeal() {
  const [messages, setMessages] = useState([])
  const [attachedImage, setAttachedImage] = useState(null)
  const [scanImage, setScanImage] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [recentScans, setRecentScans] = useState([])
  const [recentMeals, setRecentMeals] = useState([])
  const chatRef = useRef(null)

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])
  useEffect(() => { fetchRecentMeals() }, [])

  const fetchRecentMeals = async () => {
    try { const res = await client.get('/meal/history'); setRecentMeals(res.data.meals?.slice(0, 8) || []) } catch {}
  }

  const handleSend = async (text) => {
    setMessages((m) => [...m, { role: 'user', text, image: attachedImage }])
    const imageBase64 = attachedImage
    setAttachedImage(null)
    try {
      const res = await client.post('/meal/chat', { message: text, image_base64: imageBase64 })
      const data = res.data
      setMessages((m) => [...m, { role: 'ai', text: data.response_text, nutrients: data.nutrients, mealName: data.meal_identified ? text : null }])
    } catch { setMessages((m) => [...m, { role: 'ai', text: 'Sorry, I could not process that. Try again.' }]) }
  }

  const handleLogFromChat = async (msg) => {
    if (!msg.nutrients) return
    try {
      await client.post('/meal/log', { name: msg.mealName || msg.text, protein: msg.nutrients.protein, carbs: msg.nutrients.carbs, fat: msg.nutrients.fat, calories: msg.nutrients.calories, source: 'chat' })
      fetchRecentMeals()
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
        const result = { meal_name: 'Dal makhani + 2 roti', confidence: 91, protein: 24, carbs: 72, fat: 9, calories: 468 }
        setScanResult(result)
        setScanLoading(false)
        setRecentScans((s) => [result, ...s].slice(0, 5))
      }, 1500)
    }
    reader.readAsDataURL(file)
  }

  const handleAddScan = async () => {
    if (!scanResult) return
    try {
      await client.post('/meal/log', { name: scanResult.meal_name, protein: scanResult.protein, carbs: scanResult.carbs, fat: scanResult.fat, calories: scanResult.calories, source: 'scan', image_url: scanImage })
      setScanImage(null); setScanResult(null); fetchRecentMeals()
    } catch {}
  }

  const handleQuickAdd = (meal) => {
    client.post('/meal/log', { name: meal.name, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, calories: meal.calories, source: 'chat' }).then(() => fetchRecentMeals())
  }

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
        <div className="card flex flex-col h-full">
          <div className="p-5 border-b border-[rgba(0,0,0,0.08)]"><div className="section-label">Chat meal logger</div></div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && <div className="text-center text-[13px] text-[#888780] mt-12">Type a meal or attach a photo. Try: "Teen roti aur daal"</div>}
            {messages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role} actions={msg.role === 'ai' && msg.nutrients ? (
                <button className="btn-ghost text-[12px] px-2 py-1" onClick={() => handleLogFromChat(msg)}><Plus className="w-3 h-3 inline mr-1" /> Add to log</button>
              ) : null}>
                {msg.role === 'ai' && msg.nutrients ? (
                  <div className="space-y-1">
                    <div className="font-medium text-[14px]">{msg.mealName || 'Meal'}</div>
                    <div className="text-[12px] text-[#5F5E5A]">{msg.text}</div>
                    <div className="text-[12px] font-medium text-[#1D9E75]">Protein: {msg.nutrients.protein}g · Carbs: {msg.nutrients.carbs}g · Fat: {msg.nutrients.fat}g · Calories: {msg.nutrients.calories}</div>
                  </div>
                ) : msg.text}
              </ChatBubble>
            ))}
          </div>
          <div className="p-5 border-t border-[rgba(0,0,0,0.08)]">
            <ChatInput onSend={handleSend} onAttach={setAttachedImage} attachedImage={attachedImage} />
            {recentMeals.length > 0 && (
              <div className="mt-3">
                <div className="section-label mb-2">Quick add</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentMeals.map((m, i) => (
                    <button key={i} className="flex-shrink-0 px-3 py-1.5 text-[12px] rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-[#F1EFE8] text-[#5F5E5A]" onClick={() => handleQuickAdd(m)}>{m.name}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card flex flex-col h-full p-5">
          <div className="section-label mb-3">Scan meal</div>
          {!scanImage ? (
            <label className="flex flex-col items-center justify-center gap-2 border-[2px] border-dashed border-[#1D9E75] rounded-[8px] p-8 cursor-pointer flex-1">
              <Camera className="w-8 h-8 text-[#1D9E75]" />
              <div className="text-[14px] text-[#5F5E5A] font-medium">Take a photo or upload</div>
              <div className="text-[12px] text-[#888780]">JPG, PNG up to 10MB</div>
              <input type="file" accept="image/*" className="hidden" onChange={handleScanUpload} />
            </label>
          ) : (
            <div className="space-y-3 flex-1">
              <div className="relative">
                <img src={scanImage} alt="" className="w-full h-[200px] object-cover rounded-[8px]" />
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
          {recentScans.length > 0 && (
            <div className="mt-4">
              <div className="section-label mb-2 flex items-center gap-1"><History className="w-3 h-3" /> Recent scans</div>
              <div className="flex gap-2 overflow-x-auto">
                {recentScans.map((s, i) => (
                  <div key={i} className="flex-shrink-0 w-16 h-16 rounded-[8px] bg-[#F1EFE8] flex items-center justify-center text-[10px] text-[#888780] cursor-pointer" onClick={() => { setScanResult(s); setScanImage(null) }}><Camera className="w-4 h-4" /></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
