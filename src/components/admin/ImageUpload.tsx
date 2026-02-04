'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, className = "", label = "Image" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner une image valide.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await api.storage.upload(file);
      onChange(url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
        {label && <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</label>}
        
        <div 
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
                relative group cursor-pointer 
                min-h-[160px] rounded-sm border-2 border-dashed transition-all duration-200 ease-in-out
                flex flex-col items-center justify-center p-4 text-center overflow-hidden
                ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}
                ${value ? 'border-solid border-gray-100 bg-gray-50' : ''}
            `}
        >
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleChange} 
                className="hidden" 
            />

            {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload en cours...</span>
                </div>
            ) : value ? (
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="Preview" className="max-h-[300px] w-auto object-contain shadow-sm rounded-sm" />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Changer l'image</span>
                        <button 
                            onClick={handleRemove}
                            className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 hover:scale-110 transition-all"
                            title="Supprimer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-primary transition-colors">
                    <div className="p-4 bg-gray-100 rounded-full group-hover:bg-primary/10 transition-colors">
                        <Upload className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-600">Cliquez ou glissez une image ici</p>
                        <p className="text-[9px] uppercase tracking-wider mt-1 text-gray-400">JPG, PNG, WEBP (Max 5Mo)</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
