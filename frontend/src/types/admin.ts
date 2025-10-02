import { UserRole } from './auth'

export interface AdminUser {
  id: string
  login: string
  fullName?: string
  email?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  login: string
  password: string
  role: UserRole
  fullName?: string
  email?: string
}

export interface UpdateUserRequest {
  fullName?: string
  email?: string
  role?: UserRole
  isActive?: boolean
}

export interface UserActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export interface BlockingLog {
  id: string
  userId: string
  userName: string
  action: 'block' | 'unblock'
  reason?: string
  adminUserId: string
  adminUserName: string
  timestamp: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: 'create' | 'update' | 'delete'
  resource: 'counterparty' | 'concrete_grade' | 'warehouse' | 'material' | 'driver' | 'vehicle'
  resourceId: string
  resourceName: string
  changes?: Record<string, any>
  timestamp: string
}

export interface ReportFilters {
  userId?: string
  dateFrom?: string
  dateTo?: string
  action?: string
  resource?: string
}

export interface ActivityStats {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  totalLogins: number
  totalActions: number
}
