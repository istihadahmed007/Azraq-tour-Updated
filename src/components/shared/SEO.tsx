import React from 'react';
import { useSEO } from '../../hooks/useSEO';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  keywords?: string[];
  ogType?: 'website' | 'article';
}

export function SEO({
  title,
  description,
  canonical,
  ogImage,
  noIndex,
  structuredData,
  keywords,
  ogType = 'website',
}: SEOProps) {
  useSEO({
    title,
    description,
    canonical,
    ogImage,
    noindex: noIndex,
    structuredData,
    keywords,
    ogType,
  });

  return null;
}
