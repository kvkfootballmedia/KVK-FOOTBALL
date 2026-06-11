'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function TwitterEmbed({ url }: { url: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as any;
    try {
      if (win.twttr?.widgets?.load) {
        win.twttr.widgets.load();
      }
    } catch {}
  }, [url]);

  return (
    <figure className="my-12 flex flex-col items-center">
      <div className="w-full max-w-[550px]">
        <blockquote className="twitter-tweet" data-dnt="true">
          <a href={url} />
        </blockquote>
      </div>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        charSet="utf-8"
      />
    </figure>
  );
}
