import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number // Количество элементов для предварительной отрисовки
  className?: string
  onScroll?: (scrollTop: number) => void
  getItemKey?: (item: T, index: number) => string | number
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey = (_, index) => index
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Вычисляем видимые элементы
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // Обработчик скролла с throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  // Общая высота контейнера
  const totalHeight = items.length * itemHeight

  // Видимые элементы
  const visibleItems = useMemo(() => {
    const result = []
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          key: getItemKey(items[i], i)
        })
      }
    }
    return result
  }, [items, visibleRange, getItemKey])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, key }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Хук для виртуализированного списка с поиском
export function useVirtualizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
) {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return items
    }

    const lowercaseSearch = searchTerm.toLowerCase()
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field]
        return String(value).toLowerCase().includes(lowercaseSearch)
      })
    )
  }, [items, searchTerm, searchFields])
}

// Компонент для виртуализированной таблицы
interface VirtualizedTableProps<T> {
  data: T[]
  columns: Array<{
    key: keyof T
    title: string
    width?: number
    render?: (value: any, item: T, index: number) => React.ReactNode
  }>
  rowHeight?: number
  containerHeight: number
  className?: string
  onRowClick?: (item: T, index: number) => void
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 50,
  containerHeight,
  className = '',
  onRowClick
}: VirtualizedTableProps<T>) {
  const renderRow = useCallback((item: T, index: number) => (
    <div
      className={`flex items-center border-b border-mono-200 hover:bg-mono-50 transition-colors ${
        onRowClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onRowClick?.(item, index)}
    >
      {columns.map((column, colIndex) => {
        const value = item[column.key]
        const content = column.render ? column.render(value, item, index) : String(value)
        
        return (
          <div
            key={colIndex}
            className="px-4 py-2 flex-1 truncate"
            style={{ width: column.width }}
          >
            {content}
          </div>
        )
      })}
    </div>
  ), [columns, onRowClick])

  return (
    <div className={`border border-mono-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex bg-mono-100 border-b border-mono-200">
        {columns.map((column, index) => (
          <div
            key={index}
            className="px-4 py-3 font-semibold text-black flex-1 truncate"
            style={{ width: column.width }}
          >
            {column.title}
          </div>
        ))}
      </div>

      {/* Virtualized rows */}
      <VirtualizedList
        items={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
        getItemKey={(item, index) => `row-${index}`}
      />
    </div>
  )
}

// Хук для пагинации с виртуализацией
export function useVirtualizedPagination<T>(
  items: T[],
  pageSize: number = 50
) {
  const [currentPage, setCurrentPage] = useState(0)

  const paginatedItems = useMemo(() => {
    const start = currentPage * pageSize
    const end = start + pageSize
    return items.slice(start, end)
  }, [items, currentPage, pageSize])

  const totalPages = Math.ceil(items.length / pageSize)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  return {
    items: paginatedItems,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0,
    goToPage,
    nextPage,
    prevPage
  }
}

// Компонент для бесконечной прокрутки
interface InfiniteScrollProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  loadMore: () => Promise<void>
  hasMore: boolean
  loading: boolean
  itemHeight: number
  containerHeight: number
  threshold?: number // Расстояние от конца для загрузки
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading,
  itemHeight,
  containerHeight,
  threshold = 200
}: InfiniteScrollProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const handleScroll = useCallback(async (scrollTop: number) => {
    const totalHeight = items.length * itemHeight
    const scrollBottom = scrollTop + containerHeight

    if (
      hasMore &&
      !loading &&
      !isLoadingMore &&
      totalHeight - scrollBottom < threshold
    ) {
      setIsLoadingMore(true)
      try {
        await loadMore()
      } finally {
        setIsLoadingMore(false)
      }
    }
  }, [items.length, itemHeight, containerHeight, hasMore, loading, isLoadingMore, loadMore, threshold])

  const renderItemWithLoader = useCallback((item: T, index: number) => {
    const isLastItem = index === items.length - 1
    
    return (
      <div>
        {renderItem(item, index)}
        {isLastItem && (isLoadingMore || loading) && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-mono-300 border-t-black"></div>
            <span className="ml-2 text-mono-600">Загрузка...</span>
          </div>
        )}
      </div>
    )
  }, [items.length, renderItem, isLoadingMore, loading])

  return (
    <VirtualizedList
      items={items}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderItemWithLoader}
      onScroll={handleScroll}
      overscan={10}
    />
  )
}