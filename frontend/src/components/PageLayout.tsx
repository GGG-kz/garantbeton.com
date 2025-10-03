import { ReactNode } from 'react'
import BackButton from './BackButton'
import UserMenu from './UserMenu'
import RoleSwitcher from './RoleSwitcher'

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
        {/* Навигация и пользовательское меню в одной строке */}
        <div className="mb-6 animate-slide-up flex justify-between items-center">
          {showBackButton && <BackButton to={backTo} />}
          <div className="flex items-center space-x-3">
            <RoleSwitcher />
            <UserMenu />
          </div>
        </div>

        {/* Заголовок */}
        <div className="mb-8 animate-fade-in">
          <div className="card-primary p-8 text-center">
            <h1 className="text-4xl font-bold text-black">
              {title}
            </h1>
            {subtitle && (
              <p className="text-mono-600 mt-3 text-lg font-semibold">{subtitle}</p>
            )}
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
