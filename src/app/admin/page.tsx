'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabaseClient';
import { Post, Profile } from '@/types';
import { Plus, Edit2, Shield, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (profile) {
          setUser(profile);
        }
      }
    };

    initDashboard();
  }, []);

  // Fetch posts when user is set or status filter changes
  useEffect(() => {
    if (user) {
      fetchAdminPosts(user);
    }
  }, [user, statusFilter]);

  const fetchAdminPosts = async (currentUser: Profile) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('id, title, slug, status, is_featured, created_at, author:profiles!posts_author_id_fkey(full_name, role)')
        .order('created_at', { ascending: false });
      
      // Role-based filtering
      if (currentUser.role === 'author') {
        // Authors only see their own posts
        query = query.eq('author_id', currentUser.id);
      }
      // Admins and editors see ALL posts (no filter)

      // Status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-gray-900 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">Tableau de bord</span>
            {user?.role === 'admin' && <span className="bg-black text-[7px] md:text-[8px] text-white px-2 py-0.5 font-black uppercase tracking-widest rounded-full">Super Admin</span>}
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">Espace Rédaction</h1>
        </div>
        <Link 
          href="/admin/new" 
          className="w-full md:w-auto bg-primary text-white px-6 md:px-10 py-4 md:py-5 font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-black transition-all shadow-[0_10px_30px_rgba(196,18,46,0.3)] flex items-center justify-center gap-3"
        >
          <Plus className="w-4 h-4" /> Nouvel Article
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="p-6 md:p-8 bg-white border border-gray-100 shadow-sm rounded-sm">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">En Brouillon</p>
          <p className="text-3xl md:text-4xl font-black italic">{posts.filter(p => p.status === 'draft').length}</p>
        </div>
        <div className="p-6 md:p-8 bg-white border border-gray-100 shadow-sm rounded-sm">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">En Révision</p>
          <p className="text-3xl md:text-4xl font-black italic">{posts.filter(p => p.status === 'review').length}</p>
        </div>
        <div className="p-6 md:p-8 bg-white border border-gray-100 shadow-sm rounded-sm">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Statut Session</p>
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" /> {user?.role} — Connecté
          </p>
        </div>
      </div>

      {/* Status Filter Buttons */}
      {(user?.role === 'admin' || user?.role === 'editor') && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 font-black uppercase text-[10px] md:text-xs transition-all ${
              statusFilter === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 font-black uppercase text-[10px] md:text-xs transition-all ${
              statusFilter === 'draft' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Brouillons
          </button>
          <button
            onClick={() => setStatusFilter('review')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 font-black uppercase text-[10px] md:text-xs transition-all ${
              statusFilter === 'review' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Révision ⚠️
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 font-black uppercase text-[10px] md:text-xs transition-all ${
              statusFilter === 'published' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Publiés
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-100 shadow-2xl rounded-sm overflow-hidden">
        <div className="p-8 bg-gray-50 border-b border-gray-100">
           <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Flux de Production</h2>
        </div>
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead>
              <tr className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-4 md:px-8 py-4 md:py-6">Article</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-center">Statut</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-right">Auteur</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={4} className="py-24 text-center text-gray-300 font-serif italic">Chargement du flux...</td></tr>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 md:px-8 py-4 md:py-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                        <p className="font-black text-sm md:text-lg tracking-tight uppercase group-hover:text-primary transition-colors line-clamp-1">{post.title}</p>
                        {post.is_featured && (
                          <span className="w-fit bg-primary text-white text-[7px] px-2 py-0.5 font-black uppercase tracking-widest rounded-sm">À La Une</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6 text-center">
                      <span className={`px-3 md:px-4 py-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' :
                        post.status === 'review' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 block md:inline max-w-[80px] md:max-w-none truncate">{post.author?.full_name || 'Anonyme'}</span>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                      <div className="flex justify-end gap-1 md:gap-3 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/article/${post.slug}`} className="p-2 text-gray-400 hover:text-gray-900 border border-gray-50 md:border-transparent hover:border-gray-100 transition-all rounded-full"><Eye className="w-3.5 h-3.5 md:w-4 md:h-4" /></Link>
                        <Link href={`/admin/edit/${post.id}`} className="p-2 text-gray-400 hover:text-primary border border-gray-50 md:border-transparent hover:border-primary/20 transition-all rounded-full"><Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-24 text-center text-gray-300 font-serif italic">Aucun article dans ce flux.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
