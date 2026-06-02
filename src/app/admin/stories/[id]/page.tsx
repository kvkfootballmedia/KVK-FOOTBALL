'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Plus, Trash2, Check, Link as LinkIcon, Type } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminStorySlides({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const groupId = unwrappedParams.id;

  const [group, setGroup] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag & Drop
  const [dragSlideIndex, setDragSlideIndex] = useState<number | null>(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // New Slide Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newSlide, setNewSlide] = useState({
    media_type: 'image',
    media_url: '',
    title: '',
    body_text: '',
    link_url: ''
  });

  useEffect(() => {
    if (groupId) {
      fetchGroupAndStories();
    }
  }, [groupId]);

  const fetchGroupAndStories = async () => {
    try {
      setLoading(true);
      // Fetch Group
      const { data: groupData, error: groupErr } = await supabase
        .from('story_groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (groupErr) throw groupErr;
      setGroup(groupData);

      // Fetch Slides (Stories)
      const { data: storyData, error: storyErr } = await supabase
        .from('stories')
        .select('*')
        .eq('group_id', groupId)
        .order('sort_order', { ascending: true });

      if (storyErr) throw storyErr;
      setStories(storyData || []);

    } catch (err) {
      console.error(err);
      router.push('/admin/stories');
    } finally {
      setLoading(false);
    }
  };

  const createSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.media_url) {
      alert("Une image (URL) est requise au minimum.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([{ 
           group_id: groupId,
           media_type: newSlide.media_type,
           media_url: newSlide.media_url,
           title: newSlide.title || null,
           body_text: newSlide.body_text || null,
           link_url: newSlide.link_url || null,
           sort_order: stories.length + 1
        }]);

      if (error) throw error;
      
      setIsCreating(false);
      setNewSlide({
        media_type: 'image',
        media_url: '',
        title: '',
        body_text: '',
        link_url: ''
      });
      fetchGroupAndStories();
    } catch (err) {
       console.error(err);
       alert("Erreur lors de l'ajout de la slide.");
    }
  };

  const deleteSlide = async (storyId: string) => {
    if (!confirm('Supprimer cette slide ?')) return;
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);
      if (error) throw error;
      fetchGroupAndStories();
    } catch(err) {
      console.error(err);
    }
  };

  const handleDropOrder = async (newSlides: any[]) => {
    try {
      setIsSavingOrder(true);
      
      const updates = newSlides.map((s, index) => ({
        id: s.id,
        group_id: s.group_id,
        media_type: s.media_type,
        media_url: s.media_url,
        title: s.title,
        body_text: s.body_text,
        link_url: s.link_url,
        sort_order: index + 1
      }));
      
      const { error } = await supabase
        .from('stories')
        .upsert(updates);
        
      if (error) throw error;
      
    } catch (err) {
      console.error("Erreur d'ordre :", err);
      alert("Erreur de sauvegarde de l'ordre conditionné");
    } finally {
      setIsSavingOrder(false);
      fetchGroupAndStories();
    }
  };

  const onDragStart = (index: number) => {
    setDragSlideIndex(index);
  };

  const onDragEnter = (index: number) => {
    setDragOverSlideIndex(index);
  };

  const onDrop = () => {
    if (dragSlideIndex === null || dragOverSlideIndex === null) return;
    
    const newSlides = [...stories];
    const draggedItem = newSlides.splice(dragSlideIndex, 1)[0];
    newSlides.splice(dragOverSlideIndex, 0, draggedItem);
    
    setStories(newSlides);
    setDragSlideIndex(null);
    setDragOverSlideIndex(null);
    
    // Save to DB
    handleDropOrder(newSlides);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Chargement...</div>;
  if (!group) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/stories" className="p-2 text-gray-400 hover:text-primary transition-colors bg-white hover:bg-white/50 rounded-xl shadow-sm border border-gray-100/50">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
           {group.cover_image_url && (
              <Image src={group.cover_image_url} alt="" width={40} height={40} className="rounded-full object-cover shadow-md" />
           )}
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
                {group.title} <span className="text-primary opacity-50">#Édition</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">Gérez les slides de cette bulle</p>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
         <h2 className="font-bold text-gray-900 uppercase text-xs tracking-widest">{stories.length} Slides publiées</h2>
         <button 
           onClick={() => setIsCreating(!isCreating)}
           className="bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-full hover:bg-primary transition-colors flex items-center gap-2"
         >
           <Plus className="w-4 h-4" /> Ajouter une Slide
         </button>
      </div>

      {isCreating && (
        <form onSubmit={createSlide} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 overflow-hidden relative">
           <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
           <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest ml-4">Nouvelle Slide</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-4">
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 flex items-center gap-2"><Type className="w-3 h-3"/> Type de media</label>
                    <select 
                      value={newSlide.media_type}
                      onChange={e => setNewSlide({...newSlide, media_type: e.target.value as any})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    >
                       <option value="image">Image Publique (URL)</option>
                       <option value="video" disabled>Vidéo (Bientôt dispo)</option>
                    </select>
                 </div>
                 
                 <div>
                    <ImageUpload 
                      label="Visuel de la slide"
                      value={newSlide.media_url}
                      onChange={(url) => setNewSlide({...newSlide, media_url: url})}
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 flex items-center gap-2">Titre accrocheur</label>
                    <input 
                      type="text" 
                      value={newSlide.title}
                      onChange={e => setNewSlide({...newSlide, title: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black italic focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900"
                      placeholder="Ex: INCROYABLE RETOURNEMENT..."
                    />
                 </div>
              </div>

              <div className="space-y-4 flex flex-col">
                 <div className="flex-1 text-area-grow">
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Résumé (Optionnel)</label>
                    <textarea 
                      value={newSlide.body_text}
                      onChange={e => setNewSlide({...newSlide, body_text: e.target.value})}
                      className="w-full h-full min-h-[100px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                      placeholder="Quelques lignes de description..."
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 flex items-center gap-2"><LinkIcon className="w-3 h-3"/> Lien / Swipe-up</label>
                    <input 
                      type="url" 
                      value={newSlide.link_url}
                      onChange={e => setNewSlide({...newSlide, link_url: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="https://kvkfootball.com/article/1"
                    />
                    <p className="text-[9px] text-gray-400 mt-1 pl-1">Le bouton "En savoir plus" s'affichera si un lien est présent.</p>
                 </div>
              </div>
           </div>
           
           <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100 ml-4">
               <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-gray-900 transition-colors">Annuler</button>
               <button type="submit" className="bg-primary text-white font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-xl hover:bg-black transition-colors flex items-center gap-2">
                 Enregistrer Slide <Check className="w-4 h-4" />
               </button>
           </div>
        </form>
      )}

      {/* Liste des Slides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((s, idx) => (
           <div 
             key={s.id}
             draggable
             onDragStart={() => onDragStart(idx)}
             onDragEnter={() => onDragEnter(idx)}
             onDragEnd={() => { setDragSlideIndex(null); setDragOverSlideIndex(null); }}
             onDragOver={(e) => e.preventDefault()}
             onDrop={onDrop} 
             className={`bg-gray-900 rounded-[2rem] overflow-hidden shadow-xl aspect-[9/16] relative flex flex-col group border cursor-grab active:cursor-grabbing transition-transform ${dragSlideIndex === idx ? 'opacity-50 border-primary ring-2 ring-primary scale-95' : 'border-gray-800'}`}
             style={{ transformOrigin: 'center' }}
           >
              
              {/* Actions Overlays */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => deleteSlide(s.id)}
                   className="w-10 h-10 bg-red-500/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              {/* Order Label */}
              <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                 {idx + 1}
              </div>

              {/* Image Preview */}
              <div className="absolute inset-0 z-0 bg-gray-950 overflow-hidden">
                 {s.media_url && s.media_type === 'image' && (
                   <>
                     <Image src={s.media_url} alt="" fill className="object-cover opacity-30 blur-xl scale-110" />
                     <Image src={s.media_url} alt="" fill className="object-contain relative z-10" />
                   </>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-black/40 z-20 pointer-events-none" />
              </div>

              {/* Content Preview Overlay (Bottom) */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-10">
                 {s.title && (
                   <h3 className="text-white text-xl font-black italic leading-tight mb-2 uppercase drop-shadow-md line-clamp-2">{s.title}</h3>
                 )}
                 {s.body_text && (
                   <p className="text-gray-300 text-xs font-medium leading-relaxed drop-shadow-sm line-clamp-3 mb-4">{s.body_text}</p>
                 )}
                 {s.link_url && (
                   <div className="mt-4 pt-4 border-t border-white/20">
                      <span className="inline-flex items-center gap-2 text-white bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                         En savoir plus <LinkIcon className="w-3 h-3" />
                      </span>
                   </div>
                 )}
              </div>
           </div>
        ))}

        {stories.length === 0 && !isCreating && (
          <div className="col-span-full py-20 text-center text-gray-400 border border-gray-100 bg-white rounded-[2rem] shadow-sm">
             <Plus className="w-12 h-12 mx-auto mb-4 text-gray-200" />
             <p className="font-bold text-gray-900">Bulle vide !</p>
             <p className="text-sm mt-1">Ajoutez des slides pour animer cette story.</p>
          </div>
        )}
      </div>

    </div>
  );
}
