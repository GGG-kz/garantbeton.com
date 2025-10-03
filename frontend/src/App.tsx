import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useEffect, Suspense, lazy } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { useMobile } from './hooks/useMobile'

// Критически важные страницы загружаем сразу
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DirectoriesPage from './pages/DirectoriesPage'

// Остальные страницы загружаем лениво
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const DriverProfilePage = lazy(() => import('./pages/DriverProfilePage'))
const PricesPage = lazy(() => import('./pages/PricesPage'))
const RequestsPage = lazy(() => import('./pages/RequestsPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const ServicePricesPage = lazy(() => import('./pages/ServicePricesPage'))
const MessengerPage = lazy(() => import('./pages/MessengerPage'))
const ApiTestPage = lazy(() => import('./pages/ApiTestPage'))

// Admin страницы
const UsersPage = lazy(() => import('./pages/admin/UsersPage'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))

// Directories страницы - временно удалены

// Invoice страницы
const ExpenseInvoicesPage = lazy(() => import('./pages/ExpenseInvoicesPage'))
const DriverInvoicesPage = lazy(() => import('./pages/DriverInvoicesPage'))
const ReceiptInvoicesPage = lazy(() => import('./pages/ReceiptInvoicesPage'))
const DriverReceiptInvoicesPage = lazy(() => import('./pages/DriverReceiptInvoicesPage'))

// Scales страницы
const ScalesModelsPage = lazy(() => import('./pages/ScalesModelsPage'))
const DriverScalesPage = lazy(() => import('./pages/DriverScalesPage'))
const WeighingPage = lazy(() => import('./pages/WeighingPage'))

function App() {
  const { initializeAuth, isLoading } = useAuthStore()
  const { isNative, networkStatus } = useMobile()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Индикатор отсутствия сети для мобильных устройств */}
      {isNative && !networkStatus && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-mono-800 text-white text-center py-2 text-sm">
          Нет подключения к интернету
        </div>
      )}
      
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/directories" 
            element={
              <ProtectedRoute>
                <DirectoriesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver-profile" 
            element={
              <ProtectedRoute>
                <DriverProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/prices" 
            element={
              <ProtectedRoute>
                <PricesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/requests" 
            element={
              <ProtectedRoute>
                <RequestsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/service-prices" 
            element={
              <ProtectedRoute>
                <ServicePricesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messenger" 
            element={
              <ProtectedRoute>
                <MessengerPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          {/* Directories routes - temporarily removed */}
          <Route 
            path="/scales-models" 
            element={
              <ProtectedRoute>
                <ScalesModelsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver-scales" 
            element={
              <ProtectedRoute>
                <DriverScalesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/weighing" 
            element={
              <ProtectedRoute>
                <WeighingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/expense-invoices" 
            element={
              <ProtectedRoute>
                <ExpenseInvoicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/receipt-invoices" 
            element={
              <ProtectedRoute>
                <ReceiptInvoicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver-receipt-invoices" 
            element={
              <ProtectedRoute>
                <DriverReceiptInvoicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver-invoices" 
            element={
              <ProtectedRoute>
                <DriverInvoicesPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <PWAInstallPrompt />
    </div>
  )
}

export default App
