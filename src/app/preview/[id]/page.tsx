'use client';

import { use, useEffect, useState, Fragment } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { PostBlock } from '@/types';
import { Loader2, AlertCircle, Eye } from 'lucide-react';
import ShortVideoBlock from '@/components/editorial/ShortVideoBlock';
import TwitterEmbed from '@/components/editorial/TwitterEmbed';

function sanitize(html: string): string {
  return (html || "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript\s*:/gi, "");
}

// Block Renderer Component - Identique à la version publique de KVK
const BlockRenderer = ({ block }: { block: PostBlock }) => {
  const { block_type, content } = block;

  switch (block_type) {
    case "paragraph":
      return (
        <div
          className="font-serif text-base md:text-xl leading-relaxed text-gray-800 mb-10 prose prose-lg prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitize(content.text || "") }}
        />
      );
    case "heading":
      return content.level === 3 ? (
        <h3 className="font-black text-3xl md:text-4xl mt-16 mb-8 tracking-tighter italic border-b-2 border-gray-900 pb-2 inline-block">
          {content.text}
        </h3>
      ) : (
        <h2 className="font-black text-3xl md:text-4xl mt-16 mb-8 tracking-tighter italic border-b-2 border-gray-900 pb-2 inline-block">
          {content.text}
        </h2>
      );
    case "image":
      return (
        <figure className="my-16 -mx-4 md:-mx-16">
          <div className="relative aspect-video">
            <img
              src={content.url}
              alt={content.alt || ""}
              className="w-full h-full object-cover shadow-2xl"
            />
          </div>
          {content.caption && (
            <figcaption className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-t border-gray-100 pt-4 w-fit mx-auto italic">
              {content.caption}
            </figcaption>
          )}
        </figure>
      );
    case "quote":
      return (
        <div className="my-20 relative p-12 bg-gray-50 border-y-2 border-gray-900 overflow-hidden">
          <span className="absolute -top-10 -left-4 text-[200px] font-black text-gray-900/5 select-none leading-none">
            "
          </span>
          <p className="font-serif text-4xl italic leading-tight text-gray-900 text-center relative z-10">
            {content.text}
          </p>
          {content.author && (
            <p className="text-center mt-8 text-xs font-black uppercase tracking-[0.2em] text-primary relative z-10">
              — {content.author}
            </p>
          )}
        </div>
      );
    case "list":
      return (
        <ul className="list-disc list-inside space-y-4 font-serif text-xl text-gray-800 mb-10 pl-4 border-l-2 border-gray-100">
          {content.items?.map((item: string, i: number) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: sanitize(item || "") }}
            />
          ))}
        </ul>
      );
    case "embed": {
      const url = content.url || "";

      // Twitter / X
      if (url.includes("twitter.com") || url.includes("x.com")) {
        return <TwitterEmbed url={url} />;
      }

      // YouTube
      const getEmbedUrl = (u: string) => {
        try {
          if (u.includes("youtube.com/watch")) {
            const videoId = new URL(u).searchParams.get("v");
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
          }
          if (u.includes("youtu.be/")) {
            const videoId = u.split("youtu.be/")[1];
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
          }
          return u;
        } catch {
          return u;
        }
      };

      return (
        <div className="my-16 aspect-video bg-gray-100 rounded-sm overflow-hidden shadow-xl">
          <iframe
            src={getEmbedUrl(url)}
            className="w-full h-full"
            allowFullScreen
            title="Embedded content"
          />
        </div>
      );
    }
    case "html":
      return (
        <div
          className="my-10"
          dangerouslySetInnerHTML={{ __html: sanitize(content.html || "") }}
        />
      );

    case "short_video":
      return (
        <ShortVideoBlock
          url={content.url}
          platform={content.platform}
          caption={content.caption}
        />
      );

    default:
      return null;
  }
};

export default function PreviewArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Vous devez être connecté pour prévisualiser un article.");
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!profile || !['admin', 'editor', 'author'].includes(profile.role)) {
          setError("Vous n'avez pas l'autorisation de prévisualiser cet article.");
          setLoading(false);
          return;
        }

        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image,
            featured_image_focal_x,
            featured_image_focal_y,
            published_at,
            category_id,
            categories:category_id ( name, slug ),
            author:profiles!posts_author_id_fkey ( full_name, role ),
            post_blocks ( id, block_type, content, position )
          `)
          .eq("id", id)
          .single();

        if (postError || !postData) {
          throw new Error("Article introuvable");
        }

        const transformedPost = {
          ...postData,
          categories: postData.categories ? [postData.categories] : [],
        };

        setPost(transformedPost);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Génération de la prévisualisation...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-black uppercase text-gray-900 mb-4">Accès Refusé</h1>
        <p className="text-gray-500 font-serif italic mb-8 max-w-md">
          {error}
        </p>
        <Link
          href="/kv0980gp-coffre"
          className="text-white bg-primary font-black uppercase tracking-[0.4em] text-[10px] inline-block px-8 py-4 hover:bg-black transition-all rounded-sm"
        >
          Retour au Dashboard
        </Link>
      </div>
    );
  }

  const post_blocks = post.post_blocks || [];
  const sortedBlocks = [...post_blocks].sort((a, b) => a.position - b.position);

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-yellow-400 text-black text-center py-2 z-[9999] shadow-lg flex items-center justify-center gap-4">
        <span className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest">
          <Eye className="w-4 h-4" /> Mode Prévisualisation
        </span>
        <Link 
          href={`/kv0980gp-coffre/edit/${post.id}`}
          className="bg-black text-white text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full hover:bg-gray-800 transition-colors"
        >
          Retour à l'édition
        </Link>
      </div>

      <article className="pb-32 bg-white pt-16">
        <header className="pt-4 pb-3 md:pt-10 md:pb-6 bg-white">
          <div className="container mx-auto px-3 md:px-4 max-w-3xl">
            <div className="flex flex-wrap gap-2 md:gap-4 mb-2 md:mb-4">
              {post.categories.map((cat: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-primary font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px]"
                >
                  <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                  {cat.name}
                </span>
              ))}
            </div>

            <h1 className="text-xl md:text-5xl font-black mb-2 md:mb-4 leading-tight tracking-tight uppercase text-gray-900">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="font-serif text-sm md:text-lg text-gray-500 leading-relaxed mb-3 md:mb-5 max-w-xl hidden sm:block">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-2 border-t border-gray-100 pt-2 md:pt-3">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gray-800 flex items-center justify-center text-white text-[8px] font-black uppercase select-none shrink-0">
                {(post.author?.full_name || "K")[0]}
              </div>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {post.author?.full_name || "Rédaction KVK"}
              </p>
              <span className="text-gray-200 text-[9px]">•</span>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {new Date().toLocaleDateString(
                  "fr-FR",
                  { day: "numeric", month: "long", year: "numeric" },
                )}
              </p>
            </div>
          </div>
        </header>

        {post.featured_image && (
          <div className="container mx-auto px-3 md:px-4 max-w-3xl mb-4 md:mb-8">
            <div className="relative w-full rounded-sm overflow-hidden shadow-md max-h-[210px] md:max-h-[420px]">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover max-h-[210px] md:max-h-[420px]"
                style={{
                  objectPosition: `${post.featured_image_focal_x ?? 50}% ${post.featured_image_focal_y ?? 50}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-4 mt-8">
            {sortedBlocks.map((block, index) => (
              <Fragment key={index}>
                <BlockRenderer block={block} />
              </Fragment>
            ))}
          </div>

          <div className="mt-24 pt-16 border-t border-gray-100 text-center">
             <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Les commentaires et éléments de partage seront affichés ici.
             </p>
          </div>
        </div>
      </article>
    </>
  );
}
