
import React from 'react';
import SkeletonLoader from '@ui/SkeletonLoader';

const MenuCardSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-apple-md border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col aspect-[4/5]">
      {/* Image Block */}
      <div className="aspect-[4/3]">
        <SkeletonLoader className="w-full h-full bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Text Block */}
      <div className="p-3 flex flex-col gap-1">
        <SkeletonLoader className="h-5 w-3/4 rounded mb-1 bg-gray-200 dark:bg-gray-700" />
        <SkeletonLoader className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-end justify-between mt-2">
          <SkeletonLoader className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
          <SkeletonLoader className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default MenuCardSkeleton;