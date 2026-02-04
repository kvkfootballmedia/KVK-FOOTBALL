import NewsFeed from "@/components/editorial/NewsFeed";
import PromoBanner from "@/components/layout/PromoBanner";
import RubriqueStrip from "@/components/editorial/RubriqueStrip";

export default function Home() {
  return (
    <main>
      <PromoBanner />
      <div className="container mx-auto px-4 py-8">
        <NewsFeed />
      </div>
      
      {/* 🕵️ Feature Section: Enquêtes */}
      <RubriqueStrip categorySlug="enquetes" />

      <div className="container mx-auto px-4 py-16 text-center">
         <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.5em] text-gray-400">KVK FOOTBALL</h2>
            <p className="text-3xl font-serif italic text-gray-800 leading-relaxed">
              "L'analyse au service du jeu, la passion au service de l'excellence."
            </p>
         </div>
      </div>
    </main>
  );
}
