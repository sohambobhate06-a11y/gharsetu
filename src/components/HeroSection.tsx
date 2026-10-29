import React, { useState } from 'react';
import { Search, Compass, MapPin, Building, Sparkles, TrendingDown, ArrowRight } from 'lucide-react';
import { TransactionType } from '../types';

interface HeroSectionProps {
  onSearch: (city: string, type: TransactionType, bhk: number | 'all') => void;
  onExploreMap: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onExploreMap }) => {
  const [transactionType, setTransactionType] = useState<TransactionType>('rent');
  const [city, setCity] = useState('Mumbai');
  const [bhk, setBhk] = useState<number | 'all'>('all');

  const heroImage = '/src/assets/images/hero_mumbai_luxury_home_1793260661654.jpg';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(city, transactionType, bhk);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-[#F8F5EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Split: Editorial Headline + Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Headline and Positioning */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#174D3B] bg-[#174D3B]/10 px-3 py-1.5 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#C96F4A]" />
              <span>India's 1st Multi-Broker Comparison Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#174D3B] tracking-tight leading-[1.1] text-balance">
              Find Your Place in the City.
            </h1>

            <p className="text-base sm:text-lg text-[#747A75] leading-relaxed max-w-xl">
              Discover verified property listings across Indian metros, compare multiple broker offers on the same canonical residence, and eliminate hidden commissions with full transparency.
            </p>

            {/* Quick value proposition metrics */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#252A28]/10 text-xs">
              <div>
                <strong className="block text-lg font-bold font-serif text-[#174D3B]">100%</strong>
                <span className="text-[#747A75]">RERA Verified Listings</span>
              </div>
              <div>
                <strong className="block text-lg font-bold font-serif text-[#174D3B]">3+ Offers</strong>
                <span className="text-[#747A75]">Per Canonical Home</span>
              </div>
              <div>
                <strong className="block text-lg font-bold font-serif text-[#C96F4A]">0 Hidden</strong>
                <span className="text-[#747A75]">Disclosed Outlay</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-6 relative h-[380px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-[#252A28]/10 group">
            <img
              src={heroImage}
              alt="Luxury residence overlooking Mumbai skyline and sea"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Visual Contrast Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#D5B477] uppercase tracking-wider block">
                    Featured Canonical Residence
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white">
                    The Solitaire Skyline, Bandra West
                  </h3>
                  <p className="text-xs text-white/80">
                    3 BHK Sea View · 3 Competing Broker Deals from ₹2.15L/mo
                  </p>
                </div>
                <button
                  onClick={onExploreMap}
                  className="px-3.5 py-2 bg-white text-[#174D3B] rounded-lg text-xs font-bold hover:bg-[#F8F5EE] transition-colors flex items-center gap-1 shadow-lg shrink-0"
                >
                  <span>Explore Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Search Widget */}
        <div className="mt-8 lg:-mt-10 relative z-30 bg-white rounded-2xl shadow-xl border border-[#252A28]/15 p-5 sm:p-7">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Segmented Buy / Rent Switch */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252A28]/10">
              <div className="flex p-1 bg-[#F3EFE6] rounded-lg border border-[#252A28]/10">
                <button
                  type="button"
                  onClick={() => setTransactionType('rent')}
                  className={`px-5 py-2 text-xs font-bold rounded-md transition-all ${
                    transactionType === 'rent'
                      ? 'bg-[#174D3B] text-white shadow-xs'
                      : 'text-[#252A28] hover:text-[#174D3B]'
                  }`}
                >
                  Rent a Home
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('buy')}
                  className={`px-5 py-2 text-xs font-bold rounded-md transition-all ${
                    transactionType === 'buy'
                      ? 'bg-[#174D3B] text-white shadow-xs'
                      : 'text-[#252A28] hover:text-[#174D3B]'
                  }`}
                >
                  Buy a Property
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-[#747A75]">
                <span className="w-2 h-2 rounded-full bg-[#174D3B]" />
                <span>Persistent in LocalStorage · No Database Needed</span>
              </div>
            </div>

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#252A28] mb-1.5">
                  Select Metro
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#252A28]/15 rounded-lg text-sm text-[#252A28] font-medium focus:ring-2 focus:ring-[#174D3B] focus:bg-white"
                >
                  <option value="Mumbai">Mumbai (Bandra, Worli, Juhu, Powai)</option>
                  <option value="Thane">Thane (Hiranandani Estate, Majiwada, Vasant Vihar)</option>
                  <option value="Bengaluru">Bengaluru (Indiranagar, Koramangala)</option>
                  <option value="Delhi NCR">Delhi NCR (Gurgaon DLF 5, South Ex)</option>
                  <option value="Pune">Pune (Koregaon Park, Kalyani Nagar)</option>
                  <option value="Hyderabad">Hyderabad (Jubilee Hills, Gachibowli)</option>
                </select>
              </div>

              {/* Bedrooms (BHK) */}
              <div>
                <label className="block text-xs font-semibold text-[#252A28] mb-1.5">
                  Bedrooms (BHK)
                </label>
                <select
                  value={String(bhk)}
                  onChange={(e) => setBhk(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#252A28]/15 rounded-lg text-sm text-[#252A28] font-medium focus:ring-2 focus:ring-[#174D3B] focus:bg-white"
                >
                  <option value="all">Any BHK Configuration</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK Luxury</option>
                </select>
              </div>

              {/* Action 1: Search Listings */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#174D3B] hover:bg-[#0F3528] text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>

              {/* Action 2: Open Map with Searching Tab */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={onExploreMap}
                  className="w-full py-2.5 px-4 bg-[#C96F4A] hover:bg-[#b05f3d] text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore on Map</span>
                </button>
              </div>
            </div>

            {/* Urban Afford Value Highlight Banner */}
            <div className="pt-3 border-t border-[#252A28]/10 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#F8F5EE]/60 p-3 rounded-xl border border-emerald-200/60">
              <div className="flex items-center gap-2.5">
                <span className="bg-emerald-700 text-white font-bold px-2.5 py-0.5 rounded text-[10px] tracking-wide">
                  🌿 URBAN AFFORD
                </span>
                <span className="text-[#252A28] font-medium">
                  Verified budget-friendly rentals under ₹45K/mo & starter homes with capped 2-3 mo deposits.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTransactionType('rent');
                  onSearch('Thane', 'rent', 'all');
                }}
                className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 hover:underline"
              >
                <span>Explore Affordable Listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
