'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface ShortVideoBlockProps {
  url: string;
  platform: string;
  caption?: string;
}

function extractYouTubeShortsId(url: string): string | null {
  const m = url.match(/shorts\/([a-zA-Z0-9_-]+)/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function extractTikTokVideoId(url: string): string | null {
  const m = url.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

// ── YouTube Shorts ────────────────────────────────────────────
function YouTubeShortsEmbed({ url, caption }: { url: string; caption?: string }) {
  const videoId = extractYouTubeShortsId(url);
  if (!videoId) return <EmbedError />;

  return (
    <figure className="my-12 flex flex-col items-center gap-4">
      <div className="relative w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl bg-black"
           style={{ aspectRatio: '9/16' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube Shorts"
        />
      </div>
      {caption && (
        <figcaption className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic text-center max-w-xs">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── TikTok ────────────────────────────────────────────────────
function TikTokEmbed({ url, caption }: { url: string; caption?: string }) {
  const videoId = extractTikTokVideoId(url);
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-traiter les embeds TikTok si le script est déjà chargé
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).tiktok) {
      try { (window as any).tiktok.reload(); } catch {}
    }
  }, [videoId]);

  if (!videoId) return <EmbedError />;

  return (
    <figure className="my-12 flex flex-col items-center gap-4">
      <div ref={containerRef} className="w-full max-w-[340px]">
        <blockquote
          className="tiktok-embed"
          cite={url}
          data-video-id={videoId}
          style={{ maxWidth: 340, minWidth: 280 }}
        >
          <section />
        </blockquote>
      </div>

      {/* Script officiel TikTok — chargé une seule fois par page grâce à strategy="lazyOnload" */}
      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="lazyOnload"
      />

      {caption && (
        <figcaption className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic text-center max-w-xs">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Fallback erreur ───────────────────────────────────────────
function EmbedError() {
  return (
    <div className="my-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs text-gray-400 font-mono">
      URL video non reconnue
    </div>
  );
}

// ── Export principal ──────────────────────────────────────────
export default function ShortVideoBlock({ url, platform, caption }: ShortVideoBlockProps) {
  if (platform === 'youtube_shorts') {
    return <YouTubeShortsEmbed url={url} caption={caption} />;
  }
  if (platform === 'tiktok') {
    return <TikTokEmbed url={url} caption={caption} />;
  }
  return <EmbedError />;
}
