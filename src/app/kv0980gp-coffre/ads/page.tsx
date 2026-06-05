'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Save, Loader2, DollarSign, Info } from 'lucide-react';

const AD_POSITIONS = [
  { key: 'SLOT_ARTICLE_TOP',    label: 'Article — Haut',          desc: 'Leaderboard sous le header de l\'article' },
  { key: 'SLOT_ARTICLE_MID',    label: 'Article — Milieu',        desc: 'Rectangle 300x250 apres le 3e bloc' },
  { key: 'SLOT_ARTICLE_BOTTOM', label: 'Article — Bas',           desc: 'Leaderboard avant les commentaires' },
  { key: 'SLOT_HOME_MID',       label: 'Accueil — Entre sections', desc: 'Leaderboard entre A La Une et Dernieres Infos' },
];

interface AdsConfig {
  pub_id: string;
  slots: Record<string, string>;
  enabled: boolean;
}

const DEFAULT: AdsConfig = {
  pub_id: '',
  slots: Object.fromEntries(AD_POSITIONS.map(p => [p.key, ''])),
  enabled: false,
};

export default function AdminAds() {
  const [config, setConfig] = useState<AdsConfig>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'ads_config').single()
      .then(({ data }) => {
        if (data?.value) setConfig({ ...DEFAULT, ...(data.value as AdsConfig) });
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from('site_settings').upsert({ key: 'ads_config', value: config }, { onConflict: 'key' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setSlot = (key: string, val: string) =>
    setConfig(c => ({ ...c, slots: { ...c.slots, [key]: val } }));

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 max-w-2xl">
      <div className="border-b-4 border-gray-900 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-primary" /> Ad Inserter
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Configuration des emplacements publicitaires AdSense</p>
      </div>

      {/* Activation */}
      <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-sm">
        <input type="checkbox" id="enabled" checked={config.enabled} onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))} className="w-5 h-5 accent-primary" />
        <label htmlFor="enabled" className="text-xs font-black uppercase tracking-widest cursor-pointer">
          Activer la publicite AdSense sur le site
        </label>
      </div>

      {/* Publisher ID */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Publisher ID AdSense</label>
        <input
          value={config.pub_id}
          onChange={e => setConfig(c => ({ ...c, pub_id: e.target.value }))}
          placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm font-mono text-sm focus:outline-none focus:border-primary transition-colors"
        />
        <p className="text-[9px] text-gray-400 flex items-center gap-1">
          <Info className="w-3 h-3" /> Disponible dans votre compte Google AdSense
        </p>
      </div>

      {/* Slots */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-3">Identifiants des blocs</h2>
        {AD_POSITIONS.map(pos => (
          <div key={pos.key} className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-700">{pos.label}</label>
            <p className="text-[9px] text-gray-400">{pos.desc}</p>
            <input
              value={config.slots[pos.key] || ''}
              onChange={e => setSlot(pos.key, e.target.value)}
              placeholder="Ex: 1234567890"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-mono text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? 'Enregistre !' : 'Enregistrer'}
      </button>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm text-[10px] text-amber-700 font-bold uppercase tracking-widest">
        Note : Apres modification, redeploy necessaire pour que les nouveaux IDs soient actifs.
        Verifiez aussi que <code className="font-mono bg-amber-100 px-1">NEXT_PUBLIC_ADSENSE_PUB_ID</code> est defini dans Vercel.
      </div>
    </div>
  );
}
