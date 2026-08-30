import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Package, ArrowRight } from 'lucide-react';
import { TourPackage } from '../../types';
import { PackageCard } from '../PackageCard';

interface FeaturedPackagesSectionProps {
  packages: TourPackage[];
  onViewDetails: (pkg: TourPackage) => void;
  onRequestQuote: (pkg: TourPackage) => void;
  onNavigateToPackages?: () => void;
}

export const FeaturedPackagesSection: React.FC<FeaturedPackagesSectionProps> = ({
  packages,
  onViewDetails,
  onRequestQuote,
  onNavigateToPackages,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const featured = packages.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#086788]">
            <Package className="w-3.5 h-3.5 text-[#17BEBB]" />
            <span>Handpicked Holidays</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#073B4C] tracking-tight font-serif-display">
            Featured Tour Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-inter">
            Complete Asian itineraries with verified hotels, private transfers, and visa checklists.
          </p>
        </div>

        {onNavigateToPackages && (
          <button
            onClick={onNavigateToPackages}
            type="button"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#EAF7F8] text-[#073B4C] hover:bg-[#17BEBB]/20 hover:text-[#073B4C] font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto border border-[#17BEBB]/30"
          >
            <span>View All Packages ({packages.length})</span>
            <ArrowRight className="w-4 h-4 text-[#FF6B5A]" />
          </button>
        )}
      </div>

      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-x-visible no-scrollbar pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
        {featured.map((pkg, idx) => (
          <motion.div
            key={pkg.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: shouldReduceMotion ? 0 : idx * 0.05,
              ease: 'easeOut',
            }}
            whileHover={shouldReduceMotion ? undefined : { y: -3 }}
            className="min-w-[270px] xs:min-w-[290px] sm:min-w-0 w-[82vw] max-w-[330px] sm:w-full snap-start shrink-0 sm:shrink flex"
          >
            <PackageCard
              pkg={pkg}
              onViewDetails={onViewDetails}
              onRequestQuote={onRequestQuote}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
