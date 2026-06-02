import { useRef, useState, MouseEvent } from 'react';
import { RotateCcw } from 'lucide-react';

interface FocalPointSelectorProps {
  imageUrl: string;
  onFocalPointChange: (x: number, y: number) => void;
  initialX?: number;
  initialY?: number;
}

export default function FocalPointSelector({
  imageUrl,
  onFocalPointChange,
  initialX = 50,
  initialY = 50,
}: FocalPointSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focalX, setFocalX] = useState(initialX);
  const [focalY, setFocalY] = useState(initialY);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setFocalX(clampedX);
    setFocalY(clampedY);
    onFocalPointChange(clampedX, clampedY);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetFocalPoint = () => {
    setFocalX(50);
    setFocalY(50);
    onFocalPointChange(50, 50);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700">
          Point Focal (Zoom Image)
        </label>
        <button
          type="button"
          onClick={resetFocalPoint}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 rounded transition"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-64 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 cursor-crosshair bg-gray-100"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Image */}
        <img
          src={imageUrl}
          alt="Image pour sélectionner le point focal"
          className="w-full h-full object-cover"
        />

        {/* Focal Point Indicator */}
        <div
          className="absolute w-8 h-8 border-2 border-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${focalX}%`,
            top: `${focalY}%`,
            boxShadow: '0 0 0 1px white, 0 0 0 3px red',
          }}
        >
          <div className="absolute inset-1 border border-red-500 rounded-full" />
        </div>

        {/* Crosshair */}
        <div
          className="absolute w-full h-0.5 bg-red-500/30 pointer-events-none"
          style={{ top: `${focalY}%` }}
        />
        <div
          className="absolute h-full w-0.5 bg-red-500/30 pointer-events-none"
          style={{ left: `${focalX}%` }}
        />
      </div>

      {/* Display current coordinates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <span className="font-semibold">X:</span> {focalX.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <span className="font-semibold">Y:</span> {focalY.toFixed(1)}%
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Cliquez et déplacez pour sélectionner la zone importante de l'image. Elle sera affichée en priorité.
      </p>
    </div>
  );
}
