import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define breakpoints
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;
  const isDesktop = windowWidth > 1024;

  return { isMobile, isTablet, isDesktop, windowWidth };
};