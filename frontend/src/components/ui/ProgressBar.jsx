export default function ProgressBar({ value, max, color = "teal" }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0
  const fill = color === "amber" ? "bg-[#EF9F27]" : "bg-[#1D9E75]"
  return (
    <div className="progress-bar">
      <div className={`progress-bar-fill ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
