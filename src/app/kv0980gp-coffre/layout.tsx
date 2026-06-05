'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { LayoutDashboard, Users, FileText, LogOut, Shield, BarChart, Smartphone, Image, DollarSign, Search } from 'lucide-react';
import { NotificationProvider } from '@/context/NotificationContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip protection for login page
    if (pathname === '/kv0980gp-coffre/login') {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/kv0980gp-coffre/login');
          return;
        }

        // Get profile to check role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !profile || !['admin', 'editor', 'author'].includes(profile.role)) {
          console.error("Auth check failed:", error);
          await supabase.auth.signOut();
          router.push('/kv0980gp-coffre/login');
          return;
        }

        setUser(profile);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Unexpected auth error:", err);
        router.push('/kv0980gp-coffre/login');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/kv0980gp-coffre/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/kv0980gp-coffre/login');
  };

  if (!isAuthenticated && pathname !== '/kv0980gp-coffre/login') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If on login page, just render children
  if (pathname === '/kv0980gp-coffre/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-gray-900 text-white flex flex-col p-6 md:p-8 border-r border-gray-900 shrink-0">
        <div className="mb-8 md:mb-12">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-1 md:mb-2">Terminal</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">KVK Rédaction</h2>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
          <Link 
            href="/kv0980gp-coffre" 
            className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pathname === '/kv0980gp-coffre' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4" /> Dashboard
          </Link>
          <Link 
            href="/kv0980gp-coffre/new" 
            className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pathname === '/kv0980gp-coffre/new' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <FileText className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4" /> Nouveau
          </Link>
          <Link 
            href="/kv0980gp-coffre/stats" 
            className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pathname === '/kv0980gp-coffre/stats' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4" /> Statistiques
          </Link>
          <Link 
            href="/kv0980gp-coffre/stories" 
            className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pathname?.startsWith('/kv0980gp-coffre/stories') ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Smartphone className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4" /> Stories
          </Link>
          
          <Link
            href="/kv0980gp-coffre/media"
            className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pathname === '/kv0980gp-coffre/media' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Image className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4" /> Mediatheque
          </Link>

          {user?.role === 'admin' && (
            <>
              <Link
                href="/kv0980gp-coffre/ads"
                className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pathname === '/kv0980gp-coffre/ads' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <DollarSign className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4" /> Publicites
              </Link>
              <Link
                href="/kv0980gp-coffre/seo"
                className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pathname === '/kv0980gp-coffre/seo' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Search className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4" /> SEO
              </Link>
              <Link
                href="/kv0980gp-coffre/users"
                className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pathname === '/kv0980gp-coffre/users' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Users className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4" /> Staff
              </Link>
            </>
          )}
        </nav>

        <div className="hidden md:block mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-10 h-10 bg-primary flex items-center justify-center font-black text-xs uppercase italic">
                {user?.full_name?.charAt(0)}
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest">{user?.full_name}</p>
                <p className="text-[8px] text-gray-500 uppercase tracking-widest flex items-center gap-1 italic">
                  {user?.role === 'admin' && <Shield className="w-2 h-2 text-primary" />}
                  {user?.role}
                </p>
             </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-3 mb-2 w-full text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 border border-emerald-500/20 rounded transition-all"
          >
            Voir le site
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
        
        {/* Mobile logout and profile (compact) */}
        <div className="md:hidden flex items-center justify-between pt-4 border-t border-white/10 gap-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary flex items-center justify-center font-black text-[9px] uppercase italic">
                 {user?.full_name?.charAt(0)}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[80px]">{user?.full_name?.split(' ')[0]}</span>
           </div>
           <div className="flex items-center gap-3">
             <Link
               href="/"
               className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-all border border-emerald-500/30 px-2 py-1 rounded"
             >
               Voir le site
             </Link>
             <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
                <LogOut className="w-4 h-4" />
             </button>
           </div>
        </div>
      </aside>

      {/* Main Administrative Content */}
      <NotificationProvider>
        <main className="flex-1 bg-gray-50/30 overflow-y-auto">
          <div className="p-6 md:p-12">
            {children}
          </div>
        </main>
      </NotificationProvider>
    </div>
  );
}
