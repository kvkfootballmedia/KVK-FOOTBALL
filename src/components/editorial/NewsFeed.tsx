'use client';

import { useState, useEffect } from 'react';
import PostCard from "@/components/editorial/PostCard";
import { Post } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export default function NewsFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image,
            published_at,
            is_featured,
            categories:category_id ( name, slug ),
            author:profiles!posts_author_id_fkey ( full_name, role )
          `)
          .eq('status', 'published')
          .order('is_featured', { ascending: false })
          .order('published_at', { ascending: false });

        if (supabaseError) throw supabaseError;

        const transformedPosts = (data as any[]).map(post => ({
          ...post,
          categories: post.categories ? [post.categories] : []
        }));

        setPosts(transformedPosts as any);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Échec de la récupération des actualités.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const heroPost = posts.find(p => p.is_featured) || posts[0];
  const gridPosts = posts.filter(p => p.id !== heroPost?.id);

  if (isLoading) {
    return (
      <div className="py-24 space-y-12">
        <div className="h-8 w-48 bg-gray-100 animate-pulse"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 w-full bg-gray-50 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <section>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 mb-8 border-b border-gray-100 pb-4">
          À La Une
        </h1>

        {heroPost && (
          <div className="mb-16">
             <PostCard post={heroPost} featured={true} />
          </div>
        )}

        {heroPost && gridPosts.length > 0 && (
          <div className="w-full h-px bg-gray-200 mb-16"></div>
        )}

        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 mb-8 border-b border-gray-100 pb-4">
          Dernières infos
        </h2>

        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 md:gap-y-16">
            {gridPosts.map(post => (
              <div key={post.id}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : !heroPost && (
          <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-white">
            <p className="text-gray-300 font-serif italic text-2xl">Aucun article disponible.</p>
          </div>
        )}
      </section>
    </div>
  );
}
