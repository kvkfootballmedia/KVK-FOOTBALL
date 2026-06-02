import NewsFeed from "@/components/editorial/NewsFeed";
import PromoBanner from "@/components/layout/PromoBanner";
import FlagStrip from "@/components/layout/FlagStrip";
import RubriqueStrip from "@/components/editorial/RubriqueStrip";
import StoryBubbles from "@/components/editorial/StoryBubbles";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-gray-50">
      <PromoBanner />

      {/* Bandeau drapeaux Coupe du Monde */}
      <FlagStrip />

      <StoryBubbles />

      <NewsFeed />

      <RubriqueStrip categorySlug="enquetes" title="ENQUÊTES & DOSSIERS" />

      {/* Section manifeste premium */}
      <div className="relative bg-[#060912] border-y border-[#1E293B] py-20 mt-8 overflow-hidden">

        {/* Coupe en arrière-plan — décoration */}
        <div className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none">
          <Image src="/cdm coupe.png" alt="" width={320} height={320} className="object-contain" />
        </div>

        {/* Shimmer top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] shimmer-border" />

        <div className="container mx-auto px-3 md:px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">

            <div className="flex items-center justify-center gap-3 md:gap-4">
              <div className="w-8 md:w-12 h-px bg-[#E11D48]" />
              <div className="flex items-center gap-1.5 md:gap-2">
                <Image src="/cdm coupe.png" alt="CDM" width={14} height={14} className="object-contain opacity-80 animate-trophy-glow md:w-[18px] md:h-[18px]" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-[#475569]">KVK Football</span>
                <Image src="/cdm coupe.png" alt="CDM" width={14} height={14} className="object-contain opacity-80 animate-trophy-glow md:w-[18px] md:h-[18px]" />
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
