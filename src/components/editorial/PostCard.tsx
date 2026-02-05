import Link from 'next/link';
import { Post } from '@/types';
import { Clock } from 'lucide-react';

interface PostCardProps {
  post: Partial<Post>;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const { title, excerpt, slug, published_at, categories, author, featured_image } = post;

  const category = categories && categories.length > 0 ? categories[0] : { name: 'Général', slug: 'general' };
  
// Helper for consistent date formatting
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const displayDate = formatDate(published_at);

  // 1. FEATURED LAYOUT (Hero - FC Plateau Refined)
  if (featured) {
    return (
      <article className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm hover:shadow-md transition-shadow">
        <div className="md:col-span-12 lg:col-span-7 relative aspect-[16/10] md:aspect-[16/9] overflow-hidden bg-gray-100 rounded-[1.5rem] md:rounded-[2rem]">
          <Link href={`/article/${slug}`} className="block w-full h-full">
            {featured_image ? (
              <img 
                src={featured_image} 
                alt={title || ''} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-4xl bg-gray-50">KVK</div>
            )}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-primary text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-4 md:px-6 py-1.5 md:py-2 rounded-full">
              À la une
            </div>
          </Link>
        </div>
        <div className="md:col-span-12 lg:col-span-5 flex flex-col justify-center px-2 md:px-4">
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
             <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
             <span>{displayDate}</span>
          </div>
          
          <Link href={`/category/${category.slug}`} className="text-primary font-black uppercase tracking-wider text-[11px] md:text-[12px] mb-3 md:mb-4 hover:underline">
            {category.name}
          </Link>
          <Link href={`/article/${slug}`}>
            <h2 className="text-2xl md:text-5xl font-black mb-4 md:mb-6 leading-[1.1] md:leading-[1.05] text-gray-900 group-hover:text-primary transition-colors cursor-pointer uppercase italic italic-none">
              {title}
            </h2>
          </Link>
          <p className="text-gray-500 mb-6 md:mb-8 font-serif leading-relaxed text-sm md:text-base line-clamp-3 md:line-clamp-4">
            {excerpt}
          </p>

          <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-gray-100">
             <Link href={`/article/${slug}`} className="flex items-center gap-3 md:gap-4 group/btn">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center text-white group-hover/btn:bg-primary transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
               </div>
               <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-black">Lire l'article</span>
            </Link>
            
            <button className="text-gray-300 hover:text-primary transition-colors p-2">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    );
  }

  // 2. STANDARD CARD LAYOUT (Eurosport-style on Mobile, Card on Desktop)
  return (
    <article className="group flex flex-row md:flex-col gap-4 md:gap-0 h-full bg-white p-3 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Thumbnail */}
      <Link href={`/article/${slug}`} className="relative shrink-0 w-28 h-28 md:w-auto md:h-auto md:aspect-[4/3] overflow-hidden bg-gray-100 md:mb-6 rounded-[1rem] md:rounded-[2rem] block">
        {featured_image ? (
          <img 
            src={featured_image} 
            alt={title || ''} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 font-black text-xl">KVK</div>
        )}
        {/* Overlay Badge - Desktop Only */}
        <div className="hidden md:block absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Lire la suite
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 md:px-2">
        {/* Meta */}
        <div className="flex items-center gap-3 text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 md:mb-4">
           <div className="flex items-center gap-1.5">
             <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
             <span>{displayDate}</span>
           </div>
        </div>

        {/* Category & Title */}
        <Link href={`/category/${category.slug}`} className="text-primary font-black uppercase tracking-wider text-[10px] md:text-[11px] mb-1 md:mb-2 hover:underline">
          {category.name}
        </Link>

        <Link href={`/article/${slug}`}>
          <h3 className="text-base md:text-2xl font-black mb-2 md:mb-4 leading-[1.2] md:leading-[1.15] text-gray-900 group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-3 uppercase italic italic-none">
            {title}
          </h3>
        </Link>

        {/* Excerpt - Desktop Only for standard cards to keep mobile tight */}
        <p className="hidden md:block text-gray-500 text-sm font-serif leading-relaxed mb-8 line-clamp-3">
          {excerpt}
        </p>
        
        {/* Footer Actions - Desktop Only */}
        <div className="hidden md:flex mt-auto pt-6 items-center justify-between border-t border-gray-100">
          <Link href={`/article/${slug}`} className="flex items-center gap-3 group/btn">
             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white group-hover/btn:bg-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
             </div>
             <span className="text-[11px] font-black uppercase tracking-widest text-black">Détails</span>
          </Link>

          <button className="text-gray-300 hover:text-primary transition-colors p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* Mobile Footer action (optional, keeping it minimal) */}
        <div className="md:hidden mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
           <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Lire plus</span>
           <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
           </svg>
        </div>
      </div>
    </article>
  );
}
