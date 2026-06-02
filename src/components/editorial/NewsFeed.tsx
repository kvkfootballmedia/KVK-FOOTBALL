'use client';

import { useState, useEffect } from 'react';
import PostCard from "@/components/editorial/PostCard";
import AdBanner from "@/components/ads/AdBanner";
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
        <div className="h-8 w-48 bg-gray-200 animate-pulse"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 w-full bg-gray-100 animate-pulse border border-gray-200"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-12">
      <section>
        <div className="flex items-center mb-4 md:mb-6">
          <div className="w-1.5 md:w-2 h-6 md:h-8 bg-primary mr-2 md:mr-3"></div>
          <h1 className="text-lg md:text-3xl font-heading font-black uppercase text-secondary tracking-tight">
            A La Une
          </h1>
        </div>

        {heroPost && (
          <div className="mb-6 md:mb-12">
            <PostCard post={heroPost} featured={true} />
          </div>
        )}

        <AdBanner dataAdSlot="SLOT_HOME_MID" dataAdFormat="horizontal" className="mt-4 md:mt-8" />

        <div className="flex items-center mb-4 md:mb-6 mt-4 md:mt-8">
          <div className="w-1.5 md:w-2 h-6 md:h-8 bg-secondary mr-2 md:mr-3"></div>
          <h2 className="text-lg md:text-3xl font-heading font-black uppercase text-secondary tracking-tight">
            Dernieres Infos
          </h2>
        </div>

        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
            {gridPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : !heroPost && (
          <div className="py-16 text-center border border-gray-200 bg-white">
            <p className="text-gray-400 font-heading font-bold uppercase tracking-widest text-sm md:text-xl">Aucun article disponible.</p>
          </div>
        )}
      </section>
    </div>
  );
}
