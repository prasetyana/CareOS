import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  mobileAs?: 'bottom-sheet';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, mobileAs }) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isBottomSheet = isMobile && mobileAs === 'bottom-sheet';

  const containerClasses = isBottomSheet
    ? "flex items-end justify-center"
    : "flex items-center justify-center";

  const panelClasses = isBottomSheet
    ? "bg-surface-2 dark:bg-gray-800/85 backdrop-blur-xl rounded-t-3xl shadow-popover w-full animate-slide-in-up border-t border-glass-border"
    : "bg-surface-2 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl shadow-popover w-full max-w-lg m-8 animate-scale-in border border-glass-border";

  return createPortal(
    <div
      className="fixed inset-0 z-[60] p-0 md:p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className={`fixed inset-0 ${containerClasses}`}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal Panel */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative ${panelClasses}`}
          style={{ animationFillMode: 'forwards' }}
        >
          {isBottomSheet && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          )}
          {title && (
            <div className="flex items-start justify-between p-6 border-b border-black/10 dark:border-white/10">
              <h3 className="text-xl font-semibold text-text-primary" id="modal-title">
                {title}
              </h3>
              <button
                type="button"
                className="text-text-muted bg-transparent hover:bg-black/5 dark:hover:bg-white/10 hover:text-text-primary rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className={`${title ? 'p-6' : 'p-0'} ${isBottomSheet ? 'pb-8' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;