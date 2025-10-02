import { useState, useEffect } from 'react'
import { Driver, CreateDriverRequest } from '../../types/directories'
import { User, Phone, Key, Copy, RefreshCw } from 'lucide-react'
import { authApi } from '../../api/auth'

interface DriverModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateDriverRequest) => void
  driver?: Driver | null
  title: string
}

export default function DriverModal({ isOpen, onClose, onSave, driver, title }: DriverModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    phone: '',
    login: '',
    vehicleIds: [] as string[],
    tempPassword: '',
    hasChangedPassword: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Функция генерации временного пароля
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Функция копирования пароля в буфер обмена
  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.tempPassword)
      // Можно добавить уведомление об успешном копировании
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }

  // Функция генерации нового пароля
  const regeneratePassword = () => {
    setFormData(prev => ({
      ...prev,
      tempPassword: generateTempPassword(),
      hasChangedPassword: false
    }))
  }

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name,
        fullName: driver.fullName,
        phone: driver.phone,
        login: driver.login,
        vehicleIds: driver.vehicleIds,
        tempPassword: driver.tempPassword || '',
        hasChangedPassword: driver.hasChangedPassword || false,
      })
    } else {
      setFormData({
        name: '',
        fullName: '',
        phone: '',
        login: '',
        vehicleIds: [],
        tempPassword: generateTempPassword(),
        hasChangedPassword: false,
      })
    }
    setErrors({})
  }, [driver, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'ФИО обязательно'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен'
    }
    
    if (!formData.login.trim()) {
      newErrors.login = 'Логин обязателен'
    } else if (!/^8\d{10}$/.test(formData.login)) {
      newErrors.login = 'Логин должен быть в формате 8XXXXXXXXXX'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Если это новый водитель (не редактирование), регистрируем его на бэкенде
      if (!driver) {
        const driverData = {
          id: Date.now().toString(),
          login: formData.login,
          tempPassword: formData.tempPassword,
          fullName: formData.fullName,
          status: 'active', // Всегда создаем водителей со статусом "активный"
        }
        
        console.log('🚗 Отправляем данные водителя:', driverData)
        await authApi.registerDriver(driverData)
      }
      
      // Сохраняем данные в справочнике
      onSave(formData)
      onClose()
    } catch (error: any) {
      console.error('Ошибка при регистрации водителя:', error)
      // Показываем детальную ошибку пользователю
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Ошибка при регистрации водителя'
      setErrors({ submit: errorMessage })
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Автоматически заполняем логин на основе номера телефона
      if (field === 'phone') {
        // Очищаем номер телефона от всех символов кроме цифр
        const cleanPhone = String(value).replace(/\D/g, '')
        // Если номер начинается с 7, убираем его и добавляем 8
        if (cleanPhone.startsWith('7') && cleanPhone.length === 11) {
          newData.login = '8' + cleanPhone.substring(1)
        } else if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
          newData.login = cleanPhone
        } else {
          newData.login = cleanPhone
        }
      }
      
      return newData
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-mono-700 mb-2">
              Имя (краткое) *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="И.И. Иванов"
            />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-mono-700 mb-2">
              ФИО *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.fullName ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            {errors.fullName && <p className="mt-1 text-sm text-mono-600">{errors.fullName}</p>}
          </div>

        </div>


        {/* Телефон и логин */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-mono-700 mb-2">
              Телефон *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.phone ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-mono-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="login" className="block text-sm font-medium text-mono-700 mb-2">
              Логин (номер телефона) *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                id="login"
                value={formData.login}
                onChange={(e) => handleChange('login', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.login ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="8XXXXXXXXXX"
              />
            </div>
            <p className="mt-1 text-xs text-mono-500">
              Автоматически заполняется на основе номера телефона
            </p>
            {errors.login && <p className="mt-1 text-sm text-mono-600">{errors.login}</p>}
          </div>
        </div>

        {/* Временный пароль */}
        <div>
          <label htmlFor="tempPassword" className="block text-sm font-medium text-mono-700 mb-2">
            Пароль разовый *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="text"
              id="tempPassword"
              value={formData.tempPassword}
              onChange={(e) => handleChange('tempPassword', e.target.value)}
              className="w-full pl-10 pr-20 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Автоматически сгенерированный пароль"
              readOnly
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                type="button"
                onClick={copyPassword}
                className="p-1 text-mono-400 hover:text-mono-600 transition-colors duration-200"
                title="Копировать пароль"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={regeneratePassword}
                className="p-1 text-mono-400 hover:text-mono-600 transition-colors duration-200"
                title="Сгенерировать новый пароль"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-mono-500">
            Водитель сможет изменить этот пароль на постоянный в своем кабинете
          </p>
        </div>

        {/* Ошибка отправки */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-mono-600">{errors.submit}</p>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-mono-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors duration-200"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}
