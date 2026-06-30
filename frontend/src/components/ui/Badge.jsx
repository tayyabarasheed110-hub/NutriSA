export default function Badge({ children, color = "success" }) {
  const map = {
    success: "bg-[#E1F5EE] text-[#1D9E75]",
    warning: "bg-[#FAEEDA] text-[#BA7517]",
    danger: "bg-[#FCEBEB] text-[#A32D2D]",
    default: "bg-[#F1EFE8] text-[#5F5E5A]",
  }
  return <span className={`badge ${map[color] || map.default}`}>{children}</span>
}
