import React from 'react'
import { Edit, Trash2 } from 'lucide-react'

interface MobileCardProps {
  title: string
  fields: Array<{
    label: string
    value: string | React.ReactNode
  }>
  onEdit: () => void
  onDelete: () => void
}

export default function MobileCard({ title, fields, onEdit, onDelete }: MobileCardProps) {
  return (
    <div className="bg-white rounded-lg border border-mono-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-mono-900">{title}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={onEdit}
            className="text-mono-600 hover:text-black"
            title="Редактировать"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={onDelete}
            className="text-mono-600 hover:text-black"
            title="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-xs text-mono-600">
        {fields.map((field, index) => (
          <div key={index} className="flex justify-between">
            <span>{field.label}:</span>
            <span>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
