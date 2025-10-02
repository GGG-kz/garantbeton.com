import { ReactNode } from 'react';
import { useMobile } from '../../hooks/useMobile';
import MobileNavigation from './MobileNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function MobileLayout({ children, showNavigation = true }: MobileLayoutProps) {
  const { isNative, keyboardHeight } = useMobile();

  return (
    <div className="min-h-screen bg-mono-50">
      {showNavigation && <MobileNavigation />}
      
      <main 
        className={`${showNavigation ? 'pt-16 pb-20' : ''}`}
        style={{ 
          paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : showNavigation ? '80px' : '0'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      {/* Индикатор нативного приложения */}
      {isNative && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-black to-mono-600 z-50" />
      )}
    </div>
  );
}