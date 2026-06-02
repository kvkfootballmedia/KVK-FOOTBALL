import { useState } from 'react';
import {
  Plus, Trash2, Copy, GripVertical, Type, Image, Heading2,
  Quote, Video, List, Code, Table as TableIcon,
} from 'lucide-react';

export type BlockType = 'text' | 'image' | 'heading' | 'quote' | 'video' | 'list' | 'code' | 'table';

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, any>;
  sort_order: number;
}

interface BlockEditorKVKProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

const BLOCK_TYPES = [
  { type: 'text', label: 'Paragraphe', icon: Type },
  { type: 'heading', label: 'Titre', icon: Heading2 },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'quote', label: 'Citation', icon: Quote },
  { type: 'video', label: 'Vidéo', icon: Video },
  { type: 'list', label: 'Liste', icon: List },
  { type: 'code', label: 'Code', icon: Code },
  { type: 'table', label: 'Tableau', icon: TableIcon },
];

export default function BlockEditorKVK({ blocks, onBlocksChange }: BlockEditorKVKProps) {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      data: getDefaultData(type),
      sort_order: blocks.length,
    };
    onBlocksChange([...blocks, newBlock]);
    setExpandedBlock(newBlock.id);
  };

  const removeBlock = (id: string) => {
    onBlocksChange(blocks.filter(b => b.id !== id));
  };

  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(b => b.id === id);
    if (!blockToDuplicate) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockToDuplicate.type,
      data: { ...blockToDuplicate.data },
      sort_order: blocks.length,
    };
    onBlocksChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, data: Record<string, any>) => {
    onBlocksChange(
      blocks.map(b =>
        b.id === id ? { ...b, data: { ...b.data, ...data } } : b
      )
    );
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    newBlocks.forEach((b, i) => (b.sort_order = i));
    onBlocksChange(newBlocks);
  };

  const handleDragStart = (id: string) => {
    setDraggedBlockId(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedBlockId === null) return;

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlockId);
    if (draggedIndex !== index) {
      moveBlock(draggedIndex, index);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          Contenu de l'article
        </label>
        <span className="text-xs text-gray-500">{blocks.length} bloc(s)</span>
      </div>

      {/* Block List */}
      <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-32">
        {blocks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Aucun bloc. Commencez par en ajouter un ci-dessous.
          </p>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => handleDragStart(block.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDraggedBlockId(null)}
              className={`p-4 rounded-lg border transition ${
                draggedBlockId === block.id
                  ? 'opacity-50 border-blue-400 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <span className="text-sm font-medium text-gray-700 flex-1">
                  {BLOCK_TYPES.find(bt => bt.type === block.type)?.label}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition"
                  >
                    {expandedBlock === block.id ? 'Masquer' : 'Éditer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateBlock(block.id)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="p-1 text-gray-600 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content Preview/Editor */}
              {expandedBlock === block.id && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <BlockContent
                    block={block}
                    onUpdate={(data) => updateBlock(block.id, data)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Block Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type as BlockType)}
            className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition text-xs font-medium text-gray-700"
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Block Content Component
function BlockContent({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (data: Record<string, any>) => void;
}) {
  switch (block.type) {
    case 'text':
      return (
        <textarea
          value={block.data.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Entrez votre texte..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          rows={4}
        />
      );

    case 'heading':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.data.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Titre..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
          />
          <select
            value={block.data.level || 2}
            onChange={(e) => onUpdate({ level: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value={1}>H1 - Titre principal</option>
            <option value={2}>H2 - Sous-titre</option>
            <option value={3}>H3 - Sous-sous-titre</option>
            <option value={4}>H4 - Section</option>
          </select>
        </div>
      );

    case 'image':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.data.url || ''}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="URL de l'image..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          />
          <input
            type="text"
            value={block.data.alt || ''}
            onChange={(e) => onUpdate({ alt: e.target.value })}
            placeholder="Texte alternatif..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <input
            type="text"
            value={block.data.caption || ''}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Légende (optionnel)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-2">
          <textarea
            value={block.data.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Citation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            rows={2}
          />
          <input
            type="text"
            value={block.data.author || ''}
            onChange={(e) => onUpdate({ author: e.target.value })}
            placeholder="Auteur (optionnel)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      );

    case 'video':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.data.url || ''}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="URL YouTube ou Vimeo..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          />
          <p className="text-xs text-gray-500">
            Insérez l'URL complète: https://youtube.com/watch?v=...
          </p>
        </div>
      );

    case 'list':
      return (
        <div className="space-y-2">
          <select
            value={block.data.style || 'unordered'}
            onChange={(e) => onUpdate({ style: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="unordered">Liste à puces</option>
            <option value="ordered">Liste numérotée</option>
          </select>
          <textarea
            value={(block.data.items || []).join('\n')}
            onChange={(e) => onUpdate({ items: e.target.value.split('\n').filter(line => line.trim()) })}
            placeholder="Un élément par ligne..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            rows={4}
          />
        </div>
      );

    case 'code':
      return (
        <div className="space-y-2">
          <select
            value={block.data.language || 'javascript'}
            onChange={(e) => onUpdate({ language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="json">JSON</option>
          </select>
          <textarea
            value={block.data.code || ''}
            onChange={(e) => onUpdate({ code: e.target.value })}
            placeholder="Entrez votre code..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            rows={6}
          />
        </div>
      );

    case 'table':
      return (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 mb-2">
            Format: Une ligne par rangée, colonnes séparées par |
          </p>
          <textarea
            value={block.data.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="En-têtes | Colonne 2 | Colonne 3&#10;Donnée 1 | Donnée 2 | Donnée 3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            rows={6}
          />
        </div>
      );

    default:
      return null;
  }
}

function getDefaultData(type: BlockType): Record<string, any> {
  switch (type) {
    case 'text':
      return { text: '' };
    case 'heading':
      return { text: '', level: 2 };
    case 'image':
      return { url: '', alt: '', caption: '' };
    case 'quote':
      return { text: '', author: '' };
    case 'video':
      return { url: '' };
    case 'list':
      return { items: [], style: 'unordered' };
    case 'code':
      return { code: '', language: 'javascript' };
    case 'table':
      return { content: '' };
    default:
      return {};
  }
}
