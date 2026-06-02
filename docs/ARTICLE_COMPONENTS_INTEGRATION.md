# KVK FOOTBALL — INTÉGRATION DES COMPOSANTS D'ARTICLES AVANCÉS

## 📦 FICHIERS CRÉÉS

Tous les composants suivants sont prêts dans `C:\KVK FOOTBALL\`:

```
✅ component_focal_point_selector.tsx      — Sélecteur de point focal pour images
✅ component_image_upload_kvk.tsx          — Upload d'images avec drag & drop
✅ component_block_editor_kvk.tsx          — Éditeur multi-blocs (8 types)
✅ component_share_buttons_kvk.tsx         — Boutons de partage social
✅ component_comments_kvk.tsx              — Section commentaires modérés
✅ component_article_form_kvk.tsx          — Formulaire complet d'article (admin)
✅ component_view_counter_kvk.tsx          — Compteur de vues
```

---

## 🎯 STRUCTURE D'IMPLÉMENTATION

### **1. Hiérarchie des Composants**

```
ArticleFormKVK (Admin - Édition)
├── ImageUploadKVK
│   └── FocalPointSelector
├── BlockEditorKVK
│   └── BlockContent (interne)
└── Boutons Save/Publish

Article Page (Public - Affichage)
├── ShareButtonsKVK
├── BlockPreview (rendu des blocs)
├── CommentsKVK
└── ViewCounterKVK
```

---

## 📁 ÉTAPES D'INTÉGRATION

### **Phase 1: Copier les composants**

```bash
# Copier dans src/components/admin/
component_article_form_kvk.tsx          → ArticleFormKVK.tsx
component_block_editor_kvk.tsx          → BlockEditorKVK.tsx
component_image_upload_kvk.tsx          → ImageUploadKVK.tsx
component_focal_point_selector.tsx      → FocalPointSelector.tsx

# Copier dans src/components/editorial/
component_share_buttons_kvk.tsx         → ShareButtonsKVK.tsx
component_comments_kvk.tsx              → CommentsKVK.tsx
component_view_counter_kvk.tsx          → ViewCounterKVK.tsx
```

### **Phase 2: Créer la page d'édition d'articles (Admin)**

Créer `src/app/admin/articles/[id]/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleFormKVK from '@/components/admin/ArticleFormKVK';
import { supabase } from '@/lib/supabase';

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch article
        const { data: articleData } = await supabase
          .from('posts')
          .select('*, blocks:post_blocks(*)')
          .eq('id', params.id)
          .single();

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*');

        setArticle(articleData);
        setCategories(categoriesData || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSave = async (data: any) => {
    const { error } = await supabase
      .from('posts')
      .update({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        featured_image_url: data.featured_image_url,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        category_id: data.category_id,
        status: data.status,
      })
      .eq('id', params.id);

    if (error) throw error;

    // Update blocks
    await supabase
      .from('post_blocks')
      .delete()
      .eq('post_id', params.id);

    if (data.blocks.length > 0) {
      await supabase
        .from('post_blocks')
        .insert(
          data.blocks.map((block: any) => ({
            post_id: params.id,
            type: block.type,
            data: block.data,
            sort_order: block.sort_order,
          }))
        );
    }
  };

  const handlePublish = async (data: any) => {
    await handleSave({ ...data, status: 'published' });
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <ArticleFormKVK
      initialData={article}
      categories={categories}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
```

### **Phase 3: Créer la page de création d'articles (Admin)**

Créer `src/app/admin/articles/new/page.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import ArticleFormKVK from '@/components/admin/ArticleFormKVK';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const handleSave = async (data: any) => {
    const { data: newArticle, error } = await supabase
      .from('posts')
      .insert({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        featured_image_url: data.featured_image_url,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        category_id: data.category_id,
        status: data.status,
        author_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert blocks
    if (data.blocks.length > 0) {
      await supabase
        .from('post_blocks')
        .insert(
          data.blocks.map((block: any) => ({
            post_id: newArticle.id,
            type: block.type,
            data: block.data,
            sort_order: block.sort_order,
          }))
        );
    }

    router.push(`/admin/articles/${newArticle.id}`);
  };

  return (
    <ArticleFormKVK
      categories={categories}
      onSave={handleSave}
      onPublish={handleSave}
    />
  );
}
```

### **Phase 4: Page d'affichage d'article (Public)**

Modifier `src/app/article/[slug]/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import ShareButtonsKVK from '@/components/editorial/ShareButtonsKVK';
import CommentsKVK from '@/components/editorial/CommentsKVK';
import ViewCounterKVK from '@/components/editorial/ViewCounterKVK';
import { supabase } from '@/lib/supabase';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data: articleData } = await supabase
        .from('posts')
        .select('*, blocks:post_blocks(*), category:categories(*), comments:comments(*)')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single();

      const approvedComments = articleData?.comments?.filter(
        (c: any) => c.status === 'approved'
      ) || [];

      setArticle(articleData);
      setComments(approvedComments);
      setIsLoading(false);
    };

    fetchArticle();
  }, [params.slug]);

  const handleAddComment = async (content: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    const { data: newComment } = await supabase
      .from('comments')
      .insert({
        post_id: article.id,
        author_id: user.user.id,
        content,
        status: 'pending',
      })
      .select()
      .single();

    // Les commentaires apparaîtront après modération
  };

  const handleLikeComment = async (commentId: string) => {
    await supabase
      .from('comments')
      .update({ like_count: supabase.rpc('increment', { id: commentId }) })
      .eq('id', commentId);
  };

  if (isLoading) return <div>Chargement...</div>;
  if (!article) return <div>Article non trouvé</div>;

  return (
    <article className="max-w-4xl mx-auto py-8 px-4">
      {/* Featured Image */}
      {article.featured_image_url && (
        <img
          src={article.featured_image_url}
          alt={article.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
          style={{
            objectPosition: `${article.featured_image_focal_x}% ${article.featured_image_focal_y}%`,
          }}
        />
      )}

      {/* Category Badge */}
      {article.category && (
        <span
          className="inline-block px-4 py-2 rounded-full text-white font-bold mb-4"
          style={{ backgroundColor: article.category.color_hex }}
        >
          {article.category.name}
        </span>
      )}

      {/* Title */}
      <h1 className="text-4xl font-black text-gray-900 mb-4">
        {article.title}
      </h1>

      {/* Meta Info */}
      <div className="flex items-center gap-4 mb-6 text-gray-600 text-sm">
        <span>
          {new Date(article.published_at).toLocaleDateString('fr-FR')}
        </span>
        <span>•</span>
        <ViewCounterKVK postId={article.id} />
      </div>

      {/* Share Buttons */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <ShareButtonsKVK
          title={article.title}
          slug={article.slug}
          excerpt={article.excerpt}
        />
      </div>

      {/* Content Blocks */}
      <div className="prose prose-lg max-w-none space-y-6 mb-12">
        {article.blocks
          ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((block: any, index: number) => (
            <BlockRenderer key={index} block={block} />
          ))}
      </div>

      {/* Comments */}
      <CommentsKVK
        postId={article.id}
        comments={comments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />
    </article>
  );
}

// Render different block types
function BlockRenderer({ block }: { block: any }) {
  switch (block.type) {
    case 'text':
      return <p className="text-gray-700 leading-relaxed">{block.data.text}</p>;
    case 'heading':
      const Tag = `h${block.data.level || 2}` as any;
      return <Tag className="font-bold">{block.data.text}</Tag>;
    case 'image':
      return (
        <figure>
          <img src={block.data.url} alt={block.data.alt} className="w-full rounded-lg" />
          {block.data.caption && (
            <figcaption className="text-center text-gray-600 text-sm mt-2">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-red-600 pl-4 italic">
          <p>{block.data.text}</p>
          {block.data.author && <footer className="text-sm">— {block.data.author}</footer>}
        </blockquote>
      );
    case 'list':
      const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag className={block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'}>
          {block.data.items?.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );
    case 'code':
      return (
        <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
          <code className="font-mono text-sm">{block.data.code}</code>
        </pre>
      );
    case 'video':
      return (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={block.data.url}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      );
    default:
      return null;
  }
}
```

---

## 🗄️ MIGRATION SQL REQUISE

Exécuter dans Supabase SQL Editor pour ajouter les colonnes manquantes:

```sql
-- Ajouter les colonnes meta SEO
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Ajouter le focal point
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_focal_x FLOAT DEFAULT 50;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_focal_y FLOAT DEFAULT 50;

-- Créer l'index pour slug unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
```

---

## 🎯 FONCTIONNALITÉS IMPLÉMENTÉES

### **BlockEditorKVK** ✅
- 8 types de blocs: Text, Heading, Image, Quote, Video, List, Code, Table
- Drag & drop pour réordonner
- Ajouter/supprimer/dupliquer blocs
- Édition inline de chaque bloc

### **ImageUploadKVK** ✅
- Drag & drop support
- Click to browse
- Preview inline
- Focal point selector
- Validation (type, taille)
- Compression (WebP optional)

### **FocalPointSelector** ✅
- Interface interactive
- Crosshair pour visualiser
- Coordonnées X/Y en temps réel
- Reset à center
- Encodage dans URL: `image.jpg#focal=50_50`

### **ShareButtonsKVK** ✅
- WhatsApp
- Facebook
- Twitter/X
- Copier le lien (clipboard)
- Email
- Feedback "Copié!" après copy

### **CommentsKVK** ✅
- Affichage des commentaires approuvés
- Avatar + Nom + Rôle
- Troncature 200 caractères → "Voir plus"
- Date relative (il y a X minutes)
- Compteur de likes
- Nesting (replies)
- Modération status

### **ArticleFormKVK** ✅
- Auto slug generation
- Meta SEO fields (title, description)
- Featured image avec focal point
- Multi-block editor
- Category selector
- Status selector (Draft/Review/Published)
- Aperçu en temps réel
- Save & Publish buttons

### **ViewCounterKVK** ✅
- Compte les vues uniques (localStorage check)
- Affichage formaté (100, 1K, 1M)
- Hook useViewCounter disponible

---

## 📝 EXEMPLES D'UTILISATION

### **Utiliser ArticleFormKVK dans une page admin**

```tsx
import ArticleFormKVK from '@/components/admin/ArticleFormKVK';

<ArticleFormKVK
  categories={categories}
  onSave={handleSave}
  onPublish={handlePublish}
/>
```

### **Afficher les commentaires sur une page d'article**

```tsx
import CommentsKVK from '@/components/editorial/CommentsKVK';

<CommentsKVK
  postId={article.id}
  comments={approvedComments}
  onAddComment={handleAddComment}
  onLikeComment={handleLikeComment}
/>
```

### **Ajouter les boutons de partage**

```tsx
import ShareButtonsKVK from '@/components/editorial/ShareButtonsKVK';

<ShareButtonsKVK
  title={article.title}
  slug={article.slug}
  excerpt={article.excerpt}
/>
```

### **Utiliser le compteur de vues**

```tsx
import ViewCounterKVK from '@/components/editorial/ViewCounterKVK';

<ViewCounterKVK postId={article.id} />
```

---

## 🔧 CONFIGURATION REQUISE

### **Dependencies**

```bash
npm install lucide-react
```

### **Tailwind CSS**

Les composants utilisent Tailwind CSS. Assurer que votre `tailwind.config.ts` est configuré.

### **Supabase Client**

```tsx
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 🎨 PERSONNALISATION

### **Couleurs**

Modifier dans chaque composant:
```tsx
className="bg-red-600 hover:bg-red-700"  // Rouge KVK
```

### **Textes**

Tous les textes sont en français et peuvent être modifiés directement dans les composants.

### **Tailles de caractères**

Ajuster les `text-sm`, `text-lg`, `text-2xl`, etc. selon vos préférences.

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Copier les composants
2. ✅ Créer les pages admin (create/edit)
3. ✅ Créer la page d'affichage d'article
4. ✅ Ajouter les migrations SQL
5. ⏭️ Configurer les permissions Supabase RLS
6. ⏭️ Tester l'éditeur d'articles
7. ⏭️ Tester les commentaires modérés
8. ⏭️ Tester le partage social

---

## ⚠️ NOTES IMPORTANTES

- **Focal Point**: Stocké en base comme colonnes `featured_image_focal_x` et `featured_image_focal_y`
- **Blocs**: Stockés dans table `post_blocks` avec `type` et `data` JSONB
- **Commentaires**: Stockés dans table `comments` avec status `pending/approved/rejected`
- **Slug**: Généré automatiquement et unique par article
- **Vues**: Comptées via localStorage (unique par navigateur)

---

**Tous les composants sont prêts à intégrer ! 🚀**
