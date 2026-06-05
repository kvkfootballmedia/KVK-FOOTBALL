'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import { ChevronLeft } from 'lucide-react';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabaseClient';
import { useNotification } from '@/context/NotificationContext';

export default function NewArticlePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'author'>('author');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const initPage = async () => {
      // 1. Auth check
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionToken(session.access_token);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setUserRole(profile.role);
        }
      }

      // 2. Fetch Categories
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
        
      if (cats) setCategories(cats);
    };
    initPage();
  }, []);

  const handleSave = async (data: any): Promise<void> => {
    if (!sessionToken) {
      showNotification('Session expirée. Veuillez vous reconnecter.', 'error');
      return;
    }
    
    console.log('Sending article to production edge:', data);
    try {
      const savedPost = await api.posts.save(data);
      // ✅ SUCCESS: Redirect to edit page to avoid "Duplicate Slug" on re-save
      if (savedPost && savedPost.id) {
         showNotification('Article enregistré !', 'success');
         router.push(`/kv0980gp-coffre/edit/${savedPost.id}`);
      }
    } catch (error) {
      console.error(error);
      showNotification("Erreur: Ce titre/slug existe probablement déjà.", 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12 flex items-center justify-between border-b-2 border-gray-900 pb-8">
        <div className="flex items-center gap-4">
          <Link href="/kv0980gp-coffre" className="text-gray-400 hover:text-black transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </Link>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Rédaction KVK</span>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Nouvelle Écriture</h1>
          </div>
        </div>
        <div className="text-right hidden md:block">
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Statut: Préparation</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-8 md:p-16 shadow-2xl rounded-sm">
        <ArticleForm onSave={handleSave} userRole={userRole} categories={categories} />
      </div>
    </div>
  );
}
