import { Grid3X3, List } from 'lucide-react'

interface ViewToggleProps {
  viewMode: 'cards' | 'list'
  onViewModeChange: (mode: 'cards' | 'list') => void
  className?: string
}

export default function ViewToggle({ viewMode, onViewModeChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex border border-mono-300 rounded-lg ${className}`}>
      <button
        onClick={() => onViewModeChange('list')}
        className={`px-3 py-2 rounded-l-lg transition-colors duration-200 ${
          viewMode === 'list' 
            ? 'bg-black text-white' 
            : 'bg-white text-mono-600 hover:bg-mono-50'
        }`}
        title="Список"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewModeChange('cards')}
        className={`px-3 py-2 rounded-r-lg transition-colors duration-200 ${
          viewMode === 'cards' 
            ? 'bg-black text-white' 
            : 'bg-white text-mono-600 hover:bg-mono-50'
        }`}
        title="Карточки"
      >
        <Grid3X3 className="h-4 w-4" />
      </button>
    </div>
  )
}

