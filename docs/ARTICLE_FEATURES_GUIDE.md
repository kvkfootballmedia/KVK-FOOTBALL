# KVK FOOTBALL — FEATURES AVANCÉES POUR LES ARTICLES

## 🎯 FONCTIONNALITÉS À IMPLÉMENTER

Inspiré de **Pantheres Inside**, KVK Football aura ces features:

### **1. ✅ Slug Automatique**
```typescript
// Généré automatiquement à partir du titre
"Mon super Article" → "mon-super-article"

- Supprime les accents
- Minuscule
- Remplace les espaces par des tirets
- Utilise la regex: /[̀-ͯ]/g
```

### **2. ✅ Focal Point (Zoom Image)**
```typescript
// Permet de sélectionner la zone important d'une image
featured_image: "https://storage.com/image.jpg#focal=50%_50%"

// Stocké en format: url#focal=X_Y (encodé en URL)
// Utilisation: CSS background-position pour crop
```

### **3. ✅ Éditeur Multi-Blocs (BlockEditor)**
Types de blocs supportés:
- **Paragraph** - Texte riche (Editor.js ou Tiptap)
- **Heading** - H1, H2, H3
- **Image** - Avec légende et zoom
- **Quote** - Bloc citation
- **Video** - YouTube/Vimeo embed
- **List** - Listes à puces/numérotées
- **Code** - Code snippet avec highlighting
- **Table** - Tableau de données

Chaque bloc peut être:
- ✅ Réordonné (Drag & Drop)
- ✅ Supprimé
- ✅ Dupliqué

### **4. ✅ Image Upload Avancé**
```
Fonctionnalités:
- Drag & drop
- Click to browse
- Preview inline
- Compression automatique
- Focal point selector
- Lazy loading
```

### **5. ✅ Partage d'Articles**
```
Boutons de partage:
- WhatsApp
- Facebook
- Twitter/X
- Copier le lien (clipboard)
- Email

Chaque réseau obtient:
- Titre de l'article
- URL complète
- Description courte
```

### **6. ✅ Commentaires Modérés**
```
Fonctionnalités:
- Affichage en temps réel
- Avatar + Nom
- Rôle affiché (Rédaction)
- Troncature (200 caractères) → "Voir plus"
- Date relative (il y a X minutes)
- Modération (pending/approved/rejected)
- Nesting possible (replies)
```

### **7. ✅ Meta SEO**
```
Champs:
- meta_title (50-60 chars)
- meta_description (150-160 chars)
- Open Graph image
- Open Graph title/description
```

### **8. ✅ Statuts d'Article**
```
- DRAFT (Brouillon)
- REVIEW (En révision)
- PUBLISHED (Publié)
- ARCHIVED (Archivé)
```

### **9. ✅ Featured Article**
```
- Mise en avant sur homepage
- Image large avec overlay
- Affichage prioritaire
```

### **10. ✅ View Counter**
```
- Compte les vues
- Unique visitors (localStorage check)
- Affichage du nombre de vues
```

---

## 📊 STRUCTURE BDD REQUISE

### Tables existantes à utiliser:

```sql
-- Posts
- id (uuid)
- title (text)
- slug (text) ← Unique, générés auto
- excerpt (text)
- featured_image_url (text) ← Avec focal point encodé
- meta_title (text) ← Nouveau
- meta_description (text) ← Nouveau
- status (enum: draft, review, published, archived)
- author_id (uuid) → profiles
- category_id (uuid) → categories
- view_count (int)
- published_at (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)

-- Post Blocks
- id (uuid)
- post_id (uuid) → posts
- type (enum: text, image, heading, quote, video, list, code, table)
- data (jsonb) ← Contient le contenu du bloc
- sort_order (int)

-- Comments
- id (uuid)
- post_id (uuid) → posts
- author_id (uuid) → profiles
- content (text)
- status (enum: pending, approved, rejected)
- like_count (int)
- parent_comment_id (uuid) ← Pour nesting
- created_at (timestamptz)
```

---

## 🚀 COMPOSANTS À CRÉER POUR KVK

### **1. ArticleFormKVK.tsx** (Admin)
```tsx
Features:
- Slug auto (avec bouton éditer)
- Titre + Excerpt
- Featured image avec focal point selector
- Meta Title/Description
- Category selector
- BlockEditor
- Status selector (Draft/Review/Published)
- Preview button
- Save & Publish buttons
```

### **2. BlockEditorKVK.tsx** (Admin)
```tsx
Types de blocs:
- Text (Tiptap editor)
- Image (Drag & drop)
- Heading (H2, H3, H4)
- Quote
- Video (YouTube/Vimeo URL)
- List (Unordered/Ordered)
- Code (avec syntax highlighting)
- Table

Fonctionnalités:
- Ajouter bloc
- Supprimer bloc
- Réordonner (drag)
- Dupliquer bloc
```

### **3. ImageUploadKVK.tsx** (Admin)
```tsx
Features:
- Drag & drop
- Click to browse
- Preview
- Focal point selector (interactive)
- Remove button
- Compression (WebP)
- Lazy loading
```

### **4. ShareButtonsKVK.tsx** (Public)
```tsx
Boutons:
- WhatsApp
- Facebook
- Twitter/X
- LinkedIn (optionnel)
- Copy link → "Copié!" feedback
- Email (optionnel)
```

### **5. CommentsKVK.tsx** (Public)
```tsx
Features:
- Afficher commentaires approuvés
- Form pour nouveau commentaire
- Avatar + Nom
- Rôle badge (Rédaction)
- Troncature → Voir plus
- Date relative
- Like count (futur)
```

### **6. FocalPointSelector.tsx** (Admin)
```tsx
Interactive:
- Image preview
- Click/drag to set focal point
- Visual indicator (crosshair)
- Save focal point
- Reset to center
```

---

## 📋 ORDRE D'IMPLÉMENTATION

### **Phase 1: Backend (SQL)**
```sql
-- Ajouter colonnes manquantes à posts
ALTER TABLE posts ADD COLUMN meta_title TEXT;
ALTER TABLE posts ADD COLUMN meta_description TEXT;

-- Créer trigger pour slug auto si pas présent
-- Créer index pour slug
CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
```

### **Phase 2: Admin Components**
1. ArticleFormKVK (drag & drop)
2. BlockEditorKVK (multi-block)
3. ImageUploadKVK (preview)
4. FocalPointSelector (interactive)

### **Phase 3: Public Components**
1. ShareButtonsKVK
2. CommentsKVK
3. ViewCounterKVK

### **Phase 4: Page d'Article**
- Intégrer tous les composants
- Meta tags (OG, Twitter Card)
- JSON-LD (Schema.org)

---

## 💾 DONNÉES DU BLOC (Post Blocks)

Exemple de structure `data` JSONB:

```json
{
  "type": "image",
  "data": {
    "url": "https://storage.com/image.jpg#focal=50%_30%",
    "alt": "Description",
    "caption": "Légende optionnelle",
    "width": 800,
    "height": 600
  }
}

{
  "type": "text",
  "data": {
    "text": "Paragraphe de contenu..."
  }
}

{
  "type": "heading",
  "data": {
    "text": "Titre de section",
    "level": 2
  }
}

{
  "type": "quote",
  "data": {
    "text": "Citation importante",
    "author": "Auteur"
  }
}

{
  "type": "video",
  "data": {
    "url": "https://youtube.com/embed/...",
    "width": 1280,
    "height": 720
  }
}

{
  "type": "code",
  "data": {
    "code": "const x = 5;",
    "language": "javascript"
  }
}
```

---

## 🎨 UI/UX CONSIDERATIONS

### **Editor (Admin)**
- Dark mode pour moins de fatigue oculaire
- Sidebar avec bloc types
- Preview en temps réel
- Auto-save toutes les 30s
- Notification feedback

### **Public View**
- Share buttons après le titre
- Comments section en bas
- View count subtle
- Meta tags invisibles mais présentes

---

## 🔐 SÉCURITÉ

- ✅ RLS pour comments (seul admin/editor peut approuver)
- ✅ Sanitize slug (pas de XSS)
- ✅ Rate limiting sur commentaires
- ✅ Image validation (type, size)
- ✅ Focal point validation (0-100%)

---

## 📚 LIBRARIES RECOMMANDÉES

```
npm install:
- editor.js (ou tiptap pour RTE)
- react-image-crop (focal point selector)
- react-share (social share)
- react-hot-toast (notifications)
- date-fns (formatting)
- slugify (slug generation)
```

---

**Procédure complète à suivre dans KVK_ARTICLE_COMPONENTS.md**
