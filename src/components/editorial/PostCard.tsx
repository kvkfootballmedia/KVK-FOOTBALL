import Link from 'next/link';
import { Post } from '@/types';
import { Clock } from 'lucide-react';

interface PostCardProps {
  post: Partial<Post>;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const { title, excerpt, slug, published_at, categories, featured_image } = post;
  const category = categories?.[0] ?? { name: 'General', slug: 'general' };

  const displayDate = published_at
    ? new Date(published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  if (featured) {
    return (
      <article className="group grid grid-cols-1 md:grid-cols-12 gap-0 border-2 border-secondary bg-white hover:border-primary transition-colors">
        {/* Image */}
        <div className="md:col-span-8 relative aspect-[16/9] overflow-hidden bg-gray-900 border-b md:border-b-0 md:border-r border-secondary">
          <Link href={`/article/${slug}`} className="block w-full h-full">
            {featured_image ? (
              <img src={featured_image} alt={title || ''} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700 font-heading font-black text-4xl bg-gray-900 tracking-widest">KVK</div>
            )}
            <div className="absolute top-0 left-0 bg-primary text-white text-[9px] md:text-xs font-black uppercase tracking-widest px-2 py-1 md:px-4 md:py-2">
              A la une
            </div>
          </Link>
        </div>

        {/* Contenu */}
        <div className="md:col-span-4 flex flex-col p-4 md:p-8 justify-center">
          <div className="flex items-center gap-2 text-[9px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            <span>{displayDate}</span>
          </div>
          <Link href={`/category/${category.slug}`} className="text-primary font-heading font-black uppercase tracking-widest text-[10px] md:text-sm mb-1 hover:underline">
            {category.name}
          </Link>
          <Link href={`/article/${slug}`}>
            <h2 className="text-lg md:text-3xl font-heading font-black mb-3 leading-tight text-secondary group-hover:text-primary transition-colors uppercase line-clamp-3">
              {title}
            </h2>
          </Link>
          <p className="text-gray-600 mb-4 font-sans leading-relaxed text-xs md:text-sm line-clamp-3 hidden sm:block">
            {excerpt}
          </p>
          <div className="mt-auto pt-3 md:pt-6 border-t border-gray-200">
            <Link href={`/article/${slug}`} className="inline-flex items-center gap-1.5 font-heading font-black uppercase tracking-widest text-secondary hover:text-primary text-[10px] md:text-sm">
              LIRE
              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col h-full bg-white border border-gray-200 hover:border-secondary transition-colors">
      {/* Thumbnail */}
      <Link href={`/article/${slug}`} className="relative shrink-0 aspect-[16/9] overflow-hidden bg-gray-900 border-b border-gray-200 block">
        {featured_image ? (
          <img src={featured_image} alt={title || ''} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700 font-heading font-black text-2xl tracking-widest">KVK</div>
        )}
      </Link>

      {/* Contenu */}
      <div className="flex flex-col flex-1 p-3 md:p-5">
        <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">
          <Clock className="w-3 h-3" />
          <span>{displayDate}</span>
        </div>
        <Link href={`/category/${category.slug}`} className="text-primary font-heading font-bold uppercase tracking-widest text-[9px] md:text-xs mb-1 inline-block hover:underline">
          {category.name}
        </Link>
        <Link href={`/article/${slug}`}>
          <h3 className="text-sm md:text-xl font-heading font-black mb-2 leading-tight text-secondary group-hover:text-primary transition-colors uppercase line-clamp-3">
            {title}
          </h3>
        </Link>
        <p className="text-gray-600 text-xs font-sans leading-relaxed mb-3 line-clamp-2 hidden md:block">
          {excerpt}
        </p>
        <div className="mt-auto pt-3 border-t border-gray-100">
          <Link href={`/article/${slug}`} className="flex items-center gap-1.5 font-heading font-bold uppercase tracking-widest text-secondary hover:text-primary text-[9px] md:text-xs">
            LIRE
            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
