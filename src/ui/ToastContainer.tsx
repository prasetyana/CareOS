import React from 'react';
import { useToast } from '@core/hooks/useToast';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm space-y-3 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
