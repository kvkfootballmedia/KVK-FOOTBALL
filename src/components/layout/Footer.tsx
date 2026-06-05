import Link from 'next/link';
import { Twitter, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  const competitions = [
    { name: 'Ligue des Champions', slug: 'ligue-champions' },
    { name: 'Premier League', slug: 'premier-league' },
    { name: 'Ligue 1', slug: 'ligue-1' },
    { name: 'La Liga', slug: 'la-liga' },
    { name: 'Serie A', slug: 'serie-a' },
    { name: 'Copa Libertadores', slug: 'copa-libertadores' },
  ];

  const sections = [
    { name: 'Actualités', slug: 'actualites' },
    { name: 'Analyses Tactiques', slug: 'analyses-tactiques' },
    { name: 'Grands Formats', slug: 'grands-formats' },
    { name: 'Mercato & Business', slug: 'mercato-business' },
  ];

  return (
    <footer className="bg-[#0A0F1D] text-[#94A3B8] border-t border-[#1E293B] py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-[#1E293B]">
          
          {/* Logo & Description */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="text-2xl font-black tracking-tighter flex items-center">
              <span className="text-red-500 bg-red-950/40 px-3 py-1 rounded-lg border border-red-900/50 mr-1.5">KVK</span>
              <span className="text-white font-bold">FOOTBALL</span>
            </Link>
            
            <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed max-w-sm font-sans">
              "L'exploration au cœur du jeu international. Analyse tactique, enquêtes de terrain et passion éditoriale au service de l'excellence sportive."
            </p>
            
            {/* Social handles */}
            <div className="flex gap-3 pt-2">
              <a href="https://x.com/kvkfootball?s=21" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:bg-red-950/40 hover:text-red-500 hover:border-red-900/50 transition-all duration-200 shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="https://www.facebook.com/kvkfootball?mibextid=wwXIfr&rdid=Hslh8jKodP98eG2p&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CgQJDr1Pk%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:bg-red-950/40 hover:text-red-500 hover:border-red-900/50 transition-all duration-200 shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="https://www.youtube.com/@kvk100football" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:bg-red-950/40 hover:text-red-500 hover:border-red-900/50 transition-all duration-200 shadow-sm">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Rubriques */}
          <div className="md:col-span-3 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E7958]">Rubriques</h4>
            </div>
            <ul className="space-y-3.5 text-xs font-semibold text-[#94A3B8]">
              {sections.map(section => (
                <li key={section.slug}>
                  <Link href={`/category/${section.slug}`} className="hover:text-red-500 transition-colors duration-200">
                    {section.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compétitions */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E7958]">Compétitions</h4>
            </div>
            <ul className="space-y-3.5 text-xs font-semibold text-[#94A3B8]">
              {competitions.slice(0, 4).map(comp => (
                <li key={comp.slug}>
                  <Link href={`/championship/${comp.slug}`} className="hover:text-red-500 transition-colors duration-200">
                    {comp.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E7958]">Informations</h4>
            </div>
            <ul className="space-y-3.5 text-xs font-semibold text-[#94A3B8]">
              <li><Link href="/about" className="hover:text-red-500 transition-colors">Mentions légales</Link></li>
              <li><Link href="/privacy" className="hover:text-red-500 transition-colors">Confidentialité</Link></li>
              <li><a href="mailto:kvkfootballmedia@gmail.com" className="hover:text-red-500 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Custom Jérémie Akwe Signature Section inspired by Pantheres Inside using floral-royal.png */}
        <div className="mt-10 flex justify-center">
          <div
            className="relative w-64 h-20 rounded-2xl overflow-hidden border border-[#1E293B] shadow-lg flex flex-col items-center justify-center text-center p-4 bg-cover bg-center"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(10, 15, 29, 0.92), rgba(10, 15, 29, 0.96)), url("/floral-royal.png")'
            }}
          >
            <p className="text-[7px] font-bold text-[#D97706] uppercase tracking-[0.3em] mb-0.5">Architecture Digitale Par</p>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Jérémie <span className="text-red-500 bg-red-950/60 border border-red-900/50 px-1.5 py-0.5 rounded-lg shadow-sm font-black">Akwe.</span>
            </h3>
            <p className="text-[7px] font-semibold text-[#64748B] uppercase tracking-widest mt-1">
              © 2026 KVK Football | Tous Droits Réservés
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
