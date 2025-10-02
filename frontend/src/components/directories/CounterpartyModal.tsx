import { useState, useEffect } from 'react'
import { Counterparty, CreateCounterpartyRequest } from '../../types/directories'
import { Building2, User, Mail, Phone, MapPin, FileText } from 'lucide-react'
import Modal from '../Modal'

interface CounterpartyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateCounterpartyRequest) => void
  counterparty?: Counterparty | null
  title: string
}

export default function CounterpartyModal({ isOpen, onClose, onSave, counterparty, title }: CounterpartyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    type: 'client' as 'client' | 'supplier',
    organizationType: 'legal' as 'legal' | 'individual',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    iin: '',
    bin: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (counterparty) {
      setFormData({
        name: counterparty.name,
        fullName: counterparty.fullName || '',
        type: counterparty.type,
        organizationType: counterparty.organizationType || 'legal',
        iin: counterparty.iin || '',
        bin: counterparty.bin || '',
        address: counterparty.address || '',
        phone: counterparty.phone || '',
        email: counterparty.email || '',
        contactPerson: counterparty.contactPerson || '',
        notes: counterparty.notes || '',
      })
    } else {
      setFormData({
        name: '',
        fullName: '',
        type: 'client',
        organizationType: 'legal',
        iin: '',
        bin: '',
        address: '',
        phone: '',
        email: '',
        contactPerson: '',
        notes: '',
      })
    }
    setErrors({})
  }, [counterparty, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно'
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Полное наименование обязательно'
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // При смене типа организации очищаем соответствующие поля реквизитов
      if (field === 'organizationType') {
        if (value === 'individual') {
          // При выборе физического лица очищаем БИН
          newData.bin = ''
        } else if (value === 'legal') {
          // При выборе юридического лица очищаем ИИН
          newData.iin = ''
        }
      }
      
      return newData
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-mono-700 mb-2">
              Название *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="Краткое название"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-mono-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-mono-700 mb-2">
              Тип контрагента *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="client">Клиент</option>
              <option value="supplier">Поставщик</option>
            </select>
          </div>

          <div>
            <label htmlFor="organizationType" className="block text-sm font-medium text-mono-700 mb-2">
              Тип организации *
            </label>
            <select
              id="organizationType"
              value={formData.organizationType}
              onChange={(e) => handleChange('organizationType', e.target.value)}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="legal">Юридическое лицо</option>
              <option value="individual">Физическое лицо</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-mono-700 mb-2">
            Полное наименование *
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.fullName ? 'border-red-300' : 'border-mono-300'
            }`}
            placeholder="Полное наименование организации"
          />
          {errors.fullName && <p className="mt-1 text-sm text-mono-600">{errors.fullName}</p>}
        </div>

        {/* Реквизиты */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Показываем ИИН только для физических лиц */}
          {formData.organizationType === 'individual' && (
            <div>
              <label htmlFor="iin" className="block text-sm font-medium text-mono-700 mb-2">
                ИИН
              </label>
              <input
                type="text"
                id="iin"
                value={formData.iin}
                onChange={(e) => handleChange('iin', e.target.value)}
                className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Индивидуальный идентификационный номер"
                maxLength={12}
              />
            </div>
          )}

          {/* Показываем БИН только для юридических лиц */}
          {formData.organizationType === 'legal' && (
            <div>
              <label htmlFor="bin" className="block text-sm font-medium text-mono-700 mb-2">
                БИН
              </label>
              <input
                type="text"
                id="bin"
                value={formData.bin}
                onChange={(e) => handleChange('bin', e.target.value)}
                className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Бизнес-идентификационный номер"
                maxLength={12}
              />
            </div>
          )}
        </div>

        {/* Контактная информация */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-mono-700 mb-2">
            Адрес
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-mono-400" />
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Адрес организации"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-mono-700 mb-2">
              Телефон
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-mono-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.email ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="email@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-mono-600">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium text-mono-700 mb-2">
            Контактное лицо
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="text"
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => handleChange('contactPerson', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="ФИО контактного лица"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-mono-700 mb-2">
            Заметки
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-mono-400" />
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Дополнительная информация"
            />
          </div>
        </div>

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
    </Modal>
  )
}
