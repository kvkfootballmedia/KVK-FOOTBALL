'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PromoBanner() {
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState<number>(128);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('title, slug')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        if (data) setFeaturedPosts(data);
      } catch (err) {
        console.error('[PromoBanner] Error fetching featured posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();

    // Calculate days left until June 11, 2026
    const target = new Date('2026-06-11T00:00:00');
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays > 0 ? diffDays : 0);
  }, []);

  return (
    <div className="w-full mb-8 font-sans border-b border-gray-200">
      {/* 1. TOP BAR (Black) - Dynamic */}
      {featuredPosts.length > 0 && (
        <div className="bg-secondary text-white text-[10px] font-heading font-black uppercase tracking-widest py-2 border-b-2 border-primary">
          <div className="container mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar whitespace-nowrap items-center">
            <span className="bg-primary text-white px-2 py-0.5 shrink-0">DIRECT</span>
            {featuredPosts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/article/${post.slug}`} 
                className="hover:text-primary transition-colors shrink-0"
              >
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. MIDDLE BANNER */}
      <div className="bg-white flex flex-row border-b border-gray-200">
        <div className="flex-1 p-3 md:p-8 border-r border-gray-200 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2 h-2 md:w-3 md:h-3 shrink-0 ${daysLeft === 0 ? 'bg-primary animate-ping' : 'bg-primary'}`}></span>
            <span className="text-primary font-heading font-bold uppercase tracking-widest text-[9px] md:text-xs">
              {daysLeft === 0 ? '🔴 EN DIRECT' : 'Evenement'}
            </span>
          </div>
          <h2 className="text-base md:text-4xl font-heading font-black uppercase tracking-tight text-secondary leading-tight">
            COUPE DU MONDE 2026
          </h2>
          <p className="text-[9px] md:text-sm font-sans text-gray-500 uppercase tracking-widest mt-1">
            USA / MEXIQUE / CANADA
          </p>
        </div>

        <div className={`flex items-center justify-center p-3 md:p-8 w-1/3 md:w-1/3 shrink-0 ${daysLeft === 0 ? 'bg-primary' : 'bg-gray-50'}`}>
          {daysLeft === 0 ? (
            <div className="text-center animate-pulse">
              <div className="text-[8px] md:text-xs font-heading font-black text-white/80 uppercase tracking-widest mb-1">
                C'EST
              </div>
              <div className="text-xl md:text-5xl font-heading font-black text-white leading-none">
                JOUR J
              </div>
              <div className="text-[8px] md:text-xs font-heading font-black text-white/80 uppercase tracking-widest mt-1">
                ÇA COMMENCE !
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-[8px] md:text-sm font-heading font-bold text-gray-500 uppercase tracking-widest mb-1">
                DANS
              </div>
              <div className="text-2xl md:text-6xl font-heading font-black text-primary leading-none">
                {daysLeft}
              </div>
              <div className="text-[9px] md:text-xl font-heading font-black text-secondary uppercase">
                JOURS
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
