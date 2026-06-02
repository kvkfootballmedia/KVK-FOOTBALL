import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import FocalPointSelector from './component_focal_point_selector';
import { articleStorage } from '@/lib/storageService';

interface ImageUploadKVKProps {
  onImageChange: (url: string, focalX: number, focalY: number) => void;
  onRemove?: () => void;
  initialImageUrl?: string;
  initialFocalX?: number;
  initialFocalY?: number;
  label?: string;
  type?: 'featured' | 'block'; // Type de contenu pour déterminer le chemin de stockage
}

export default function ImageUploadKVK({
  onImageChange,
  onRemove,
  initialImageUrl,
  initialFocalX = 50,
  initialFocalY = 50,
  label = 'Image vedette',
  type = 'featured',
}: ImageUploadKVKProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [focalX, setFocalX] = useState(initialFocalX);
  const [focalY, setFocalY] = useState(initialFocalY);
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Upload vers le bon bucket/chemin selon le type
      let uploadResult;

      if (type === 'featured') {
        uploadResult = await articleStorage.uploadFeaturedImage(file);
      } else {
        uploadResult = await articleStorage.uploadBlockImage(file);
      }

      // Créer un preview en local aussi
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
      };
      reader.readAsDataURL(file);

      // Stocker l'URL publique
      setImageUrl(uploadResult.url);
      setFocalX(50);
      setFocalY(50);
      onImageChange(uploadResult.url, 50, 50);

    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors du téléchargement';
      setError(errorMsg);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFocalPointChange = (x: number, y: number) => {
    setFocalX(x);
    setFocalY(y);
    if (imageUrl) {
      onImageChange(imageUrl, x, y);
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    setPreview(null);
    setFocalX(50);
    setFocalY(50);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      {!imageUrl ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition hover:border-blue-400 cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">
            Glissez-déposez une image ici
          </p>
          <p className="text-xs text-gray-500">ou cliquez pour parcourir</p>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG, WebP (max 5MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img
              src={preview || imageUrl}
              alt="Aperçu"
              className="w-full h-auto max-h-64 object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Focal Point Selector */}
          <FocalPointSelector
            imageUrl={preview || imageUrl}
            onFocalPointChange={handleFocalPointChange}
            initialX={focalX}
            initialY={focalY}
          />

          {/* Reupload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
          >
            Changer l'image
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ❌ {error}
        </div>
      )}

      {isLoading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          ⏳ Téléchargement en cours...
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />
    </div>
  );
}
