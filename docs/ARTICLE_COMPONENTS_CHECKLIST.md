# KVK FOOTBALL — COMPOSANTS D'ARTICLES AVANCÉS — CHECKLIST

## ✅ FICHIERS PRÊTS À INTÉGRER

Tous les fichiers sont dans `C:\KVK FOOTBALL\`:

### **Composants Admin (Édition)**
- ✅ `component_article_form_kvk.tsx` — Formulaire complet d'article
- ✅ `component_block_editor_kvk.tsx` — Éditeur multi-blocs
- ✅ `component_image_upload_kvk.tsx` — Upload avec focal point
- ✅ `component_focal_point_selector.tsx` — Sélecteur de zoom

### **Composants Public (Affichage)**
- ✅ `component_share_buttons_kvk.tsx` — Partage social
- ✅ `component_comments_kvk.tsx` — Commentaires modérés
- ✅ `component_view_counter_kvk.tsx` — Compteur de vues

### **Documentation**
- ✅ `ARTICLE_COMPONENTS_INTEGRATION.md` — Guide complet d'intégration
- ✅ `sql_article_features_migration.sql` — Migrations base de données
- ✅ `ARTICLE_COMPONENTS_CHECKLIST.md` — Ce fichier

---

## 📋 PLAN D'INTÉGRATION (Étapes)

### **Étape 1: Préparation Base de Données**
- [ ] Ouvrir Supabase SQL Editor
- [ ] Copier le contenu de `sql_article_features_migration.sql`
- [ ] Exécuter les migrations
- [ ] Vérifier que les colonnes ont été ajoutées

**Commandes à exécuter:**
```sql
-- Vérifier que tout est OK
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'posts' AND column_name IN (
  'meta_title', 'meta_description',
  'featured_image_focal_x', 'featured_image_focal_y'
);
```

---

### **Étape 2: Copier les Composants**

```bash
# Créer les dossiers
mkdir -p src/components/admin
mkdir -p src/components/editorial

# Copier les composants
cp component_article_form_kvk.tsx src/components/admin/ArticleFormKVK.tsx
cp component_block_editor_kvk.tsx src/components/admin/BlockEditorKVK.tsx
cp component_image_upload_kvk.tsx src/components/admin/ImageUploadKVK.tsx
cp component_focal_point_selector.tsx src/components/admin/FocalPointSelector.tsx

cp component_share_buttons_kvk.tsx src/components/editorial/ShareButtonsKVK.tsx
cp component_comments_kvk.tsx src/components/editorial/CommentsKVK.tsx
cp component_view_counter_kvk.tsx src/components/editorial/ViewCounterKVK.tsx
```

---

### **Étape 3: Créer les Pages Admin**

- [ ] Créer `src/app/admin/articles/new/page.tsx` (créer article)
- [ ] Créer `src/app/admin/articles/[id]/page.tsx` (éditer article)

**Voir le guide ARTICLE_COMPONENTS_INTEGRATION.md pour le code complet.**

---

### **Étape 4: Mettre à Jour la Page d'Article**

- [ ] Modifier `src/app/article/[slug]/page.tsx`
- [ ] Importer ShareButtonsKVK
- [ ] Importer CommentsKVK
- [ ] Importer ViewCounterKVK
- [ ] Rendre les composants avec les bonnes props

---

### **Étape 5: Tester l'Application**

```bash
npm install lucide-react
npm run dev
```

**Tests à effectuer:**
- [ ] Créer un nouvel article
- [ ] Éditer un article existant
- [ ] Ajouter des blocs (text, image, heading, etc.)
- [ ] Utiliser le focal point selector
- [ ] Afficher l'aperçu avant publication
- [ ] Publier un article
- [ ] Voir les boutons de partage sur la page d'article
- [ ] Ajouter un commentaire (doit être en pending)
- [ ] Approuver un commentaire dans Supabase
- [ ] Vérifier le compteur de vues

---

## 🎯 FONCTIONNALITÉS PAR COMPOSANT

### **ArticleFormKVK**
```
Inputs:
- title (string) ← Auto-slug generation
- slug (string) ← Éditable avec bouton "Régénérer"
- excerpt (string) ← Max 160 caractères
- featured_image_url (string)
- featured_image_focal_x (number 0-100)
- featured_image_focal_y (number 0-100)
- meta_title (string) ← Max 60 caractères
- meta_description (string) ← Max 160 caractères
- category_id (string) ← Dropdown
- status (enum) ← draft, review, published, archived
- blocks (Block[]) ← Multi-block editor

Outputs:
- onSave() ← Enregistrer le brouillon
- onPublish() ← Publier l'article
- Preview mode ← Affichage en temps réel
```

### **BlockEditorKVK**
```
Blocs supportés:
- Text (Tiptap ou textarea)
- Heading (H1-H4)
- Image (URL + alt + caption)
- Quote (texte + auteur)
- Video (YouTube/Vimeo URL)
- List (à puces ou numérotée)
- Code (avec sélection de langage)
- Table (format pipe-delimited)

Actions:
- Add block
- Remove block
- Duplicate block
- Drag to reorder
- Edit inline
```

### **ImageUploadKVK**
```
Features:
- Drag & drop
- Click to browse
- Image validation (type, size)
- Preview inline
- Focal point selector
- Remove button
- Change image

Output:
- url (string)
- focal_x (number 0-100)
- focal_y (number 0-100)
```

### **FocalPointSelector**
```
Interaction:
- Click/drag to set point
- Visual crosshair
- Real-time coordinates
- Reset to center (50, 50)

Output:
- X coordinate (0-100)
- Y coordinate (0-100)
```

### **ShareButtonsKVK**
```
Boutons:
- WhatsApp (message)
- Facebook (share dialog)
- Twitter/X (tweet)
- Copy link (avec feedback "Copié!")
- Email (mailto)

Props:
- title (string)
- slug (string)
- excerpt (string)
```

### **CommentsKVK**
```
Features:
- Display approved comments
- Comment form
- Avatar + Name + Role
- Text truncation (200 chars)
- "Show more" button
- Relative time (il y a X minutes)
- Like count
- Nested replies
- Moderation notice

Props:
- postId (string)
- comments (CommentData[])
- onAddComment() async
- onLikeComment() async
```

### **ViewCounterKVK**
```
Features:
- Count unique views (localStorage)
- Formatted display (100, 1K, 1M)
- Hook useViewCounter()

Props:
- postId (string)
- onViewRecorded() ← callback
- showIcon (boolean)
```

---

## 🔍 VÉRIFICATION AVANT LANCEMENT

### **Base de Données**
- [ ] Colonnes meta_title/meta_description existent
- [ ] Colonnes featured_image_focal_x/y existent
- [ ] Table post_blocks existe
- [ ] Table comments existe avec parent_comment_id
- [ ] Indexes créés pour performance

### **Configuration**
- [ ] lucide-react installé (`npm install lucide-react`)
- [ ] Tailwind CSS configuré
- [ ] Supabase client configuré
- [ ] Variables d'environnement OK

### **Composants**
- [ ] Chemins d'import corrects
- [ ] Pas d'erreurs TypeScript
- [ ] Props alignées avec les interfaces

### **Pages**
- [ ] Admin pages (new/[id]) créées
- [ ] Article page ([slug]) mise à jour
- [ ] Routes fonctionnent

---

## 🚀 DÉPLOIEMENT

### **Avant le lancement en production:**

1. **Tests complets**
   - [ ] Créer un article (brouillon)
   - [ ] Éditeur multi-blocs fonctionne
   - [ ] Focal point sélectionnable
   - [ ] Aperçu fonctionne
   - [ ] Publication fonctionne
   - [ ] Affichage public correct

2. **RLS Supabase**
   - [ ] Vérifier que les policies sont OK
   - [ ] Admin/Editor peut créer/éditer
   - [ ] Utilisateurs normaux ne peuvent pas éditer
   - [ ] Les commentaires pending ne s'affichent pas

3. **Performance**
   - [ ] Image lazy loading
   - [ ] Blocs se chargent correctement
   - [ ] Pas de flicker
   - [ ] Focal point fluide

4. **SEO**
   - [ ] Meta tags injectés dans <head>
   - [ ] Open Graph tags présents
   - [ ] Slug unique et SEO-friendly

---

## 📞 TROUBLESHOOTING

### **"Cannot find module 'lucide-react'"**
```bash
npm install lucide-react
npm run dev
```

### **Focal point ne s'affiche pas**
- Vérifier que FocalPointSelector.tsx est dans le bon dossier
- Vérifier les imports dans ImageUploadKVK

### **Commentaires ne s'affichent pas**
- Vérifier que comments.status = 'approved' dans la base
- Vérifier la requête Supabase

### **Slug n'est pas généré**
- Vérifier que generateSlug() est appelée au onChange du title
- Vérifier que initialData?.id est undefined (new article)

### **Blocs ne se sauvegardent pas**
- Vérifier que post_blocks table existe
- Vérifier que les permissions RLS permettent l'insertion
- Vérifier le format des blocks dans onSave

---

## 📖 RESSOURCES

- **Guide complet**: ARTICLE_COMPONENTS_INTEGRATION.md
- **Migrations SQL**: sql_article_features_migration.sql
- **Composants**: component_*.tsx
- **Lucide Icons**: https://lucide.dev
- **Tailwind CSS**: https://tailwindcss.com

---

## ✨ RÉSULTAT FINAL

Une fois tout intégré, KVK Football aura:

✅ **Édition avancée**
- Editeur visuel multi-blocs
- Focal point pour les images
- Aperçu en temps réel
- Auto slug generation
- Meta SEO fields

✅ **Affichage riche**
- Contenu blocs rendus correctement
- Images avec focal point appliqué
- Boutons de partage social
- Compteur de vues
- Section commentaires

✅ **Modération**
- Commentaires pending/approved
- Rôles (Rédacteur, Auteur, User)
- Troncature et "Voir plus"

✅ **SEO**
- Meta title/description
- Open Graph tags
- JSON-LD schema
- Slug unique

---

**Tous les composants et guides sont prêts ! 🎉**

Commencez par l'étape 1 (migrations SQL), puis suivez le plan d'intégration étape par étape.
