import React from 'react';
import { useSEO } from '../hooks/useSEO';
import { SEOConfig } from '../lib/seo';

export interface SEOHeadProps extends SEOConfig {}

export const SEOHead: React.FC<SEOHeadProps> = (props) => {
  useSEO(props);
  return null;
};
