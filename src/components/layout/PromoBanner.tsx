'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function PromoBanner() {
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div className="w-full mb-8 font-sans">
      {/* 1. TOP BAR (Black) - Dynamic */}
      {featuredPosts.length > 0 && (
        <div className="bg-black text-white text-[10px] font-black uppercase tracking-widest py-2">
          <div className="container mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="text-gray-400 shrink-0">À la une :</span>
            {featuredPosts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/post/${post.slug}`} 
                className="hover:text-primary transition-colors shrink-0"
              >
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. MIDDLE BANNER (Red/Image) */}
      <div className="relative bg-red-900 text-white overflow-hidden h-32 md:h-40 flex items-center">
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-red-800 z-0">
          {/* Optional: Add a real background image here later */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-start justify-center h-full">
           <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-1 font-[family-name:var(--font-inter)]">
             COUPE DU MONDE 2026
           </h2>
           <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-red-200 mb-4 opacity-90">
             VIVRE L'HISTOIRE • USA / MEXIQUE / CANADA
           </p>
        </div>

        {/* Floating Play Button / CA (Right side) - Removed "S'abonner" button */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-black/50 to-transparent z-10 hidden md:flex items-center justify-end px-12">
        </div>
      </div>

      {/* 3. BOTTOM BAR (White/Red) */}
      <div className="bg-white border-b border-gray-100 text-gray-900 py-4 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-4 md:gap-8">
           {/* Event Logo / Name */}
           <div className="text-lg font-black tracking-tighter uppercase border-r border-gray-200 pr-8 hidden md:block text-primary">
             J-128
           </div>

           {/* Countdown / Main Text */}
           <div className="flex items-baseline gap-3 uppercase font-black tracking-tight text-xl md:text-3xl">
              <span className="text-4xl md:text-5xl font-mono text-primary">128</span>
              <span>JOURS AVANT LE COUP D'ENVOI</span>
           </div>
           
           {/* Decorative Element */}
           <div className="ml-auto hidden md:block">
            <div className="h-12 w-32 bg-gradient-to-l from-red-50 to-transparent rounded-full blur-xl"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
