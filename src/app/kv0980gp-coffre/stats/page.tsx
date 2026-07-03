'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ChevronLeft, Zap, Target, TrendingUp, FileText, MessageSquare, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type PeriodKey = '1m' | '2m' | '3m' | 'all';

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: '1m', label: '1 mois' },
  { key: '2m', label: '2 mois' },
  { key: '3m', label: '3 mois' },
  { key: 'all', label: 'Tout' },
];

const INITIAL_ARTICLES_SHOWN = 5;

function getPeriodStartDate(period: PeriodKey): Date | null {
  if (period === 'all') return null;
  const now = new Date();
  const months = period === '1m' ? 1 : period === '2m' ? 2 : 3;
  return new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
}

export default function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_views: 0,
    posts_count: 0,
    comments_count: 0,
    stories_count: 0,
  });
  const [allPostViews, setAllPostViews] = useState<any[]>([]);
  const [allPostDetails, setAllPostDetails] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<PeriodKey>('1m');
  const [articlesExpanded, setArticlesExpanded] = useState(false);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

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

      const countsMap: Record<string, number> = {};
      viewsData?.forEach(v => {
        if (v.post_id) countsMap[v.post_id] = (countsMap[v.post_id] || 0) + 1;
      });

      const allPostIds = Object.entries(countsMap).sort((a,b) => b[1]-a[1]);
      
      let postsDetailed: any[] = [];
      if (allPostIds.length > 0) {
        const { data: details } = await supabase
          .from('posts').select('id, title, featured_image')
          .in('id', allPostIds.map(t => t[0]));
          
        postsDetailed = allPostIds.map(([id, count]) => ({
          ...details?.find(p => p.id === id),
          view_count: count,
        })).filter(p => p.title);
      }

      setStats({
        total_views:    totalViews   || 0,
        posts_count:    postsCount   || 0,
        comments_count: commentsCount || 0,
        stories_count:  storiesCount  || 0,
      });
      setAllPostViews(viewsData || []);
      setAllPostDetails(postsDetailed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const startDate = getPeriodStartDate(chartPeriod);
    const now = new Date();

    const filteredViews = allPostViews.filter(v => {
      if (!v.viewed_at) return false;
      if (!startDate) return true;
      return new Date(v.viewed_at) >= startDate;
    });

    const dailyMap: Record<string, number> = {};
    filteredViews.forEach(v => {
      const d = new Date(v.viewed_at);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayOfMonth = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayOfMonth}`;
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
    });

    const dates: { label: string; day_date: string; views: number }[] = [];
    const effectiveStart = startDate || (() => {
      let earliest = now;
      filteredViews.forEach(v => {
        const d = new Date(v.viewed_at);
        if (d < earliest) earliest = d;
      });
      return earliest;
    })();

    const current = new Date(effectiveStart);
    current.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const dayOfMonth = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayOfMonth}`;

      dates.push({
        label: `${dayOfMonth}/${month}`,
        day_date: dateStr,
        views: dailyMap[dateStr] || 0
      });
      current.setDate(current.getDate() + 1);
    }

    if (dates.length > 45) {
      const weeks: { label: string; day_date: string; views: number }[] = [];
      for (let i = 0; i < dates.length; i += 7) {
        const chunk = dates.slice(i, i + 7);
        const totalViews = chunk.reduce((sum, d) => sum + d.views, 0);
        const startLabel = chunk[0].label;
        const endLabel = chunk[chunk.length - 1].label;
        weeks.push({
          label: chunk.length > 1 ? `${startLabel}` : startLabel,
          day_date: `${startLabel}-${endLabel}`,
          views: totalViews
        });
      }
      return weeks;
    }

    return dates;
  }, [allPostViews, chartPeriod]);

  const periodViewsCount = useMemo(() => {
    const startDate = getPeriodStartDate(chartPeriod);
    return allPostViews.filter(v => {
      if (!v.viewed_at) return false;
      if (!startDate) return true;
      return new Date(v.viewed_at) >= startDate;
    }).length;
  }, [allPostViews, chartPeriod]);

  const visibleArticles = articlesExpanded
    ? allPostDetails
    : allPostDetails.slice(0, INITIAL_ARTICLES_SHOWN);

  const hasMoreArticles = allPostDetails.length > INITIAL_ARTICLES_SHOWN;

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8 md:mb-12">
        <Link href="/kv0980gp-coffre" className="p-2 md:p-3 text-gray-400 hover:text-primary transition-colors bg-white rounded-xl shadow-sm border border-gray-100">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
            Statistiques <span className="text-primary">&amp; Vues</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mt-2 md:mt-3">
            Mesurez l'impact de vos articles
          </p>
        </div>
      </div>

      {/* Google Analytics — Looker Studio */}
      <div className="mb-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Google Analytics</span>
        </div>
        <div className="w-full" style={{ height: 450 }}>
          <iframe
            src="https://datastudio.google.com/embed/reporting/719ed50d-d0a5-49e7-ab71-59a34bcc9c38/page/EC10F"
            className="w-full h-full border-0"
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Graphique */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2 uppercase italic tracking-tight">
                <TrendingUp size={20} className="text-primary shrink-0" /> Évolution
              </h3>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
                {PERIOD_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setChartPeriod(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
                      chartPeriod === opt.key
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl md:text-4xl font-black text-gray-900 italic tracking-tighter">
                {periodViewsCount.toLocaleString('fr-FR')}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                vues sur la période
              </span>
            </div>

            <div className="h-48 md:h-64 flex items-end gap-[2px] md:gap-1 pt-4 md:pt-10 px-0 md:px-2 overflow-x-auto">
               {chartData.length === 0 ? (
                 <div className="w-full flex items-center justify-center text-sm font-bold text-gray-400 py-8">
                   Aucune donnée sur cette période.
                 </div>
               ) : (
                 chartData.map((m, i, arr) => {
                   const maxViews = Math.max(...arr.map(d => Number(d.views)), 1);
                   const viewHeight = (Number(m.views) / maxViews) * 85 + 5; 
                   
                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end min-w-[6px]">
                         <div className="w-full max-w-[40px] bg-primary/10 rounded-t-xl relative flex items-end justify-center group-hover:bg-primary/20 transition-all cursor-pointer" style={{ height: `${viewHeight}%` }}>
                            <div className="w-full bg-primary/60 rounded-t-xl absolute inset-x-0 bottom-0" style={{ height: '100%' }} />
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap shadow-xl scale-90 group-hover:scale-100 font-sans pointer-events-none">
                               <span className="text-primary">{m.views} vues</span>
                               <br />
                               <span className="text-gray-400 text-[8px]">{m.label}</span>
                            </div>
                         </div>
                     </div>
                   );
                 })
               )}
            </div>
            
            {chartData.length > 0 && (
              <div className="flex justify-between mt-4 text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest px-0 md:px-2 border-t border-gray-50 pt-4 overflow-hidden">
                 {chartData.length <= 14
                   ? chartData.map((m, i) => (
                       <span key={i} className="flex-1 text-center truncate">{m.label}</span>
                     ))
                   : (() => {
                       const step = Math.max(1, Math.floor(chartData.length / 7));
                       const indices: number[] = [];
                       for (let i = 0; i < chartData.length; i += step) {
                         indices.push(i);
                       }
                       if (indices[indices.length - 1] !== chartData.length - 1) {
                         indices.push(chartData.length - 1);
                       }
                       return indices.map((idx) => (
                         <span key={idx} className="text-center" style={{ flex: 1 }}>{chartData[idx].label}</span>
                       ));
                     })()
                 }
              </div>
            )}
          </div>

          {/* Top articles */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
             <div className="flex items-center justify-between mb-6 md:mb-8">
               <h3 className="text-lg md:text-xl font-black text-gray-900 uppercase italic tracking-tight flex items-center gap-2">
                   <Target size={20} className="text-primary shrink-0" /> Top Articles
               </h3>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                 {allPostDetails.length} article{allPostDetails.length > 1 ? 's' : ''}
               </span>
             </div>
            <div className="space-y-4">
              {allPostDetails.length === 0 ? (
                <p className="text-sm font-bold text-gray-400 text-center py-8">Aucune donnee disponible.</p>
              ) : (
                <>
                  {visibleArticles.map((l, index) => (
                    <div key={l.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-50 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-primary/20 transition-all group">
                      <div className="w-7 md:w-8 shrink-0 text-center font-black text-gray-300 italic text-base md:text-xl group-hover:text-primary transition-colors">
                        #{index+1}
                      </div>
                      {l.featured_image && (
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-200 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                          <Image src={l.featured_image} alt="" fill className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm md:text-base leading-tight line-clamp-2" title={l.title}>
                          {l.title}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">{l.view_count} vues</p>
                      </div>
                      <div className="shrink-0">
                         <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                             <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                         </div>
                      </div>
                    </div>
                  ))}

                  {hasMoreArticles && (
                    <button
                      onClick={() => setArticlesExpanded(!articlesExpanded)}
                      className="w-full mt-4 py-3 px-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/40 text-gray-500 hover:text-gray-900 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 group hover:bg-primary/5"
                    >
                      {articlesExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                          Voir moins
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                          Voir plus ({allPostDetails.length - INITIAL_ARTICLES_SHOWN} articles restants)
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
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
