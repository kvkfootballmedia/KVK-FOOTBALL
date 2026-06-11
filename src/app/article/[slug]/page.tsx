import { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
// Sanitisation legere sans jsdom — compatible serverless Vercel
// Le contenu vient uniquement d'admins/editors authentifies (risque XSS faible)
function sanitize(html: string): string {
  return (html || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '');
}
import { Post, PostBlock } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import RelatedArticles from '@/components/editorial/RelatedArticles';
import CommentsSection from '@/components/editorial/CommentsSection';
import ShortVideoBlock from '@/components/editorial/ShortVideoBlock';
import ShareBar from '@/components/editorial/ShareBar';
import AdBanner from '@/components/ads/AdBanner';
import ViewTracker from '@/components/editorial/ViewTracker';
import TwitterEmbed from '@/components/editorial/TwitterEmbed';

// Revalidate every 5 minutes as per instructions
export const revalidate = 300;

// Block Renderer Component
const BlockRenderer = ({ block }: { block: PostBlock }) => {
  const { block_type, content } = block;

  switch (block_type) {
    case "paragraph":
      return (
        <div
          className="font-serif text-base md:text-xl leading-relaxed text-gray-800 mb-10 prose prose-lg prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitize(content.text || '') }}
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
            <li key={i} dangerouslySetInnerHTML={{ __html: sanitize(item || '') }} />
          ))}
        </ul>
      );
    case "embed": {
      const url = content.url || '';

      // Twitter / X
      if (url.includes('twitter.com') || url.includes('x.com')) {
        return <TwitterEmbed url={url} />;
      }

      // YouTube
      const getEmbedUrl = (u: string) => {
        try {
          if (u.includes('youtube.com/watch')) {
            const videoId = new URL(u).searchParams.get('v');
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
          }
          if (u.includes('youtu.be/')) {
            const videoId = u.split('youtu.be/')[1];
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
          }
          return u;
        } catch { return u; }
      };

      return (
        <div className="my-16 aspect-video bg-gray-100 rounded-sm overflow-hidden shadow-xl">
          <iframe
            src={getEmbedUrl(url)}
            className="w-full h-full"
            allowFullScreen
            title="Embedded content"
          />
        </div>
      );
    }
    case "html":
      return <div className="my-10" dangerouslySetInnerHTML={{ __html: sanitize(content.html || '') }} />;

    case "short_video":
      return (
        <ShortVideoBlock
          url={content.url}
          platform={content.platform}
          caption={content.caption}
        />
      );

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
      featured_image_focal_x,
      featured_image_focal_y,
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
      <ViewTracker postId={transformedPost.id} />
      <article className="pb-32 bg-white">

        {/* 1. Bloc pub — tout en haut */}
        <div className="container mx-auto px-3 md:px-4 max-w-3xl pt-4">
          <AdBanner dataAdSlot="SLOT_ARTICLE_TOP" dataAdFormat="horizontal" />
        </div>

        {/* 2. Header éditorial */}
        <header className="pt-4 pb-3 md:pt-10 md:pb-6 bg-white">
          <div className="container mx-auto px-3 md:px-4 max-w-3xl">
            {/* Catégorie */}
            <div className="flex flex-wrap gap-2 md:gap-4 mb-2 md:mb-4">
              {transformedPost.categories.map((cat: any, i: number) => (
                <Link key={i} href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1 text-primary font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:underline transition-all">
                  <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Titre */}
            <h1 className="text-xl md:text-5xl font-black mb-2 md:mb-4 leading-tight tracking-tight uppercase text-gray-900">
              {transformedPost.title}
            </h1>

            {/* Excerpt — desktop uniquement */}
            {transformedPost.excerpt && (
              <p className="font-serif text-sm md:text-lg text-gray-500 leading-relaxed mb-3 md:mb-5 max-w-xl hidden sm:block">
                {transformedPost.excerpt}
              </p>
            )}

            {/* Auteur + Date — petits, inline */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-2 md:pt-3">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gray-800 flex items-center justify-center text-white text-[8px] font-black uppercase select-none shrink-0">
                {(transformedPost.author?.full_name || 'K')[0]}
              </div>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {transformedPost.author?.full_name || 'Rédaction KVK'}
              </p>
              <span className="text-gray-200 text-[9px]">•</span>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {new Date(transformedPost.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        {/* 3. Image principale — collée au titre */}
        {transformedPost.featured_image && (
          <div className="container mx-auto px-3 md:px-4 max-w-3xl mb-4 md:mb-8">
            <div className="relative w-full rounded-sm overflow-hidden shadow-md max-h-[210px] md:max-h-[420px]">
              <img
                src={transformedPost.featured_image}
                alt={transformedPost.title}
                className="w-full h-full object-cover max-h-[210px] md:max-h-[420px]"
                style={{ objectPosition: `${transformedPost.featured_image_focal_x ?? 50}% ${transformedPost.featured_image_focal_y ?? 50}%` }}
              />
            </div>
          </div>
        )}

        {/* 4. Contenu */}
        <div className="container mx-auto px-4 max-w-3xl">
          <ShareBar title={transformedPost.title} slug={transformedPost.slug} />
          <div className="space-y-4">
            {sortedBlocks.map((block, index) => (
              <Fragment key={index}>
                <BlockRenderer block={block} />
                {index === 2 && (
                  <AdBanner dataAdSlot="SLOT_ARTICLE_MID" dataAdFormat="rectangle" />
                )}
              </Fragment>
            ))}
          </div>

          {/* Pub avant les commentaires */}
          <AdBanner dataAdSlot="SLOT_ARTICLE_BOTTOM" dataAdFormat="horizontal" />

          {/* Banderoles 1xBet + WhatsApp */}
          <div className="flex flex-col gap-2 my-6 max-w-xl mx-auto w-full">
            <a href="https://reffpa.com/L?tag=d_51222m_1599c_&site=51222&ad=1599" target="_blank" rel="noopener noreferrer">
              <img src="/1x Bet.png" alt="1xBet" className="w-full rounded-sm" />
            </a>
            <a href="https://wa.me/221765948961" target="_blank" rel="noopener noreferrer">
              <img src="/whatsapp.png" alt="Rejoindre sur WhatsApp" className="w-full rounded-sm" />
            </a>
          </div>

          <CommentsSection postId={transformedPost.id} />
        </div>
      </article>

      <RelatedArticles 
        currentPostId={transformedPost.id} 
        categoryId={post.category_id} 
      />
    </>
  );
}
