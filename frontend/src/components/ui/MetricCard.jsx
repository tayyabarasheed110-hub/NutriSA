export default function MetricCard({ label, value, sub, progress, color = "teal" }) {
  const barColor = color === "amber" ? "bg-[#EF9F27]" : "bg-[#1D9E75]"
  return (
    <div className="card p-5 flex flex-col gap-2">
      <div className="section-label">{label}</div>
      <div className="text-[22px] font-medium text-[#1A1A18]">{value}</div>
      {sub && <div className="text-[12px] text-[#888780]">{sub}</div>}
      {progress !== undefined && (
        <div className="progress-bar mt-1">
          <div className={`progress-bar-fill ${barColor}`} style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </div>
  )
}
