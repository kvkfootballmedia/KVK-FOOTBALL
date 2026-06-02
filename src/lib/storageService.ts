/**
 * KVK FOOTBALL — Storage Service
 * Gestion complète du upload/download de fichiers vers Supabase
 */

import { supabase } from '@/lib/supabaseClient';
import {
  STORAGE_BUCKETS,
  STORAGE_PATHS,
  generateStoragePath,
  getBucketForContent,
  FILE_VALIDATION,
  getPublicUrl,
} from './storageConfig';

interface UploadResult {
  url: string;
  path: string;
  bucket: string;
  size: number;
}

interface UploadError {
  code: string;
  message: string;
}

/**
 * SERVICE: Upload d'images d'articles (vedette + blocs)
 */
export const articleStorage = {
  /**
   * Upload image vedette d'article
   * @param file - Fichier image
   * @returns URL publique de l'image
   */
  uploadFeaturedImage: async (file: File): Promise<UploadResult> => {
    try {
      validateImage(file);

      const bucket = STORAGE_BUCKETS.ARTICLES_MEDIA;
      const path = generateStoragePath('articles', STORAGE_PATHS.articles.featured, file.name);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const url = getPublicUrl(bucket, path);

      return {
        url,
        path,
        bucket,
        size: file.size,
      };
    } catch (error) {
      throw handleUploadError(error);
    }
  },

  /**
   * Upload image de bloc (dans le contenu d'article)
   * @param file - Fichier image
   * @returns URL publique de l'image
   */
  uploadBlockImage: async (file: File): Promise<UploadResult> => {
    try {
      validateImage(file);

      const bucket = STORAGE_BUCKETS.ARTICLES_MEDIA;
      const path = generateStoragePath('articles', STORAGE_PATHS.articles.blocks, file.name);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '7200',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const url = getPublicUrl(bucket, path);

      return {
        url,
        path,
        bucket,
        size: file.size,
      };
    } catch (error) {
      throw handleUploadError(error);
    }
  },

  /**
   * Upload vignette pour listes d'articles
   * @param file - Fichier image
   * @returns URL publique de la vignette
   */
  uploadThumbnail: async (file: File): Promise<UploadResult> => {
    try {
      validateImage(file);

      const bucket = STORAGE_BUCKETS.ARTICLES_MEDIA;
      const path = generateStoragePath('articles', STORAGE_PATHS.articles.thumbnails, file.name);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '86400', // 24h
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const url = getPublicUrl(bucket, path);

      return {
        url,
        path,
        bucket,
        size: file.size,
      };
    } catch (error) {
      throw handleUploadError(error);
    }
  },

  /**
   * Supprimer un fichier d'article
   * @param path - Chemin du fichier
   */
  deleteFeaturedImage: async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.ARTICLES_MEDIA)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw handleUploadError(error);
    }
  },
};

/**
 * SERVICE: Upload de fichiers utilisateur (avatars, bannières)
 */
export const userStorage = {
  /**
   * Upload avatar utilisateur
   * @param file - Fichier image
   * @returns URL publique de l'avatar
   */
  uploadAvatar: async (file: File): Promise<UploadResult> => {
    try {
      // 1. Générer un nom unique et choisir le bon sous-dossier
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      // Utilise le sous-dossier "uploads" du bucket ARTICLES_MEDIA
      const filePath = `${STORAGE_PATHS.user.uploads}/${fileName}`;

      // 2. Upload dans le bucket ARTICLES_MEDIA
      const bucket = STORAGE_BUCKETS.ARTICLES_MEDIA;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Récupérer l'URL publique
      const url = getPublicUrl(bucket, filePath);

      return {
        url,
        path: filePath,
        bucket,
        size: file.size,
      };
    } catch (error) {
      throw handleUploadError(error);
    }
  },

  /**
   * Upload bannière de profil
   * @param file - Fichier image
   * @returns URL publique de la bannière
   */
  uploadBanner: async (file: File): Promise<UploadResult> => {
    try {
      validateImage(file);

      const bucket = STORAGE_BUCKETS.USER_MEDIA;
      const path = generateStoragePath('user', STORAGE_PATHS.user.banners, file.name);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '7200',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const url = getPublicUrl(bucket, path);

      return {
        url,
        path,
        bucket,
        size: file.size,
      };
    } catch (error) {
      throw handleUploadError(error);
    }
  },

  /**
   * Supprimer l'avatar d'un utilisateur
   * @param path - Chemin du fichier
   */
  deleteAvatar: async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.USER_MEDIA)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw handleUploadError(error);
    }
  },
};

/**
 * SERVICE: Upload d'assets statiques (logos, badges)
 */
export const staticStorage = {
  /**
   * Upload logo d'équipe
   * @param file - Fichier image
   * @returns URL publique du logo
   */
  uploadTeamLogo: async (file: File): Promise<UploadResult> => {
    try {
      validateImage(file);

      const bucket = STORAGE_BUCKETS.STATIC_ASSETS;
      const path = generateStoragePath('static', STORAGE_PATHS.static.logos, file.name);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '31536000', // 1 an
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const url = getPublicUrl(bucket, path);

      return {
        url,
        path,
        bucket,
        size: file.size,
      };
    } catch (error) {
      throw handleUploadError(error);
    }
  },

  /**
   * Upload badge (rôle, status)
   * @param file - Fichier image
   * @returns URL publique du badge
   */
  uploadBadge: async (file: File): Promise<UploadResult> => {
    try {
      validateImage(file);

      const bucket = STORAGE_BUCKETS.STATIC_ASSETS;
      const path = generateStoragePath('static', STORAGE_PATHS.static.badges, file.name);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '31536000', // 1 an
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const url = getPublicUrl(bucket, path);

      return {
        url,
        path,
        bucket,
        size: file.size,
      };
    } catch (error) {
      throw handleUploadError(error);
    }
  },
};

/**
 * UTILITIES INTERNES
 */

/**
 * Valide qu'un fichier est une image
 */
function validateImage(file: File): void {
  if (!(FILE_VALIDATION.images.mimeTypes as readonly string[]).includes(file.type)) {
    throw new Error(`INVALID_FILE_TYPE: ${file.type}`);
  }

  if (file.size > FILE_VALIDATION.images.maxSize) {
    throw new Error(`FILE_TOO_LARGE: Max ${FILE_VALIDATION.images.maxSize / 1024 / 1024}MB`);
  }
}

/**
 * Gère les erreurs d'upload
 */
function handleUploadError(error: any): UploadError {
  console.error('Storage error:', error);

  if (error.message.includes('INVALID_FILE_TYPE')) {
    return {
      code: 'INVALID_FILE_TYPE',
      message: 'Format de fichier non autorisé. Utilisez JPG, PNG, WEBP ou GIF.',
    };
  }

  if (error.message.includes('FILE_TOO_LARGE')) {
    return {
      code: 'FILE_TOO_LARGE',
      message: 'Fichier trop volumineux. Maximum 5 MB.',
    };
  }

  if (error.message === 'The resource already exists') {
    return {
      code: 'FILE_EXISTS',
      message: 'Ce fichier existe déjà.',
    };
  }

  if (error.message === 'Bucket not found') {
    return {
      code: 'BUCKET_NOT_FOUND',
      message: 'Le bucket de stockage n\'existe pas. Veuillez le créer dans Supabase.',
    };
  }

  return {
    code: 'UPLOAD_ERROR',
    message: error.message || 'Erreur lors de l\'upload du fichier.',
  };
}
