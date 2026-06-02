'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, MessageSquare, Send, Loader2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    role: string;
  };
}

export default function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchComments();
  }, [postId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (full_name, avatar_url, role)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data as any);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          user_id: currentUser.id,
          content: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment('');
      fetchComments(); // Reload comments
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Erreur lors de la publication du commentaire.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-16 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-8">
         <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
            <MessageSquare className="w-5 h-5 text-gray-400" />
         </div>
         <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
              Avis & <span className="text-primary">Débats</span>
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
              {comments.length} commentaire{comments.length !== 1 ? 's' : ''}
            </p>
         </div>
      </div>

      {/* Formulaire d'ajout */}
      <div className="mb-12 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
        {currentUser ? (
          <form onSubmit={submitComment}>
             <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 ml-2">Votre avis</label>
             <div className="relative">
                <textarea
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Qu'avez-vous pensé de cet article ?"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] resize-none transition-shadow hover:shadow-sm pr-14"
                />
                <button 
                  type="submit" 
                  disabled={submitting || !newComment.trim()}
                  className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
             </div>
          </form>
        ) : (
          <div className="text-center py-6">
             <h4 className="text-lg font-black text-gray-900 mb-2">Rejoignez la discussion !</h4>
             <p className="text-sm text-gray-500 mb-6">Vous devez être connecté pour donner votre avis.</p>
             <button onClick={() => window.location.href='/login'} className="bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-full hover:bg-primary transition-colors">
               Se Connecter / S'inscrire
             </button>
          </div>
        )}
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-6">
        {loading ? (
           <div className="text-center py-8 text-gray-400 flex flex-col items-center">
             <Loader2 className="w-8 h-8 animate-spin mb-4" />
             <p className="text-xs font-bold uppercase tracking-widest">Chargement des avis...</p>
           </div>
        ) : comments.length === 0 ? (
           <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50">
             <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
             <p className="text-sm font-bold text-gray-500">Aucun avis pour le moment.</p>
             <p className="text-xs text-gray-400 mt-1">Soyez le premier à réagir !</p>
           </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
               {/* Avatar */}
               <div className="flex-shrink-0">
                 {comment.profiles?.avatar_url ? (
                   <img src={comment.profiles.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm bg-gray-50 border border-gray-100" />
                 ) : (
                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase shadow-sm border border-primary/20">
                     {comment.profiles?.full_name?.charAt(0) || <User className="w-5 h-5" />}
                   </div>
                 )}
               </div>
               
               {/* Contenu */}
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-gray-900 text-sm truncate">{comment.profiles?.full_name || 'Utilisateur Anonyme'}</span>
                    
                    {/* Badge Role Optionnel */}
                    {['admin', 'editor', 'author'].includes(comment.profiles?.role) && (
                       <span className="px-2 py-0.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Staff</span>
                    )}

                    <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                      il y a {formatDistanceToNow(new Date(comment.created_at), { addSuffix: false, locale: fr })}
                    </span>
                 </div>
                 <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words mt-3">
                   {comment.content}
                 </p>
               </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
