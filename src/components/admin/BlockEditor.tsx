'use client';

import { PostBlock, BlockType } from '@/types';
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
  Code
} from 'lucide-react';
import ImageUpload from './ImageUpload';

interface BlockEditorProps {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const addBlock = (block_type: BlockType) => {
    const newBlock: PostBlock = {
      block_type,
      content: block_type === 'list' ? { items: [''] } : { text: '' },
      position: blocks.length,
    };
    onChange([...blocks, newBlock]);
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={index} className="group relative bg-white border border-gray-100 p-6 rounded-sm shadow-sm hover:border-primary transition-colors">
            {/* Controls */}
            <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => moveBlock(index, 'up')} className="p-2 bg-gray-900 text-white hover:bg-primary rounded-sm disabled:opacity-30" disabled={index === 0}>
                <ArrowUp className="w-3 h-3" />
              </button>
              <button onClick={() => moveBlock(index, 'down')} className="p-2 bg-gray-900 text-white hover:bg-primary rounded-sm disabled:opacity-30" disabled={index === blocks.length - 1}>
                <ArrowDown className="w-3 h-3" />
              </button>
              <button onClick={() => removeBlock(index)} className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-sm">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4 text-[9px] font-black uppercase tracking-[2px] text-gray-400">
              <GripVertical className="w-3 h-3 mr-2 text-gray-200" />
              {block.block_type}
            </div>

            {/* Content fields by type */}
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
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="p-8 border-2 border-dashed border-gray-100 rounded-sm flex flex-wrap gap-3 justify-center">
        <button onClick={() => addBlock('paragraph')} className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary shadow-sm flex items-center gap-2">
          <Plus className="w-3 h-3" /> Paragraphe
        </button>
        <button onClick={() => addBlock('heading')} className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary shadow-sm flex items-center gap-2">
          <Plus className="w-3 h-3" /> Titre
        </button>
        <button onClick={() => addBlock('image')} className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary shadow-sm flex items-center gap-2">
          <Plus className="w-3 h-3" /> Image
        </button>
        <button onClick={() => addBlock('quote')} className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary shadow-sm flex items-center gap-2">
          <Plus className="w-3 h-3" /> Citation
        </button>
        <button onClick={() => addBlock('list')} className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary shadow-sm flex items-center gap-2">
          <Plus className="w-3 h-3" /> Liste
        </button>
        <button onClick={() => addBlock('embed')} className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary shadow-sm flex items-center gap-2">
          <Plus className="w-3 h-3" /> Embed
        </button>
        <button onClick={() => addBlock('html')} className="px-4 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary shadow-sm flex items-center gap-2">
          <Plus className="w-3 h-3" /> HTML
        </button>
      </div>
    </div>
  );
}
