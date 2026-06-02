'use client';

import Image from 'next/image';

const FLAGS = [
  { src: '/France.png',      label: 'France' },
  { src: '/Bresil.png',      label: 'Brésil' },
  { src: '/argentina.png',   label: 'Argentine' },
  { src: '/Angleterre.png',  label: 'Angleterre' },
  { src: '/spain.png',       label: 'Espagne' },
  { src: '/Allemagne.png',   label: 'Allemagne' },
  { src: '/Maroc.png',       label: 'Maroc' },
  { src: '/usa.png',         label: 'USA' },
  { src: '/senegal.png',     label: 'Sénégal' },
  { src: '/nigeria.png',     label: 'Nigeria' },
  { src: '/civ.png',         label: "Côte d'Ivoire" },
  { src: '/congo.png',       label: 'Congo' },
];

// Tripler pour un loop parfaitement fluide
const TRACK = [...FLAGS, ...FLAGS, ...FLAGS];

export default function FlagStrip() {
  return (
    <div className="relative w-full bg-[#060912] border-y border-[#1E293B]/60 overflow-hidden py-2 md:py-3">

      {/* Titre flottant à gauche */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-2 md:pl-4 pr-4 md:pr-8
                      bg-gradient-to-r from-[#060912] via-[#060912]/90 to-transparent pointer-events-none">
        <div className="flex flex-col items-start">
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#E11D48]">CDM</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-[#475569] mt-0.5">2026</span>
        </div>
        <div className="w-px h-4 bg-[#1E293B] mx-2 md:mx-3" />
      </div>

      {/* Piste des drapeaux */}
      <div className="flags-fade-mask overflow-hidden">
        <div className="flex gap-3 md:gap-5 animate-flags-marquee w-max">
          {TRACK.map((flag, i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0 group" title={flag.label}>
              <div className="relative w-7 h-7 md:w-10 md:h-10 rounded-full overflow-hidden ring-1 ring-white/10
                              group-hover:ring-[#E11D48]/60 transition-all duration-300 shadow-md
                              group-hover:scale-110 transform">
                <Image src={flag.src} alt={flag.label} fill className="object-cover" sizes="40px" />
              </div>
              <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-wider text-[#475569]
                               group-hover:text-[#94A3B8] transition-colors whitespace-nowrap hidden md:block">
                {flag.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
