'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostCard from './PostCard';
import { Post } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { ChevronRight } from 'lucide-react';

interface RubriqueStripProps {
  categorySlug: string;
  title?: string;
}

export default function RubriqueStrip({ categorySlug, title }: RubriqueStripProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categoryName, setCategoryName] = useState(title || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Get Category
        const { data: cat } = await supabase
          .from('categories')
          .select('id, name')
          .eq('slug', categorySlug)
          .single();

        if (cat) {
          if (!title) setCategoryName(cat.name);

          // 2. Get Posts
          const { data: postData } = await supabase
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
            .eq('category_id', cat.id)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(3);

          if (postData) {
            const transformed = postData.map(p => ({
              ...p,
              categories: p.categories ? [p.categories] : []
            }));
            setPosts(transformed as any);
          }
        }
      } catch (err) {
        console.error('Error fetching rubrique strip:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, title]);

  if (isLoading || posts.length === 0) return null;

  return (
    <section className="py-20 bg-gray-900 border-y-8 border-primary relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-10 skew-x-12 translate-x-1/2"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Dossiers Spéciaux</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">{categoryName}</h2>
          </div>
          <Link 
            href={`/category/${categorySlug}`}
            className="group flex items-center gap-3 text-white font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors mb-2"
          >
            Voir tout <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map(post => (
             <div key={post.id} className="bg-white/5 p-4 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all">
                <PostCard post={post} />
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
