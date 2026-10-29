import React, { useState } from 'react';
import {
  X,
  MapPin,
  Bookmark,
  Share2,
  ShieldCheck,
  Check,
  Calendar,
  CloudSun,
  Layers,
  Car,
  Compass,
  ArrowUpRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Property, BrokerOffer } from '../types';
import { formatINR, toggleSaveProperty, getSavedPropertyIds, calculateInitialCost, isUrbanAfford } from '../services/storage';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  onCompareOffers: (property: Property) => void;
  onEnquire: (property: Property, offer: BrokerOffer) => void;
  onBookViewing: (property: Property, offer: BrokerOffer) => void;
}

// Weather metadata mapping for Indian metros
const CITY_WEATHER: Record<string, { temp: number; condition: string; aqi: number; humidity: number }> = {
  Mumbai: { temp: 31, condition: 'Hazy Sunshine / Coastal Breeze', aqi: 112, humidity: 72 },
  Bengaluru: { temp: 24, condition: 'Pleasant & Partly Cloudy', aqi: 48, humidity: 55 },
  'Delhi NCR': { temp: 28, condition: 'Mild Autumn Fog', aqi: 185, humidity: 45 },
  Pune: { temp: 26, condition: 'Clear Breeze', aqi: 68, humidity: 50 },
  Hyderabad: { temp: 29, condition: 'Sunny & Warm', aqi: 75, humidity: 48 },
};

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  onClose,
  onCompareOffers,
  onEnquire,
  onBookViewing,
}) => {
  const [selectedImage, setSelectedImage] = useState(property.coverImage);
  const [savedIds, setSavedIds] = useState<string[]>(getSavedPropertyIds());
  const isSaved = savedIds.includes(property.id);

  const weather = CITY_WEATHER[property.city] || {
    temp: 28,
    condition: 'Pleasant Sky',
    aqi: 70,
    humidity: 50,
  };

  const handleToggleBookmark = () => {
    toggleSaveProperty(property.id);
    setSavedIds(getSavedPropertyIds());
  };

  const offers = property.offers || [];
  const lowestOffer = offers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#252A28]/15 overflow-hidden my-6">
        {/* Header bar */}
        <div className="p-4 sm:px-6 border-b border-[#252A28]/10 flex items-center justify-between bg-[#F8F5EE]/80">
          <div className="flex items-center gap-2 text-xs text-[#747A75]">
            <span className="font-semibold text-[#174D3B]">Canonical Residence</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">{property.canonicalKey}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-[#C96F4A] border-[#C96F4A] text-white'
                  : 'bg-white border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved in LocalStorage' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white border border-[#252A28]/15 hover:bg-[#F3EFE6] text-[#252A28] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 max-h-[75vh] overflow-y-auto space-y-7">
          {/* Main Visual Gallery Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 relative h-72 sm:h-96 rounded-xl overflow-hidden bg-[#F3EFE6] shadow-inner">
              <img
                src={selectedImage}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />
              {property.isVerified && (
                <div className="absolute top-3 left-3 bg-[#174D3B] text-white text-xs font-bold px-3 py-1 rounded-md shadow-md flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D5B477]" />
                  <span>Title & Physical Inspection Verified</span>
                </div>
              )}
              {isUrbanAfford(property) && (
                <div className="absolute top-3 right-3 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md flex items-center gap-1.5">
                  <span>🌿 Urban Afford Pick</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative flex-1 lg:h-[118px] rounded-lg overflow-hidden border-2 transition-all shrink-0 w-24 lg:w-full ${
                    selectedImage === img
                      ? 'border-[#174D3B] shadow-sm'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title, Address & Core Headline Box */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#252A28]/10 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[#747A75]">
                <MapPin className="w-3.5 h-3.5 text-[#C96F4A]" />
                <span>{property.address}, {property.locality}, {property.city}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252A28]">
                {property.title}
              </h1>
              <p className="text-xs text-[#747A75] max-w-2xl leading-relaxed pt-1">
                {property.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-[#F8F5EE] border border-[#252A28]/10 rounded-xl p-4 shrink-0 min-w-[240px] text-right">
              <span className="text-xs text-[#747A75] block">Lowest Quoted Offer</span>
              <div className="text-2xl font-serif font-bold text-[#174D3B] font-mono-num">
                {formatINR(
                  property.transactionType === 'rent'
                    ? lowestOffer?.rentAmount
                    : lowestOffer?.salePrice
                )}
                {property.transactionType === 'rent' && (
                  <span className="text-sm font-sans font-normal text-[#747A75]">/month</span>
                )}
              </div>
              <div className="text-xs text-[#C96F4A] font-semibold mt-1">
                {offers.length} Broker Offers Available
              </div>
            </div>
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F8F5EE] p-3.5 rounded-xl border border-[#252A28]/10">
              <span className="text-[11px] text-[#747A75] block">Configuration</span>
              <strong className="text-sm font-semibold text-[#252A28]">
                {property.bedroomCount} BHK · {property.bathroomCount} Baths
              </strong>
            </div>
            <div className="bg-[#F8F5EE] p-3.5 rounded-xl border border-[#252A28]/10">
              <span className="text-[11px] text-[#747A75] block">Carpet Area</span>
              <strong className="text-sm font-mono-num font-semibold text-[#252A28]">
                {property.carpetArea} sq.ft
              </strong>
            </div>
            <div className="bg-[#F8F5EE] p-3.5 rounded-xl border border-[#252A28]/10">
              <span className="text-[11px] text-[#747A75] block">Floor & Aspect</span>
              <strong className="text-sm font-semibold text-[#252A28]">
                Floor {property.floorNumber} of {property.totalFloors}
              </strong>
            </div>
            <div className="bg-[#F8F5EE] p-3.5 rounded-xl border border-[#252A28]/10">
              <span className="text-[11px] text-[#747A75] block">Furnishing & Parking</span>
              <strong className="text-sm font-semibold text-[#252A28] capitalize">
                {property.furnishing.replace('-', ' ')}
              </strong>
            </div>
          </div>

          {/* Neighborhood Microclimate & Weather Widget (OpenWeather ready) */}
          <div className="bg-gradient-to-r from-[#174D3B]/5 via-[#F8F5EE] to-[#F3EFE6] border border-[#252A28]/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#174D3B] text-white flex items-center justify-center">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#252A28]">
                    {property.locality} Locality Microclimate
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#252A28]/10 text-[#747A75]">
                    Live Telemetry
                  </span>
                </div>
                <span className="text-xs text-[#747A75]">
                  {weather.condition} · {weather.temp}°C · Humidity {weather.humidity}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div>
                <span className="text-[#747A75] block text-[10px]">Air Quality Index (AQI)</span>
                <span className="text-[#174D3B] font-mono-num font-bold">{weather.aqi} AQI (Good)</span>
              </div>
              <div>
                <span className="text-[#747A75] block text-[10px]">Geo Coordinates</span>
                <span className="font-mono text-[#252A28]">{property.lat.toFixed(4)}, {property.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-sm font-bold text-[#252A28] mb-3">
              Features & Society Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {property.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-[#252A28]/10 text-xs text-[#252A28]"
                >
                  <Check className="w-3.5 h-3.5 text-[#174D3B] shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Broker Deals Section */}
          <div className="border-t border-[#252A28]/10 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#174D3B]">
                  Linked Broker Offers ({offers.length})
                </h3>
                <p className="text-xs text-[#747A75]">
                  Compare brokerage fees, deposits, and initial outlays for this exact property.
                </p>
              </div>
              <button
                onClick={() => onCompareOffers(property)}
                className="px-4 py-2 bg-[#174D3B] text-white rounded-lg text-xs font-semibold hover:bg-[#0F3528] transition-colors"
              >
                Side-by-Side Comparison Matrix
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((offer) => {
                const cost = calculateInitialCost(offer);
                return (
                  <div
                    key={offer.id}
                    className="p-4 rounded-xl border border-[#252A28]/15 bg-white space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-sm font-bold text-[#252A28]">
                          {offer.brokerName}
                        </strong>
                        <span className="text-xs text-[#747A75] block">
                          {offer.brokerAgency}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#174D3B] font-mono-num">
                        {formatINR(offer.transactionType === 'rent' ? offer.rentAmount : offer.salePrice)}
                        {offer.transactionType === 'rent' ? '/mo' : ''}
                      </span>
                    </div>

                    <div className="text-xs text-[#747A75] grid grid-cols-2 gap-2 bg-[#F8F5EE] p-2.5 rounded-lg">
                      <div>
                        <span>Brokerage: </span>
                        <strong className="text-[#252A28]">
                          {offer.brokerageType === 'fixed'
                            ? formatINR(offer.brokerageValue)
                            : `${offer.brokerageValue}%`}
                        </strong>
                      </div>
                      <div>
                        <span>Deposit: </span>
                        <strong className="text-[#252A28]">
                          {formatINR(offer.depositAmount || 0)}
                        </strong>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onEnquire(property, offer)}
                        className="flex-1 py-1.5 bg-[#174D3B] text-white rounded-md text-xs font-semibold hover:bg-[#0F3528]"
                      >
                        Enquire
                      </button>
                      <button
                        onClick={() => onBookViewing(property, offer)}
                        className="flex-1 py-1.5 border border-[#252A28]/20 text-[#252A28] rounded-md text-xs font-semibold hover:border-[#174D3B]"
                      >
                        Book Visit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
