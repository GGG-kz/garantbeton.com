import { ReactNode } from 'react'
import BackButton from './BackButton'
import UserMenu from './UserMenu'

interface PageLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  backTo?: string
  showBackButton?: boolean
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  backTo = '/dashboard',
  showBackButton = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Навигация */}
        {showBackButton && (
          <div className="mb-6 animate-slide-up">
            <BackButton to={backTo} />
          </div>
        )}

        {/* Заголовок */}
        <div className="mb-8 animate-fade-in">
          <div className="card-primary p-8 text-center relative">
            <h1 className="text-4xl font-bold text-black">
              {title}
            </h1>
            {subtitle && (
              <p className="text-mono-600 mt-3 text-lg font-semibold">{subtitle}</p>
            )}
            
            {/* UserMenu в правом верхнем углу */}
            <div className="absolute top-4 right-4">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="animate-slide-up">
          {children}
        </div>
      </div>
    </div>
  )
}
