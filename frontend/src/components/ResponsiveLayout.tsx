import { ReactNode, useEffect, useState } from 'react';
import { useMobile } from '../hooks/useMobile';
import MobileLayout from './mobile/MobileLayout';
import PageLayout from './PageLayout';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function ResponsiveLayout({ children, showNavigation = true }: ResponsiveLayoutProps) {
  const { isNative } = useMobile();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || isNative);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [isNative]);

  if (isMobile || isNative) {
    return (
      <MobileLayout showNavigation={showNavigation}>
        {children}
      </MobileLayout>
    );
  }

  return (
    <PageLayout title="" subtitle="">
      {children}
    </PageLayout>
  );
}
