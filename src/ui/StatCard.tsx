import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg flex items-center justify-between border border-white/20 dark:border-gray-700/50">
      <div>
        <p className="text-sm font-medium text-text-muted dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-text-primary dark:text-gray-200">{value}</p>
      </div>
      <div className="bg-accent/10 dark:bg-accent/20 p-4 rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
