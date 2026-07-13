'use client';

import { PostBlock, BlockType, VideoPlatform } from '@/types';
import { useState, useRef, useCallback } from 'react';
import {
  Type,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Quote,
  Video,
  GripVertical,
  Minus,
  Code,
  ExternalLink,
} from 'lucide-react';
import ImageUpload from './ImageUpload';

function detectPlatform(url: string): VideoPlatform | null {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com/shorts') || url.includes('youtu.be')) return 'youtube_shorts';
  return null;
}

function getEmbedUrl(url: string, platform: VideoPlatform | null): string | null {
  if (platform === 'youtube_shorts') {
    const match = url.match(/shorts\/([a-zA-Z0-9_-]+)/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
  if (platform === 'tiktok') {
    const match = url.match(/\/video\/(\d+)/);
    return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
  }
  return null;
}

interface BlockEditorProps {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: any }[] = [
  { type: 'paragraph', label: 'Paragraphe', icon: Type },
  { type: 'heading', label: 'Titre', icon: Type },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'quote', label: 'Citation', icon: Quote },
  { type: 'list', label: 'Liste', icon: Minus },
  { type: 'embed', label: 'Embed', icon: Video },
  { type: 'html', label: 'HTML', icon: Code },
  { type: 'short_video', label: 'Vidéo Courte', icon: Video },
];

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [insertMenuIndex, setInsertMenuIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const addBlock = (block_type: BlockType, atIndex?: number) => {
    const defaultContent: Record<string, any> =
      block_type === 'list'        ? { items: [''] } :
      block_type === 'short_video' ? { url: '', platform: '', caption: '' } :
                                     { text: '' };
    const newBlock: PostBlock = {
      block_type,
      content: defaultContent,
      position: 0,
    };

    const newBlocks = [...blocks];
    const insertAt = atIndex !== undefined ? atIndex : newBlocks.length;
    newBlocks.splice(insertAt, 0, newBlock);
    onChange(newBlocks.map((b, i) => ({ ...b, position: i })));
    setInsertMenuIndex(null);
  };

  const updateBlockContent = (index: number, newContent: any) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content: { ...newBlocks[index].content, ...newContent } };
    onChange(newBlocks);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, position: i })));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks.map((b, i) => ({ ...b, position: i })));
  };

  // Drag & Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4';
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1';
    setDragIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  }, [dragIndex]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);
    onChange(newBlocks.map((b, i) => ({ ...b, position: i })));
    handleDragEnd();
  }, [dragIndex, blocks, onChange, handleDragEnd]);

  const toggleInsertMenu = (index: number) => {
    setInsertMenuIndex(insertMenuIndex === index ? null : index);
  };

  const InsertDivider = ({ atIndex }: { atIndex: number }) => (
    <div className="relative py-2 group/insert">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-[1px] bg-gray-100 group-hover/insert:bg-primary/30 transition-colors" />
        <button
          type="button"
          onClick={() => toggleInsertMenu(atIndex)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-gray-300 hover:text-white hover:bg-primary hover:scale-110 border border-gray-100 hover:border-primary ${
            insertMenuIndex === atIndex ? 'bg-primary text-white border-primary scale-110' : 'bg-white'
          }`}
          title="Insérer un bloc ici"
        >
          <Plus className="w-3 h-3" />
        </button>
        <div className="flex-1 h-[1px] bg-gray-100 group-hover/insert:bg-primary/30 transition-colors" />
      </div>
      
      {insertMenuIndex === atIndex && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full z-30 mt-1 bg-white rounded-xl shadow-2xl shadow-gray-200/80 border border-gray-100 p-2 flex flex-wrap gap-1.5 justify-center min-w-[280px] animate-in fade-in zoom-in-95 duration-150">
          {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type, atIndex)}
              className="px-3 py-2 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      {blocks.length > 0 && <InsertDivider atIndex={0} />}

      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div key={index}>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`group relative bg-white border rounded-sm shadow-sm transition-all ${
                dragOverIndex === index && dragIndex !== index
                  ? 'border-primary border-2 shadow-lg shadow-primary/10 scale-[1.01]'
                  : dragIndex === index
                    ? 'border-primary/40 opacity-50'
                    : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200/80 transition-colors touch-none">
                    <GripVertical className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[2px] text-gray-400 select-none">
                    {BLOCK_TYPES.find(b => b.type === block.block_type)?.label || block.block_type}
                  </span>
                  <span className="text-[8px] font-bold text-gray-300">#{index + 1}</span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 'up')}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-900 rounded-sm disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all"
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 'down')}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-900 rounded-sm disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all"
                    disabled={index === blocks.length - 1}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500 rounded-sm transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {block.block_type === 'paragraph' && (
                  <textarea
                    value={block.content.text || ''}
                    onChange={(e) => updateBlockContent(index, { text: e.target.value })}
                    placeholder="Écrivez votre paragraphe ici..."
                    className="w-full min-h-[100px] font-serif text-lg leading-relaxed outline-none resize-y"
                  />
                )}

                {block.block_type === 'heading' && (
                  <div className="flex gap-4 items-center">
                    <select 
                      value={block.content.level || 2}
                      onChange={(e) => updateBlockContent(index, { level: parseInt(e.target.value) })}
                      className="p-2 text-xs border border-gray-100 rounded-sm"
                    >
                      <option value={1}>H1</option>
                      <option value={2}>H2</option>
                      <option value={3}>H3</option>
                    </select>
                    <input
                      type="text"
                      value={block.content.text || ''}
                      onChange={(e) => updateBlockContent(index, { text: e.target.value })}
                      placeholder="Titre de section..."
                      className="flex-1 font-black text-2xl outline-none"
                    />
                  </div>
                )}

                {block.block_type === 'image' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ImageUpload 
                        label="Image du bloc"
                        value={block.content.url}
                        bucketKey="ARTICLES_MEDIA"
                        subFolder="blocks"
                        onChange={(url) => updateBlockContent(index, { url })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase text-gray-400">Légende / Alt</label>
                      <input
                        type="text"
                        value={block.content.caption || ''}
                        onChange={(e) => updateBlockContent(index, { caption: e.target.value, alt: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-sm text-xs outline-none"
                      />
                    </div>
                  </div>
                )}

                {block.block_type === 'quote' && (
                  <div className="space-y-4">
                    <textarea
                      value={block.content.text || ''}
                      onChange={(e) => updateBlockContent(index, { text: e.target.value })}
                      placeholder="Texte de la citation..."
                      className="w-full min-h-[80px] font-serif text-xl italic leading-relaxed border-l-4 border-primary pl-6 outline-none"
                    />
                    <input
                      type="text"
                      value={block.content.author || ''}
                      onChange={(e) => updateBlockContent(index, { author: e.target.value })}
                      placeholder="Auteur de la citation (ex: Pep Guardiola)"
                      className="w-full px-3 py-2 text-xs font-bold uppercase outline-none"
                    />
                  </div>
                )}

                {block.block_type === 'list' && (
                  <div className="space-y-2">
                    {block.content.items?.map((item: string, i: number) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Minus className="w-3 h-3 text-gray-300 shrink-0" />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...block.content.items];
                            newItems[i] = e.target.value;
                            updateBlockContent(index, { items: newItems });
                          }}
                          className="flex-1 text-sm outline-none"
                        />
                        <button 
                          onClick={() => {
                            const newItems = block.content.items.filter((_: any, idx: number) => idx !== i);
                            updateBlockContent(index, { items: newItems });
                          }}
                          className="text-gray-200 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => updateBlockContent(index, { items: [...(block.content.items || []), ''] })}
                      className="text-[9px] font-black uppercase text-primary hover:underline mt-2"
                    >
                      + Ajouter un élément
                    </button>
                  </div>
                )}

                {block.block_type === 'embed' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase text-gray-400">URL Embed (YouTube/X/etc.)</label>
                    <input
                      type="text"
                      value={block.content.url || ''}
                      onChange={(e) => updateBlockContent(index, { url: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-sm text-xs font-mono outline-none"
                    />
                  </div>
                )}

                {block.block_type === 'html' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase text-gray-400 flex items-center gap-2">
                      <Code className="w-3 h-3" /> HTML Brut
                    </label>
                    <textarea
                      value={block.content.html || ''}
                      onChange={(e) => updateBlockContent(index, { html: e.target.value })}
                      placeholder="<div>...</div>"
                      className="w-full min-h-[100px] font-mono text-xs p-3 bg-gray-900 text-green-400 border-none rounded-sm outline-none"
                    />
                  </div>
                )}

                {block.block_type === 'short_video' && (() => {
                  const platform = detectPlatform(block.content.url || '');
                  const embedUrl = getEmbedUrl(block.content.url || '', platform);
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-gray-400 flex items-center gap-2">
                          <Video className="w-3 h-3" /> Lien TikTok / YouTube Shorts
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={block.content.url || ''}
                            onChange={(e) => {
                              const url = e.target.value;
                              const detected = detectPlatform(url);
                              updateBlockContent(index, {
                                url,
                                platform: detected ?? block.content.platform,
                              });
                            }}
                            placeholder="https://www.tiktok.com/@user/video/... ou https://youtube.com/shorts/..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-sm text-xs font-mono outline-none focus:border-primary pr-28"
                          />
                          {platform && (
                            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              platform === 'tiktok'
                                ? 'bg-black text-white'
                                : 'bg-red-600 text-white'
                            }`}>
                              {platform === 'tiktok' ? 'TikTok' : 'YT Shorts'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-gray-400">Légende (optionnel)</label>
                        <input
                          type="text"
                          value={block.content.caption || ''}
                          onChange={(e) => updateBlockContent(index, { caption: e.target.value })}
                          placeholder="ex: Le but du siècle — Liverpool vs Barça, 2019"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-sm text-xs outline-none focus:border-primary"
                        />
                      </div>

                      {platform === 'youtube_shorts' && embedUrl ? (
                        <div className="rounded-sm overflow-hidden border border-gray-100">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-3 py-2 bg-gray-50 border-b border-gray-100">
                            Apercu YouTube Shorts
                          </p>
                          <div className="flex justify-center py-4 bg-gray-950">
                            <iframe
                              src={embedUrl}
                              className="w-[280px] h-[500px] rounded-sm"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : platform === 'tiktok' && embedUrl ? (
                        <div className="flex items-start gap-3 p-4 bg-gray-950 border border-gray-800 rounded-sm">
                          <Video className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                              TikTok — apercu non disponible dans l'editeur
                            </p>
                            <p className="text-[9px] text-white/30 mb-2">
                              TikTok bloque les embeds hors de son domaine. La video s'affichera correctement sur le site publie.
                            </p>
                            <a
                              href={block.content.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Voir sur TikTok
                            </a>
                          </div>
                        </div>
                      ) : block.content.url ? (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-sm">
                          <ExternalLink className="w-3 h-3 text-amber-500 shrink-0" />
                          <p className="text-[10px] text-amber-700">
                            URL non reconnue — seuls TikTok et YouTube Shorts sont supportes.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <InsertDivider atIndex={index + 1} />
          </div>
        ))}
      </div>

      <div className="p-6 border-2 border-dashed border-gray-100 rounded-sm flex flex-wrap gap-2 justify-center mt-4 bg-gray-50/30">
        <p className="w-full text-center text-[9px] font-black uppercase tracking-widest text-gray-300 mb-2">Ajouter à la fin</p>
        {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary shadow-sm flex items-center gap-2 rounded-sm transition-colors"
          >
            <Plus className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
