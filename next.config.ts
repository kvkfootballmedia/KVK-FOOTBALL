import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts — TikTok CDN mondial (US, EU, Asie, Moyen-Orient, Afrique)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://*.tiktok.com https://*.ttwstatic.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://*.tiktokstatic.com https://*.tiktokv.com https://*.byteoversea.com https://*.ibytedtos.com https://*.byteimg.com https://*.bytecdn.com https://*.muscdn.com https://*.snssdk.com https://*.bytedance.com https://*.bytegoofy.com https://*.volces.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tiktok.com https://*.ttwstatic.com https://*.tiktokcdn.com https://*.tiktokstatic.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src * data: blob:",
              // Connexions API — tous CDN TikTok
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://kvkfootball.fr https://*.tiktok.com https://*.ttwstatic.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://*.tiktokstatic.com https://*.tiktokv.com https://*.byteoversea.com https://*.ibytedtos.com https://*.byteimg.com https://*.snssdk.com https://*.volces.com https://*.muscdn.com",
              "frame-src https://www.youtube.com https://*.tiktok.com https://pagead2.googlesyndication.com",
              // Medias video TikTok
              "media-src 'self' blob: https://*.supabase.co https://*.tiktok.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://*.tiktokv.com https://*.byteoversea.com https://*.ibytedtos.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
