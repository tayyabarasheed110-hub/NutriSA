export default function NutrientRow({ label, value, unit, highlight = false }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(0,0,0,0.08)] last:border-0">
      <span className="text-[13px] text-[#5F5E5A]">{label}</span>
      <span className={`text-[13px] font-medium font-mono ${highlight ? "text-[#1D9E75]" : "text-[#1A1A18]"}`}>
        {value}{unit}
      </span>
    </div>
  )
}
