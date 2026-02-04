import { Metadata } from 'next';
import Link from 'next/link';
import { Post, PostBlock } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import RelatedArticles from '@/components/editorial/RelatedArticles';

// Revalidate every 5 minutes as per instructions
export const revalidate = 300;

// Block Renderer Component
const BlockRenderer = ({ block }: { block: PostBlock }) => {
  const { block_type, content } = block;

  switch (block_type) {
    case "paragraph":
      return (
        <div 
          className="font-serif text-xl leading-relaxed text-gray-800 mb-10 prose prose-lg prose-gray max-w-none" 
          dangerouslySetInnerHTML={{ __html: content.text }} 
        />
      );
    case "heading":
      return content.level === 3 ? (
        <h3 className="font-black text-3xl md:text-4xl mt-16 mb-8 tracking-tighter italic border-b-2 border-gray-900 pb-2 inline-block">
          {content.text}
        </h3>
      ) : (
        <h2 className="font-black text-3xl md:text-4xl mt-16 mb-8 tracking-tighter italic border-b-2 border-gray-900 pb-2 inline-block">
          {content.text}
        </h2>
      );
    case "image":
      return (
        <figure className="my-16 -mx-4 md:-mx-16">
          <div className="relative aspect-video">
            <img 
              src={content.url} 
              alt={content.alt || ''} 
              className="w-full h-full object-cover shadow-2xl" 
            />
          </div>
          {content.caption && (
            <figcaption className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-t border-gray-100 pt-4 w-fit mx-auto italic">
              {content.caption}
            </figcaption>
          )}
        </figure>
      );
    case "quote":
      return (
        <div className="my-20 relative p-12 bg-gray-50 border-y-2 border-gray-900 overflow-hidden">
          <span className="absolute -top-10 -left-4 text-[200px] font-black text-gray-900/5 select-none leading-none">"</span>
          <p className="font-serif text-4xl italic leading-tight text-gray-900 text-center relative z-10">
            {content.text}
          </p>
          {content.author && (
            <p className="text-center mt-8 text-xs font-black uppercase tracking-[0.2em] text-primary relative z-10">
               — {content.author}
            </p>
          )}
        </div>
      );
    case "list":
      return (
        <ul className="list-disc list-inside space-y-4 font-serif text-xl text-gray-800 mb-10 pl-4 border-l-2 border-gray-100">
          {content.items?.map((item: string, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
    case "embed":
      const getEmbedUrl = (url: string) => {
        try {
          // Handle YouTube
          if (url.includes('youtube.com/watch')) {
            const videoId = new URL(url).searchParams.get('v');
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
          }
          if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1];
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
          }
          return url;
        } catch {
          return url;
        }
      };

      return (
        <div className="my-16 aspect-video bg-gray-100 rounded-sm overflow-hidden shadow-xl">
          <iframe 
            src={getEmbedUrl(content.url)} 
            className="w-full h-full"
            allowFullScreen
            title="Embedded content"
          />
        </div>
      );
    case "html":
      return <div className="my-10" dangerouslySetInnerHTML={{ __html: content.html }} />;
    default:
      return null;
  }
};

// SEO Metadata Generation - Production Strict
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('title, excerpt, featured_image')
      .eq('slug', slug)
      .eq('status', 'published')
      .single() as any;

    if (error || !post) throw error;

    return {
      title: `${post.title} | KVK Football`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt || '',
        images: post.featured_image ? [post.featured_image] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || '',
        images: post.featured_image ? [post.featured_image] : [],
      }
    };
  } catch (error) {
    return { title: 'Article | KVK Football' };
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      category_id,
      categories:category_id ( name, slug ),
      author:profiles!posts_author_id_fkey ( full_name, role ),
      post_blocks ( id, block_type, content, position )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single() as any;

  if (error || !post) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-black uppercase">Article introuvable ou non publié</h1>
        <p className="text-gray-500 mt-4">Vérifiez l'URL ou réessayez plus tard.</p>
        <Link href="/" className="text-primary font-black uppercase tracking-widest text-xs mt-8 inline-block hover:underline">
          Retour au flux
        </Link>
      </div>
    );
  }

  // Transform post to match expected type (categories as array)
  const transformedPost = {
    ...post,
    categories: post.categories ? [post.categories] : []
  };
  
  const post_blocks = transformedPost.post_blocks || [];

  // Strict chronological ordering for editorial integrity
  const sortedBlocks = [...post_blocks].sort((a, b) => a.position - b.position);

  return (
    <>
      <article className="pb-32 bg-white">
        {/* Editorial Header */}
        <header className="py-20 md:py-32 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {transformedPost.categories.map((cat: any, i: number) => (
                <Link key={i} href={`/category/${cat.slug}`} className="text-primary font-black uppercase tracking-[0.3em] text-[10px] hover:underline transition-all">
                  {cat.name}
                </Link>
              ))}
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-12 leading-[0.9] tracking-tighter uppercase italic">
              {transformedPost.title}
            </h1>
            <div className="flex items-center justify-center gap-6 pt-8 border-t border-gray-100 w-fit mx-auto px-12">
              <div className="text-left">
                <p className="font-black text-sm uppercase tracking-tighter mb-1 select-none">
                  Par {transformedPost.author?.full_name || 'Rédaction KVK'}
                </p>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  {new Date(transformedPost.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Image - Optimized */}
        {transformedPost.featured_image && (
          <div className="w-full h-[70vh] relative overflow-hidden mb-24 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out">
            <img 
              src={transformedPost.featured_image} 
              alt={transformedPost.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
          </div>
        )}

        {/* Block Rendering Engine */}
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-4">
            {sortedBlocks.map((block, index) => (
              <BlockRenderer key={index} block={block} />
            ))}
          </div>
        </div>
      </article>

      <RelatedArticles 
        currentPostId={transformedPost.id} 
        categoryId={post.category_id} 
      />
    </>
  );
}
