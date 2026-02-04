import { supabase } from '@/lib/supabaseClient';
import PostCard from './PostCard';
import { Post } from '@/types';

interface RelatedArticlesProps {
  currentPostId: string;
  categoryId?: string;
}

export default async function RelatedArticles({ currentPostId, categoryId }: RelatedArticlesProps) {
  // Fetch related posts (same category, excluding current)
  let { data: relatedPosts } = await supabase
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
    .neq('id', currentPostId)
    .eq('category_id', categoryId)
    .limit(3)
    .order('published_at', { ascending: false });

  const relatedIds = relatedPosts?.map(p => p.id) || [];

  // If not enough related by category, fetch latest
  if (!relatedPosts || relatedPosts.length < 3) {
    const { data: latestPosts } = await supabase
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
      .neq('id', currentPostId)
      .limit(6) // Fetch a few more to allow filtering duplicates
      .order('published_at', { ascending: false });

    const extraPosts = (latestPosts || []).filter(p => !relatedIds.includes(p.id));
    relatedPosts = [...(relatedPosts || []), ...extraPosts].slice(0, 3);
  }

  if (!relatedPosts || relatedPosts.length === 0) return null;

  // Transform for PostCard
  const transformedPosts = relatedPosts.map((post: any) => ({
    ...post,
    categories: post.categories ? [post.categories] : []
  }));

  return (
    <section className="bg-gray-50 pt-24 pb-32 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-6 mb-16">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400 shrink-0">
            Plus de lecture
          </h2>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {transformedPosts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
