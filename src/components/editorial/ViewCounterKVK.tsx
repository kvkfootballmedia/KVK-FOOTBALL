import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

interface ViewCounterKVKProps {
  postId: string;
  onViewRecorded?: (viewCount: number) => void;
  showIcon?: boolean;
}

export default function ViewCounterKVK({
  postId,
  onViewRecorded,
  showIcon = true,
}: ViewCounterKVKProps) {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnique, setIsUnique] = useState(false);

  useEffect(() => {
    const recordView = async () => {
      try {
        // Check if this is a unique view using localStorage
        const storageKey = `viewed-post-${postId}`;
        const hasViewed = localStorage.getItem(storageKey);

        if (!hasViewed) {
          // Mark this post as viewed
          localStorage.setItem(storageKey, 'true');
          setIsUnique(true);

          // In production, call your API to increment view count
          // await fetch(`/api/posts/${postId}/views`, { method: 'POST' });
        }

        // Fetch current view count
        // In production, this would come from your API
        // const response = await fetch(`/api/posts/${postId}/views`);
        // const data = await response.json();
        // setViewCount(data.viewCount);

        // For now, we'll use a placeholder
        setViewCount(Math.floor(Math.random() * 1000) + 100);
        onViewRecorded?.(viewCount);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la vue:', error);
      } finally {
        setIsLoading(false);
      }
    };

    recordView();
  }, [postId, onViewRecorded]);

  if (isLoading) {
    return null;
  }

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="flex items-center gap-1 text-gray-600 text-sm">
      {showIcon && <Eye className="w-4 h-4" />}
      <span>{formatViewCount(viewCount)} vue{viewCount !== 1 ? 's' : ''}</span>
    </div>
  );
}

// Helper hook to use view counter
export function useViewCounter(postId: string) {
  const [viewCount, setViewCount] = useState<number>(0);

  useEffect(() => {
    const recordView = async () => {
      try {
        const storageKey = `viewed-post-${postId}`;
        const hasViewed = localStorage.getItem(storageKey);

        if (!hasViewed) {
          localStorage.setItem(storageKey, 'true');

          // Call API in production
          // await fetch(`/api/posts/${postId}/views`, { method: 'POST' });
        }

        // Fetch view count from API or database
        // In production:
        // const response = await fetch(`/api/posts/${postId}/views`);
        // const data = await response.json();
        // setViewCount(data.viewCount);

        setViewCount(Math.floor(Math.random() * 1000) + 100);
      } catch (error) {
        console.error('Erreur lors de la lecture des vues:', error);
      }
    };

    recordView();
  }, [postId]);

  return viewCount;
}
