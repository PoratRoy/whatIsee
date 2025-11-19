'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SlidePanel({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: SlidePanelProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting for hydration safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    onClose();
  };

  const sizeClasses = {
    sm: 'w-80', // 320px
    md: 'w-96', // 384px
    lg: 'w-1/2', // 50% width
  };

  const panelContent = (
    <>
      {/* Backdrop with blur */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-500',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleBackdropClick}
      />

      {/* Slide Panel */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full bg-background border-r shadow-2xl z-50',
          'transform transition-transform duration-500 ease-out',
          'flex flex-col',
          sizeClasses[size],
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!title && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close panel</span>
              </Button>
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );

  // Render in portal to ensure proper z-index stacking
  // Use hydration-safe approach to prevent SSR mismatch
  if (!isMounted) {
    return null;
  }

  return createPortal(panelContent, document.body);
}
