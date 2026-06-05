'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Edit, ChevronRight, Eye, EyeOff } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminStories() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pour créer un nouveu groupe
  // Drag & Drop
  const [dragGroupIndex, setDragGroupIndex] = useState<number | null>(null);
  const [dragOverGroupIndex, setDragOverGroupIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Pour créer un nouveu groupe
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('story_groups')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du chargement des groupes de stories.');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('story_groups')
        .insert([{ 
           title: newTitle, 
           cover_image_url: newCoverUrl,
           sort_order: groups.length + 1
        }])
        .select();

      if (error) throw error;
      
      setNewTitle('');
      setNewCoverUrl('');
      setIsCreating(false);
      fetchGroups();
    } catch (err) {
       console.error(err);
       alert("Erreur lors de la création.");
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('story_groups')
        .update({ is_active: !current })
        .eq('id', id);
      if (error) throw error;
      fetchGroups();
    } catch(err) {
      console.error(err);
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm('Sûr de vouloir supprimer cette bulle ainsi que toutes les slides à l\'intérieur ?')) return;
    try {
      const { error } = await supabase
        .from('story_groups')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchGroups();
    } catch(err) {
      console.error(err);
    }
  };

  const handleDropOrder = async (newGroups: any[]) => {
    try {
      setIsSavingOrder(true);
      
      const updates = newGroups.map((g, index) => ({
        id: g.id,
        title: g.title,
        cover_image_url: g.cover_image_url,
        is_active: g.is_active,
        sort_order: index + 1
      }));
      
      const { error } = await supabase
        .from('story_groups')
        .upsert(updates);
        
      if (error) throw error;
      
    } catch (err) {
      console.error("Erreur d'ordre :", err);
      alert("Erreur de sauvegarde de l'ordre");
    } finally {
      setIsSavingOrder(false);
      fetchGroups();
    }
  };

  const onDragStart = (index: number) => {
    setDragGroupIndex(index);
  };

  const onDragEnter = (index: number) => {
    setDragOverGroupIndex(index);
  };

  const onDrop = () => {
    if (dragGroupIndex === null || dragOverGroupIndex === null) return;
    
    const newGroups = [...groups];
    const draggedItem = newGroups.splice(dragGroupIndex, 1)[0];
    newGroups.splice(dragOverGroupIndex, 0, draggedItem);
    
    setGroups(newGroups);
    setDragGroupIndex(null);
    setDragOverGroupIndex(null);
    
    // Save to DB
    handleDropOrder(newGroups);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
              Gestion <span className="text-primary">Stories</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">Créez et organisez vos bulles d'actu rapides</p>
         </div>
         <button 
           onClick={() => setIsCreating(!isCreating)}
           className="bg-primary text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-full hover:bg-black transition-colors flex items-center gap-2"
         >
           <Plus className="w-4 h-4" /> Nouvelle Bulle
         </button>
      </div>

      {isCreating && (
        <form onSubmit={createGroup} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-8 max-w-xl">
           <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Créer une Bulle</h3>
           <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Titre (court)</label>
                 <input 
                   required
                   type="text" 
                   value={newTitle}
                   onChange={e => setNewTitle(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                   placeholder="ex: Le Mercato"
                 />
              </div>
              <div>
                 <ImageUpload 
                   label="URL Cover Image (Bulle)"
                   value={newCoverUrl}
                   onChange={(url) => setNewCoverUrl(url)}
                 />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                 <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900">Annuler</button>
                 <button type="submit" className="bg-black text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-primary transition-colors">Créer</button>
              </div>
           </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => (
           <div 
             key={group.id} 
             draggable
             onDragStart={() => onDragStart(index)}
             onDragEnter={() => onDragEnter(index)}
             onDragEnd={() => { setDragGroupIndex(null); setDragOverGroupIndex(null); }}
             onDragOver={(e) => e.preventDefault()}
             onDrop={onDrop}
             className={`bg-white p-6 rounded-[2rem] shadow-md border flex flex-col items-center text-center relative hover:shadow-xl transition-all group cursor-grab active:cursor-grabbing ${dragGroupIndex === index ? 'opacity-50 ring-2 ring-primary border-primary' : 'border-gray-50'}`}
           >
              
              <div className="absolute top-4 left-4">
                 <button 
                   onClick={() => toggleActive(group.id, group.is_active)}
                   className={`p-2 rounded-full ${group.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                   title={group.is_active ? 'Bulle visible' : 'Bulle masquée'}
                 >
                    {group.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                 </button>
              </div>
              <div className="absolute top-4 right-4">
                 <button 
                   onClick={() => deleteGroup(group.id)}
                   className="p-2 rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              {/* Instagram style gradient border */}
              <div className={`w-24 h-24 rounded-full p-[3px] mb-4 ${group.is_active ? 'bg-gradient-to-tr from-primary via-red-500 to-yellow-500' : 'bg-gray-200'} transition-all`}>
                 <div className="w-full h-full rounded-full border-4 border-white overflow-hidden relative">
                    {group.cover_image_url && (
                      <Image src={group.cover_image_url} alt="" fill className={`object-cover ${!group.is_active && 'grayscale opacity-50'}`} />
                    )}
                 </div>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-1">{group.title}</h3>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">Ordre: {group.sort_order}</p>

              <Link 
                href={`/kv0980gp-coffre/stories/${group.id}`}
                className="w-full py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 flex items-center justify-center gap-2 transition-colors border border-gray-100"
              >
                 Éditer les slides <ChevronRight className="w-4 h-4" />
              </Link>
           </div>
        ))}

        {groups.length === 0 && !isCreating && (
          <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
             <Image src="/logo.png" alt="" width={60} height={60} className="mx-auto grayscale opacity-20 mb-4" />
             <p className="font-bold">Aucune story en ligne.</p>
             <p className="text-sm">Créez votre première bulle pour que l'actu apparaisse !</p>
          </div>
        )}
      </div>
    </div>
  );
}
