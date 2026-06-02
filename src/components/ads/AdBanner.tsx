'use client';

import { useEffect } from 'react';

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'ca-pub-XXXXXXXXXXXXXXXX';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

const FORMAT_STYLES: Record<string, React.CSSProperties> = {
  horizontal:  { display: 'block', width: '100%', minHeight: 90 },
  rectangle:   { display: 'inline-block', width: 300, height: 250 },
  vertical:    { display: 'block', width: 160, minHeight: 600 },
  auto:        { display: 'block', width: '100%' },
};

export default function AdBanner({ dataAdSlot, dataAdFormat = 'auto', className = '' }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  const isRectangle = dataAdFormat === 'rectangle';

  return (
    <div className={`ad-container flex flex-col items-center overflow-hidden w-full ${isRectangle ? 'my-8' : 'my-10'} ${className}`}>
      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 mb-2 select-none">
        Publicite
      </span>
      <div className={`bg-gray-50/50 border border-gray-100 rounded-sm flex items-center justify-center overflow-hidden ${isRectangle ? 'p-2' : 'p-3 w-full'}`}>
        <ins
          className="adsbygoogle"
          style={FORMAT_STYLES[dataAdFormat] || FORMAT_STYLES.auto}
          data-ad-client={PUB_ID}
          data-ad-slot={dataAdSlot}
          data-ad-format={dataAdFormat === 'rectangle' ? undefined : dataAdFormat}
          data-full-width-responsive={dataAdFormat !== 'rectangle' ? 'true' : undefined}
        />
      </div>
    </div>
  );
}
