import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import PageLayout from '../components/PageLayout'
import CreateRequestModal from '../components/requests/CreateRequestModal'
import UserRequestsList from '../components/requests/UserRequestsList'
import AdminRequestsTable from '../components/requests/AdminRequestsTable'
import ViewToggle from '../components/ViewToggle'
import { InternalRequest, CreateRequestRequest } from '../types/requests'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Plus, FileText, Users, CheckCircle } from 'lucide-react'
import { UserRole } from '../types/auth'

// Пустой массив - данные теперь хранятся только в localStorage
const emptyRequests: InternalRequest[] = []

export default function RequestsPage() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useLocalStorage<InternalRequest[]>('internalRequests', emptyRequests)
  const [viewMode, setViewMode] = useLocalStorage<'cards' | 'list'>('requestsViewMode', 'list')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Определяем доступ к внутренним заявкам
  // Доступ имеют ВСЕ пользователи - они могут создавать заявки и видеть свои
  const canAccessRequests = !!user
  
  // Определяем, является ли пользователь руководителем (видит все заявки)
  // Директор, бухгалтер, снабженец и разработчик видят все заявки
  const isManager = user && ['director', 'accountant', 'supply', 'developer'].includes(user.role)

  // Получаем заявки в зависимости от роли
  // Руководители видят все заявки, остальные - только свои
  const userRequests = isManager 
    ? requests 
    : requests.filter(request => {
        // Простая и надежная логика: фильтруем по роли пользователя
        // Если роль заявки совпадает с ролью текущего пользователя
        return request.userRole === user?.role
      })

  // Временная отладка для проверки логики
  console.log('🔍 RequestsPage Debug:', {
    userRole: user?.role,
    userId: user?.id,
    isManager,
    totalRequests: requests.length,
    userRequestsCount: userRequests.length,
    allRequests: requests.map(r => ({ id: r.id, userId: r.userId, userRole: r.userRole, title: r.title, userName: r.userName })),
    userRequests: userRequests.map(r => ({ id: r.id, userId: r.userId, userRole: r.userRole, title: r.title, userName: r.userName }))
  })


  // Создание новой заявки
  const handleCreateRequest = (requestData: CreateRequestRequest) => {
    if (!user) return

    const newRequest: InternalRequest = {
      ...requestData,
      id: Date.now().toString(),
      userId: user.id,
      userName: user.fullName || user.login,
      userRole: user.role, // Добавляем роль пользователя
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }

    setRequests(prev => [newRequest, ...prev])
  }

  // Обновление заявки
  const handleUpdateRequest = (id: string, updates: Partial<InternalRequest>) => {
    setRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { ...request, ...updates }
          : request
      )
    )
  }

  // Обновление списка заявок
  const handleRefresh = () => {
    // В реальном приложении здесь был бы запрос к API
    console.log('Обновление списка заявок')
  }

  // Отметка заявки как полученной
  const handleMarkAsReceived = (requestId: string) => {
    if (!user) return
    
    if (window.confirm('Вы подтверждаете, что получили товар/услугу по данной заявке?')) {
      setRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: 'received',
                receivedBy: user.id,
                receivedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : request
        )
      )
    }
  }

  // Если пользователь не авторизован
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Доступ запрещен</h1>
          <p className="text-mono-600">Необходимо войти в систему</p>
        </div>
      </div>
    )
  }

  // Если пользователь не имеет доступа к внутренним заявкам
  if (!canAccessRequests) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Доступ запрещен</h1>
          <p className="text-mono-600 mb-4">
            Доступ к внутренним заявкам имеют только:
          </p>
          <div className="text-sm text-mono-500 space-y-1">
            <p>• Директор</p>
            <p>• Бухгалтер</p>
            <p>• Снабженец</p>
            <p>• Авторы заявок</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="Внутренние заявки"
      subtitle={isManager ? "Управление всеми заявками сотрудников" : "Ваши заявки на внутренние нужды"}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Заголовок и кнопка создания */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-mono-100 rounded-lg">
              <FileText className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">
                {isManager ? 'Все заявки' : 'Мои заявки'}
              </h2>
              <p className="text-mono-600">
                {isManager 
                  ? 'Управление заявками всех сотрудников' 
                  : 'Создавайте и отслеживайте свои заявки'
                }
              </p>
            </div>
          </div>

          {/* Панель управления */}
          <div className="flex items-center gap-2">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Создать заявку</span>
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Всего заявок</p>
                <p className="text-2xl font-bold text-black">{userRequests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-black" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">На рассмотрении</p>
                <p className="text-2xl font-bold text-mono-800">
                  {userRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-mono-100 rounded-full flex items-center justify-center">
                <span className="text-mono-800 font-bold">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Одобрено</p>
                <p className="text-2xl font-bold text-mono-700">
                  {userRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-mono-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-mono-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Оплачено</p>
                <p className="text-2xl font-bold text-mono-800">
                  {userRequests.filter(r => r.status === 'paid').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-mono-100 rounded-full flex items-center justify-center">
                <span className="text-mono-800 font-bold">₸</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Выполнено</p>
                <p className="text-2xl font-bold text-mono-900">
                  {userRequests.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-mono-100 rounded-full flex items-center justify-center">
                <span className="text-mono-900 font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        {isManager ? (
          <AdminRequestsTable
            requests={userRequests}
            viewMode={viewMode}
            onUpdateRequest={handleUpdateRequest}
            onRefresh={handleRefresh}
            userRole={user.role}
          />
        ) : (
          <UserRequestsList
            requests={userRequests}
            viewMode={viewMode}
            onRefresh={handleRefresh}
            onMarkAsReceived={handleMarkAsReceived}
          />
        )}

        {/* Информационный блок */}
        {isManager ? (
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-6">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Управление заявками
            </h4>
            <div className="text-sm text-mono-700 space-y-2">
              {user.role === 'supply' && (
                <p>Как <strong>снабженец</strong>, вы можете <strong>указывать поставщика и цену</strong> для заявок, а также <strong>выполнять заказы</strong> после их оплаты.</p>
              )}
              {user.role === 'director' && (
                <p>Как <strong>директор</strong>, вы можете <strong>одобрять или отклонять</strong> заявки после указания цены снабженцем.</p>
              )}
              {user.role === 'accountant' && (
                <p>Как <strong>бухгалтер</strong>, вы можете <strong>оплачивать заказы</strong> после их одобрения директором.</p>
              )}
              <p>Используйте фильтры для быстрого поиска нужных заявок.</p>
            </div>
          </div>
        ) : (
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-6">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              О внутренних заявках
            </h4>
            <div className="text-sm text-mono-700 space-y-2">
              <p>
                Создавайте заявки на внутренние нужды: канцелярские товары, IT оборудование, 
                ремонт, уборку и другие потребности.
              </p>
              <p>
                <strong>Конфиденциальность:</strong> Вы видите только свои заявки. Заявки других сотрудников 
                (менеджера, диспетчера, водителя и т.д.) вам недоступны.
              </p>
              <p>
                Отслеживайте статус ваших заявок и получайте уведомления об изменениях.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно создания заявки */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateRequest}
      />
    </PageLayout>
  )
}
