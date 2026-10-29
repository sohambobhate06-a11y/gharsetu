import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  MapPin,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Tag,
  CheckCircle2,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { Property } from '../types';
import {
  formatINR,
  toggleSaveProperty,
  getSavedPropertyIds,
  isUrbanAfford,
  getUrbanAffordMetrics,
} from '../services/storage';

interface FeaturedPropertiesProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onCompareOffers: (property: Property) => void;
  initialCategory?: 'all' | 'afford' | 'metro' | 'luxury';
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  onSelectProperty,
  onCompareOffers,
  initialCategory = 'all',
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'afford' | 'metro' | 'luxury'>(initialCategory);
  const [savedIds, setSavedIds] = useState<string[]>(getSavedPropertyIds());
  const [displayCount, setDisplayCount] = useState<number>(9);

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveProperty(id);
    setSavedIds(getSavedPropertyIds());
  };

  // Filter properties based on category
  const filteredProperties = useMemo(() => {
    if (activeCategory === 'afford') {
      return properties.filter(isUrbanAfford);
    }
    if (activeCategory === 'luxury') {
      return properties.filter((p) => {
        const offers = p.offers || [];
        const minPrice =
          p.transactionType === 'rent'
            ? Math.min(...offers.map((o) => o.rentAmount || 0))
            : Math.min(...offers.map((o) => o.salePrice || 0));
        return p.transactionType === 'rent' ? minPrice >= 120000 : minPrice >= 35000000;
      });
    }
    if (activeCategory === 'metro') {
      return properties.filter((p) =>
        ['Bandra West', 'Worli', 'Juhu', 'Hiranandani Estate', 'Powai'].includes(p.locality)
      );
    }
    return properties;
  }, [properties, activeCategory]);

  const urbanAffordCount = useMemo(() => properties.filter(isUrbanAfford).length, [properties]);

  return (
    <section className="py-14 bg-[#F8F5EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174D3B] bg-[#174D3B]/10 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C96F4A]" />
              <span>Transparent Multi-Broker Marketplace</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#174D3B]">
              {activeCategory === 'afford' ? '🌿 Urban Afford Collection' : 'Curated Urban Residences'}
            </h2>
            <p className="text-xs sm:text-sm text-[#747A75] mt-1 max-w-xl">
              {activeCategory === 'afford'
                ? 'High-affordability verified residences under ₹45,000/mo rent or ₹1.8 Cr purchase with capped deposits and transparent broker fees.'
                : 'Canonical property records linked to multiple licensed broker offers for transparent cost and deposit comparison.'}
            </p>
          </div>

          {/* Urban Afford Feature Badge */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3 text-xs text-emerald-900 shadow-xs max-w-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 font-bold">
              🌿
            </div>
            <div>
              <span className="font-bold block text-emerald-950">Urban Afford Guarantee</span>
              <span className="text-[11px] text-emerald-800">
                Low 2-3 mo deposits · Transit commuter hubs · Verified RERA brokers
              </span>
            </div>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeCategory === 'all'
                ? 'bg-[#174D3B] text-white shadow-sm'
                : 'bg-white border border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
            }`}
          >
            <span>All Residences</span>
            <span className="text-xs opacity-75 font-mono">({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('afford')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeCategory === 'afford'
                ? 'bg-[#C96F4A] text-white shadow-sm'
                : 'bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <span>🌿 Urban Afford (Budget & Starter)</span>
            <span className="text-xs opacity-80 font-mono">({urbanAffordCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('metro')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeCategory === 'metro'
                ? 'bg-[#174D3B] text-white shadow-sm'
                : 'bg-white border border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Prime Metro Hubs</span>
          </button>

          <button
            onClick={() => setActiveCategory('luxury')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeCategory === 'luxury'
                ? 'bg-[#174D3B] text-white shadow-sm'
                : 'bg-white border border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
            }`}
          >
            <span>💎 Luxury & Sea View</span>
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredProperties.slice(0, displayCount).map((prop) => {
            const offers = prop.offers || [];
            const minPrice =
              prop.transactionType === 'rent'
                ? Math.min(...offers.map((o) => o.rentAmount || 0))
                : Math.min(...offers.map((o) => o.salePrice || 0));
            const isSaved = savedIds.includes(prop.id);
            const isAfford = isUrbanAfford(prop);
            const firstOffer = offers[0];
            const affordMetrics = firstOffer ? getUrbanAffordMetrics(firstOffer, prop.transactionType) : null;

            return (
              <div
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                className={`group bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isAfford
                    ? 'border-emerald-300/80 hover:border-emerald-600'
                    : 'border-[#252A28]/10 hover:border-[#174D3B]/40'
                }`}
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#F3EFE6]">
                    <img
                      src={prop.coverImage}
                      alt={prop.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Left Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      {isAfford && (
                        <div className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                          <span>🌿 Urban Afford</span>
                        </div>
                      )}
                      {prop.isVerified && (
                        <div className="bg-[#174D3B] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#D5B477]" />
                          <span>RERA Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => handleToggleBookmark(prop.id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                        isSaved
                          ? 'bg-[#C96F4A] text-white shadow-md'
                          : 'bg-white/80 text-[#252A28] hover:bg-white hover:text-[#174D3B]'
                      }`}
                      title={isSaved ? 'Saved in LocalStorage' : 'Save Property'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    {/* Competing offers chip */}
                    {offers.length > 1 && (
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-[#174D3B] text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-[#C96F4A]" />
                        <span>{offers.length} Broker Offers to Compare</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    {/* Location & Affordability Sub-label */}
                    <div className="flex items-center justify-between text-xs text-[#747A75]">
                      <div className="flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C96F4A] shrink-0" />
                        <span>{prop.locality}, {prop.city}</span>
                      </div>
                      {isAfford && affordMetrics && (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {affordMetrics.affordabilityTag}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-[#252A28] group-hover:text-[#174D3B] transition-colors line-clamp-1">
                      {prop.title}
                    </h3>

                    {/* Unboxed Metadata Specs */}
                    <div className="flex items-center gap-2 text-xs text-[#747A75]">
                      <span className="font-semibold text-[#252A28]">{prop.bedroomCount} BHK</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">{prop.carpetArea} sq.ft</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{prop.furnishing.replace('-', ' ')}</span>
                    </div>

                    {/* Price and Broker comparison teaser */}
                    <div className="pt-3 border-t border-[#252A28]/10 flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-[#747A75] block">
                          {prop.transactionType === 'rent' ? 'Starting Rent' : 'Guaranteed Price'}
                        </span>
                        <div className="text-lg font-bold text-[#174D3B] font-mono-num">
                          {formatINR(minPrice)}
                          {prop.transactionType === 'rent' && (
                            <span className="text-xs font-normal text-[#747A75]">/month</span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs text-[#747A75] font-mono bg-[#F3EFE6] px-2 py-0.5 rounded">
                        {prop.canonicalKey}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompareOffers(prop);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors text-center shadow-xs ${
                      isAfford
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-[#174D3B] hover:bg-[#0F3528] text-white'
                    }`}
                  >
                    Compare Deals ({offers.length})
                  </button>
                  <button
                    onClick={() => onSelectProperty(prop)}
                    className="py-2 px-3 border border-[#252A28]/15 text-[#252A28] rounded-lg text-xs font-semibold hover:border-[#174D3B] hover:text-[#174D3B] transition-colors text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {filteredProperties.length > displayCount && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setDisplayCount((prev) => prev + 6)}
              className="px-6 py-2.5 bg-white border border-[#252A28]/15 hover:border-[#174D3B] text-[#174D3B] rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all"
            >
              Load More Residences ({filteredProperties.length - displayCount} remaining)
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
