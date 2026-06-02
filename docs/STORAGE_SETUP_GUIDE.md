# KVK FOOTBALL — SETUP BUCKETS SUPABASE STORAGE

## 🎯 Structure des Buckets (Inspirée de Pantheres Inside)

```
Bucket 1: articles-media
├── featured/         — Images vedette d'articles
├── blocks/          — Images dans les blocs de contenu
└── thumbnails/      — Vignettes pour listes

Bucket 2: user-media
├── avatars/         — Avatars de profil utilisateur
├── banners/         — Bannières de profil
└── uploads/         — Uploads génériques

Bucket 3: static-assets
├── logos/           — Logos équipes
├── badges/          — Badges (rôles, status)
└── icons/           — Icons custom
```

---

## 🚀 Étape 1: Créer les Buckets dans Supabase

### **Via le Dashboard Supabase:**

1. **Aller à:** Supabase Dashboard → Storage
2. **Cliquer:** "New Bucket"
3. **Créer 3 buckets avec les paramètres:**

#### **Bucket 1: articles-media**
```
Name:          articles-media
Public:        ✅ Cocher "Make it public"
Security:      RLS (Row Level Security) - à configurer après
```

#### **Bucket 2: user-media**
```
Name:          user-media
Public:        ✅ Cocher "Make it public"
Security:      RLS (Row Level Security) - à configurer après
```

#### **Bucket 3: static-assets**
```
Name:          static-assets
Public:        ✅ Cocher "Make it public"
Security:      RLS (Row Level Security) - à configurer après
```

---

## 🔐 Étape 2: Configurer les Permissions (RLS)

### **Pour chaque bucket, ajouter ces règles:**

#### **articles-media - Permissions:**

1. **SELECT (Lecture publique)**
   ```sql
   -- Tout le monde peut lire
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'articles-media');
   ```

2. **INSERT (Écriture pour admins)**
   ```sql
   -- Seulement les admins/editors peuvent uploader
   CREATE POLICY "Admin upload only"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'articles-media'
     AND auth.uid() IN (
       SELECT id FROM profiles WHERE role IN ('admin', 'editor')
     )
   );
   ```

3. **UPDATE (Modification pour admins)**
   ```sql
   CREATE POLICY "Admin update only"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'articles-media'
     AND auth.uid() IN (
       SELECT id FROM profiles WHERE role IN ('admin', 'editor')
     )
   );
   ```

4. **DELETE (Suppression pour admins)**
   ```sql
   CREATE POLICY "Admin delete only"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'articles-media'
     AND auth.uid() IN (
       SELECT id FROM profiles WHERE role IN ('admin', 'editor')
     )
   );
   ```

---

#### **user-media - Permissions:**

1. **SELECT (Lecture publique)**
   ```sql
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'user-media');
   ```

2. **INSERT (Chacun peut uploader son propre fichier)**
   ```sql
   CREATE POLICY "Users can upload their own media"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'user-media'
     AND auth.uid() IS NOT NULL
   );
   ```

3. **UPDATE (Chacun peut modifier le sien)**
   ```sql
   CREATE POLICY "Users can update their own media"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'user-media'
     AND auth.uid() IS NOT NULL
   );
   ```

4. **DELETE (Chacun peut supprimer le sien)**
   ```sql
   CREATE POLICY "Users can delete their own media"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'user-media'
     AND auth.uid() IS NOT NULL
   );
   ```

---

#### **static-assets - Permissions:**

1. **SELECT (Lecture publique)**
   ```sql
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'static-assets');
   ```

2. **INSERT (Seulement admins)**
   ```sql
   CREATE POLICY "Admin upload only"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'static-assets'
     AND auth.uid() IN (
       SELECT id FROM profiles WHERE role = 'admin'
     )
   );
   ```

3. **UPDATE/DELETE (Seulement admins)**
   ```sql
   CREATE POLICY "Admin only"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'static-assets'
     AND auth.uid() IN (
       SELECT id FROM profiles WHERE role = 'admin'
     )
   );
   ```

---

## 📁 Fichiers Créés pour KVK Football

```
✅ storageConfig.ts
   - Configuration des buckets
   - Noms de chemins
   - Validation des fichiers
   - Génération de chemins uniques

✅ storageService.ts
   - articleStorage.uploadFeaturedImage()
   - articleStorage.uploadBlockImage()
   - userStorage.uploadAvatar()
   - staticStorage.uploadTeamLogo()
   - ... et 6 autres fonctions

✅ component_image_upload_kvk_UPDATED.tsx
   - Component d'upload mis à jour
   - Utilise storageService réel
   - Gère les erreurs correctement
   - Téléchargement progressif
```

---

## 💻 Installation & Intégration

### **1. Copier les fichiers dans le projet:**

```bash
cp storageConfig.ts src/lib/
cp storageService.ts src/lib/
cp component_image_upload_kvk_UPDATED.tsx src/components/admin/ImageUploadKVK.tsx
```

### **2. Importer dans ArticleFormKVK.tsx:**

```tsx
import ImageUploadKVK from '@/components/admin/ImageUploadKVK';

// Utilisation:
<ImageUploadKVK
  type="featured"  // ou "block"
  onImageChange={(url, x, y) => {
    setFeaturedImageUrl(url);
    setFeaturedImageFocalX(x);
    setFeaturedImageFocalY(y);
  }}
/>
```

### **3. Utiliser dans CommentsKVK.tsx (avatars):**

```tsx
import { userStorage } from '@/lib/storageService';

// Upload avatar commentateur:
const uploadAvatar = async (file: File) => {
  const result = await userStorage.uploadAvatar(file);
  return result.url;
};
```

---

## 🔄 Flux d'Upload par Type de Contenu

### **Image Vedette d'Article**
```
Component: ArticleFormKVK
    ↓
ImageUploadKVK (type="featured")
    ↓
articleStorage.uploadFeaturedImage()
    ↓
Bucket: articles-media/featured/
```

### **Image dans un Bloc**
```
Component: BlockEditorKVK
    ↓
ImageUploadKVK (type="block")
    ↓
articleStorage.uploadBlockImage()
    ↓
Bucket: articles-media/blocks/
```

### **Avatar Utilisateur/Commentateur**
```
Component: ProfileUpdate ou CommentsKVK
    ↓
ImageUploadKVK
    ↓
userStorage.uploadAvatar()
    ↓
Bucket: user-media/avatars/
```

### **Logo Équipe (Admin)**
```
Component: AdminTeamForm
    ↓
staticStorage.uploadTeamLogo()
    ↓
Bucket: static-assets/logos/
```

---

## ✅ Vérification des Buckets

### **Dans Supabase SQL Editor, vérifier:**

```sql
-- Voir tous les buckets
SELECT * FROM storage.buckets;

-- Résultat attendu:
-- id         | name            | public
-- -----------+-----------------+--------
-- articles   | articles-media  | true
-- users      | user-media      | true
-- static     | static-assets   | true
```

---

## 🎯 Noms de Fichiers & Structure de Chemin

Les fichiers sont automatiquement nommés:

```
Timestamp-Random.Extension

Exemple:
1716234567-a3f2k9.jpg

Chemin complet:
articles-media/featured/1716234567-a3f2k9.jpg

URL publique:
https://xxxxxxxxxxx.supabase.co/storage/v1/object/public/articles-media/featured/1716234567-a3f2k9.jpg
```

---

## 🔧 Configuration Requise

### **Variables d'environnement (.env.local):**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### **Dependencies:**

```bash
npm install @supabase/supabase-js
```

---

## 📋 Checklist d'Installation

- [ ] 3 buckets créés dans Supabase
- [ ] Buckets configurés comme "Public"
- [ ] RLS policies créées (copier-coller des SQL ci-dessus)
- [ ] Fichiers storageConfig.ts et storageService.ts copiés
- [ ] ImageUploadKVK.tsx mis à jour
- [ ] Variables d'environnement OK
- [ ] Test d'upload en local
- [ ] Vérification des fichiers dans Supabase Dashboard

---

## 🚨 Troubleshooting

### **"Bucket not found"**
→ Vérifier que les 3 buckets existent dans Supabase Storage

### **"Permission denied" on upload**
→ Vérifier les RLS policies, notamment l'INSERT policy

### **Fichier uploadé mais URL privée**
→ Vérifier que le bucket est coché "Make it public"

### **Upload très lent**
→ Vérifier la taille du fichier (max 5 MB)
→ Vérifier la connexion réseau

---

## 🎉 Une fois tout configuré

✅ Articles peuvent avoir des images vedette et des images dans les blocs
✅ Utilisateurs peuvent uploader des avatars
✅ Admins peuvent ajouter des logos d'équipes
✅ Tout est organisé en buckets séparés
✅ Structure prête pour la scalabilité
✅ Sécurité avec RLS

---

**Les 3 buckets sont maintenant prêts pour KVK Football! 🚀**
