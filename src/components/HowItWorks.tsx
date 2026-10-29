import React from 'react';
import { Layers, ShieldCheck, Scale, CheckCircle2, TrendingDown, Users } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 bg-[#F3EFE6] border-y border-[#252A28]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold text-[#C96F4A] uppercase tracking-wider">
            Architecture of Transparency
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#174D3B]">
            How GharSetu Solves the Indian Real Estate Dilemma
          </h2>
          <p className="text-sm text-[#747A75]">
            In traditional portals, 10 brokers upload the same flat 10 times with fake prices and duplicate photos. GharSetu creates one verified canonical listing and invites licensed brokers to compete openly on pricing and brokerage terms.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-7 border border-[#252A28]/10 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#174D3B]/10 text-[#174D3B] flex items-center justify-center font-serif text-xl font-bold">
              01
            </div>
            <h3 className="text-lg font-bold text-[#252A28]">
              One Canonical Record
            </h3>
            <p className="text-xs text-[#747A75] leading-relaxed">
              Every real apartment or villa receives a single canonical ID (e.g. Pali Hill #402). Zero duplicate spam listings cluttering your search.
            </p>
            <div className="pt-2 text-xs font-medium text-[#174D3B] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Title & RERA verified</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-7 border border-[#252A28]/10 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#C96F4A]/10 text-[#C96F4A] flex items-center justify-center font-serif text-xl font-bold">
              02
            </div>
            <h3 className="text-lg font-bold text-[#252A28]">
              Multiple Competing Offers
            </h3>
            <p className="text-xs text-[#747A75] leading-relaxed">
              Authorized licensed brokers link their best offers to the property. Compare monthly rents, security deposits, and brokerage commissions side-by-side.
            </p>
            <div className="pt-2 text-xs font-medium text-[#C96F4A] flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>No hidden brokerage fees</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-7 border border-[#252A28]/10 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#D5B477]/20 text-[#252A28] flex items-center justify-center font-serif text-xl font-bold">
              03
            </div>
            <h3 className="text-lg font-bold text-[#252A28]">
              Disclosed Initial Outlay
            </h3>
            <p className="text-xs text-[#747A75] leading-relaxed">
              Calculate total upfront cash needed before scheduling a visit: 1st month rent + deposit + brokerage + maintenance fee clearly calculated.
            </p>
            <div className="pt-2 text-xs font-medium text-[#252A28] flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-[#174D3B]" />
              <span>Save 20% to 50% on brokerage</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
