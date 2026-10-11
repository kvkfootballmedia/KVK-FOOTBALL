export const revalidate = 120; // ISR: revalider toutes les 2 minutes

import NewsFeed from "@/components/editorial/NewsFeed";
import RubriqueStrip from "@/components/editorial/RubriqueStrip";
import StoryBubbles from "@/components/editorial/StoryBubbles";

export default function Home() {
  return (
    <main className="bg-gray-50">
      <StoryBubbles />

      <NewsFeed />

      <RubriqueStrip categorySlug="enquetes" title="ENQUÊTES & DOSSIERS" />

      {/* Section manifeste premium */}
      <div className="relative bg-[#060912] border-y border-[#1E293B] py-20 mt-8 overflow-hidden">

        {/* Shimmer top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] shimmer-border" />

        <div className="container mx-auto px-3 md:px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">

            <div className="flex items-center justify-center gap-3 md:gap-4">
              <div className="w-8 md:w-12 h-px bg-[#E11D48]" />
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-[#475569]">KVK Football</span>
              </div>
              <div className="w-8 md:w-12 h-px bg-[#E11D48]" />
            </div>

            <p className="text-lg md:text-5xl font-heading font-black text-white leading-tight uppercase">
              L'ANALYSE AU SERVICE DU JEU.{' '}
              <br />
              <span className="text-[#E11D48]">LA PASSION AU SERVICE DE L'EXCELLENCE.</span>
            </p>

            <p className="text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">
              Foot international · Tactique · Mercato · Grands Formats
            </p>
          </div>
        </div>

        {/* Shimmer bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] shimmer-border" />
      </div>
    </main>
  );
}
