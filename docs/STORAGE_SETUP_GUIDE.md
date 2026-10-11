# KVK FOOTBALL — GUIDE COMPLET STOCKAGE & INFRASTRUCTURE

> **Dernière mise à jour : Juillet 2026**
> Ce document reflète l'architecture actuelle du projet, après la migration complète de Supabase Storage vers Cloudflare R2.

---

## 📐 Architecture Actuelle

Suite au dépassement du quota de bande passante Supabase (16.78 Go consommés sur 5.5 Go autorisés), l'architecture de stockage a été entièrement migrée vers Cloudflare R2, qui ne facture **aucun frais de sortie (egress)**.

```
              Utilisateur
                    │
                    ▼
          Cloudflare (CDN mondial)
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
 Frontend Next.js           Images / Médias
  (Vercel / local)          Cloudflare R2
       │                   kvk-football-media
       └────────────┬────────────┘
                    ▼
             Supabase PostgreSQL
             (BDD + Auth uniquement)
```

### Séparation des responsabilités

| Service | Rôle |
|---|---|
| **Supabase PostgreSQL** | Tables (posts, profiles, categories, etc.) |
| **Supabase Auth** | Authentification des utilisateurs |
| **Cloudflare R2** | Stockage de toutes les images et médias |
| **Cloudflare CDN** | Distribution mondiale des fichiers sans frais d'egress |

---

## 🪣 Structure du Bucket Cloudflare R2

Un seul bucket remplace les 3 anciens buckets Supabase. L'organisation est maintenue via des sous-dossiers.

```
Bucket: kvk-football-media (Cloudflare R2)
├── featured/         — Images vedette d'articles
├── blocks/           — Images dans les blocs de contenu
├── thumbnails/       — Vignettes pour listes
├── avatars/          — Avatars de profil utilisateur
├── banners/          — Bannières de profil
├── uploads/          — Uploads génériques
├── logos/            — Logos équipes
├── badges/           — Badges (rôles, status)
└── icons/            — Icons custom
```

**URL publique du bucket :** `https://pub-0db92ee9cad1404b89383b7179eba8f0.r2.dev`

---

## ⚙️ Variables d'Environnement (`.env.local`)

```bash
# ── Supabase (BDD & Auth) ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://<projet>.functions.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhb...

# ── Cloudflare R2 (Stockage Images) ────────────────────────────
# URL publique du CDN (visible côté client)
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-0db92ee9cad1404b89383b7179eba8f0.r2.dev

# Clés secrètes (SERVEUR UNIQUEMENT — jamais exposées côté client)
R2_ENDPOINT=https://f5dae20ace5d28132a176acbf5d35a51.r2.cloudflarestorage.com
R2_BUCKET_NAME=kvk-football-media
R2_ACCESS_KEY_ID=acfb8a9b3590821ff53bb971c29e99ba
R2_SECRET_ACCESS_KEY=<votre_secret_key>
```

> **⚠️ Important :** Après toute modification du `.env.local`, relancer le serveur de développement (`npm run dev`) pour que les nouvelles variables soient prises en compte.

---

## 🔄 Flux d'Upload (Nouvelle Architecture)

Tous les uploads transitent désormais par une **route API sécurisée Next.js** (`/api/upload`) qui gère les clés Cloudflare côté serveur. Les clés secrètes ne sont jamais exposées au navigateur.

```
Utilisateur sélectionne un fichier
         │
         ▼
   ImageUpload.tsx (frontend)
         │
         ▼
  api.storage.upload() → POST /api/upload
  (avec token Auth Supabase en header)
         │
         ▼
   src/app/api/upload/route.ts (serveur)
   ✓ Vérifie le token Supabase
   ✓ Upload le fichier vers Cloudflare R2
   ✓ Retourne l'URL publique
         │
         ▼
  URL Cloudflare enregistrée en BDD
  https://pub-...r2.dev/avatars/xxx.jpg
```

---

## 📁 Fichiers Clés de l'Architecture

### Côté serveur (sécurisé)

| Fichier | Rôle |
|---|---|
| `src/lib/r2.ts` | Initialisation du client S3 (compatible R2) |
| `src/app/api/upload/route.ts` | Route d'API sécurisée — reçoit le fichier, uploade sur R2, retourne l'URL |

### Côté client

| Fichier | Rôle |
|---|---|
| `src/lib/storageConfig.ts` | Constantes des noms de buckets et sous-dossiers |
| `src/lib/storageService.ts` | Conservé pour référence — remplacé par `api.storage` |
| `src/components/admin/ImageUpload.tsx` | Composant d'upload utilisé dans le CMS |
| `src/services/api.ts` → `api.storage.upload()` | Point d'entrée du frontend pour l'upload |

---

## 🗄️ Base de Données (Nouveau Projet Supabase)

Suite au blocage du projet Supabase original (quota dépassé), un **nouveau projet Supabase** a été créé. Le schéma complet a été réappliqué via :

**Script de référence :** `supabase/kvk_football_schema_clean.sql`

### Tables du schéma

| Table | Description |
|---|---|
| `profiles` | Profils utilisateurs (étend `auth.users`) |
| `categories` | Rubriques éditoriales |
| `tags` | Mots-clés des articles |
| `leagues` | Championnats internationaux |
| `story_groups` | Groupes de Stories (style Instagram) |
| `stories` | Slides d'un groupe de stories |
| `posts` | Articles |
| `post_tags` | Liaison N-N posts ↔ tags |
| `post_blocks` | Blocs de contenu de l'éditeur |
| `post_comments` | Commentaires |
| `post_views_daily` | Stats de vues quotidiennes |
| `admin_activities` | Journal des actions CMS *(ajouté au script)* |
| `post_views` | Historique détaillé des vues *(ajouté au script)* |

> `admin_activities` et `post_views` étaient présentes dans l'ancienne BDD mais manquaient dans `kvk_football_schema_clean.sql`. Elles ont été ajoutées directement dans le script.

### Patch SQL pour tables manquantes

À exécuter dans le **SQL Editor** de Supabase si les tables `admin_activities` et `post_views` sont absentes :

```sql
CREATE TABLE IF NOT EXISTS public.admin_activities (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  action      text        NOT NULL,
  entity_type text        NOT NULL,
  entity_id   uuid,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.post_views (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid        REFERENCES public.posts(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_activities_select_all" ON public.admin_activities
  FOR SELECT TO authenticated USING (public.can_manage_content());
CREATE POLICY "admin_activities_insert" ON public.admin_activities
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_content() OR public.is_author());
CREATE POLICY "post_views_insert_public" ON public.post_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "post_views_select_admin" ON public.post_views
  FOR SELECT TO authenticated USING (public.can_manage_content());
```

---

## 🗜️ Script de Compression (migrate-images.js)

Le script `scripts/migrate-images.js` permet de compresser les images existantes directement sur le storage.

```bash
node scripts/migrate-images.js
```

**Ce qu'il fait :**
- Scanne les buckets `articles-media`, `user-media`, `static-assets`
- Compresse les `.jpg`, `.jpeg`, `.png` (max 1920px, qualité 82) via Sharp
- Écrase le fichier original en place → les URLs en BDD ne changent pas

> Ce script a été utilisé avant la migration pour compresser les images sur Supabase. Il reste disponible pour usage futur.

---

## 🔧 Dépendances Installées

```bash
npm install @aws-sdk/client-s3   # SDK AWS S3 (compatible Cloudflare R2)
```

---

## ✅ Checklist Remise en Marche (Nouveau Projet)

- [x] Créer un compte Cloudflare et activer R2
- [x] Créer le bucket `kvk-football-media` avec accès public activé
- [x] Créer le token API R2 (Object Read & Write)
- [x] Ajouter les variables R2 dans `.env.local`
- [x] Installer `@aws-sdk/client-s3`
- [x] Créer `src/lib/r2.ts` (client S3)
- [x] Créer `src/app/api/upload/route.ts` (route sécurisée)
- [x] Modifier `api.storage.upload()` pour pointer vers `/api/upload`
- [x] Créer un nouveau projet Supabase
- [x] Appliquer `kvk_football_schema_clean.sql` sur la nouvelle BDD
- [x] Appliquer le patch SQL (`admin_activities` + `post_views`)
- [x] Mettre à jour les clés Supabase dans `.env.local`
- [x] Redémarrer `npm run dev`
- [x] Se connecter à l'admin et se donner le rôle `admin` via le Table Editor

---

## 🚨 Troubleshooting

### Image uploadée mais non affichée dans le CMS
**Cause :** Le serveur `npm run dev` n'a pas été redémarré après l'ajout des variables R2 dans `.env.local`.
**Solution :** Arrêter le serveur (Ctrl+C) et relancer `npm run dev`.

### Erreur `402 Payment Required` sur Supabase Storage
Le quota de bande passante Supabase gratuit est dépassé (5.5 Go/mois). Les nouvelles images passent par R2 et ne sont plus concernées.

### Erreur `Non autorisé` sur `/api/upload`
Vérifier que l'utilisateur est bien connecté et que les clés `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont correctes dans `.env.local`.

### Image visible dans Cloudflare mais URL retournée incorrecte
Vérifier que `NEXT_PUBLIC_R2_PUBLIC_URL` est bien renseignée et que le serveur a été redémarré après modification du `.env.local`.

### Erreur de build `Expected ',' got 'upload'`
Erreur de syntaxe dans `src/services/api.ts` ligne ~295 — s'assurer que le message d'erreur utilise des guillemets doubles autour d'une apostrophe : `"Erreur lors de l'upload vers R2"`.

---

**Architecture prête — Stockage illimité en bande passante sortante grâce à Cloudflare R2. 🚀**
