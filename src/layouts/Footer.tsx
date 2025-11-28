
import React from 'react';
import { useHomepageContent } from '../hooks/useHomepageContent';

const Footer: React.FC = () => {
  const { config } = useHomepageContent();
  const copyrightText = config?.footer?.copyrightText || `© ${new Date().getFullYear()} Gourmet Gemini. All Rights Reserved.`;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-[1440px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-brand-secondary dark:text-gray-400">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
