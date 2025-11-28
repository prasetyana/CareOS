
import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface AlertProps {
  variant: 'success' | 'error' | 'info';
  message: string;
}

const icons = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const variantClasses = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'text-green-500',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'text-red-500',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'text-blue-500',
  },
};

const Alert: React.FC<AlertProps> = ({ variant, message }) => {
  const classes = variantClasses[variant];
  return (
    <div className={`p-4 rounded-lg shadow-md ${classes.bg}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={classes.icon}>{icons[variant]}</span>
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${classes.text}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
