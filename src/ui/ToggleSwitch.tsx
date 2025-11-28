
import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, id, disabled = false }) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`${
          checked ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span
          aria-hidden="true"
          className={`${
            checked ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      {label && <span id={`${id}-label`} className={`ml-3 text-sm font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-brand-secondary dark:text-gray-300'}`}>{label}</span>}
    </div>
  );
};

export default ToggleSwitch;
