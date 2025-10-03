import React from 'react';
import { WeighingDraft, formatWeight, formatTimestamp } from '../../types/weighing';

interface WeighingHistoryProps {
  drafts: WeighingDraft[];
  onSelectDraft?: (draft: WeighingDraft) => void;
  maxItems?: number;
}

const WeighingHistory: React.FC<WeighingHistoryProps> = ({
  drafts,
  onSelectDraft,
  maxItems = 10
}) => {
  if (drafts.length === 0) {
    return (
      <div className="p-4 bg-mono-50 border border-mono-200 rounded-lg">
        <div className="text-center text-mono-500">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm">История взвешиваний пуста</p>
        </div>
      </div>
    );
  }

  const recentDrafts = drafts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxItems);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-mono-900 mb-3">
        📋 Последние взвешивания ({drafts.length})
      </h4>
      
      <div className="max-h-64 overflow-y-auto space-y-2">
        {recentDrafts.map((draft) => (
          <div
            key={draft.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              draft.status === 'completed'
                ? 'bg-mono-50 border-green-200 hover:bg-mono-100'
                : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
            }`}
            onClick={() => onSelectDraft?.(draft)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="font-medium text-mono-700">Номер:</span>
                    <span className="ml-1 font-bold text-mono-900">{draft.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-mono-700">Въезд:</span>
                    <span className="ml-1 font-bold text-mono-600">{formatWeight(draft.grossWeight)}</span>
                  </div>
                  {draft.tareWeight && (
                    <div>
                      <span className="font-medium text-mono-700">Выезд:</span>
                      <span className="ml-1 font-bold text-black">{formatWeight(draft.tareWeight)}</span>
                    </div>
                  )}
                  {draft.netWeight && (
                    <div>
                      <span className="font-medium text-mono-700">Груз:</span>
                      <span className="ml-1 font-bold text-purple-600">{formatWeight(draft.netWeight)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-1 text-xs text-mono-500">
                  {formatTimestamp(draft.createdAt)} • {draft.operatorName}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  draft.status === 'completed'
                    ? 'bg-mono-100 text-mono-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {draft.status === 'completed' ? 'Завершено' : 'В процессе'}
                </div>
                
                {onSelectDraft && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDraft(draft);
                    }}
                    className="text-black hover:text-black text-xs"
                  >
                    Выбрать
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeighingHistory;
