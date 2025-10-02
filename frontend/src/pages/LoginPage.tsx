import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, AlertCircle, Users, Truck } from 'lucide-react'
import { useMobile } from '../hooks/useMobile'

const loginSchema = z.object({
  login: z.string().min(1, 'Логин обязателен'),
  password: z.string().min(1, 'Пароль обязателен'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState<'user' | 'driver'>('user')
  const { login, driverLogin, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { isNative, keyboardHeight } = useMobile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      if (userType === 'driver') {
        await driverLogin(data)
      } else {
        await login(data)
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа в систему')
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-white py-6 px-4 sm:px-6 lg:px-8"
      style={{ paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 20}px` : '24px' }}
    >
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-black animate-scale-in">
            {userType === 'driver' ? (
              <Truck className="h-10 w-10 text-white" />
            ) : (
              <LogIn className="h-10 w-10 text-white" />
            )}
          </div>
          <h2 className={`mt-6 text-center font-bold text-black ${isNative ? 'text-2xl' : 'text-4xl'}`}>
            {userType === 'driver' ? 'Вход для водителей' : 'Вход в систему'}
          </h2>
          <p className={`mt-3 text-center text-mono-600 font-semibold ${isNative ? 'text-base' : 'text-lg'}`}>
            {userType === 'driver' 
              ? 'Введите номер телефона и временный пароль'
              : 'Бетонный завод - автоматизация'
            }
          </p>
        </div>

        {/* Переключатель типа пользователя */}
        <div className="flex rounded-2xl bg-mono-100 p-1.5 border-2 border-mono-200">
          <button
            type="button"
            onClick={() => setUserType('user')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
              userType === 'user'
                ? 'bg-black text-white'
                : 'text-mono-600 hover:text-black hover:bg-mono-50'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Сотрудники
          </button>
          <button
            type="button"
            onClick={() => setUserType('driver')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
              userType === 'driver'
                ? 'bg-black text-white'
                : 'text-mono-600 hover:text-black hover:bg-mono-50'
            }`}
          >
            <Truck className="h-4 w-4 mr-2" />
            Водители
          </button>
        </div>
        
        {/* Login Form */}
        <div className="card p-8 animate-slide-up">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-gradient-to-r from-danger-50 to-danger-100 border border-danger-200 rounded-2xl p-4 flex items-center space-x-3 animate-slide-down">
                <div className="p-1 bg-danger-200 rounded-full">
                  <AlertCircle className="h-4 w-4 text-danger-600" />
                </div>
                <span className="text-danger-700 text-sm font-medium">{error}</span>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="login" className="block text-sm font-semibold text-black mb-2">
                  Логин
                </label>
                <input
                  {...register('login')}
                  type="text"
                  autoComplete="username"
                  className="input-field"
                  placeholder={userType === 'driver' ? 'Введите номер телефона (8XXXXXXXXXX)' : 'Введите логин'}
                />
                {errors.login && (
                  <p className="mt-2 text-sm text-danger-600 font-medium">{errors.login.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input-field pr-12"
                    placeholder={userType === 'driver' ? 'Введите временный пароль' : 'Введите пароль'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-mono-400 hover:text-mono-600 transition-colors duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-danger-600 font-medium">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary btn-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Вход...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <LogIn className="h-5 w-5" />
                    <span>Войти</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Test Accounts */}
        <div className="card-primary animate-fade-in">
          <h3 className="text-sm font-semibold text-black mb-3 flex items-center">
            <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
            Тестовые аккаунты
          </h3>
          <div className="grid grid-cols-1 gap-2 text-xs text-mono-600">
            {[
              { login: 'developer', password: 'developer123', role: 'Developer' },
              { login: 'admin', password: 'admin123', role: 'Admin' },
              { login: 'manager', password: 'manager123', role: 'Manager' },
              { login: 'dispatcher', password: 'dispatcher123', role: 'Dispatcher' },
              { login: 'driver', password: 'driver123', role: 'Driver' }
            ].map((account, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border-2 border-mono-200 hover:border-mono-300 transition-colors duration-300">
                <span className="font-mono">{account.login} / {account.password}</span>
                <span className="badge-primary">{account.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
