import { useState, useRef } from 'react'
import { Send, Paperclip, X } from 'lucide-react'

export default function ChatInput({ onSend, onAttach, attachedImage }) {
  const [text, setText] = useState('')
  const fileRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() && !attachedImage) return
    onSend(text.trim())
    setText('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => onAttach(reader.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="border-t border-[rgba(0,0,0,0.08)] pt-3">
      {attachedImage && (
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <img src={attachedImage} alt="" className="w-12 h-12 rounded-[8px] object-cover border border-[rgba(0,0,0,0.08)]" />
            <button className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A32D2D] text-white flex items-center justify-center" onClick={() => onAttach(null)}>
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[12px] text-[#888780]">Photo attached</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <button type="button" className="w-9 h-9 flex items-center justify-center text-[#888780] hover:text-[#1A1A18]" onClick={() => fileRef.current?.click()}>
          <Paperclip className="w-4 h-4" />
        </button>
        <input className="input flex-1" placeholder="e.g. Teen rotis aur daal, ya lunch mein biryani tha" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="w-9 h-9 flex items-center justify-center bg-[#1D9E75] text-white rounded-[8px] hover:bg-[#0F6E56]">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
