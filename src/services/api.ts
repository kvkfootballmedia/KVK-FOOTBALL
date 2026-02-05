import { Post } from '../types';
import { supabase } from '@/lib/supabaseClient'; // 👈 client Supabase comme SOKO

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** --- AUTH UTILS --- */

/**
 * Utilitaire : récupère le JWT utilisateur si connecté
 */
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  console.log('SESSION', data.session);
  return data.session?.access_token ?? null;
}


/**
 * Appel Edge Function (réservé aux edges admin/sensibles)
 */
async function callEdgeFunction<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('ENV_NOT_CONFIGURED');
  }

  const url = `${SUPABASE_URL}/functions/v1/${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Edge Function Error (${response.status}):`, text);
    throw new Error(`EDGE_ERROR_${response.status}: ${text}`);
  }

  return response.json();
}

export const api = {
  /**
   * ✅ PUBLIC : lecture via Supabase client direct (RLS)
   */
  posts: {
    getAll: async (params?: { category?: string; categoryId?: string; tag?: string; limit?: number }) => {
      try {
        const limit = params?.limit ?? 20;

        let query = supabase
          .from('posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image,
            published_at,
            is_featured,
            categories:category_id!inner ( name, slug ),
            author:profiles!posts_author_id_fkey ( full_name, role )
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(limit);

        // ✅ FILTER BY CATEGORY ID
        if (params?.categoryId) {
          query = query.eq('category_id', params.categoryId);
        }
        // ✅ FILTER BY CATEGORY SLUG (Using !inner join above)
        else if (params?.category && params.category !== 'all') {
           query = query.eq('categories.slug', params.category);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data ?? []) as any as Post[];
      } catch (err) {
        console.error('Error fetching posts:', err);
        return [] as Post[];
      }
    },

    getBySlug: async (slug: string) => {
      // ✅ lecture directe
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          published_at,
          categories:category_id ( name, slug ),
          author:profiles!posts_author_id_fkey ( full_name, role ),
          post_blocks ( id, type, content, caption, sort_order )
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('POST_NOT_FOUND');

      return data as any as Post;
    },
    


    /**
     * 🔐 ADMIN : écriture via Edge (vérification role dans la fonction)
     * -> plus besoin de passer token manuellement
     */
    save: async (post: Partial<Post>) => {
      const token = await getAccessToken();
      if (!token) throw new Error('NOT_AUTHENTICATED');

      return callEdgeFunction<Post>('admin-save-post', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      });
    },

    publish: async (postId: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error('NOT_AUTHENTICATED');

      return callEdgeFunction<any>('publish-post', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: postId }),
      });
    },

    delete: async (postId: string) => {
       const token = await getAccessToken();
       if (!token) throw new Error('NOT_AUTHENTICATED');
       
       const { error } = await supabase.from('posts').delete().eq('id', postId);
       if (error) throw error;
       return true;
    },
  },

  /**
   * ✅ CATEGORIES
   */
  categories: {
    getBySlug: async (slug: string) => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();
      
      if (error) return { data: null, error };
      return { data, error: null };
    }
  },

  /**
   * ✅ AUTH : Supabase natif
   */
  auth: {
    login: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },

    /**
     * 🔐 ADMIN : gestion users via edge (service role derrière)
     */
    manageUsers: async (action: 'create' | 'list' | 'update', data: any) => {
      const token = await getAccessToken();
      if (!token) throw new Error('NOT_AUTHENTICATED');

      return callEdgeFunction<any>('admin-manage-users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, data }),
      });
    },
  },
  /**
   * 📁 STORAGE : Gestion des fichiers
   */
  storage: {
    upload: async (file: File): Promise<string> => {
      const token = await getAccessToken();
      if (!token) throw new Error('NOT_AUTHENTICATED');

      // 1. Générer un nom unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 2. Upload
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    }
  }
};
