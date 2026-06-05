'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ChevronLeft, Zap, Target, TrendingUp, FileText, MessageSquare, Smartphone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_views: 0,
    posts_count: 0,
    comments_count: 0,
    stories_count: 0,
  });
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<any[]>([]);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Tout en parallele — meme approche que Pantheres Inside
      const [
        { count: totalViews },
        { data: viewsData },
        { count: postsCount },
        { count: commentsCount },
        { count: storiesCount },
      ] = await Promise.all([
        supabase.from('post_views').select('*', { count: 'exact', head: true }),
        supabase.from('post_views').select('post_id, viewed_at'),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('post_comments').select('*', { count: 'exact', head: true }),
        supabase.from('stories').select('*', { count: 'exact', head: true }),
      ]);

      // Regroupement par post et par jour (comme PI)
      const countsMap: Record<string, number> = {};
      const dailyMap: Record<string, number> = {};

      viewsData?.forEach(v => {
        if (v.post_id) countsMap[v.post_id] = (countsMap[v.post_id] || 0) + 1;
        if (v.viewed_at) {
          const d = new Date(v.viewed_at);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
        }
      });

      setDailyMetrics(Object.entries(dailyMap).map(([day_date, views]) => ({ day_date, views })));

      // Top 5 articles
      const top5Ids = Object.entries(countsMap).sort((a,b) => b[1]-a[1]).slice(0,5);
      let topPostsDetailed: any[] = [];
      if (top5Ids.length > 0) {
        const { data: details } = await supabase
          .from('posts').select('id, title, featured_image')
          .in('id', top5Ids.map(t => t[0]));
        topPostsDetailed = top5Ids.map(([id, count]) => ({
          ...details?.find(p => p.id === id),
          view_count: count,
        }));
      }

      setStats({
        total_views:    totalViews   || 0,
        posts_count:    postsCount   || 0,
        comments_count: commentsCount || 0,
        stories_count:  storiesCount  || 0,
      });
      setTopPosts(topPostsDetailed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeekData = () => {
    const labels = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const now = new Date();
    const diff = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);

    return labels.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const m = dailyMetrics.find(dm => dm.day_date === dateStr);
      return { label, day_date: dateStr, views: m ? Number(m.views) : 0 };
    });
  };

  const weekData = getWeekData();

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8 md:mb-12">
        <Link href="/kv0980gp-coffre" className="p-2 text-gray-400 hover:text-primary transition-colors bg-white rounded-xl shadow-sm border border-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
            Statistiques <span className="text-primary">&amp; Vues</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">
            Mesurez l'impact de vos articles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Graphique semaine */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2 uppercase italic tracking-tight">
              <TrendingUp size={20} className="text-primary shrink-0" /> Evolution (7 derniers jours)
            </h3>
            <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-4 pt-10 px-4">
              {weekData.map((m, i, arr) => {
                const max = Math.max(...arr.map(d => d.views), 1);
                const h = (m.views / max) * 85 + 5;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                    <div className="w-full max-w-[40px] bg-primary/10 rounded-t-xl relative flex items-end justify-center group-hover:bg-primary/20 transition-all cursor-pointer" style={{ height: `${h}%` }}>
                      <div className="w-full bg-primary/60 rounded-t-xl absolute inset-x-0 bottom-0 h-full" />
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap shadow-xl pointer-events-none">
                        <span className="text-primary">{m.views} vues</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 border-t border-gray-50 pt-4">
              {weekData.map((m, i) => <span key={i} className="flex-1 text-center">{m.label}</span>)}
            </div>
          </div>

          {/* Top articles */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-8 uppercase italic tracking-tight flex items-center gap-2">
              <Target size={20} className="text-primary" /> Top Articles
            </h3>
            <div className="space-y-4">
              {topPosts.length === 0 ? (
                <p className="text-sm font-bold text-gray-400 text-center py-8">Aucune donnee disponible.</p>
              ) : topPosts.map((l, index) => (
                <div key={l.id} className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center font-black text-gray-300 italic text-xl group-hover:text-primary transition-colors">
                      #{index+1}
                    </div>
                    {l.featured_image && (
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                        <Image src={l.featured_image} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 pr-4">
                      <p className="font-bold text-gray-900 truncate text-sm md:text-base">{l.title}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">{l.view_count} vues</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <Zap size={120} className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity group-hover:rotate-12 duration-500 text-primary" />
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <Target size={24} className="text-primary" />
            </div>
            <h3 className="text-sm font-black mb-2 uppercase tracking-widest text-gray-400">Total Vues</h3>
            <p className="text-5xl font-black text-white italic tracking-tighter mb-12">
              {stats.total_views.toLocaleString('fr-FR')}
            </p>

            <div className="pt-8 border-t border-white/10 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Articles publiés
                </span>
                <span className="text-xl font-black text-primary">{stats.posts_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Commentaires
                </span>
                <span className="text-xl font-black text-primary">{stats.comments_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Smartphone className="w-3 h-3" /> Stories actives
                </span>
                <span className="text-xl font-black text-primary">{stats.stories_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
