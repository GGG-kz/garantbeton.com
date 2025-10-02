import { useState, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { UpdateProfileRequest, ChangePasswordRequest } from '../types/auth'
import { User, Mail, Camera, Lock, Save, Eye, EyeOff } from 'lucide-react'
import PageLayout from '../components/PageLayout'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Состояние для формы профиля
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  })
  
  // Состояние для смены пароля
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  // Состояние для UI
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Пожалуйста, выберите изображение' })
        return
      }
      
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Размер файла не должен превышать 5MB' })
        return
      }
      
      // Создаем превью
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // TODO: Добавить API вызов для обновления профиля
      console.log('Обновление профиля:', profileForm)
      
      setMessage({ type: 'success', text: 'Профиль успешно обновлен' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при обновлении профиля' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Валидация паролей
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Новые пароли не совпадают' })
      setIsLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Новый пароль должен содержать минимум 6 символов' })
      setIsLoading(false)
      return
    }

    try {
      // TODO: Добавить API вызов для смены пароля
      console.log('Смена пароля:', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      
      setMessage({ type: 'success', text: 'Пароль успешно изменен' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при смене пароля' })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

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

  return (
    <PageLayout
      title="Профиль пользователя"
      subtitle="Управление личными данными и настройками безопасности"
    >

      {/* Сообщения */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-mono-100 text-mono-800 border border-mono-200' 
            : 'bg-mono-100 text-mono-900 border border-mono-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Информация о профиле */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-mono-200 p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Личная информация</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* ФИО */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-black mb-2">
                  ФИО
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mono-400" />
                  <input
                    type="text"
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-black"
                    placeholder="Введите ваше ФИО"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mono-400" />
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-black"
                    placeholder="Введите ваш email"
                  />
                </div>
              </div>

              {/* Загрузка аватара */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Аватар
                </label>
                <div className="flex items-center space-x-4">
                  {/* Превью аватара */}
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Аватар"
                        className="h-20 w-20 rounded-full object-cover border-2 border-mono-200"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-mono-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-mono-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Кнопка загрузки */}
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-black hover:bg-mono-800 text-white rounded-lg transition-colors duration-200"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Выбрать фото</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-sm text-mono-500 mt-2">
                  Рекомендуемый размер: 200x200px. Максимальный размер: 5MB
                </p>
              </div>

              {/* Кнопка сохранения */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-black hover:bg-mono-800 disabled:bg-mono-300 text-white rounded-lg transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Смена пароля */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-mono-200 p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Смена пароля</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Текущий пароль */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-black mb-2">
                  Текущий пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mono-400" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-black"
                    placeholder="Введите текущий пароль"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mono-400 hover:text-mono-600"
                  >
                    {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Новый пароль */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-black mb-2">
                  Новый пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mono-400" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-black"
                    placeholder="Введите новый пароль"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mono-400 hover:text-mono-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Подтверждение пароля */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mono-400" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-black"
                    placeholder="Повторите новый пароль"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mono-400 hover:text-mono-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Кнопка сохранения */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-black hover:bg-mono-800 disabled:bg-mono-300 text-white rounded-lg transition-colors duration-200"
              >
                <Lock className="h-4 w-4" />
                <span>{isLoading ? 'Смена пароля...' : 'Изменить пароль'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
