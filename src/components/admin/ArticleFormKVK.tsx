import { useState, useEffect } from 'react';
import { Eye, Send, Save } from 'lucide-react';
import BlockEditorKVK, { Block } from './component_block_editor_kvk';
import ImageUploadKVK from './component_image_upload_kvk';

interface Category {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
}

interface ArticleFormKVKProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    featured_image?: string;
    featured_image_focal_x?: number;
    featured_image_focal_y?: number;
    meta_title: string;
    meta_description: string;
    category_id: string;
    status: 'draft' | 'review' | 'published' | 'archived';
    blocks: Block[];
  };
  categories: Category[];
  onSave: (data: any) => Promise<void>;
  onPublish?: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function ArticleFormKVK({
  initialData,
  categories,
  onSave,
  onPublish,
  isLoading = false,
}: ArticleFormKVKProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [featured_image, setFeaturedImage] = useState(
    initialData?.featured_image || ''
  );
  const [featured_image_focal_x, setFeaturedImageFocalX] = useState(
    initialData?.featured_image_focal_x || 50
  );
  const [featured_image_focal_y, setFeaturedImageFocalY] = useState(
    initialData?.featured_image_focal_y || 50
  );
  const [meta_title, setMetaTitle] = useState(initialData?.meta_title || '');
  const [meta_description, setMetaDescription] = useState(initialData?.meta_description || '');
  const [category_id, setCategoryId] = useState(initialData?.category_id || '');
  const [status, setStatus] = useState<'draft' | 'review' | 'published' | 'archived'>(
    initialData?.status || 'draft'
  );
  const [blocks, setBlocks] = useState<Block[]>(initialData?.blocks || []);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !initialData?.id) {
      const generatedSlug = generateSlug(title);
      setSlug(generatedSlug);
    }
  }, [title, initialData?.id]);

  // Auto-generate meta title from title
  useEffect(() => {
    if (title && !initialData?.id) {
      const trimmed = title.substring(0, 60);
      setMetaTitle(trimmed);
    }
  }, [title, initialData?.id]);

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setSaveMessage({ type: 'error', text: 'Le titre est obligatoire' });
      return;
    }

    if (!category_id) {
      setSaveMessage({ type: 'error', text: 'Veuillez sélectionner une catégorie' });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title,
        slug,
        excerpt,
        featured_image,
        featured_image_focal_x,
        featured_image_focal_y,
        meta_title,
        meta_description,
        category_id,
        status,
        blocks,
      });
      setSaveMessage({ type: 'success', text: 'Article sauvegardé avec succès' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !category_id) {
      setSaveMessage({ type: 'error', text: 'Titre et catégorie sont obligatoires pour publier' });
      return;
    }

    setIsPublishing(true);
    try {
      await onPublish?.({
        title,
        slug,
        excerpt,
        featured_image,
        featured_image_focal_x,
        featured_image_focal_y,
        meta_title,
        meta_description,
        category_id,
        status: 'published',
        blocks,
      });
      setSaveMessage({ type: 'success', text: 'Article publié avec succès' });
      setStatus('published');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Erreur lors de la publication' });
    } finally {
      setIsPublishing(false);
    }
  };

  if (showPreview) {
    return <ArticlePreview article={{ title, excerpt, featured_image, blocks, category_id, categories }} onBack={() => setShowPreview(false)} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {initialData?.id ? 'Modifier l\'article' : 'Nouvel article'}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <Eye className="w-4 h-4" />
            Aperçu
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg ${
            saveMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Titre *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'article..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Titre SEO: {title.substring(0, 60)}{title.length > 60 ? '...' : ''} ({title.length}/60)
          </p>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Slug (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug-article"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setSlug(generateSlug(title))}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
            >
              Régénérer
            </button>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description courte
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Résumé en 150-160 caractères..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-vertical min-h-20"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            {excerpt.length}/160 caractères
          </p>
        </div>

        {/* Featured Image */}
        <ImageUploadKVK
          label="Image vedette"
          initialImageUrl={featured_image}
          initialFocalX={featured_image_focal_x}
          initialFocalY={featured_image_focal_y}
          onImageChange={(url, x, y) => {
            setFeaturedImage(url);
            setFeaturedImageFocalX(x);
            setFeaturedImageFocalY(y);
          }}
        />

        {/* SEO Meta Tags */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={meta_title}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Titre pour les moteurs de recherche..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {meta_title.length}/60 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={meta_description}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Description pour les résultats de recherche..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-vertical min-h-20"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {meta_description.length}/160 caractères
              </p>
            </div>
          </div>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              value={category_id}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="draft">Brouillon</option>
              <option value="review">En révision</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>

        {/* Block Editor */}
        <div className="border-t border-gray-200 pt-6">
          <BlockEditorKVK blocks={blocks} onBlocksChange={setBlocks} />
        </div>

        {/* Save & Publish Buttons */}
        <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isPublishing || isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>

          {status !== 'published' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || isSaving || isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition"
            >
              <Send className="w-4 h-4" />
              {isPublishing ? 'Publication...' : 'Publier'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Article Preview Component
function ArticlePreview({
  article,
  onBack,
}: {
  article: any;
  onBack: () => void;
}) {
  const category = article.categories.find((c: Category) => c.id === article.category_id);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Aperçu de l'article</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
          >
            ← Retour à l'édition
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Featured Image */}
        {article.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-96">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
              style={{
                objectPosition: `${article.featured_image_focal_x}% ${article.featured_image_focal_y}%`,
              }}
            />
          </div>
        )}

        {/* Category Badge */}
        {category && (
          <div className="mb-4">
            <span
              className="inline-block px-4 py-2 rounded-full text-white font-bold text-sm"
              style={{ backgroundColor: category.color_hex }}
            >
              {category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Blocks */}
        <div className="prose prose-lg max-w-none space-y-6">
          {article.blocks && article.blocks.map((block: Block, index: number) => (
            <BlockPreview key={index} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <p className="text-gray-700 leading-relaxed">{block.data.text}</p>;
    case 'heading':
      const HeadingTag = `h${block.data.level || 2}` as any;
      return <HeadingTag className="font-bold text-gray-900 mt-6 mb-3">{block.data.text}</HeadingTag>;
    case 'image':
      return (
        <figure className="my-6">
          <img
            src={block.data.url}
            alt={block.data.alt}
            className="w-full rounded-lg"
          />
          {block.data.caption && (
            <figcaption className="text-sm text-gray-600 text-center mt-2">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-red-600 pl-4 italic text-gray-700 my-6">
          <p>{block.data.text}</p>
          {block.data.author && (
            <footer className="text-sm text-gray-600 mt-2">— {block.data.author}</footer>
          )}
        </blockquote>
      );
    case 'list':
      const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag className={block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'}>
          {block.data.items?.map((item: string, i: number) => (
            <li key={i} className="text-gray-700 ml-5">{item}</li>
          ))}
        </ListTag>
      );
    case 'code':
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code className="font-mono text-sm">{block.data.code}</code>
        </pre>
      );
    case 'video':
      return (
        <div className="aspect-video my-6 rounded-lg overflow-hidden bg-black">
          <iframe
            width="100%"
            height="100%"
            src={block.data.url}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    default:
      return null;
  }
}
