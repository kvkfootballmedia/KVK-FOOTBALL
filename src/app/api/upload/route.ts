import { NextRequest, NextResponse } from 'next/server';
import { r2Client } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

// ─── Constantes de validation ───────────────────────────────────────────────
const MAX_FILE_SIZE   = 3 * 1024 * 1024; // 3 MB
const ALLOWED_MIMES   = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_ROLES   = new Set(['admin', 'editor', 'author']);

// ─── Rate limiting in-memory (20 uploads / heure / user) ────────────────────
const RATE_LIMIT      = 20;
const WINDOW_MS       = 60 * 60 * 1000; // 1 heure

const uploadCounts = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(userId: string): boolean {
  const now  = Date.now();
  const entry = uploadCounts.get(userId);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    uploadCounts.set(userId, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL  || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Vérification du rôle (admin, editor, author uniquement)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !ALLOWED_ROLES.has(profile.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 3. Rate limiting
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Limite : 20 uploads par heure.' },
        { status: 429 }
      );
    }

    // 4. Récupération des données
    const formData = await request.formData();
    const file     = formData.get('file') as File;
    const path     = formData.get('path') as string;

    if (!file || !path) {
      return NextResponse.json({ error: 'Fichier ou chemin manquant' }, { status: 400 });
    }

    // 5. Validation taille côté serveur
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Maximum ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    // 6. Validation type MIME côté serveur
    if (!ALLOWED_MIMES.has(file.type)) {
      return NextResponse.json(
        { error: 'Format non autorisé. Utilisez JPG, PNG, WEBP ou GIF.' },
        { status: 415 }
      );
    }

    // 7. Upload vers R2
    const buffer     = Buffer.from(await file.arrayBuffer());
    const bucketName = process.env.R2_BUCKET_NAME || 'kvk-football-media';

    await r2Client.send(new PutObjectCommand({
      Bucket:      bucketName,
      Key:         path,
      Body:        buffer,
      ContentType: file.type,
    }));

    // 8. Retour de l'URL publique
    const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
    const cleanBase     = publicUrlBase.replace(/\/$/, '');
    const cleanPath     = path.replace(/^\//, '');
    const publicUrl     = `${cleanBase}/${cleanPath}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error('Erreur API Upload R2:', error);
    return NextResponse.json({ error: "Erreur serveur lors de l'upload" }, { status: 500 });
  }
}
