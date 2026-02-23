'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Analytics() {
  // Load AdSense via plain DOM injection so no data-nscript attribute is added
  useEffect(() => {
    if (document.getElementById('adsense-script')) return;
    const s = document.createElement('script');
    s.id = 'adsense-script';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9564119438996773';
    document.head.appendChild(s);
  }, []);

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-F7WR3HX216"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-F7WR3HX216');
        `}
      </Script>
    </>
  );
}
