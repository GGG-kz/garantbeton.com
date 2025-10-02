import { useState } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import MaterialModal from '../../components/directories/MaterialModal'
import { Material, CreateMaterialRequest } from '../../types/directories'
import { Plus, Search, Package, Edit, Trash2, Eye } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const mockMaterials: Material[] = []

export default function MaterialsPage() {
  const [materials, setMaterials] = useLocalStorage<Material[]>('materials', mockMaterials)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | Material['type']>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null)

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || material.type === filterType
    return matchesSearch && matchesFilter && material.isActive
  })

  const getTypeLabel = (type: Material['type']) => {
    const labels = {
      cement: 'Цемент',
      sand: 'Песок',
      gravel: 'Щебень',
      water: 'Вода',
      additive: 'Добавка',
      other: 'Прочее',
    }
    return labels[type]
  }

  const getTypeColor = (type: Material['type']) => {
    const colors = {
      cement: 'bg-mono-100 text-mono-800',
      sand: 'bg-mono-200 text-mono-900',
      gravel: 'bg-mono-300 text-black',
      water: 'bg-mono-400 text-black',
      additive: 'bg-mono-500 text-white',
      other: 'bg-mono-100 text-mono-800',
    }
    return colors[type]
  }

  const getUnitLabel = (unit: Material['unit']) => {
    const labels = {
      kg: 'кг',
      m3: 'м³',
      ton: 'т',
      liter: 'л',
      piece: 'шт',
    }
    return labels[unit]
  }



  const handleAdd = () => {
    setEditingMaterial(null)
    setIsModalOpen(true)
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setIsModalOpen(true)
  }

  const handleView = (material: Material) => {
    setViewingMaterial(material)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      setMaterials(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleSave = (data: CreateMaterialRequest) => {
    if (editingMaterial) {
      setMaterials(prev => prev.map(item => 
        item.id === editingMaterial.id 
          ? { ...item, ...data, updatedAt: new Date().toISOString() }
          : item
      ))
    } else {
      const newMaterial: Material = {
        id: Date.now().toString(),
        ...data,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setMaterials(prev => [...prev, newMaterial])
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingMaterial(null)
  }

  return (
    <PageLayout
      title="Материалы"
      subtitle="Управление сырьем и компонентами для производства бетона"
    >
      <div className="space-y-6">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-mono-900">Материалы</h2>
              <p className="text-mono-600">Всего: {filteredMaterials.length}</p>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить материал</span>
          </button>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg border border-mono-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию или характеристикам..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Фильтр по типу */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filterType === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                }`}
              >
                Все
              </button>
              {['cement', 'sand', 'gravel', 'water', 'additive', 'other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as Material['type'])}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    filterType === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                  }`}
                >
                  {getTypeLabel(type as Material['type'])}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Список материалов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMaterials.map((material) => {
            
            return (
              <div key={material.id} className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-mono-900">
                        {material.name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(material.type)}`}>
                        {getTypeLabel(material.type)}
                      </span>
                      <span className="text-sm text-mono-500">
                        {getUnitLabel(material.unit)}
                      </span>
                    </div>
                  </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleView(material)}
                    className="p-1 text-mono-400 hover:text-mono-600 transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(material)}
                    className="p-1 text-mono-400 hover:text-black transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(material.id)}
                    className="p-1 text-mono-400 hover:text-mono-600 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                </div>

                <div className="space-y-3">




                </div>
              </div>
            )
          })}
        </div>

        {/* Пустое состояние */}
        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-mono-400" />
            <h3 className="mt-4 text-lg font-medium text-mono-900">
              {searchTerm || filterType !== 'all' ? 'Материалы не найдены' : 'Нет материалов'}
            </h3>
            <p className="mt-2 text-mono-600">
              {searchTerm || filterType !== 'all' 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Добавьте первый материал для начала работы'
              }
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно для редактирования */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMaterial ? 'Редактировать материал' : 'Добавить материал'}
        size="lg"
      >
        <MaterialModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          material={editingMaterial}
          title={editingMaterial ? 'Редактировать материал' : 'Добавить материал'}
        />
      </Modal>

      {/* Модальное окно для просмотра */}
      <Modal
        isOpen={!!viewingMaterial}
        onClose={() => setViewingMaterial(null)}
        title="Просмотр материала"
        size="md"
      >
        {viewingMaterial && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700">Название</label>
                <p className="mt-1 text-sm text-mono-900">{viewingMaterial.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-mono-700">Тип</label>
                <p className="mt-1 text-sm text-mono-900">{getTypeLabel(viewingMaterial.type)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700">Единица измерения</label>
                <p className="mt-1 text-sm text-mono-900">{getUnitLabel(viewingMaterial.unit)}</p>
              </div>
            </div>




            <div className="flex justify-end pt-4 border-t border-mono-200">
              <button
                onClick={() => setViewingMaterial(null)}
                className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
