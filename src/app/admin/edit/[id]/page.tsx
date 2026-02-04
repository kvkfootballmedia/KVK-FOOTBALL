'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ArticleForm from '@/components/admin/ArticleForm';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabaseClient';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'author'>('author');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const initPage = async () => {
      // 1. Auth & Role Verification
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Session expirée. Veuillez vous reconnecter.');
        router.push('/admin/login');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profile) setUserRole(profile.role);

      // 2. Fetch Categories
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
        
      if (cats) setCategories(cats);

      // 3. Fetch Post content
      fetchPost();
    };

    initPage();
  }, [id]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          status,
          category_id,
          featured_image,
          is_featured,
          meta_title,
          meta_description,
          post_blocks ( id, block_type, content, position )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any): Promise<void> => {
    try {
      await api.posts.save({ ...data, id });
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Error saving article:', err);
      // alert('Erreur lors de la sauvegarde.'); // handled by form
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await api.posts.delete(postId);
      alert('Article supprimé.');
      router.push('/admin');
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Article introuvable</h1>
        <Link href="/admin" className="mt-8 inline-block text-primary font-black uppercase tracking-widest text-xs border-b-2 border-primary">
          Retour au Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12 flex items-center justify-between border-b-2 border-gray-900 pb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-400 hover:text-black transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </Link>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Édition de l'article</span>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Modifier le contenu</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full ${
            post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
            {post.status}
            </span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-8 md:p-16 shadow-2xl rounded-sm">
        <ArticleForm initialData={post} onSave={handleSave} onDelete={handleDelete} userRole={userRole} categories={categories} />
      </div>
    </div>
  );
}
