
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-5xl font-bold font-sans text-brand-dark sm:text-6xl">{title}</h1>
      {subtitle && (
        <p className="mt-4 text-xl text-brand-secondary max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
