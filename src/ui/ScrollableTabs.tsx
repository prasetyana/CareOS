
import React, { useRef, useEffect } from 'react';

interface ScrollableTabsProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  id: string;
}

const ScrollableTabs = <T extends string>({ options, value, onChange, id }: ScrollableTabsProps<T>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [value]);

  return (
    <div
      ref={scrollContainerRef}
      id={id}
      role="tablist"
      className="flex items-center justify-start sm:justify-center gap-1 overflow-x-auto hide-scrollbar scroll-smooth bg-neutral-200 dark:bg-neutral-800 p-1 rounded-full"
    >
      {options.map((option) => (
        <button
          key={option}
          ref={option === value ? activeTabRef : null}
          onClick={() => onChange(option)}
          role="tab"
          aria-selected={value === option}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-apple active:scale-95 ${
            value === option
              ? 'bg-white dark:bg-neutral-600 text-text-primary dark:text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary dark:hover:text-gray-200'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ScrollableTabs;
