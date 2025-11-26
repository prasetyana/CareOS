

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  id?: string;
}

const Dropdown = <T extends string>({ options, value, onChange, id }: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(options.indexOf(value));
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, options, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const optionElement = listRef.current.children[highlightedIndex] as HTMLLIElement;
      optionElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);


  const handleOptionClick = (option: T) => {
    onChange(option);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionClick(options[highlightedIndex]);
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev + 1) % options.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
        }
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef} id={id} onKeyDown={handleKeyDown}>
      <button
        type="button"
        ref={buttonRef}
        className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-4 pr-10 text-left border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id ? `${id}-label` : undefined}
        aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
      >
        <span className="block truncate text-gray-900 dark:text-gray-200">{value}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-scale-in"
          style={{ transformOrigin: 'top' }}
          role="listbox"
          aria-labelledby={id ? `${id}-label` : undefined}
        >
          {options.map((option, index) => (
            <li
              key={option}
              id={`${id}-option-${index}`}
              className={`relative cursor-default select-none py-2 pl-4 pr-4 ${highlightedIndex === index ? 'bg-gray-100 dark:bg-gray-600' : 'text-gray-900 dark:text-gray-200'}`}
              role="option"
              aria-selected={option === value}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className={`block truncate ${option === value ? 'font-medium' : 'font-normal'}`}>
                {option}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;