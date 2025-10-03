import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import { AdditionalService, EMPTY_ADDITIONAL_SERVICES } from '../types/orders'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { 
  Plus, 
  Search, 
  Settings, 
  DollarSign, 
  Edit, 
  Trash2, 
  Save,
  X,
  Package,
  Clock,
  MapPin
} from 'lucide-react'

export default function ServicePricesPage() {
  const [services, setServices] = useLocalStorage<AdditionalService[]>('additionalServices', EMPTY_ADDITIONAL_SERVICES)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingService, setEditingService] = useState<AdditionalService | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    price: 0,
    unit: 'per_m3' as 'per_m3' | 'per_hour' | 'fixed'
  })

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (service: AdditionalService) => {
    setEditingService(service)
    setEditForm({
      name: service.name,
      price: service.price,
      unit: service.unit as 'fixed' | 'per_hour' | 'per_m3'
    })
  }

  const handleSave = () => {
    if (editingService) {
      setServices(prev => prev.map(service => 
        service.id === editingService.id 
          ? { ...service, ...editForm }
          : service
      ))
    }
    setEditingService(null)
    setEditForm({ name: '', price: 0, unit: 'per_m3' })
  }

  const handleCancel = () => {
    setEditingService(null)
    setEditForm({ name: '', price: 0, unit: 'per_m3' })
  }

  const handleAdd = () => {
    const newService: AdditionalService = {
      id: Date.now().toString(),
      name: editForm.name,
      price: editForm.price,
      unit: editForm.unit
    }
    setServices(prev => [...prev, newService])
    setEditForm({ name: '', price: 0, unit: 'per_m3' })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      setServices(prev => prev.filter(service => service.id !== id))
    }
  }

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'per_m3': return 'за м³'
      case 'per_hour': return 'за час'
      case 'fixed': return 'за заказ'
      default: return unit
    }
  }

  const getUnitIcon = (unit: string) => {
    switch (unit) {
      case 'per_m3': return <Package className="h-4 w-4" />
      case 'per_hour': return <Clock className="h-4 w-4" />
      case 'fixed': return <MapPin className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return (
    <PageLayout
      title="Цены дополнительных услуг"
      subtitle="Управление ценами на дополнительные услуги"
    >
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-mono-900">Цены дополнительных услуг</h2>
              <p className="text-mono-600">Всего услуг: {filteredServices.length}</p>
            </div>
          </div>
        </div>

        {/* Поиск */}
        <div className="bg-white rounded-lg border border-mono-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="text"
              placeholder="Поиск услуг..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Форма добавления новой услуги */}
        <div className="bg-white rounded-lg border border-mono-200 p-6">
          <h3 className="text-lg font-semibold text-mono-900 mb-4">Добавить новую услугу</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Название услуги
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Например: Автобетононасос"
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Цена (₸)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Единица измерения
              </label>
              <select
                value={editForm.unit}
                onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value as any }))}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              >
                <option value="per_m3">за м³</option>
                <option value="per_hour">за час</option>
                <option value="fixed">за заказ</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAdd}
                disabled={!editForm.name || editForm.price <= 0}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-black disabled:bg-mono-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить
              </button>
            </div>
          </div>
        </div>

        {/* Список услуг */}
        <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-mono-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Услуга
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Единица
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-mono-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingService?.id === service.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="text-sm font-medium text-mono-900">{service.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingService?.id === service.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="text-sm text-mono-900 font-medium">
                          {service.price.toLocaleString('ru-RU')} ₸
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingService?.id === service.id ? (
                        <select
                          value={editForm.unit}
                          onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                        >
                          <option value="per_m3">за м³</option>
                          <option value="per_hour">за час</option>
                          <option value="fixed">за заказ</option>
                        </select>
                      ) : (
                        <div className="flex items-center text-sm text-mono-900">
                          {getUnitIcon(service.unit)}
                          <span className="ml-1">{getUnitLabel(service.unit)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingService?.id === service.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleSave}
                            className="text-mono-600 hover:text-mono-900 p-1 rounded hover:bg-mono-50"
                            title="Сохранить"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-mono-600 hover:text-mono-900 p-1 rounded hover:bg-mono-50"
                            title="Отмена"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-black hover:text-black p-1 rounded hover:bg-mono-50"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-mono-600 hover:text-black p-1 rounded hover:bg-mono-50"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Пустое состояние */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-mono-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-900 mb-2">
              {searchTerm ? 'Услуги не найдены' : 'Нет услуг'}
            </h3>
            <p className="text-mono-500">
              {searchTerm 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Добавьте первую услугу для начала работы'
              }
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
