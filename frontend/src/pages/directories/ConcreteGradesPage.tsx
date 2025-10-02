import { useState, useEffect } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import ConcreteGradeModal from '../../components/directories/ConcreteGradeModal'
import { ConcreteGrade, CreateConcreteGradeRequest } from '../../types/directories'
import { Plus, Search, Layers, Edit, Trash2, Eye } from 'lucide-react'
import { concreteGradesApi } from '../../api/concrete-grades'

// Заглушка данных
// Пустой массив для чистого тестирования
const mockConcreteGrades: ConcreteGrade[] = []

export default function ConcreteGradesPage() {
  const [concreteGrades, setConcreteGrades] = useState<ConcreteGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<ConcreteGrade | null>(null)
  const [viewingGrade, setViewingGrade] = useState<ConcreteGrade | null>(null)

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadConcreteGrades()
  }, [])

  const loadConcreteGrades = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await concreteGradesApi.getAll()
      setConcreteGrades(data)
    } catch (err) {
      setError('Ошибка загрузки марок бетона')
      console.error('Error loading concrete grades:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedGrades = concreteGrades
    .filter(grade => 
      grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.grade.localeCompare(b.grade))

  const handleAdd = () => {
    setEditingGrade(null)
    setIsModalOpen(true)
  }

  const handleEdit = (grade: ConcreteGrade) => {
    setEditingGrade(grade)
    setIsModalOpen(true)
  }

  const handleView = (grade: ConcreteGrade) => {
    setViewingGrade(grade)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту марку бетона?')) {
      try {
        await concreteGradesApi.delete(id)
        setConcreteGrades(prev => prev.filter(item => item.id !== id))
      } catch (err) {
        setError('Ошибка удаления марки бетона')
        console.error('Error deleting concrete grade:', err)
      }
    }
  }

  const handleSave = async (data: CreateConcreteGradeRequest) => {
    try {
      if (editingGrade) {
        // Редактирование существующей марки бетона
        const updatedGrade = await concreteGradesApi.update(editingGrade.id, data)
        setConcreteGrades(prev => prev.map(item =>
          item.id === editingGrade.id ? updatedGrade : item
        ))
      } else {
        // Создание новой марки бетона
        const newGrade = await concreteGradesApi.create(data)
        setConcreteGrades(prev => [...prev, newGrade])
      }
      setIsModalOpen(false)
      setEditingGrade(null)
    } catch (err) {
      setError('Ошибка сохранения марки бетона')
      console.error('Error saving concrete grade:', err)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingGrade(null)
  }

  // UI для загрузки и ошибок
  if (loading) {
    return (
      <PageLayout title="Марки бетона">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка марок бетона...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Марки бетона">
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
                  onClick={loadConcreteGrades}
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
      title="Марки бетона"
      subtitle="Управление номенклатурой бетонных смесей"
    >
      <div className="space-y-6">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Layers className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Марки бетона</h2>
              <p className="text-gray-600">Всего: {filteredAndSortedGrades.length}</p>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить марку</span>
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
                  placeholder="Поиск по марке или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Список марок бетона */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedGrades.map((grade) => (
            <div key={grade.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{grade.grade}</h3>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleView(grade)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(grade)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(grade.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {grade.description && (
                <p className="text-gray-600 mb-4">{grade.description}</p>
              )}

            </div>
          ))}
        </div>

        {/* Пустое состояние */}
        {filteredAndSortedGrades.length === 0 && (
          <div className="text-center py-12">
            <Layers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm ? 'Марки бетона не найдены' : 'Нет марок бетона'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchTerm 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Добавьте первую марку бетона для начала работы'
              }
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно для редактирования */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGrade ? 'Редактировать марку бетона' : 'Добавить марку бетона'}
        size="lg"
      >
        <ConcreteGradeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          concreteGrade={editingGrade}
          title={editingGrade ? 'Редактировать марку бетона' : 'Добавить марку бетона'}
        />
      </Modal>

      {/* Модальное окно для просмотра */}
      <Modal
        isOpen={!!viewingGrade}
        onClose={() => setViewingGrade(null)}
        title="Просмотр марки бетона"
        size="md"
      >
        {viewingGrade && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <p className="mt-1 text-sm text-gray-900">{viewingGrade.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Марка</label>
                <p className="mt-1 text-sm text-gray-900">{viewingGrade.grade}</p>
              </div>
            </div>
            

            {/* Расход материалов */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Цемент (кг)</label>
                <p className="mt-1 text-sm text-gray-900">{viewingGrade.cementConsumption || 'Не указано'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Щебень (кг)</label>
                <p className="mt-1 text-sm text-gray-900">{viewingGrade.gravelConsumption || 'Не указано'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Песок (кг)</label>
                <p className="mt-1 text-sm text-gray-900">{viewingGrade.sandConsumption || 'Не указано'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Пластификатор (л)</label>
                <p className="mt-1 text-sm text-gray-900">{viewingGrade.plasticizerConsumption || 'Не указано'}</p>
              </div>
            </div>

            {viewingGrade.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <p className="mt-1 text-sm text-gray-900">{viewingGrade.description}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setViewingGrade(null)}
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
