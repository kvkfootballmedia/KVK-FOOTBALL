'use client';

import { useEffect } from 'react';

export default function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `viewed_${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    // Passe par l'API Route Next.js (rate limiting + service role)
    // Jamais d'appel direct à Supabase depuis le client pour les stats
    fetch(`/api/views/${postId}`, { method: 'POST' }).catch(() => {});
  }, [postId]);

  return null;
}
