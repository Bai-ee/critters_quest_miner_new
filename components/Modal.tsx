'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { animateModalBackdrop, animateModalEntrance, animateModalExit } from '@/lib/animations/gsap';
import { playClickSound } from '@/lib/animations/sound';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playClickSound();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (!backdropRef.current || !modalRef.current) {
      console.log('[Modal] Refs not ready yet');
      return;
    }

    if (isOpen) {
      console.log('[Modal] Opening modal, setting up animations');
      // Set initial visible state immediately
      backdropRef.current.style.opacity = '1';
      backdropRef.current.style.display = 'flex';
      modalRef.current.style.opacity = '1';
      modalRef.current.style.display = 'block';
      
      try {
        animateModalBackdrop(backdropRef.current, true);
        animateModalEntrance(modalRef.current);
      } catch (err) {
        console.warn('[Modal] Animation error, showing modal anyway:', err);
        // Modal already visible from above
      }
      document.body.style.overflow = 'hidden';
    } else {
      console.log('[Modal] Closing modal');
      try {
        animateModalBackdrop(backdropRef.current, false);
        animateModalExit(modalRef.current, () => {
          if (backdropRef.current) {
            backdropRef.current.style.display = 'none';
          }
          document.body.style.overflow = '';
        });
      } catch (err) {
        console.warn('[Modal] Animation error on close:', err);
        if (backdropRef.current) {
          backdropRef.current.style.display = 'none';
        }
        document.body.style.overflow = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debug: Log modal render state
  useEffect(() => {
    console.log('[Modal Component] isOpen state:', isOpen, 'backdropRef:', !!backdropRef.current, 'modalRef:', !!modalRef.current);
  }, [isOpen]);

  console.log('[Modal Component] Render check - isOpen:', isOpen);
  
  if (!isOpen) {
    return null;
  }
  
  console.log('[Modal Component] Rendering modal content');

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      playClickSound();
      onClose();
    }
  };

  const handleClose = () => {
    playClickSound();
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      className="fixed flex items-center justify-center p-4"
      style={{ 
        zIndex: 999999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        position: 'fixed',
        display: 'flex',
        opacity: 1,
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-gray-800/95 backdrop-blur-md
          rounded-2xl border border-gray-700/50
          shadow-2xl
          max-h-[90vh] overflow-y-auto
          ${className}
        `}
        style={{ 
          zIndex: 999999,
          position: 'relative',
          opacity: 1,
          display: 'block',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {title && (
              <h2
                id="modal-title"
                className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="
                  ml-auto p-2
                  text-gray-400 hover:text-white
                  hover:bg-gray-700/50
                  rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}


