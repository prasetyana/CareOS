
import React, { useState, useRef, useEffect } from 'react';

interface SegmentedControlProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  id: string;
}

const SegmentedControl = <T extends string>({ options, value, onChange, id }: SegmentedControlProps<T>) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.indexOf(value);

  useEffect(() => {
    if (containerRef.current && selectedIndex !== -1) {
      const selectedTab = buttonRefs.current[selectedIndex];
      if (selectedTab) {
        setIndicatorStyle({
          left: selectedTab.offsetLeft,
          width: selectedTab.offsetWidth,
        });
      }
    }
  }, [value, options, selectedIndex]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center bg-neutral-200 dark:bg-neutral-800 p-1 rounded-full"
      role="tablist"
      aria-label="Segmented control"
    >
      {selectedIndex !== -1 && (
        <span
          className="absolute h-[calc(100%-0.5rem)] bg-white dark:bg-neutral-600 rounded-full shadow-sm transition-all duration-300 ease-apple"
          style={indicatorStyle}
        />
      )}
      {options.map((option, index) => (
        <button
          key={option}
          ref={el => { buttonRefs.current[index] = el; }}
          id={`${id}-tab-${index}`}
          role="tab"
          aria-selected={value === option}
          aria-controls={`${id}-panel-${index}`}
          onClick={() => onChange(option)}
          className={`relative z-10 whitespace-nowrap px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ease-apple focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-200 dark:focus-visible:ring-offset-neutral-800 ${
            value === option ? 'text-text-primary dark:text-white' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
