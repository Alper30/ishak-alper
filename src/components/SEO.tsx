import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: Record<string, any>;
}

export default function SEO({ 
  title, 
  description, 
  keywords = "İshak Alper, Çıplak Gösteren Gözlükler, kişisel gelişim kitabı, psikoloji danışmanlık, karanlık psikoloji", 
  image, 
  url = "https://ishakalper.com/",
  type = "website",
  structuredData
}: SEOProps) {
  const [globalImage, setGlobalImage] = useState<string>("https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1920&auto=format&fit=crop");
  const [globalKeywords, setGlobalKeywords] = useState<string>(keywords);
  const [globalDesc, setGlobalDesc] = useState<string>("");
  const [gaId, setGaId] = useState<string>("");
  const [pixelId, setPixelId] = useState<string>("");

  useEffect(() => {
    const fetchGlobalImage = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.profilePictureUrl) setGlobalImage(data.profilePictureUrl);
          if (data.seoKeywords) setGlobalKeywords(data.seoKeywords);
          if (data.seoDescription) setGlobalDesc(data.seoDescription);
          if (data.googleAnalyticsId) setGaId(data.googleAnalyticsId);
          if (data.metaPixelId) setPixelId(data.metaPixelId);
        }
      } catch (err) {
        console.error("Error fetching SEO global settings:", err);
      }
    };
    fetchGlobalImage();
  }, []);

  const finalImage = image || globalImage;
  const finalKeywords = globalKeywords || keywords;
  const finalDescription = description || globalDesc;
  
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "İshak Alper",
    "url": "https://ishakalper.com/",
    "image": finalImage
  };

  const ldJson = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalImage} />

      {/* AI Bot Hint Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(ldJson)}
      </script>

      {/* Google Analytics */}
      {gaId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
      )}
      {gaId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </script>
      )}

      {/* Meta Pixel Code */}
      {pixelId && (
        <script>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `}
        </script>
      )}
      {pixelId && (
        <noscript>
          {`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`}
        </noscript>
      )}
    </Helmet>
  );
}
