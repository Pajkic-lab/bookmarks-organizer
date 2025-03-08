import { useState, useEffect } from 'react';

export const useResponsiveGutter = () => {
  const [gutter, setGutter] = useState('16px');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 750) {
        setGutter('12px');
      } else if (width < 900) {
        setGutter('16px');
      } else {
        setGutter('24px');
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return gutter;
};