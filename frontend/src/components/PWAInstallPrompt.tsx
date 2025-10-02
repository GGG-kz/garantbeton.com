import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA установлено')
    } else {
      console.log('PWA не установлено')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-mono-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-black" />
            <h3 className="font-medium text-black">Установить приложение</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-mono-400 hover:text-mono-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm text-mono-600 mb-4">
          Установите приложение на свой рабочий стол для быстрого доступа
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 btn-primary text-sm py-2"
          >
            Установить
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 btn-secondary text-sm py-2"
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  )
}
