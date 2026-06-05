'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { STORAGE_BUCKETS } from '@/lib/storageConfig';
import { Copy, Trash2, Image as ImageIcon, Loader2, RefreshCw, Check } from 'lucide-react';

const BUCKETS = [
  { key: 'ARTICLES_MEDIA', name: 'Articles', bucket: STORAGE_BUCKETS.ARTICLES_MEDIA },
  { key: 'USER_MEDIA',     name: 'Utilisateurs', bucket: STORAGE_BUCKETS.USER_MEDIA },
  { key: 'STATIC_ASSETS',  name: 'Statiques', bucket: STORAGE_BUCKETS.STATIC_ASSETS },
];

interface FileItem {
  name: string;
  path: string;
  bucket: string;
  size?: number;
  updated_at?: string;
  url: string;
}

export default function AdminMedia() {
  const [activeBucket, setActiveBucket] = useState(BUCKETS[0].bucket);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const fetchFiles = useCallback(async (bucket: string) => {
    setLoading(true);
    setFiles([]);
    try {
      // Liste récursive des fichiers
      const fetchFolder = async (prefix = ''): Promise<FileItem[]> => {
        const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 200 });
        if (error || !data) return [];

        const items: FileItem[] = [];
        for (const item of data) {
          const path = prefix ? `${prefix}/${item.name}` : item.name;
          if (!item.metadata) {
            // Dossier — récursion
            const sub = await fetchFolder(path);
            items.push(...sub);
          } else {
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
            items.push({
              name: item.name,
              path,
              bucket,
              size: item.metadata?.size,
              updated_at: item.updated_at,
              url: publicUrl,
            });
          }
        }
        return items;
      };

      const result = await fetchFolder();
      setFiles(result);
    } catch (err) {
      console.error('[media]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(activeBucket); }, [activeBucket, fetchFiles]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const deleteFile = async (file: FileItem) => {
    if (!confirm(`Supprimer "${file.name}" ?`)) return;
    setDeletingPath(file.path);
    await supabase.storage.from(file.bucket).remove([file.path]);
    setFiles(f => f.filter(x => x.path !== file.path));
    setDeletingPath(null);
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);
  const formatSize = (bytes?: number) => !bytes ? '' : bytes < 1024 ? `${bytes}o` : bytes < 1048576 ? `${(bytes/1024).toFixed(0)}Ko` : `${(bytes/1048576).toFixed(1)}Mo`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b-4 border-gray-900 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Mediatheque</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">{files.length} fichier{files.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => fetchFiles(activeBucket)} className="p-2 text-gray-400 hover:text-primary transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Bucket tabs */}
      <div className="flex gap-2">
        {BUCKETS.map(b => (
          <button
            key={b.key}
            onClick={() => setActiveBucket(b.bucket)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${
              activeBucket === b.bucket ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Grid fichiers */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest">Chargement...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-gray-100 text-gray-400">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-xs font-black uppercase tracking-widest">Aucun fichier</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map(file => (
            <div key={file.path} className="group relative bg-white border border-gray-100 rounded-sm overflow-hidden hover:border-primary transition-colors shadow-sm">
              {/* Preview */}
              <div className="aspect-square bg-gray-50 overflow-hidden">
                {isImage(file.name) ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-[9px] font-bold text-gray-600 truncate">{file.name}</p>
                {file.size && <p className="text-[8px] text-gray-400">{formatSize(file.size)}</p>}
              </div>

              {/* Actions */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyUrl(file.url)}
                  className="p-1.5 bg-gray-900/80 text-white rounded hover:bg-primary transition-colors"
                  title="Copier l'URL"
                >
                  {copiedUrl === file.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => deleteFile(file)}
                  disabled={deletingPath === file.path}
                  className="p-1.5 bg-gray-900/80 text-white rounded hover:bg-red-600 transition-colors"
                  title="Supprimer"
                >
                  {deletingPath === file.path ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
