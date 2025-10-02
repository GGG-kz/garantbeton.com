// Типы данных для процесса взвешивания машин

export interface WeighingDraft {
  id: string;
  vehicleNumber: string;
  grossWeight: number; // Брутто (въезд)
  grossTimestamp: string;
  tareWeight?: number; // Тара (выезд)
  tareTimestamp?: string;
  netWeight?: number; // Нетто (автоматически рассчитывается)
  
  // Информация о грузе (заполняется при выезде)
  supplier?: string;
  recipient?: string;
  cargoType?: string;
  notes?: string;
  
  // Статус записи
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
  
  // Связь с пользователем
  operatorId: string;
  operatorName: string;
}

export interface WeighingSession {
  id: string;
  startTime: string;
  endTime?: string;
  drafts: WeighingDraft[];
  totalVehicles: number;
  completedVehicles: number;
  status: 'active' | 'completed';
}

// Типы для API запросов
export interface CreateDraftRequest {
  vehicleNumber: string;
  grossWeight: number;
  operatorId: string;
  operatorName: string;
}

export interface CompleteWeighingRequest {
  draftId: string;
  tareWeight: number;
  supplier?: string;
  recipient?: string;
  cargoType?: string;
  notes?: string;
}

// Типы для отображения
export interface WeighingStats {
  totalDrafts: number;
  completedWeighings: number;
  pendingDrafts: number;
  totalWeight: number;
  averageWeight: number;
}

// Константы
export const WEIGHING_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed'
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed'
} as const;

// Утилиты для работы с весами
export const calculateNetWeight = (grossWeight: number, tareWeight: number): number => {
  return Math.max(0, grossWeight - tareWeight);
};

export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(2)} кг`;
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
