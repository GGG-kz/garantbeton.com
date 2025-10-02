import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  to?: string
  className?: string
}

export default function BackButton({ to = '/dashboard', className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1) // Возврат на предыдущую страницу в истории браузера
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`group inline-flex items-center space-x-3 px-6 py-3 bg-white hover:bg-black text-black hover:text-white border-2 border-black rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-lg ${className}`}
    >
      <div className="p-1 bg-black group-hover:bg-white rounded-full transition-colors duration-300">
        <ArrowLeft className="h-4 w-4 text-white group-hover:text-black group-hover:-translate-x-1 transition-all duration-300" />
      </div>
      <span className="text-sm">Назад</span>
    </button>
  )
}
