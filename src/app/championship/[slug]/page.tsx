import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trophy, Calendar, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { footballApi } from '@/services/football';

export default async function ChampionshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Get League Info from DB
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!league) {
    return <div className="py-24 text-center italic font-serif">Championnat non trouvé.</div>;
  }

  // 2. Fetch Data from Football API (SSR)
  let standings = null;
  let matches = null;

  // Try fetching Standings
  try {
    const res = await footballApi.getStandings(league.api_id.toString());
    // Path: result[0].seasons[last].groups[0].table
    const latestSeason = res.result?.[0]?.seasons?.slice(-1)[0];
    standings = latestSeason?.groups?.[0]?.table;
  } catch (err) {
    console.error(`Standings not found for ${league.name}:`, err);
  }

  // Try fetching Matches
  try {
    const res = await footballApi.getMatches(league.api_id.toString());
    matches = res.result;
  } catch (err) {
    console.error(`Matches not found for ${league.name}:`, err);
  }

  const hasData = standings || matches;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {!hasData && (
        <div className="bg-primary text-white text-center py-2 text-[10px] font-black uppercase tracking-widest sticky top-[88px] z-50">
          Certaines données sont actuellement indisponibles pour ce championnat.
        </div>
      )}
      {/* Header Section */}
      <header className="bg-white border-b border-gray-100 py-16 mb-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-8 hover:gap-4 transition-all">
            <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="bg-black text-white text-[9px] px-3 py-1 font-black uppercase tracking-[0.2em] rounded-full mb-4 inline-block">
                {league.category}
              </span>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
                {league.name}
              </h1>
            </div>
            <div className="flex gap-4">
               <div className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-center min-w-[120px]">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Status</p>
                  <p className="text-sm font-black text-green-600 flex items-center justify-center gap-2">
                    <Zap className="w-3 h-3 fill-current" /> LIVE
                  </p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Standings */}
            <div className="lg:col-span-2">
               <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden border border-gray-100 h-fit">
                  <div className="px-8 py-8 border-b border-gray-50 flex items-center justify-between bg-white">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                           <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Classement Officiel</h2>
                     </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                              <th className="px-8 py-6 font-black w-16">Pos</th>
                              <th className="px-4 py-6 font-black">Équipe</th>
                              <th className="px-4 py-6 font-black text-center">J</th>
                              <th className="px-4 py-6 font-black text-center">G</th>
                              <th className="px-4 py-6 font-black text-center">N</th>
                              <th className="px-4 py-6 font-black text-center">P</th>
                              <th className="px-8 py-6 font-black text-right">Pts</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                           {standings && standings.length > 0 ? standings.map((item: any, idx: number) => (
                              <tr key={idx} className="group hover:bg-gray-50/80 transition-all duration-300">
                                 <td className="px-8 py-5">
                                    <span className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black tracking-tighter ${
                                       item.position <= 3 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                       {item.position}
                                    </span>
                                 </td>
                                 <td className="px-4 py-5">
                                    <span className="font-bold text-[13px] uppercase tracking-tight text-gray-800 group-hover:text-primary transition-colors">
                                       {item.team?.name}
                                    </span>
                                 </td>
                                 <td className="px-4 py-5 text-center font-bold text-sm text-gray-600">
                                    {(item.win || 0) + (item.draw || 0) + (item.loss || 0)}
                                 </td>
                                 <td className="px-4 py-5 text-center text-[13px] font-medium text-gray-500">{item.win || 0}</td>
                                 <td className="px-4 py-5 text-center text-[13px] font-medium text-gray-400">{item.draw || 0}</td>
                                 <td className="px-4 py-5 text-center text-[13px] font-medium text-gray-400">{item.loss || 0}</td>
                                 <td className="px-8 py-5 text-right font-black text-lg text-gray-900">{item.points || 0}</td>
                              </tr>
                           )) : (
                              <tr>
                                 <td colSpan={7} className="px-8 py-20 text-center text-gray-400 italic">
                                    Le classement sera disponible prochainement...
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-1">
               <div className="bg-[#0f172a] rounded-[2.5rem] shadow-2xl p-8 border border-white/5 h-fit sticky top-24">
                  <div className="flex items-center gap-3 mb-10">
                     <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                     </div>
                     <h2 className="text-xl font-black uppercase tracking-tight text-white">Derniers Résultats</h2>
                  </div>

                  <div className="space-y-4">
                     {matches && matches.length > 0 ? matches.slice(0, 8).map((match: any, idx: number) => (
                        <div key={idx} className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 hover:border-primary/40 transition-all duration-300 group">
                           <div className="flex items-center gap-4">
                              {/* Team A */}
                              <div className="flex-1 text-right">
                                 <p className="text-[10px] font-black uppercase tracking-tight text-gray-400 group-hover:text-white transition-colors line-clamp-2">
                                    {match.teamA?.name}
                                 </p>
                              </div>

                              {/* Score & Status */}
                              <div className="flex flex-col items-center min-w-[80px]">
                                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                                    {match.status === 'ENDED' ? 'Terminé' : match.status}
                                 </span>
                                 <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                                    <span className="text-sm font-black text-white">{match.teamA?.score?.f ?? 0}</span>
                                    <span className="w-1 h-[2px] bg-white/20"></span>
                                    <span className="text-sm font-black text-white">{match.teamB?.score?.f ?? 0}</span>
                                 </div>
                              </div>

                              {/* Team B */}
                              <div className="flex-1 text-left">
                                 <p className="text-[10px] font-black uppercase tracking-tight text-gray-400 group-hover:text-white transition-colors line-clamp-2">
                                    {match.teamB?.name}
                                 </p>
                              </div>
                           </div>
                        </div>
                     )) : (
                        <div className="py-12 text-center">
                           <p className="text-gray-500 text-sm italic">Aucun résultat récent disponible</p>
                        </div>
                     )}
                  </div>

                  <Link 
                     href="#" 
                     className="mt-10 w-full py-4 bg-white text-gray-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all duration-300 text-center block shadow-lg shadow-black/20"
                  >
                     Voir tout le calendrier
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}
