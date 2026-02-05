'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  isDestructive = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md shadow-2xl rounded-sm p-8 md:p-12 relative animate-in zoom-in duration-300">
        <button onClick={onCancel} className="absolute top-6 right-6 text-gray-400 hover:text-black">
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDestructive ? 'bg-red-50 text-primary' : 'bg-gray-50 text-gray-900'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">
            {title}
          </h2>
          
          <p className="text-gray-500 font-serif italic mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`py-4 font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-xl ${
                isDestructive 
                  ? 'bg-primary text-white hover:bg-black' 
                  : 'bg-gray-900 text-white hover:bg-primary'
              }`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="py-4 font-black uppercase tracking-[0.3em] text-[10px] text-gray-400 hover:text-black transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
