import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useUsersStore } from '../../stores/usersStore'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { AdminUser, CreateUserRequest, UpdateUserRequest, UserActivityLog } from '../../types/admin'
import { UserRole } from '../../types/auth'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import ViewToggle from '../../components/ViewToggle'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff, 
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  User,
  Mail,
  Key,
  Crown,
  Grid3X3,
  List,
  MoreVertical
} from 'lucide-react'

// Моковые данные для тестирования
const mockUsers: AdminUser[] = [
  {
    id: '1',
    login: 'admin',
    fullName: 'Администратор Системы',
    email: 'admin@beton.com',
    role: UserRole.ADMIN,
    isActive: true,
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    login: 'manager',
    fullName: 'Иван Петров',
    email: 'manager@beton.com',
    role: UserRole.MANAGER,
    isActive: true,
    lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    login: 'operator',
    fullName: 'Анна Сидорова',
    email: 'operator@beton.com',
    role: UserRole.OPERATOR,
    isActive: true,
    lastLoginAt: new Date(Date.now() - 10800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '4',
    login: 'cook',
    fullName: 'Мария Кузнецова',
    email: 'cook@beton.com',
    role: UserRole.COOK,
    isActive: false,
    lastLoginAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '5',
    login: 'driver1',
    fullName: 'Сергей Волков',
    email: 'driver1@beton.com',
    role: UserRole.DRIVER,
    isActive: true,
    lastLoginAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
]

const mockActivityLogs: UserActivityLog[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Иван Петров',
    action: 'login',
    resource: 'auth',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    userId: '2',
    userName: 'Иван Петров',
    action: 'create',
    resource: 'counterparty',
    resourceId: '123',
    details: 'Создан новый контрагент "ООО Стройка"',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: '3',
    userId: '3',
    userName: 'Анна Сидорова',
    action: 'login',
    resource: 'auth',
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
]

const roleLabels: Record<UserRole, string> = {
  [UserRole.DEVELOPER]: 'Разработчик',
  [UserRole.ADMIN]: 'Администратор',
  [UserRole.MANAGER]: 'Менеджер',
  [UserRole.DISPATCHER]: 'Диспетчер',
  [UserRole.DRIVER]: 'Водитель',
  [UserRole.SUPPLY]: 'Снабженец',
  [UserRole.ACCOUNTANT]: 'Бухгалтер',
  [UserRole.DIRECTOR]: 'Директор',
  [UserRole.OPERATOR]: 'Оператор',
  [UserRole.COOK]: 'Повар',
  [UserRole.USER]: 'Пользователь',
}

const roleColors: Record<UserRole, string> = {
  [UserRole.DEVELOPER]: 'text-purple-600 bg-purple-100',
  [UserRole.ADMIN]: 'text-mono-600 bg-red-100',
  [UserRole.MANAGER]: 'text-black bg-mono-100',
  [UserRole.DISPATCHER]: 'text-mono-600 bg-mono-100',
  [UserRole.DRIVER]: 'text-orange-600 bg-orange-100',
  [UserRole.SUPPLY]: 'text-indigo-600 bg-indigo-100',
  [UserRole.ACCOUNTANT]: 'text-emerald-600 bg-emerald-100',
  [UserRole.DIRECTOR]: 'text-mono-600 bg-mono-100',
  [UserRole.OPERATOR]: 'text-indigo-600 bg-indigo-100',
  [UserRole.COOK]: 'text-orange-600 bg-orange-100',
  [UserRole.USER]: 'text-mono-600 bg-mono-100',
}

export default function UsersPage() {
  const { user } = useAuthStore()
  const { users: storeUsers, addUser, updateUser, deleteUser } = useUsersStore()
  const [activityLogs, setActivityLogs] = useLocalStorage<UserActivityLog[]>('userActivityLogs', mockActivityLogs)
  
  // Объединяем пользователей из хранилища с моковыми данными
  const [users, setUsers] = useState<AdminUser[]>([...mockUsers])
  
  // Синхронизируем пользователей из хранилища
  useEffect(() => {
    const combinedUsers = [...mockUsers]
    
    // Добавляем пользователей из хранилища (включая водителей)
    storeUsers.forEach(storeUser => {
      const existingUser = combinedUsers.find(u => u.id === storeUser.id)
      if (!existingUser) {
        combinedUsers.push({
          id: storeUser.id,
          login: storeUser.login,
          fullName: storeUser.fullName || '',
          email: storeUser.email || '',
          role: storeUser.role,
          isActive: storeUser.isActive !== false,
          lastLoginAt: new Date().toISOString(),
          createdAt: storeUser.createdAt,
          updatedAt: storeUser.updatedAt || new Date().toISOString()
        })
      }
    })
    
    setUsers(combinedUsers)
  }, [storeUsers])
  
  const [viewMode, setViewMode] = useLocalStorage<'cards' | 'list'>('usersViewMode', 'list')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Проверяем права доступа
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.DEVELOPER)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-mono-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-mono-900 mb-4">Доступ запрещен</h1>
          <p className="text-mono-600">Только администраторы могут управлять пользователями</p>
        </div>
      </div>
    )
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'blocked' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = (userData: CreateUserRequest) => {
    // Добавляем в общее хранилище
    addUser({
      login: userData.login,
      role: userData.role,
      fullName: userData.fullName,
      email: userData.email,
      isActive: true
    })
    
    // Добавляем запись в лог активности
    const activityLog: UserActivityLog = {
      id: Date.now().toString(),
      userId: user!.id,
      userName: user!.fullName || user!.login,
      action: 'create_user',
      resource: 'user',
      resourceId: Date.now().toString(),
      details: `Создан пользователь "${userData.login}" с ролью "${roleLabels[userData.role]}"`,
      timestamp: new Date().toISOString(),
    }
    setActivityLogs(prev => [activityLog, ...prev])
    
    setIsCreateModalOpen(false)
  }

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updatedUser = { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() }
        
        // Добавляем запись в лог активности
        const activityLog: UserActivityLog = {
          id: Date.now().toString(),
          userId: user!.id,
          userName: user!.fullName || user!.login,
          action: updatedUser.isActive ? 'unblock_user' : 'block_user',
          resource: 'user',
          resourceId: userId,
          details: `${updatedUser.isActive ? 'Разблокирован' : 'Заблокирован'} пользователь "${updatedUser.login}"`,
          timestamp: new Date().toISOString(),
        }
        setActivityLogs(prevLogs => [activityLog, ...prevLogs])
        
        return updatedUser
      }
      return u
    }))
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId)
    if (userToDelete) {
      // Удаляем из общего хранилища
      deleteUser(userId)
      
      // Добавляем запись в лог активности
      const activityLog: UserActivityLog = {
        id: Date.now().toString(),
        userId: user!.id,
        userName: user!.fullName || user!.login,
        action: 'delete_user',
        resource: 'user',
        resourceId: userId,
        details: `Удален пользователь "${userToDelete.login}"`,
        timestamp: new Date().toISOString(),
      }
      setActivityLogs(prev => [activityLog, ...prev])
    }
  }

  const handleEditUser = (userData: UpdateUserRequest) => {
    if (selectedUser) {
      // Обновляем в общем хранилище
      updateUser(selectedUser.id, userData)
      
      setIsEditModalOpen(false)
      setSelectedUser(null)
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    blocked: users.filter(u => !u.isActive).length,
    online: users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 3600000)).length,
  }

  return (
    <PageLayout
      title="Управление пользователями"
      subtitle="Создание, редактирование и управление пользователями системы"
    >
      <div className="space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-mono-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-mono-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Активных</p>
                <p className="text-2xl font-bold text-mono-600">{stats.active}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Заблокированных</p>
                <p className="text-2xl font-bold text-mono-600">{stats.blocked}</p>
              </div>
              <ShieldOff className="h-8 w-8 text-mono-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Онлайн</p>
                <p className="text-2xl font-bold text-black">{stats.online}</p>
              </div>
              <Eye className="h-8 w-8 text-mono-500" />
            </div>
          </div>
        </div>

        {/* Панель управления */}
        <div className="bg-white rounded-lg border border-mono-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Поиск */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-mono-400" />
                <input
                  type="text"
                  placeholder="Поиск пользователей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                />
              </div>

              {/* Фильтры */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              >
                <option value="all">Все роли</option>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <option key={role} value={role}>{label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="blocked">Заблокированные</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-black transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить пользователя
              </button>
            </div>
          </div>
        </div>

        {/* Отображение пользователей */}
        {viewMode === 'list' ? (
          /* Табличный вид */
          <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Последний вход
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-mono-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-mono-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-mono-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-mono-900">
                              {user.fullName || user.login}
                            </div>
                            <div className="text-sm text-mono-500">{user.login}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-mono-900">
                          <Mail className="h-4 w-4 text-mono-400 mr-2" />
                          {user.email || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                          <Crown className="h-3 w-3 mr-1" />
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'text-mono-800 bg-mono-100' 
                            : 'text-mono-800 bg-red-100'
                        }`}>
                          {user.isActive ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Активен
                            </>
                          ) : (
                            <>
                              <ShieldOff className="h-3 w-3 mr-1" />
                              Заблокирован
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleString('ru-RU')
                          : 'Никогда'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setIsEditModalOpen(true)
                            }}
                            className="text-black hover:text-black p-1"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`p-1 ${
                              user.isActive 
                                ? 'text-mono-600 hover:text-black' 
                                : 'text-mono-600 hover:text-mono-900'
                            }`}
                            title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
                          >
                            {user.isActive ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-mono-600 hover:text-black p-1"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Карточный вид */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200 relative">
                {/* Кнопки действий в правом верхнем углу */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedUser(user)
                      setIsEditModalOpen(true)
                    }}
                    className="text-black hover:text-black p-1 rounded hover:bg-mono-50 transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleUserStatus(user.id)}
                    className={`p-1 rounded hover:bg-mono-50 transition-colors duration-200 ${
                      user.isActive 
                        ? 'text-mono-600 hover:text-black' 
                        : 'text-mono-600 hover:text-mono-900'
                    }`}
                    title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
                  >
                    {user.isActive ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-mono-600 hover:text-black p-1 rounded hover:bg-mono-50 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Основная информация пользователя */}
                <div className="flex items-center mb-4 pr-20">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-mono-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-mono-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="text-lg font-semibold text-mono-900 truncate">
                      {user.fullName || user.login}
                    </div>
                    <div className="text-sm text-mono-500 truncate">{user.login}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Email */}
                  <div className="flex items-center text-sm text-mono-600">
                    <Mail className="h-4 w-4 text-mono-400 mr-2" />
                    {user.email || 'Email не указан'}
                  </div>

                  {/* Роль */}
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]} whitespace-nowrap`}>
                      <Crown className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{roleLabels[user.role]}</span>
                    </span>
                  </div>

                  {/* Статус */}
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      user.isActive 
                        ? 'text-mono-800 bg-mono-100' 
                        : 'text-mono-800 bg-red-100'
                    }`}>
                      {user.isActive ? (
                        <>
                          <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>Активен</span>
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>Заблокирован</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Последний вход */}
                  <div className="text-sm text-mono-500">
                    <div className="font-medium text-mono-700">Последний вход:</div>
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleString('ru-RU')
                      : 'Никогда'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальные окна */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateUser}
        />

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          onSubmit={handleEditUser}
        />
      </div>
    </PageLayout>
  )
}

// Модальное окно создания пользователя
interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: CreateUserRequest) => void
}

function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    login: '',
    password: '',
    role: UserRole.MANAGER,
    fullName: '',
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.login && formData.password) {
      onSubmit(formData)
      setFormData({
        login: '',
        password: '',
        role: UserRole.MANAGER,
        fullName: '',
        email: '',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить пользователя">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Логин *
          </label>
          <input
            type="text"
            value={formData.login}
            onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Пароль *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Роль *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
          >
            {Object.entries(roleLabels).map(([role, label]) => (
              <option key={role} value={role}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            ФИО
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
          >
            Создать
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Модальное окно редактирования пользователя
interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
  onSubmit: (userData: UpdateUserRequest) => void
}

function EditUserModal({ isOpen, onClose, user, onSubmit }: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    fullName: '',
    email: '',
    role: UserRole.MANAGER,
    isActive: true,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role,
        isActive: user.isActive,
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать пользователя">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            ФИО
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Роль
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
          >
            {Object.entries(roleLabels).map(([role, label]) => (
              <option key={role} value={role}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-black focus:ring-mono-500 border-mono-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-mono-700">
            Пользователь активен
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
          >
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  )
}
