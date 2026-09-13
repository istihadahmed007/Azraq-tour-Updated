import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ExternalLink, Palette, Sparkles, AlertCircle } from 'lucide-react';

interface BehanceShowcaseProps {
  className?: string;
  projectId?: string;
  embedUrl?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

export const BehanceShowcase: React.FC<BehanceShowcaseProps> = ({
  className = '',
  projectId = '167873131',
  embedUrl = 'https://www.behance.net/embed/project/167873131?ilo0=1',
  title = 'Visual Identity & Brand Architecture',
  subtitle = 'Explore the editorial design system, typography hierarchy, and visual journey crafted for Azraq Tours on Behance.',
  badgeText = 'Featured Case Study',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const directProjectUrl = `https://www.behance.net/gallery/${projectId}`;

  return (
    <section className={`w-full py-14 sm:py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-[1200px] mx-auto w-full space-y-8"
      >
        {/* Header with Visual Hierarchy */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#071A33]/5 text-[#071A33] border border-[#071A33]/10 text-xs font-semibold tracking-wider uppercase font-mono">
              <Palette className="w-3.5 h-3.5 text-[#17BEBB]" />
              <span>{badgeText}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#071A33] tracking-tight font-serif-display">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-inter">
              {subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={directProjectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#071A33] border border-slate-200/80 shadow-xs hover:shadow-sm font-semibold text-xs sm:text-sm transition-all cursor-pointer font-inter group"
            >
              <span>View on Behance</span>
              <ExternalLink className="w-4 h-4 text-[#17BEBB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Outer Showcase Container with Restrained Luxury Styling */}
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { y: -2 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md bg-white overflow-hidden transition-shadow"
        >
          {/* Loading Skeleton */}
          {isLoading && !hasError && (
            <div className="w-full min-h-[520px] md:min-h-[700px] flex flex-col items-center justify-center gap-3 bg-slate-50 p-6 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                <Palette className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs text-slate-400 font-medium font-inter">
                Loading Behance project showcase...
              </p>
            </div>
          )}

          {/* Error Fallback */}
          {hasError ? (
            <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-bold text-slate-800 font-inter">
                  Unable to load embedded preview
                </h3>
                <p className="text-xs text-slate-500 font-inter leading-relaxed">
                  Your browser or ad-blocker may be restricting third-party embedded content. You can view the full project directly on Behance.
                </p>
              </div>
              <a
                href={directProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#073B4C] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Open Project on Behance</span>
                <ExternalLink className="w-4 h-4 text-[#17BEBB]" />
              </a>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title="Behance Project Showcase"
              loading="lazy"
              allowFullScreen
              allow="clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className={`w-full block min-h-[520px] md:min-h-[700px] border-0 transition-opacity duration-300 ${
                isLoading ? 'opacity-0 absolute inset-0' : 'opacity-100'
              }`}
            />
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};
