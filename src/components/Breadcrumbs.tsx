import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { SITE_URL } from '../lib/seo';

export interface BreadcrumbItem {
  name: string;
  url?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url ? (item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`) : undefined,
    })),
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs sm:text-sm text-slate-500 font-medium py-2.5 overflow-x-auto no-scrollbar ${className}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <ol className="flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 mx-1 sm:mx-1.5 text-slate-400 shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="font-semibold text-slate-900 truncate max-w-[220px] sm:max-w-none"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center gap-1 text-slate-600 hover:text-[#0D6EFD] transition-colors cursor-pointer"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{item.name}</span>
                </button>
              ) : item.url ? (
                <a
                  href={item.url}
                  className="flex items-center gap-1 text-slate-600 hover:text-[#0D6EFD] transition-colors"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{item.name}</span>
                </a>
              ) : (
                <span className="flex items-center gap-1 text-slate-600">
                  {isFirst && <Home className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{item.name}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
