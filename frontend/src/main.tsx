import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './utils/consoleClear'
import { checkForUpdates, APP_VERSION } from './version'

// Проверяем обновления при загрузке
checkForUpdates()

// Логируем версию для отладки
console.log(`Версия приложения: ${APP_VERSION}`)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
