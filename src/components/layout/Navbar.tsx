'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Menu, X, User, Search } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  // Do not render the navbar in the admin panel
  if (pathname?.startsWith('/kv0980gp-coffre')) {
    return null;
  }

  const competitions = [
    { name: 'Ligue des Champions', slug: 'ligue-champions' },
    { name: 'Premier League', slug: 'premier-league' },
    { name: 'Ligue 1', slug: 'ligue-1' },
    { name: 'La Liga', slug: 'la-liga' },
    { name: 'Serie A', slug: 'serie-a' },
    { name: 'Bundesliga', slug: 'bundesliga' },
    { name: 'Copa Libertadores', slug: 'copa-libertadores' },
  ];

  const mainNav = [
    { name: 'Accueil', href: '/' },
    { name: 'Actualités', href: '/category/actualites' },
    { name: 'Analyses Tactiques', href: '/category/analyses-tactiques' },
    { name: 'Grands Formats', href: '/category/grands-formats' },
  ];

  const extraNav = [
    { name: 'Mercato & Business', href: '/category/mercato-business' },
    { name: 'Sélections Nationales', href: '/category/selections-nationales' },
    { name: 'Enquêtes & Dossiers', href: '/category/enquetes' },
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Premium vibrant sports accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-red-600 via-red-500 to-red-700"></div>
      
      <nav className="bg-[#0A0F1D]/95 backdrop-blur-md shadow-sm border-b border-[#1E293B] transition-all duration-300">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="shrink-0 text-xl lg:text-2xl font-black tracking-tighter flex items-center gap-1.5 mr-8 lg:mr-12">
              <span className="text-red-500 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-900/50 transition-all hover:bg-red-500 hover:text-white">KVK</span>
              <div className="animate-trophy-glow relative">
                <Image
                  src="/cdm coupe.png"
                  alt="Coupe du Monde"
                  width={24}
                  height={24}
                  className="object-contain drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                />
              </div>
              <span className="text-white font-bold">FOOTBALL</span>
            </Link>

            <div className="hidden lg:flex flex-1 items-center gap-5 xl:gap-7">
              {mainNav.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold text-[#94A3B8] hover:text-red-500 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}

              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('competitions')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 text-sm font-semibold text-[#94A3B8] hover:text-red-500 transition-colors duration-200 cursor-pointer">
                  Compétitions <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === 'competitions' ? 'rotate-180 text-red-500' : ''}`} />
                </button>

                {openDropdown === 'competitions' && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#0F172A]/98 backdrop-blur-md shadow-2xl rounded-xl p-3 border border-[#1E293B] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1 px-2 mb-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#1E293B]">Compétitions majeures</div>
                    <div className="flex flex-col gap-0.5">
                      {competitions.map(comp => (
                        <Link
                          key={comp.slug}
                          href={`/championship/${comp.slug}`}
                          className="px-3 py-2 text-xs font-semibold text-[#94A3B8] hover:bg-red-950/40 hover:text-red-500 rounded-lg transition-all duration-150"
                        >
                          {comp.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('more')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 text-sm font-semibold text-[#94A3B8] hover:text-red-500 transition-colors duration-200 cursor-pointer">
                  Plus <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === 'more' ? 'rotate-180 text-red-500' : ''}`} />
                </button>

                {openDropdown === 'more' && (
                  <div className="absolute left-0 mt-2 w-56 bg-[#0F172A]/98 backdrop-blur-md shadow-2xl rounded-xl p-3 border border-[#1E293B] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1 px-2 mb-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#1E293B]">Autres Rubriques</div>
                    <div className="flex flex-col gap-0.5">
                      {extraNav.map(item => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="px-3 py-2 text-xs font-semibold text-[#94A3B8] hover:bg-red-950/40 hover:text-red-500 rounded-lg transition-all duration-150"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <form onSubmit={handleSearch}>
                <div className={`relative flex items-center transition-all duration-300 rounded-full border ${searchFocused ? 'w-64 border-red-500 ring-2 ring-red-950/40 bg-[#0A0F1D]' : 'w-48 border-[#334155] bg-[#1E293B]/40'}`}>
                  <button type="submit" className="pl-3.5 text-gray-500 hover:text-red-500 transition-colors">
                    <Search size={16} className={`${searchFocused ? 'text-red-500' : ''}`} />
                  </button>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full pl-2 pr-4 py-2 bg-transparent border-0 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                  />
                </div>
              </form>
              
              <Link
                href="/login"
                aria-label="Connexion"
                className="p-2.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-950/40 rounded-full border border-transparent hover:border-red-900/50 transition-all duration-200"
              >
                <User size={18} />
              </Link>
            </div>

            <button
              className="lg:hidden p-2 text-[#94A3B8] hover:bg-[#1E293B] rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden flex flex-col gap-1 pb-6 pt-2 border-t border-[#1E293B] animate-in slide-in-from-top duration-300">
              {mainNav.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2.5 text-sm font-semibold text-[#94A3B8] hover:bg-red-950/40 hover:text-red-500 rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="mt-2 pt-2 border-t border-[#1E293B]">
                <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Autres Rubriques</p>
                {extraNav.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-sm font-semibold text-[#94A3B8] hover:bg-red-950/40 hover:text-red-500 rounded-lg transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-3 px-4 py-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Compétitions</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {competitions.map(comp => (
                    <Link
                      key={comp.slug}
                      href={`/championship/${comp.slug}`}
                      className="text-xs font-semibold text-[#94A3B8] hover:text-red-500 py-1"
                    >
                      {comp.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1E293B] px-4">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1E293B] border border-[#334155] text-sm font-semibold text-[#94A3B8] hover:bg-red-950/40 hover:text-red-500 hover:border-red-900/50 rounded-xl transition-all"
                >
                  <User size={16} />
                  <span>Espace Connexion</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
