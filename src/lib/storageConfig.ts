/**
 * KVK FOOTBALL — Storage Configuration
 * Définit les buckets Supabase et leur structure
 */

export const STORAGE_BUCKETS = {
  // Bucket 1: Articles & Contenu éditorial
  ARTICLES_MEDIA: 'articles-media',

  // Bucket 2: Données utilisateurs
  USER_MEDIA: 'user-media',

  // Bucket 3: Statiques & Assets
  STATIC_ASSETS: 'static-assets',
} as const;

// Sous-dossiers organisés par type de contenu
export const STORAGE_PATHS = {
  // Articles
  articles: {
    featured: 'featured',          // Images vedette d'articles
    blocks: 'blocks',              // Images dans les blocs de contenu
    thumbnails: 'thumbnails',      // Vignettes pour listes
  },

  // Utilisateurs
  user: {
    avatars: 'avatars',            // Avatars de profil
    banners: 'banners',            // Bannières de profil
    uploads: 'uploads',            // Uploads génériques
  },

  // Assets statiques
  static: {
    logos: 'logos',                // Logos équipes
    badges: 'badges',              // Badges rôles/status
    icons: 'icons',                // Icons custom
  },
} as const;

/**
 * Générateur de chemin de fichier
 * @param category - Catégorie (articles, user, static)
 * @param subdir - Sous-dossier
 * @param fileName - Nom du fichier
 * @returns Chemin complet: subdir/timestamp-random.ext
 */
export function generateStoragePath(
  category: 'articles' | 'user' | 'static',
  subdir: string,
  fileName: string
): string {
  const ext = fileName.split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const uniqueName = `${timestamp}-${random}.${ext}`;

  return `${subdir}/${uniqueName}`;
}

/**
 * Détermine le bucket basé sur le type de contenu
 */
export function getBucketForContent(type: 'article' | 'user' | 'static'): string {
  switch (type) {
    case 'article':
      return STORAGE_BUCKETS.ARTICLES_MEDIA;
    case 'user':
      return STORAGE_BUCKETS.USER_MEDIA;
    case 'static':
      return STORAGE_BUCKETS.STATIC_ASSETS;
    default:
      return STORAGE_BUCKETS.ARTICLES_MEDIA;
  }
}

/**
 * Configuration de validation des fichiers
 */
export const FILE_VALIDATION = {
  images: {
    maxSize: 5 * 1024 * 1024, // 5 MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
  documents: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['pdf', 'doc', 'docx'],
  },
} as const;

/**
 * Format de l'URL publique d'un fichier
 * @param bucket - Nom du bucket
 * @param path - Chemin du fichier
 * @param supabaseUrl - URL de base Supabase
 * @returns URL publique complète
 */
export function getPublicUrl(
  bucket: string,
  path: string,
  supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
