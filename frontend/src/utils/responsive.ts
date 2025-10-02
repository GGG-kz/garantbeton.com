// Утилиты для адаптивного дизайна и мобильной оптимизации
import { useState, useEffect } from 'react'

export const isMobile = () => {
  return window.innerWidth < 768
}

export const isTablet = () => {
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

export const isDesktop = () => {
  return window.innerWidth >= 1024
}

// Хук для отслеживания размера экрана
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop()
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: isMobile(),
        isTablet: isTablet(),
        isDesktop: isDesktop()
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return screenSize
}

// Константы для мобильной оптимизации
export const MOBILE_BREAKPOINT = 768
export const TABLET_BREAKPOINT = 1024

// Минимальные размеры для touch-элементов (Apple HIG)
export const MIN_TOUCH_TARGET = 44 // px

// Утилиты для классов
export const mobileClasses = {
  touchTarget: 'min-h-[44px] min-w-[44px]',
  input: 'text-base py-3 px-4', // Предотвращает zoom на iOS
  button: 'py-3 px-6 text-base',
  card: 'rounded-lg shadow-sm',
  spacing: 'p-4 space-y-4'
}

export const responsiveClasses = {
  container: 'px-4 md:px-6 lg:px-8',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
  text: 'text-sm md:text-base',
  heading: 'text-lg md:text-xl lg:text-2xl'
}