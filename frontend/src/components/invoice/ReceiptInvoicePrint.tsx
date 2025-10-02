import React from 'react'
import { ReceiptInvoice } from '../../types/receiptInvoice'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface ReceiptInvoicePrintProps {
  invoice: ReceiptInvoice
}

export default function ReceiptInvoicePrint({ invoice }: ReceiptInvoicePrintProps) {
  const [counterparties] = useLocalStorage<any[]>('counterparties', [])
  const [materials] = useLocalStorage<any[]>('materials', [])
  const [warehouses] = useLocalStorage<any[]>('warehouses', [])
  
  // Отладка при загрузке
  console.log(`🔍 ОТЛАДКА ReceiptInvoicePrint: загружен invoice:`, invoice)
  console.log(`🔍 ОТЛАДКА: counterparties в localStorage:`, counterparties)
  console.log(`🔍 ОТЛАДКА: materials в localStorage:`, materials)
  console.log(`🔍 ОТЛАДКА: warehouses в localStorage:`, warehouses)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return '—'
    return new Date(dateTimeString).toLocaleString('ru-RU')
  }

  const formatWeight = (weight?: number) => {
    return weight ? `${weight.toFixed(1)} кг` : '—'
  }

  const getCounterpartyName = (id: string) => {
    console.log(`🔍 ОТЛАДКА getCounterpartyName: ищем ID="${id}"`)
    console.log(`🔍 ОТЛАДКА: доступные контрагенты:`, counterparties.map(cp => ({ id: cp.id, name: cp.name })))
    
    const counterparty = counterparties.find(cp => cp.id === id)
    const result = counterparty ? counterparty.name : 'Неизвестный контрагент'
    console.log(`🔍 ОТЛАДКА: результат для ID="${id}" = "${result}"`)
    return result
  }

  const getMaterialName = (id: string) => {
    console.log(`🔍 ОТЛАДКА getMaterialName: ищем ID="${id}"`)
    console.log(`🔍 ОТЛАДКА: доступные материалы:`, materials.map(m => ({ id: m.id, name: m.name })))
    
    const material = materials.find(m => m.id === id)
    const result = material ? `${material.name} (${material.unit})` : 'Неизвестный материал'
    console.log(`🔍 ОТЛАДКА: результат для ID="${id}" = "${result}"`)
    return result
  }

  const getWarehouseName = (id: string) => {
    const warehouse = warehouses.find(w => w.id === id)
    return warehouse ? warehouse.name : 'Неизвестный склад'
  }

  const calculateTotalNetWeight = () => {
    return invoice.items.reduce((sum, item) => sum + (item.netWeight || 0), 0)
  }

  const calculateTotalFinalWeight = () => {
    return invoice.items.reduce((sum, item) => sum + (item.finalWeight || 0), 0)
  }

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:p-4 print:max-w-none">
      {/* Стили для печати */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-page { page-break-after: always; }
          .print-page:last-child { page-break-after: avoid; }
        }
      `}</style>

      {/* Первый экземпляр */}
      <div className="print-page mb-8">
        <div className="border border-mono-800 p-4">
          {/* Заголовок */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase">Приходная накладная</h1>
            <p className="text-sm">№ {invoice.invoiceNumber} от {formatDate(invoice.invoiceDate)}</p>
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Поставщик:</h3>
              <div className="text-sm">
                {invoice.items.length > 0 && getCounterpartyName(invoice.items[0].supplier)}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Покупатель:</h3>
              <div className="text-sm">
                {invoice.items.length > 0 && getCounterpartyName(invoice.items[0].buyer)}
              </div>
            </div>
          </div>

          {/* Таблица позиций */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Позиции накладной:</h3>
            <table className="w-full border-collapse border border-mono-800 text-sm">
              <thead>
                <tr className="bg-mono-100">
                  <th className="border border-mono-800 p-2 text-left">№</th>
                  <th className="border border-mono-800 p-2 text-left">Гос. номер</th>
                  <th className="border border-mono-800 p-2 text-left">Материал</th>
                  <th className="border border-mono-800 p-2 text-left">Покупатель</th>
                  <th className="border border-mono-800 p-2 text-center">Брутто</th>
                  <th className="border border-mono-800 p-2 text-center">Тара</th>
                  <th className="border border-mono-800 p-2 text-center">Нетто</th>
                  <th className="border border-mono-800 p-2 text-center">Влажность %</th>
                  <th className="border border-mono-800 p-2 text-center">Итоговый вес</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-mono-800 p-2">{index + 1}</td>
                    <td className="border border-mono-800 p-2 font-medium">{item.vehicleNumber}</td>
                    <td className="border border-mono-800 p-2">{getMaterialName(item.material)}</td>
                    <td className="border border-mono-800 p-2">{getCounterpartyName(item.buyer)}</td>
                    <td className="border border-mono-800 p-2 text-center">{formatWeight(item.bruttoWeight)}</td>
                    <td className="border border-mono-800 p-2 text-center">{formatWeight(item.taraWeight)}</td>
                    <td className="border border-mono-800 p-2 text-center font-medium">{formatWeight(item.netWeight)}</td>
                    <td className="border border-mono-800 p-2 text-center">{item.humidity ? `${item.humidity}%` : '—'}</td>
                    <td className="border border-mono-800 p-2 text-center font-bold text-mono-700">{formatWeight(item.finalWeight)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-mono-50 font-semibold">
                  <td colSpan={4} className="border border-mono-800 p-2 text-right">ИТОГО:</td>
                  <td className="border border-mono-800 p-2 text-center">{formatWeight(invoice.items.reduce((sum, item) => sum + (item.bruttoWeight || 0), 0))}</td>
                  <td className="border border-mono-800 p-2 text-center">{formatWeight(invoice.items.reduce((sum, item) => sum + (item.taraWeight || 0), 0))}</td>
                  <td className="border border-mono-800 p-2 text-center">{formatWeight(calculateTotalNetWeight())}</td>
                  <td className="border border-mono-800 p-2 text-center">—</td>
                  <td className="border border-mono-800 p-2 text-center font-bold text-mono-700">{formatWeight(calculateTotalFinalWeight())}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Временные метки взвешивания */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Время взвешивания:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="border border-mono-300 rounded p-3">
                  <div className="font-medium">Машина {index + 1}: {item.vehicleNumber}</div>
                  <div>Брутто: {formatDateTime(item.bruttoDateTime)}</div>
                  <div>Тара: {formatDateTime(item.taraDateTime)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Подписи */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <p className="text-sm mb-2">Принял:</p>
              <div className="border-b border-mono-800 mb-1"></div>
              <p className="text-sm">{invoice.receivedBy}</p>
            </div>
            <div>
              <p className="text-sm mb-2">Выписал:</p>
              <div className="border-b border-mono-800 mb-1"></div>
              <p className="text-sm">{invoice.issuedBy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Второй экземпляр */}
      <div className="print-page">
        <div className="border border-mono-800 p-4">
          {/* Заголовок */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase">Приходная накладная</h1>
            <p className="text-sm">№ {invoice.invoiceNumber} от {formatDate(invoice.invoiceDate)}</p>
            <p className="text-sm text-mono-600">(Копия)</p>
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Поставщик:</h3>
              <div className="text-sm">
                {invoice.items.length > 0 && getCounterpartyName(invoice.items[0].supplier)}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Покупатель:</h3>
              <div className="text-sm">
                {invoice.items.length > 0 && getCounterpartyName(invoice.items[0].buyer)}
              </div>
            </div>
          </div>

          {/* Таблица позиций */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Позиции накладной:</h3>
            <table className="w-full border-collapse border border-mono-800 text-sm">
              <thead>
                <tr className="bg-mono-100">
                  <th className="border border-mono-800 p-2 text-left">№</th>
                  <th className="border border-mono-800 p-2 text-left">Гос. номер</th>
                  <th className="border border-mono-800 p-2 text-left">Материал</th>
                  <th className="border border-mono-800 p-2 text-left">Покупатель</th>
                  <th className="border border-mono-800 p-2 text-center">Брутто</th>
                  <th className="border border-mono-800 p-2 text-center">Тара</th>
                  <th className="border border-mono-800 p-2 text-center">Нетто</th>
                  <th className="border border-mono-800 p-2 text-center">Влажность %</th>
                  <th className="border border-mono-800 p-2 text-center">Итоговый вес</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-mono-800 p-2">{index + 1}</td>
                    <td className="border border-mono-800 p-2 font-medium">{item.vehicleNumber}</td>
                    <td className="border border-mono-800 p-2">{getMaterialName(item.material)}</td>
                    <td className="border border-mono-800 p-2">{getCounterpartyName(item.buyer)}</td>
                    <td className="border border-mono-800 p-2 text-center">{formatWeight(item.bruttoWeight)}</td>
                    <td className="border border-mono-800 p-2 text-center">{formatWeight(item.taraWeight)}</td>
                    <td className="border border-mono-800 p-2 text-center font-medium">{formatWeight(item.netWeight)}</td>
                    <td className="border border-mono-800 p-2 text-center">{item.humidity ? `${item.humidity}%` : '—'}</td>
                    <td className="border border-mono-800 p-2 text-center font-bold text-mono-700">{formatWeight(item.finalWeight)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-mono-50 font-semibold">
                  <td colSpan={4} className="border border-mono-800 p-2 text-right">ИТОГО:</td>
                  <td className="border border-mono-800 p-2 text-center">{formatWeight(invoice.items.reduce((sum, item) => sum + (item.bruttoWeight || 0), 0))}</td>
                  <td className="border border-mono-800 p-2 text-center">{formatWeight(invoice.items.reduce((sum, item) => sum + (item.taraWeight || 0), 0))}</td>
                  <td className="border border-mono-800 p-2 text-center">{formatWeight(calculateTotalNetWeight())}</td>
                  <td className="border border-mono-800 p-2 text-center">—</td>
                  <td className="border border-mono-800 p-2 text-center font-bold text-mono-700">{formatWeight(calculateTotalFinalWeight())}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Временные метки взвешивания */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Время взвешивания:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="border border-mono-300 rounded p-3">
                  <div className="font-medium">Машина {index + 1}: {item.vehicleNumber}</div>
                  <div>Брутто: {formatDateTime(item.bruttoDateTime)}</div>
                  <div>Тара: {formatDateTime(item.taraDateTime)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Подписи */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <p className="text-sm mb-2">Принял:</p>
              <div className="border-b border-mono-800 mb-1"></div>
              <p className="text-sm">{invoice.receivedBy}</p>
            </div>
            <div>
              <p className="text-sm mb-2">Выписал:</p>
              <div className="border-b border-mono-800 mb-1"></div>
              <p className="text-sm">{invoice.issuedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}