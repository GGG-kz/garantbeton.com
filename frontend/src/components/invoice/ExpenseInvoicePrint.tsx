import { ExpenseInvoice } from '../../types/invoice'

interface ExpenseInvoicePrintProps {
  invoice: ExpenseInvoice
  isDuplicate?: boolean
}

export default function ExpenseInvoicePrint({ invoice, isDuplicate = false }: ExpenseInvoicePrintProps) {
  // Принудительное обновление v4 - убрана дата и время из шапки и из раздела "Документ"
  console.log('ExpenseInvoicePrint v4 - date and time removed from header and document section')
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('kk-KZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    return timeString
  }

  return (
    <>
      <style>{`
        .invoice-print {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 15mm;
          background: white;
          font-family: 'Times New Roman', serif;
          font-size: 12px;
          line-height: 1.4;
          border: 1px solid #000;
          box-sizing: border-box;
        }
        
        @media print {
          .invoice-print {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 15mm;
            border: none;
            box-shadow: none;
            page-break-after: always;
          }
          
          .invoice-print:last-child {
            page-break-after: avoid;
          }
          
          /* Отключаем заголовки и колонтитулы браузера */
          @page {
            margin: 15mm;
            size: A4;
          }
        }
        
        .invoice-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        
        .invoice-title {
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        
        .invoice-number {
          font-size: 14px;
          font-weight: bold;
        }
        
        .invoice-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-section {
          border: 1px solid #000;
          padding: 10px;
        }
        
        .info-section h3 {
          font-size: 12px;
          font-weight: bold;
          margin: 0 0 5px 0;
          text-align: center;
          background: #f0f0f0;
          padding: 2px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 3px;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 80px;
          flex-shrink: 0;
        }
        
        .info-value {
          flex: 1;
          border-bottom: 1px solid #000;
          min-height: 16px;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .products-table th,
        .products-table td {
          border: 1px solid #000;
          padding: 4px;
          text-align: center;
          vertical-align: top;
        }
        
        .products-table th {
          background: #f0f0f0;
          font-weight: bold;
          font-size: 11px;
        }
        
        .products-table td {
          font-size: 11px;
        }
        
        .products-table .product-name {
          text-align: left;
          min-width: 150px;
        }
        
        .products-table .number {
          width: 30px;
        }
        
        .products-table .code {
          width: 80px;
        }
        
        .products-table .quantity {
          width: 80px;
        }
        
        .products-table .price {
          width: 80px;
        }
        
        .products-table .amount {
          width: 80px;
        }
        
        .delivery-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .delivery-info {
          border: 1px solid #000;
          padding: 10px;
        }
        
        .delivery-info h3 {
          font-size: 12px;
          font-weight: bold;
          margin: 0 0 10px 0;
          text-align: center;
          background: #f0f0f0;
          padding: 2px;
        }
        
        .timing-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .timing-table th,
        .timing-table td {
          border: 1px solid #000;
          padding: 4px;
          text-align: center;
          font-size: 11px;
        }
        
        .timing-table th {
          background: #f0f0f0;
          font-weight: bold;
        }
        
        .totals-section {
          border: 1px solid #000;
          padding: 10px;
          margin-bottom: 20px;
          background: #f9f9f9;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .totals-label {
          font-weight: bold;
        }
        
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 30px;
        }
        
        .signature {
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          height: 30px;
          margin-bottom: 5px;
        }
        
        .signature-label {
          font-size: 11px;
          font-weight: bold;
        }
      `}</style>
      <div className="invoice-print">
        {/* Шапка документа */}
        <div className="invoice-header">
          <div className="invoice-title">Расходная накладная</div>
          <div className="invoice-number">№ {invoice.invoiceNumber}</div>
        </div>
        
        {/* Информация о документе */}
        <div className="invoice-info">
          <div className="info-section">
            <h3>Поставщик</h3>
            <div className="info-row">
              <div className="info-label">Организация:</div>
              <div className="info-value">{invoice.supplier}</div>
            </div>
          </div>
          
          <div className="info-section">
            <h3>Покупатель</h3>
            <div className="info-row">
              <div className="info-label">Организация:</div>
              <div className="info-value">{invoice.customerName}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Договор:</div>
              <div className="info-value">{invoice.contract}</div>
            </div>
          </div>
        </div>
        
        <div className="invoice-info">
          <div className="info-section">
            <h3>Документ</h3>
            <div className="info-row">
              <div className="info-label">Пломба:</div>
              <div className="info-value">{invoice.seal}</div>
            </div>
          </div>
          
          <div className="info-section">
            <h3>Склад</h3>
            <div className="info-row">
              <div className="info-label">Склад:</div>
              <div className="info-value">{invoice.warehouseName}</div>
            </div>
          </div>
        </div>
        
        {/* Таблица товаров */}
        <table className="products-table">
          <thead>
            <tr>
              <th className="number">№</th>
              <th className="code">Код товара</th>
              <th className="product-name">Наименование товара</th>
              <th className="quantity">Количество</th>
              {invoice.items[0]?.price !== undefined && (
                <>
                  <th className="price">Цена</th>
                  <th className="amount">Сумма</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="number">{item.number}</td>
                <td className="code">{item.productCode}</td>
                <td className="product-name">{item.productName}</td>
                <td className="quantity">{item.quantity.toFixed(3)}</td>
                {item.price !== undefined && (
                  <>
                    <td className="price">{formatCurrency(item.price)}</td>
                    <td className="amount">{formatCurrency(item.amount || 0)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Блок доставки и время движения */}
        <div className="delivery-section">
          <div className="delivery-info">
            <h3>Доставка</h3>
            <div className="info-row">
              <div className="info-label">Объект:</div>
              <div className="info-value">{invoice.delivery.deliveryObject}</div>
            </div>
            {invoice.delivery.deliveryAddress && (
              <div className="info-row">
                <div className="info-label">Адрес:</div>
                <div className="info-value">{invoice.delivery.deliveryAddress}</div>
              </div>
            )}
            <div className="info-row">
              <div className="info-label">Диспетчер:</div>
              <div className="info-value">{invoice.delivery.dispatcher}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Водитель:</div>
              <div className="info-value">{invoice.delivery.driverName}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Автомобиль:</div>
              <div className="info-value">{invoice.delivery.vehicleNumber}</div>
            </div>
            {(invoice.delivery.netWeight || invoice.delivery.grossWeight) && (
              <>
                {invoice.delivery.netWeight && (
                  <div className="info-row">
                    <div className="info-label">Вес нетто:</div>
                    <div className="info-value">{invoice.delivery.netWeight} т</div>
                  </div>
                )}
                {invoice.delivery.grossWeight && (
                  <div className="info-row">
                    <div className="info-label">Вес брутто:</div>
                    <div className="info-value">{invoice.delivery.grossWeight} т</div>
                  </div>
                )}
              </>
            )}
            {(invoice.delivery.coneSlump || invoice.delivery.dailyVolume) && (
              <>
                {invoice.delivery.coneSlump && (
                  <div className="info-row">
                    <div className="info-label">Осадка конуса:</div>
                    <div className="info-value">{invoice.delivery.coneSlump}</div>
                  </div>
                )}
                {invoice.delivery.dailyVolume && (
                  <div className="info-row">
                    <div className="info-label">Объём с нач. дня:</div>
                    <div className="info-value">{invoice.delivery.dailyVolume} м³</div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="delivery-info">
            <h3>Время движения автомобиля</h3>
            <table className="timing-table">
              <tbody>
                <tr>
                  <td>Время убытия с завода</td>
                  <td>{formatTime(invoice.timing.departureFromPlant)}</td>
                </tr>
                <tr>
                  <td>Время прибытия на объект</td>
                  <td>{formatTime(invoice.timing.arrivalAtObject)}</td>
                </tr>
                <tr>
                  <td>Время убытия с объекта</td>
                  <td>{formatTime(invoice.timing.departureFromObject)}</td>
                </tr>
                <tr>
                  <td>Время прибытия на завод</td>
                  <td>{formatTime(invoice.timing.arrivalAtPlant)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Итоги (только если есть цены) */}
        {invoice.total !== undefined && (
          <div className="totals-section">
            <div className="totals-row">
              <span className="totals-label">Итого:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.vatAmount !== undefined && (
              <div className="totals-row">
                <span className="totals-label">В том числе НДС:</span>
                <span>{formatCurrency(invoice.vatAmount)}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Подписи */}
        <div className="signatures">
          <div className="signature">
            <div className="signature-line"></div>
            <div className="signature-label">Выпустил: {invoice.releasedBy}</div>
          </div>
          <div className="signature">
            <div className="signature-line"></div>
            <div className="signature-label">Получено: {invoice.receivedBy}</div>
          </div>
        </div>
      </div>
    </>
  )
}
