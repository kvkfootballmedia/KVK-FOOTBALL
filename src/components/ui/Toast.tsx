'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-primary" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgStyles = {
    success: 'border-emerald-100 bg-emerald-50/90',
    error: 'border-red-100 bg-red-50/90',
    info: 'border-blue-100 bg-blue-50/90',
  };

  return (
    <div className={`
      flex items-center gap-4 p-4 pr-12 min-w-[300px] max-w-md
      bg-white border-l-4 shadow-2xl rounded-sm
      animate-in slide-in-from-right duration-300
      ${bgStyles[type]}
      ${type === 'error' ? 'border-primary' : type === 'success' ? 'border-emerald-500' : 'border-blue-500'}
    `}>
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-900 leading-relaxed">
        {message}
      </p>
      <button 
        onClick={() => onClose(id)}
        className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
