'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { LayoutDashboard, Users, FileText, LogOut, Shield } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip protection for login page
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/admin/login');
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
          router.push('/admin/login');
          return;
        }

        setUser(profile);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Unexpected auth error:", err);
        router.push('/admin/login');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/admin/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If on login page, just render children
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-gray-900 text-white flex flex-col p-8 border-r border-gray-900">
        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2">Terminal</span>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">KVK Rédaction</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin" 
            className={`flex items-center gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/admin' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link 
            href="/admin/new" 
            className={`flex items-center gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/admin/new' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <FileText className="w-4 h-4" /> Nouvel Article
          </Link>
          
          {user?.role === 'admin' && (
            <Link 
              href="/admin/users" 
              className={`flex items-center gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${pathname === '/admin/users' ? 'bg-primary text-white shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Users className="w-4 h-4" /> Identités Staff
            </Link>
          )}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-4 mb-8">
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
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Administrative Content */}
      <main className="flex-1 bg-gray-50/30 overflow-y-auto">
        <div className="p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
