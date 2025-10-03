import React, { useState, useEffect } from 'react'
import { X, Building2, User, Phone, Mail, MapPin, UserCheck } from 'lucide-react'

interface Counterparty {
  id: string
  name: string
  type: 'client' | 'supplier'
  organizationType: 'legal' | 'individual'
  bin?: string
  iin?: string
  address?: string
  contactPerson?: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CounterpartyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Counterparty, 'id' | 'createdAt' | 'updatedAt'>) => void
  counterparty?: Counterparty | null
}

export default function CounterpartyModal({ isOpen, onClose, onSave, counterparty }: CounterpartyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'client' as 'client' | 'supplier',
    organizationType: 'legal' as 'legal' | 'individual',
    bin: '',
    iin: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (counterparty) {
      setFormData({
        name: counterparty.name,
        type: counterparty.type,
        organizationType: counterparty.organizationType,
        bin: counterparty.bin || '',
        iin: counterparty.iin || '',
        address: counterparty.address || '',
        contactPerson: counterparty.contactPerson || '',
        phone: counterparty.phone || '',
        email: counterparty.email || ''
      })
    } else {
      setFormData({
        name: '',
        type: 'client',
        organizationType: 'legal',
        bin: '',
        iin: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: ''
      })
    }
    setErrors({})
  }, [counterparty, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Наименование компании обязательно'
    }

    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = 'Контактное лицо обязательно'
    }

    if (formData.organizationType === 'legal' && !formData.bin?.trim()) {
      newErrors.bin = 'БИН обязателен для юридического лица'
    }

    if (formData.organizationType === 'individual' && !formData.iin?.trim()) {
      newErrors.iin = 'ИИН обязателен для физического лица'
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSave({
      ...formData,
      isActive: true
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-mono-900">
              {counterparty ? 'Редактировать контрагента' : 'Создать контрагента'}
            </h3>
            <button
              onClick={onClose}
              className="text-mono-400 hover:text-mono-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Наименование компании */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Наименование компании *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.name ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="Введите наименование компании"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-mono-600">{errors.name}</p>}
            </div>

            {/* Тип контрагента */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Тип контрагента *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="client"
                    checked={formData.type === 'client'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="text-mono-600 focus:ring-mono-500"
                  />
                  <span className="text-sm text-mono-700">Клиент</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="supplier"
                    checked={formData.type === 'supplier'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="text-mono-600 focus:ring-mono-500"
                  />
                  <span className="text-sm text-mono-700">Поставщик</span>
                </label>
              </div>
            </div>

            {/* Тип организации */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Тип организации *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="organizationType"
                    value="legal"
                    checked={formData.organizationType === 'legal'}
                    onChange={(e) => handleChange('organizationType', e.target.value)}
                    className="text-mono-600 focus:ring-mono-500"
                  />
                  <span className="text-sm text-mono-700">Юридическое лицо</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="organizationType"
                    value="individual"
                    checked={formData.organizationType === 'individual'}
                    onChange={(e) => handleChange('organizationType', e.target.value)}
                    className="text-mono-600 focus:ring-mono-500"
                  />
                  <span className="text-sm text-mono-700">Физическое лицо</span>
                </label>
              </div>
            </div>

            {/* БИН или ИИН */}
            {formData.organizationType === 'legal' ? (
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">
                  БИН *
                </label>
                <input
                  type="text"
                  value={formData.bin}
                  onChange={(e) => handleChange('bin', e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.bin ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="Введите БИН"
                />
                {errors.bin && <p className="mt-1 text-sm text-mono-600">{errors.bin}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">
                  ИИН *
                </label>
                <input
                  type="text"
                  value={formData.iin}
                  onChange={(e) => handleChange('iin', e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.iin ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="Введите ИИН"
                />
                {errors.iin && <p className="mt-1 text-sm text-mono-600">{errors.iin}</p>}
              </div>
            )}

            {/* Адрес */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Адрес
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                  placeholder="Введите адрес"
                />
              </div>
            </div>

            {/* Контактное лицо */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Контактное лицо *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.contactPerson ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="Введите ФИО контактного лица"
                />
              </div>
              {errors.contactPerson && <p className="mt-1 text-sm text-mono-600">{errors.contactPerson}</p>}
            </div>

            {/* Телефон */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Телефон
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.phone ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-mono-600">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.email ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="example@company.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-mono-600">{errors.email}</p>}
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-mono-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-mono-600 text-white hover:bg-mono-700 rounded-lg transition-colors duration-200"
              >
                {counterparty ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
