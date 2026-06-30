import { Camera, MessageSquare } from 'lucide-react'

export default function MealRow({ name, time, protein, calories, source, onOptions }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(0,0,0,0.08)] last:border-0">
      <div className="flex items-center gap-2">
        {source === 'scan' ? <Camera className="w-3.5 h-3.5 text-[#888780]" /> : <MessageSquare className="w-3.5 h-3.5 text-[#888780]" />}
        <div>
          <div className="text-[13px] font-medium text-[#1A1A18]">{name}</div>
          <div className="text-[12px] text-[#888780]">{time}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-medium text-[#1D9E75]">{protein}g</span>
        <span className="text-[12px] text-[#888780]">{calories} kcal</span>
        {onOptions && <button className="text-[#888780] text-[13px]" onClick={onOptions}>⋮</button>}
      </div>
    </div>
  )
}
