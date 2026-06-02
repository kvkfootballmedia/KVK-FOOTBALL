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
        const { data: cat } = await supabase
          .from('categories')
          .select('id, name')
          .eq('slug', categorySlug)
          .single();

        if (cat) {
          if (!title) setCategoryName(cat.name);

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
            .limit(4);

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
    <section className="py-16 bg-secondary border-t-4 border-primary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-primary mr-3"></div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white uppercase tracking-tight">{categoryName}</h2>
          </div>
          <Link 
            href={`/category/${categorySlug}`}
            className="group flex items-center gap-2 text-white font-heading font-bold uppercase tracking-widest text-xs hover:text-primary transition-colors mb-2"
          >
            TOUT VOIR <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map(post => (
             <div key={post.id} className="bg-gray-900 border border-gray-800 hover:border-primary transition-colors h-full flex flex-col">
                {/* Forcing standard mode with dark styling by applying global styling inside the PostCard but since PostCard relies on classes we might need to rely on the fact that PostCard itself has a standard mode that works on dark bgs.
                    Actually PostCard has a white background. Let's make sure it handles it or wrap it differently.
                    Wait, PostCard uses bg-white. In a dark section, we can just use the PostCard as is, it gives a nice pop. 
                 */}
                <div className="h-full bg-white">
                  <PostCard post={post} />
                </div>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
