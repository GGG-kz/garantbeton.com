import { useState, useEffect } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import MaterialModal from '../../components/directories/MaterialModal'
import { Material, CreateMaterialRequest } from '../../types/directories'
import { Plus, Search, Package, Edit, Trash2, Eye } from 'lucide-react'
import { materialsApi } from '../../api/materials'


export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | Material['type']>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка материалов при монтировании компонента
  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await materialsApi.getAll()
      setMaterials(data)
      handleSearch(searchTerm) // Обновляем отфильтрованный список
    } catch (err) {
      setError('Ошибка загрузки материалов')
      console.error('Error loading materials:', err)
    } finally {
      setLoading(false)
    }
  }

  // Функция для фильтрации материалов
  const handleSearch = (search: string) => {
    const filtered = materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filterType === 'all' || material.type === filterType
      return matchesSearch && matchesFilter && material.isActive
    })
    setFilteredMaterials(filtered)
  }

  const getTypeLabel = (type: Material['type']) => {
    const labels = {
      cement: 'Цемент',
      sand: 'Песок',
      gravel: 'Щебень',
      water: 'Вода',
      additive: 'Добавка',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: Material['type']) => {
    const colors = {
      cement: 'bg-gray-100 text-gray-800',
      sand: 'bg-yellow-100 text-yellow-800',
      gravel: 'bg-stone-100 text-stone-800',
      water: 'bg-blue-100 text-blue-800',
      additive: 'bg-purple-100 text-purple-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getUnitLabel = (unit: Material['unit']) => {
    // Возвращаем единицу как есть, так как backend может хранить любые единицы
    return unit || 'Н/Д'
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await materialsApi.delete(id)
        setMaterials(prev => prev.filter(item => item.id !== id))
        handleSearch(searchTerm)
      } catch (err) {
        setError('Ошибка удаления материала')
        console.error('Error deleting material:', err)
      }
    }
  }

  const handleSave = async (data: CreateMaterialRequest) => {
    try {
      if (editingMaterial) {
        const updatedMaterial = await materialsApi.update(editingMaterial.id, data)
        setMaterials(prev => prev.map(item => 
          item.id === editingMaterial.id ? updatedMaterial : item
        ))
      } else {
        const newMaterial = await materialsApi.create({
          ...data,
          isActive: true
        })
        setMaterials(prev => [...prev, newMaterial])
      }
      handleSearch(searchTerm)
      setIsModalOpen(false)
    } catch (err) {
      setError('Ошибка сохранения материала')
      console.error('Error saving material:', err)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingMaterial(null)
  }

  // Обновляем фильтрацию при изменении материалов
  useEffect(() => {
    handleSearch(searchTerm)
  }, [materials])

  if (loading) {
    return (
      <PageLayout title="Материалы">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка материалов...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Материалы">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadMaterials}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
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
              <h2 className="text-2xl font-bold text-gray-900">Материалы</h2>
              <p className="text-gray-600">Всего: {filteredMaterials.length}</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию или характеристикам..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Фильтр по типу */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilterType('all')
                  handleSearch(searchTerm)
                }}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filterType === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Все
              </button>
                     {['cement', 'sand', 'gravel', 'water', 'additive'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type as Material['type'])
                    handleSearch(searchTerm)
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    filterType === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <div key={material.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {material.name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(material.type)}`}>
                        {getTypeLabel(material.type)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getUnitLabel(material.unit)}
                      </span>
                    </div>
                  </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleView(material)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(material)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(material.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
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
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm || filterType !== 'all' ? 'Материалы не найдены' : 'Нет материалов'}
            </h3>
            <p className="mt-2 text-gray-600">
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
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMaterial.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип</label>
                <p className="mt-1 text-sm text-gray-900">{getTypeLabel(viewingMaterial.type)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Единица измерения</label>
                <p className="mt-1 text-sm text-gray-900">{getUnitLabel(viewingMaterial.unit)}</p>
              </div>
            </div>




            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setViewingMaterial(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
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
