
import { useContext } from 'react';
import { HomepageContext } from '../contexts/HomepageContext';

export const useHomepageContent = () => {
  const context = useContext(HomepageContext);
  if (context === undefined) {
    throw new Error('useHomepageContent must be used within a HomepageProvider');
  }
  return context;
};
