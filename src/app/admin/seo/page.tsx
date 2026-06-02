'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Save, Loader2, Search, Globe } from 'lucide-react';

interface SeoConfig {
  site_title: string;
  site_description: string;
  og_image: string;
  ga_id: string;
  twitter_handle: string;
}

const DEFAULT: SeoConfig = {
  site_title: 'KVK Football',
  site_description: "L'analyse au service du jeu international. Tactique, mercato, grands formats.",
  og_image: '',
  ga_id: '',
  twitter_handle: '@kvkfootball',
};

export default function AdminSeo() {
  const [config, setConfig] = useState<SeoConfig>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'seo_config').single()
      .then(({ data }) => {
        if (data?.value) setConfig({ ...DEFAULT, ...(data.value as SeoConfig) });
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from('site_settings').upsert({ key: 'seo_config', value: config }, { onConflict: 'key' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (k: keyof SeoConfig) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setConfig(c => ({ ...c, [k]: e.target.value }));

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 max-w-2xl">
      <div className="border-b-4 border-gray-900 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
          <Search className="w-7 h-7 text-primary" /> SEO Global
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Metadonnees par defaut du site</p>
      </div>

      <div className="space-y-6">
        {/* Titre */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nom du site</label>
          <input value={config.site_title} onChange={set('site_title')} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors font-bold" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Meta Description (par defaut)</label>
          <textarea value={config.site_description} onChange={set('site_description')} rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
          <p className="text-[9px] text-gray-400">{config.site_description.length} / 160 caracteres recommandes</p>
        </div>

        {/* OG Image */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image Open Graph par defaut</label>
          <input value={config.og_image} onChange={set('og_image')} placeholder="https://..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm font-mono focus:outline-none focus:border-primary transition-colors" />
          {config.og_image && (
            <img src={config.og_image} alt="OG preview" className="mt-2 h-24 w-auto object-cover rounded border border-gray-100" />
          )}
          <p className="text-[9px] text-gray-400">Taille recommandee : 1200 x 630px</p>
        </div>

        {/* Twitter handle */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Globe className="w-3 h-3" /> Twitter / X Handle
          </label>
          <input value={config.twitter_handle} onChange={set('twitter_handle')} placeholder="@kvkfootball" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors" />
        </div>

        {/* Google Analytics */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Google Analytics ID</label>
          <input value={config.ga_id} onChange={set('ga_id')} placeholder="G-XXXXXXXXXX" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm font-mono focus:outline-none focus:border-primary transition-colors" />
          <p className="text-[9px] text-gray-400">Format GA4 : G-XXXXXXXXXX</p>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? 'Enregistre !' : 'Enregistrer'}
      </button>
    </div>
  );
}
