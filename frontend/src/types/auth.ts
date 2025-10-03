export enum UserRole {
  DEVELOPER = 'DEVELOPER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DISPATCHER = 'DISPATCHER',
  DRIVER = 'DRIVER',
  SUPPLY = 'SUPPLY',
  ACCOUNTANT = 'ACCOUNTANT',
  DIRECTOR = 'DIRECTOR',
  OPERATOR = 'OPERATOR',
  COOK = 'COOK',
  USER = 'USER',
}

export interface User {
  id: string
  login: string
  role: UserRole
  fullName?: string
  email?: string
  avatar?: string
  originalRole?: UserRole // Для хранения исходной роли разработчика
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginRequest {
  login: string
  password: string
}

export interface RegisterRequest {
  login: string
  password: string
  role: UserRole
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  originalRole: UserRole | null // Для хранения исходной роли разработчика
  
  // Методы
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  initializeAuth: () => void
  switchRole: (role: UserRole) => void
  driverLogin: (credentials: LoginRequest) => Promise<void>
}

export interface UpdateProfileRequest {
  fullName?: string
  email?: string
  avatar?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
