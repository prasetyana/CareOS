import React, { useState, useEffect } from 'react';
import { ToastVariant } from '@core/contexts/ToastContext';
import { Check, X, Info, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
}

const icons = {
  success: <Check className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

const variantClasses = {
  success: {
    iconBg: 'bg-[#4cd964]',
    iconText: 'text-white',
  },
  error: {
    iconBg: 'bg-[#ff3b30]',
    iconText: 'text-white',
  },
  info: {
    iconBg: 'bg-[#007aff]',
    iconText: 'text-white',
  },
};

const Toast: React.FC<ToastProps> = ({ message, variant, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const classes = variantClasses[variant];

  return (
    <div
      role="alert"
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-2xl
        bg-white/80 dark:bg-black/60
        backdrop-blur-xl
        border border-white/30 dark:border-white/10
        shadow-[0_8px_24px_rgba(0,0,0,0.15)]
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
      style={{
        animation: isExiting ? 'none' : 'slideInUp 0.3s ease-out',
      }}
    >
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${classes.iconBg} ${classes.iconText} flex items-center justify-center`}>
        {icons[variant]}
      </div>
      <div className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
        {message}
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default Toast;
