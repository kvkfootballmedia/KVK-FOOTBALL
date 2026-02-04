'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: cats } = await supabase.from('categories').select('name, slug').order('name');
      const { data: leaguesData } = await supabase.from('leagues').select('name, slug, category').order('display_order');
      
      if (cats) setCategories(cats);
      if (leaguesData) setLeagues(leaguesData);
    };
    fetchData();
  }, []);

  return (
    <nav className="border-b border-gray-100 py-6 sticky top-0 bg-white/90 backdrop-blur-xl z-[100]">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-3xl font-black tracking-tighter text-primary group">
          KVK<span className="text-gray-900 group-hover:text-primary transition-colors">FOOTBALL</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-10 font-bold uppercase text-[11px] tracking-[0.2em] items-center text-gray-400">
          {/* Rubriques Dropdown */}
          <div 
            className="relative group py-2 cursor-pointer"
            onMouseEnter={() => setActiveMenu('rubriques')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className={`flex items-center gap-1 transition-colors ${activeMenu === 'rubriques' ? 'text-primary' : 'hover:text-gray-900'}`}>
              Rubriques <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'rubriques' ? 'rotate-180' : ''}`} />
            </div>
            
            {activeMenu === 'rubriques' && (
              <div className="absolute top-full left-0 w-64 bg-white border border-gray-100 shadow-2xl p-4 grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2">
                {categories.map(cat => (
                  <Link 
                    key={cat.slug} 
                    href={`/category/${cat.slug}`}
                    className="hover:text-primary transition-colors border-b border-gray-50 pb-2"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Championnats Dropdown */}
          <div 
            className="relative group py-2 cursor-pointer"
            onMouseEnter={() => setActiveMenu('leagues')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className={`flex items-center gap-1 transition-colors ${activeMenu === 'leagues' ? 'text-primary' : 'hover:text-gray-900'}`}>
              Championnats <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'leagues' ? 'rotate-180' : ''}`} />
            </div>
            
            {activeMenu === 'leagues' && (
              <div className="absolute top-full left-0 w-80 bg-white border border-gray-100 shadow-2xl p-6 grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-4">
                    {['National', 'Europe', 'International'].map(cat => {
                      const categoryLeagues = leagues.filter(l => l.category === cat);
                      if (categoryLeagues.length === 0) return null;
                      
                      return (
                        <div key={cat}>
                          <p className="text-[9px] font-black text-gray-300 mb-2 border-b border-gray-50 pb-1">{cat}</p>
                          <div className="flex flex-col gap-2">
                            {categoryLeagues.map(league => (
                              <Link 
                                key={league.slug} 
                                href={`/championship/${league.slug}`}
                                className="text-gray-900 hover:text-primary transition-colors text-xs"
                              >
                                {league.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-100 mx-2"></div>
          
          <button className="p-2 hover:text-primary transition-colors">
            <Search className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[88px] h-[calc(100vh-88px)] bg-white z-[200] overflow-y-auto p-8 animate-in slide-in-from-right">
          <div className="space-y-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Rubriques</p>
              <div className="flex flex-col gap-6">
                {categories.map(cat => (
                  <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setIsOpen(false)} className="text-3xl font-black uppercase tracking-tighter italic hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Championnats</p>
              <div className="grid grid-cols-2 gap-8">
                {leagues.map(league => (
                  <Link key={league.slug} href={`/championship/${league.slug}`} onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-tight hover:text-primary transition-colors">
                    {league.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-12 border-t border-gray-100 text-[10px] text-gray-400 font-serif italic">
            KVK Football — L'excellence éditoriale au service du jeu.
          </div>
        </div>
      )}
    </nav>
  );
}
