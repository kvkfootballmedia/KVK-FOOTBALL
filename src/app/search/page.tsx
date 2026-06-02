'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import PostCard from '@/components/editorial/PostCard';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q')?.trim() || '';
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) { setPosts([]); return; }
    setLoading(true);
    supabase
      .from('posts')
      .select(`
        id, title, slug, excerpt, featured_image, published_at, is_featured,
        categories:category_id ( name, slug ),
        author:profiles!posts_author_id_fkey ( full_name )
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order('published_at', { ascending: false })
      .limit(24)
      .then(({ data, error }) => {
        if (!error && data) {
          setPosts(data.map(p => ({ ...p, categories: p.categories ? [p.categories] : [] })));
        }
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <header className="mb-12 border-b-4 border-gray-900 pb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
          Resultats de recherche
        </p>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-gray-900">
          {q ? `"${q}"` : 'Recherche'}
        </h1>
        {!loading && q && (
          <p className="text-sm text-gray-400 font-bold mt-3 uppercase tracking-widest">
            {posts.length} resultat{posts.length !== 1 ? 's' : ''}
          </p>
        )}
      </header>

      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest">Recherche en cours...</span>
        </div>
      )}

      {!loading && q && posts.length === 0 && (
        <div className="py-24 text-center border-2 border-dashed border-gray-100">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-xl font-black uppercase text-gray-400">Aucun article trouve</p>
          <p className="text-sm text-gray-300 mt-2">Essayez avec d'autres mots-cles</p>
          <Link href="/" className="inline-block mt-8 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
            Retour a l'accueil
          </Link>
        </div>
      )}

      {!loading && !q && (
        <div className="py-24 text-center text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="font-black uppercase tracking-widest text-sm">Entrez un terme de recherche</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
