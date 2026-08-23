import { useEffect } from 'react';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
  buildCanonicalUrl,
  buildPageTitle,
  SEOConfig,
} from '../lib/seo';

export function useSEO(config: SEOConfig = {}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Update Title
    const finalTitle = buildPageTitle(config.title);
    document.title = finalTitle;

    // Helper to get or create meta tag by attribute
    const setMetaTag = (attrName: string, attrValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // 2. Meta Description
    const description = config.description || DEFAULT_DESCRIPTION;
    setMetaTag('name', 'description', description);

    // 3. Meta Keywords
    if (config.keywords && config.keywords.length > 0) {
      setMetaTag('name', 'keywords', config.keywords.join(', '));
    }

    // 4. Robots
    const robotsContent = config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMetaTag('name', 'robots', robotsContent);

    // 5. Canonical Link
    const canonicalUrl = config.canonical ? (config.canonical.startsWith('http') ? config.canonical : buildCanonicalUrl(config.canonical)) : (typeof window !== 'undefined' ? buildCanonicalUrl(window.location.pathname) : SITE_URL);
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. Open Graph Tags
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', config.ogType || 'website');
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:image', config.ogImage || DEFAULT_OG_IMAGE);

    if (config.publishedTime) {
      setMetaTag('property', 'article:published_time', config.publishedTime);
    }
    if (config.modifiedTime) {
      setMetaTag('property', 'article:modified_time', config.modifiedTime);
    }
    if (config.author) {
      setMetaTag('property', 'article:author', config.author);
    }

    // 7. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', TWITTER_HANDLE);
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', config.ogImage || DEFAULT_OG_IMAGE);

    // 8. Inject Structured Data JSON-LD
    const SCRIPT_ID = 'azraq-dynamic-schema';
    let scriptEl = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (config.structuredData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = SCRIPT_ID;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      const dataPayload = Array.isArray(config.structuredData)
        ? { '@context': 'https://schema.org', '@graph': config.structuredData }
        : config.structuredData;
      scriptEl.textContent = JSON.stringify(dataPayload);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      // Clean up dynamic schema if needed when unmounting
    };
  }, [
    config.title,
    config.description,
    config.canonical,
    config.ogImage,
    config.ogType,
    config.noindex,
    config.author,
    config.publishedTime,
    config.modifiedTime,
    JSON.stringify(config.keywords),
    JSON.stringify(config.structuredData),
  ]);
}
