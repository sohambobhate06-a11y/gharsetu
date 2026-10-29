import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  AlertCircle,
  TrendingDown,
  Phone,
  Mail,
  Calendar,
  Building,
  Award,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Property, BrokerOffer } from '../types';
import { formatINR, calculateInitialCost, saveOffer, isUrbanAfford, getUrbanAffordMetrics } from '../services/storage';

interface CompareOffersModalProps {
  property: Property;
  onClose: () => void;
  onEnquire: (property: Property, offer: BrokerOffer) => void;
  onBookViewing: (property: Property, offer: BrokerOffer) => void;
  onOfferAdded?: () => void;
}

export const CompareOffersModal: React.FC<CompareOffersModalProps> = ({
  property,
  onClose,
  onEnquire,
  onBookViewing,
  onOfferAdded,
}) => {
  const [showAddOfferForm, setShowAddOfferForm] = useState(false);
  const [newOffer, setNewOffer] = useState({
    brokerName: '',
    brokerAgency: '',
    brokerPhone: '',
    brokerEmail: '',
    brokerReraId: '',
    priceOrRent: property.transactionType === 'rent' ? 200000 : 70000000,
    depositAmount: property.transactionType === 'rent' ? 600000 : 0,
    brokerageType: 'fixed' as 'fixed' | 'percentage',
    brokerageValue: property.transactionType === 'rent' ? 100000 : 1.0,
    negotiable: true,
    availability: 'Immediate' as BrokerOffer['availability'],
    specialConditions: '',
  });

  const offers = property.offers || [];

  // Sort offers by headline price ascending
  const sortedOffers = [...offers].sort((a, b) => {
    const priceA = property.transactionType === 'rent' ? a.rentAmount || 0 : a.salePrice || 0;
    const priceB = property.transactionType === 'rent' ? b.rentAmount || 0 : b.salePrice || 0;
    return priceA - priceB;
  });

  const lowestOfferPrice = sortedOffers[0]
    ? property.transactionType === 'rent'
      ? sortedOffers[0].rentAmount || 0
      : sortedOffers[0].salePrice || 0
    : 0;

  const highestOfferPrice = sortedOffers[sortedOffers.length - 1]
    ? property.transactionType === 'rent'
      ? sortedOffers[sortedOffers.length - 1].rentAmount || 0
      : sortedOffers[sortedOffers.length - 1].salePrice || 0
    : 0;

  const priceVariance = highestOfferPrice - lowestOfferPrice;

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.brokerName || !newOffer.brokerAgency || !newOffer.brokerPhone) return;

    saveOffer({
      propertyId: property.id,
      brokerId: `broker-${Date.now()}`,
      brokerName: newOffer.brokerName,
      brokerAgency: newOffer.brokerAgency,
      brokerPhone: newOffer.brokerPhone,
      brokerEmail: newOffer.brokerEmail || `${newOffer.brokerName.toLowerCase().replace(/\s+/g, '')}@realty.in`,
      brokerRating: 4.8,
      brokerReraId: newOffer.brokerReraId || 'A51900088991',
      isVerifiedBroker: true,
      transactionType: property.transactionType,
      rentAmount: property.transactionType === 'rent' ? newOffer.priceOrRent : undefined,
      salePrice: property.transactionType === 'buy' ? newOffer.priceOrRent : undefined,
      depositAmount: newOffer.depositAmount,
      brokerageType: newOffer.brokerageType,
      brokerageValue: Number(newOffer.brokerageValue),
      maintenanceChargesMonthly: 10000,
      negotiable: newOffer.negotiable,
      availability: newOffer.availability,
      specialConditions: newOffer.specialConditions || 'Verified owner agreement with immediate possession',
    });

    setShowAddOfferForm(false);
    if (onOfferAdded) onOfferAdded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#252A28]/15 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#174D3B] text-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#D5B477] font-medium tracking-wide mb-1">
                <span>CANONICAL PROPERTY RECORD</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{property.canonicalKey}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                {property.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1.5">
                <span>{property.address}, {property.locality}, {property.city}</span>
                <span aria-hidden="true">·</span>
                <span>{property.bedroomCount} BHK</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{property.carpetArea} sq.ft Carpet</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Differentiator Banner */}
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D5B477]" />
              <span className="font-medium text-white/95">
                {offers.length} RERA-registered brokers represent this verified property.
              </span>
            </div>
            {isUrbanAfford(property) && (
              <div className="bg-emerald-600/90 text-white px-3 py-1 rounded-md font-bold text-xs flex items-center gap-1.5 shadow-xs">
                <span>🌿 Verified Urban Afford Home</span>
              </div>
            )}
            {priceVariance > 0 && (
              <div className="bg-white/15 px-3 py-1 rounded-md text-[#F8F5EE] font-semibold flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-[#D5B477]" />
                <span>Save up to {formatINR(priceVariance)} through transparent comparison</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedOffers.map((offer, index) => {
              const costBreakdown = calculateInitialCost(offer);
              const isBestPrice = index === 0;

              return (
                <div
                  key={offer.id}
                  className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all ${
                    isBestPrice
                      ? 'border-[#174D3B] bg-[#F8F5EE]/60 shadow-sm ring-1 ring-[#174D3B]'
                      : 'border-[#252A28]/15 bg-white hover:border-[#252A28]/30'
                  }`}
                >
                  {isBestPrice && (
                    <div className="absolute -top-3 left-4 bg-[#174D3B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D5B477]" />
                      <span>Lowest Quoted Rate</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Broker Profile Header */}
                    <div className="border-b border-[#252A28]/10 pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#252A28]">
                            {offer.brokerName}
                          </h4>
                          <span className="text-xs text-[#747A75] block">
                            {offer.brokerAgency}
                          </span>
                        </div>
                        {offer.isVerifiedBroker && (
                          <div className="flex items-center gap-1 text-[11px] text-[#174D3B] font-semibold" title="RERA Verified Broker">
                            <ShieldCheck className="w-4 h-4 text-[#174D3B]" />
                            <span>RERA</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-[#747A75] font-mono mt-1">
                        RERA: {offer.brokerReraId}
                      </div>
                    </div>

                    {/* Headline Price & Brokerage */}
                    <div className="bg-white rounded-lg border border-[#252A28]/10 p-3 space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-[#747A75]">
                          {offer.transactionType === 'rent' ? 'Monthly Rent' : 'Sale Price'}
                        </span>
                        <span className="text-lg font-bold text-[#174D3B] font-mono-num">
                          {formatINR(offer.transactionType === 'rent' ? offer.rentAmount : offer.salePrice)}
                          {offer.transactionType === 'rent' && (
                            <span className="text-xs font-normal text-[#747A75]">/mo</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-[#747A75]">Brokerage Fee</span>
                        <span className="font-mono-num font-semibold text-[#252A28]">
                          {offer.brokerageType === 'fixed'
                            ? `${formatINR(offer.brokerageValue)} (Fixed)`
                            : `${offer.brokerageValue}% (${formatINR(costBreakdown.brokerageFee)})`}
                        </span>
                      </div>

                      {offer.transactionType === 'rent' && offer.depositAmount && (
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-[#747A75]">Security Deposit</span>
                          <span className="font-mono-num font-medium text-[#252A28]">
                            {formatINR(offer.depositAmount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Disclosed Transparent Initial Outlay */}
                    <div className="rounded-lg bg-[#F3EFE6] p-3 text-xs space-y-1 border border-[#252A28]/10">
                      <div className="flex items-center justify-between text-[#747A75]">
                        <span className="flex items-center gap-1">
                          <Info className="w-3 h-3 text-[#174D3B]" />
                          Estimated Upfront Capital:
                        </span>
                        <strong className="text-[#252A28] font-mono-num text-sm">
                          {formatINR(costBreakdown.totalInitialOutlay)}
                        </strong>
                      </div>
                      <div className="text-[10px] text-[#747A75] leading-snug">
                        {costBreakdown.isRental
                          ? 'Includes 1st mo. rent + refundable deposit + agency commission + maintenance.'
                          : 'Includes 10% token deposit + disclosed agency fee.'}
                      </div>
                    </div>

                    {/* Terms & Availability */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#747A75]">Availability</span>
                        <span className="font-medium text-[#174D3B]">{offer.availability}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#747A75]">Price Flexibility</span>
                        <span className={`font-medium ${offer.negotiable ? 'text-[#174D3B]' : 'text-[#747A75]'}`}>
                          {offer.negotiable ? 'Open to Negotiation' : 'Fixed Quoted Rate'}
                        </span>
                      </div>
                      {offer.specialConditions && (
                        <div className="p-2 rounded bg-[#F8F5EE] text-[11px] text-[#252A28] italic border border-[#252A28]/5">
                          "{offer.specialConditions}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this broker offer */}
                  <div className="mt-5 pt-4 border-t border-[#252A28]/10 space-y-2">
                    <button
                      onClick={() => onEnquire(property, offer)}
                      className="w-full py-2 bg-[#174D3B] text-white rounded-lg text-xs font-semibold hover:bg-[#0F3528] transition-colors shadow-xs"
                    >
                      Enquire with {offer.brokerName.split(' ')[0]}
                    </button>
                    <button
                      onClick={() => onBookViewing(property, offer)}
                      className="w-full py-1.5 border border-[#252A28]/20 text-[#252A28] rounded-lg text-xs font-semibold hover:border-[#174D3B] hover:text-[#174D3B] transition-colors"
                    >
                      Schedule Site Visit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Broker Offer Collapsible Section */}
          <div className="border-t border-[#252A28]/10 pt-5">
            {!showAddOfferForm ? (
              <div className="flex items-center justify-between bg-[#F8F5EE] p-4 rounded-xl border border-[#252A28]/10">
                <div>
                  <h4 className="text-sm font-semibold text-[#252A28]">
                    Are you an authorized broker for this property?
                  </h4>
                  <p className="text-xs text-[#747A75]">
                    Link your exclusive mandate or competitive deal directly to this canonical listing.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddOfferForm(true)}
                  className="px-3.5 py-2 bg-white border border-[#174D3B] text-[#174D3B] font-semibold text-xs rounded-lg hover:bg-[#174D3B] hover:text-white transition-colors"
                >
                  Submit Broker Deal
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateOffer} className="bg-[#F8F5EE] p-5 rounded-xl border border-[#252A28]/15 space-y-4">
                <div className="flex items-center justify-between border-b border-[#252A28]/10 pb-3">
                  <h4 className="text-sm font-bold text-[#174D3B]">
                    Submit New Offer for Canonical Property
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddOfferForm(false)}
                    className="text-xs text-[#747A75] hover:text-[#252A28]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-[#252A28] mb-1">Broker Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kulkarni"
                      value={newOffer.brokerName}
                      onChange={(e) => setNewOffer({ ...newOffer, brokerName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md focus:ring-1 focus:ring-[#174D3B]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#252A28] mb-1">Agency Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Skyline Premier Realty"
                      value={newOffer.brokerAgency}
                      onChange={(e) => setNewOffer({ ...newOffer, brokerAgency: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md focus:ring-1 focus:ring-[#174D3B]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#252A28] mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98XXX XXXXX"
                      value={newOffer.brokerPhone}
                      onChange={(e) => setNewOffer({ ...newOffer, brokerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md focus:ring-1 focus:ring-[#174D3B]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#252A28] mb-1">Broker RERA ID</label>
                    <input
                      type="text"
                      placeholder="e.g. A51900019280"
                      value={newOffer.brokerReraId}
                      onChange={(e) => setNewOffer({ ...newOffer, brokerReraId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md focus:ring-1 focus:ring-[#174D3B]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#252A28] mb-1">
                      {property.transactionType === 'rent' ? 'Monthly Rent (INR)' : 'Sale Price (INR)'}
                    </label>
                    <input
                      type="number"
                      required
                      value={newOffer.priceOrRent}
                      onChange={(e) => setNewOffer({ ...newOffer, priceOrRent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md focus:ring-1 focus:ring-[#174D3B]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#252A28] mb-1">Security Deposit (INR)</label>
                    <input
                      type="number"
                      value={newOffer.depositAmount}
                      onChange={(e) => setNewOffer({ ...newOffer, depositAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md focus:ring-1 focus:ring-[#174D3B]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#252A28] mb-1">Brokerage Fee Structure</label>
                    <div className="flex gap-2">
                      <select
                        value={newOffer.brokerageType}
                        onChange={(e) => setNewOffer({ ...newOffer, brokerageType: e.target.value as any })}
                        className="px-2 py-2 bg-white border border-[#252A28]/15 rounded-md text-xs"
                      >
                        <option value="fixed">Fixed INR</option>
                        <option value="percentage">% Percentage</option>
                      </select>
                      <input
                        type="number"
                        value={newOffer.brokerageValue}
                        onChange={(e) => setNewOffer({ ...newOffer, brokerageValue: Number(e.target.value) })}
                        placeholder={newOffer.brokerageType === 'fixed' ? 'Amount (e.g. 50000)' : 'Percent (e.g. 1)'}
                        className="flex-1 px-3 py-2 bg-white border border-[#252A28]/15 rounded-md focus:ring-1 focus:ring-[#174D3B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-[#252A28] mb-1">Availability</label>
                    <select
                      value={newOffer.availability}
                      onChange={(e) => setNewOffer({ ...newOffer, availability: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md text-xs"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="Within 15 Days">Within 15 Days</option>
                      <option value="Within 30 Days">Within 30 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#252A28] text-xs mb-1">
                    Special Inclusions or Disclosed Perks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 year maintenance included, high floor parking bay guarantee"
                    value={newOffer.specialConditions}
                    onChange={(e) => setNewOffer({ ...newOffer, specialConditions: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md text-xs focus:ring-1 focus:ring-[#174D3B]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddOfferForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#747A75]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#174D3B] text-white rounded-lg text-xs font-semibold hover:bg-[#0F3528] transition-colors"
                  >
                    Publish Offer to LocalStorage
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8F5EE] px-6 py-4 border-t border-[#252A28]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#747A75]">
          <span>
            Every broker deal is stored in your browser's persistent LocalStorage engine.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#252A28]/20 bg-white rounded-lg text-[#252A28] font-semibold hover:bg-[#F3EFE6]"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
