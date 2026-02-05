'use client';

import { useState } from 'react';
import { Post, ContentStatus, PostBlock, Tag, Category } from '@/types';
import BlockEditor from './BlockEditor';
import ImageUpload from './ImageUpload';
import { Settings, Globe, Layout, ChevronRight, Trash2, Eye } from 'lucide-react';

interface ArticleFormProps {
  initialData?: Partial<Post>;
  onSave: (data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  userRole: 'admin' | 'editor' | 'author';
  categories?: Category[];
}

export default function ArticleForm({ initialData = {}, onSave, onDelete, userRole, categories = [] }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    slug: initialData.slug || '',
    excerpt: initialData.excerpt || '',
    category_id: initialData.category_id || '', 
    meta_title: initialData.meta_title || '',
    meta_description: initialData.meta_description || '',
    featured_image: initialData.featured_image || null,
    is_featured: initialData.is_featured || false,
  });

  const [postBlocks, setPostBlocks] = useState<PostBlock[]>(initialData.post_blocks || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (status: ContentStatus) => {
    if ((!formData.title || !formData.slug) && status !== 'draft') {
      alert('Titre et Slug obligatoires pour publier.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData, 
        post_blocks: postBlocks, 
        status 
      };
      
      await onSave(payload);
    } catch (error) {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!initialData.id || !onDelete) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
      setIsSubmitting(true);
      await onDelete(initialData.id);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 max-w-4xl mx-auto">
      {/* 1. EDITORIAL HEADER & META */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4">
          <div className="flex items-center gap-3">
             <Layout className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-black uppercase tracking-tighter italic">Informations Éditoriales</h2>
          </div>
          
          {/* Preview Button */}
          {initialData.slug && (
            <a 
              href={`/article/${initialData.slug}`} 
              target="_blank" 
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-primary transition-colors"
            >
              <Eye className="w-4 h-4" /> Voir l'article
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Titre de l'article</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Saisissez un titre percutant..."
              className="w-full text-4xl font-black tracking-tight outline-none placeholder:text-gray-100 border-b-2 border-transparent focus:border-gray-100 py-2 transition-all"
            />
          </div>

          <div className="space-y-2">
             <ImageUpload 
               label="Image de Couverture (Une)"
               value={formData.featured_image ?? ''} // Ensure it's not null/undefined
               onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Slug URL</label>
                <div className="flex items-center text-xs font-mono text-gray-400 bg-gray-50 p-2 rounded-sm">
                  <span>kvkfootball.fr/</span>
                  <input 
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="bg-transparent outline-none text-black flex-1 ml-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Catégorie principale</label>
                <select 
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full p-2 bg-white border border-gray-100 rounded-sm text-xs"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-blue-100 bg-blue-50/30 rounded-sm group hover:border-blue-200 transition-all">
                <input 
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary"
                />
                <div>
                  <span className="block text-xs font-black uppercase tracking-widest text-blue-900">Mettre à la une</span>
                  <span className="text-[10px] text-blue-700/60 font-serif italic">Afficher cet article en tête de liste sur l'accueil</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUMMARY / EXCERPT */}
      <section className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Le Chapeau (Accroche)</label>
        <textarea 
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          className="w-full min-h-[140px] p-8 bg-gray-50 border-none font-serif text-2xl italic leading-relaxed text-gray-700 placeholder:text-gray-200 focus:bg-white focus:shadow-inner transition-all outline-none rounded-sm"
          placeholder="Résumé de l'article en quelques lignes..."
        />
      </section>

      {/* 3. CONTENT ENGINE (BLOCKS) */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b-2 border-gray-900 pb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Moteur de Contenu</h2>
        </div>
        <BlockEditor blocks={postBlocks} onChange={setPostBlocks} />
      </section>

      {/* 4. SEO & REFERENCING */}
      <section className="space-y-8 bg-gray-900 p-10 rounded-sm text-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Référencement & SEO</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Balise Title SEO</label>
            <input 
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-primary outline-none transition-colors"
              placeholder="Si différent du titre principal..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Meta Description</label>
            <textarea 
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-primary outline-none min-h-[100px] resize-none"
              placeholder="Description courte pour Google..."
            />
          </div>
        </div>
      </section>

      {/* 5. PUBLICATION CONTROLS (Floating Bar) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-4 p-4 bg-white/80 backdrop-blur-xl border-2 border-gray-900 rounded-full shadow-2xl z-[100] md:scale-110 scale-90">
         {/* Delete Button (Only if editing existing post) */}
        {initialData.id && onDelete && (
          <button 
            onClick={handleDeleteClick}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition-all flex items-center justify-center"
            title="Supprimer l'article"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button 
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting}
          className="px-6 py-2 bg-white text-gray-900 font-black uppercase tracking-widest text-[9px] hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          Brouillon
        </button>

        <button 
          onClick={() => handleSubmit('review')}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gray-900 text-white font-black uppercase tracking-widest text-[9px] hover:bg-black transition-all disabled:opacity-50"
        >
          Soumettre
        </button>

        {(userRole === 'admin' || userRole === 'editor') && (
          <div className="pl-4 border-l border-gray-100 ml-2">
            <button 
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting}
              className="px-8 py-2 bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-[0_4px_20px_rgba(196,18,46,0.2)] disabled:opacity-50 flex items-center gap-2"
            >
              Publier l'article <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
