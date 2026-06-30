import Navbar from './Navbar.jsx'

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F8F7] pt-14">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
