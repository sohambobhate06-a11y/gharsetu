import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  Search,
  Filter,
  MapPin,
  Bookmark,
  Share2,
  CheckCircle2,
  Navigation,
  SlidersHorizontal,
  X,
  ExternalLink,
  Layers,
  ChevronRight,
  TrendingDown,
  Building,
} from 'lucide-react';
import { Property, TransactionType } from '../types';
import { formatINR, toggleSaveProperty, getSavedPropertyIds } from '../services/storage';

interface MapSearchProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onCompareOffers: (property: Property) => void;
  initialCity?: string;
  initialType?: TransactionType;
}

const CITIES = [
  { name: 'All Metros', lat: 19.076, lng: 72.8777, zoom: 5 },
  { name: 'Mumbai', lat: 19.0596, lng: 72.8295, zoom: 12 },
  { name: 'Bengaluru', lat: 12.9784, lng: 77.6408, zoom: 12 },
  { name: 'Delhi NCR', lat: 28.4595, lng: 77.0988, zoom: 12 },
  { name: 'Pune', lat: 18.5362, lng: 73.8958, zoom: 13 },
  { name: 'Hyderabad', lat: 17.4319, lng: 78.4073, zoom: 12 },
];

export const MapSearch: React.FC<MapSearchProps> = ({
  properties,
  onSelectProperty,
  onCompareOffers,
  initialCity = 'All Metros',
  initialType = 'rent',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>(initialType);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedBhk, setSelectedBhk] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(transactionType === 'rent' ? 300000 : 100000000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(getSavedPropertyIds());
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Sync budget slider bounds when switching Buy / Rent
  const handleTransactionChange = (type: TransactionType) => {
    setTransactionType(type);
    if (type === 'rent') {
      setMaxBudget(250000);
    } else {
      setMaxBudget(80000000); // ₹8 Cr
    }
  };

  // Filter properties based on current tab inputs
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Transaction type match
      if (prop.transactionType !== transactionType) return false;

      // City filter
      if (selectedCity !== 'All Metros' && prop.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Search query (matches title, locality, address)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(query);
        const matchLoc = prop.locality.toLowerCase().includes(query);
        const matchCity = prop.city.toLowerCase().includes(query);
        const matchAddr = prop.address.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchCity && !matchAddr) return false;
      }

      // BHK match
      if (selectedBhk !== 'all') {
        if (selectedBhk === 4) {
          if (prop.bedroomCount < 4) return false;
        } else if (prop.bedroomCount !== selectedBhk) {
          return false;
        }
      }

      // Property type
      if (selectedType !== 'all' && prop.propertyType !== selectedType) {
        return false;
      }

      // Verified only
      if (verifiedOnly && !prop.isVerified) return false;

      // Budget check using lowest broker offer price
      const bestOffer = prop.offers?.[0];
      if (bestOffer) {
        const price = transactionType === 'rent' ? bestOffer.rentAmount : bestOffer.salePrice;
        if (price && price > maxBudget) return false;
      }

      return true;
    });
  }, [properties, transactionType, selectedCity, searchQuery, selectedBhk, selectedType, verifiedOnly, maxBudget]);

  const activeProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  // Handle bookmarking to localStorage
  const handleToggleSave = (propId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleSaveProperty(propId);
    setSavedIds(getSavedPropertyIds());
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCoords: [number, number] = [19.0596, 72.8295]; // Default Bandra/Mumbai
      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: 12,
        zoomControl: false,
      });

      // CartoDB Voyager tiles - high aesthetic, clean cartography
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when filtered properties change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredProperties.forEach((prop) => {
      // Find lowest offer price to show on map pin
      const offers = prop.offers || [];
      const lowestOffer = offers[0];
      let displayPrice = '';

      if (prop.transactionType === 'rent') {
        const minRent = offers.length > 0 ? Math.min(...offers.map((o) => o.rentAmount || 0)) : 100000;
        displayPrice = `₹${(minRent / 1000).toFixed(0)}k/m`;
      } else {
        const minSale = offers.length > 0 ? Math.min(...offers.map((o) => o.salePrice || 0)) : 50000000;
        displayPrice = formatINR(minSale);
      }

      const isSelected = selectedPropertyId === prop.id;
      const isSale = prop.transactionType === 'buy';

      const customIcon = L.divIcon({
        className: 'ghar-map-pin-container',
        html: `
          <div class="ghar-map-pin ${isSale ? 'sale-pin' : ''} ${isSelected ? 'active-pin' : ''}" style="display:flex; align-items:center; gap:4px;">
            <span>${displayPrice}</span>
            ${offers.length > 1 ? `<span style="font-size:10px; opacity:0.85;">(${offers.length})</span>` : ''}
          </div>
        `,
        iconSize: [80, 32],
        iconAnchor: [40, 16],
      });

      const marker = L.marker([prop.lat, prop.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedPropertyId(prop.id);
        map.flyTo([prop.lat, prop.lng], 14, { duration: 0.8 });
      });

      marker.addTo(markersGroup);
    });

    // Pan map to fit markers if there are properties
    if (filteredProperties.length > 0 && map) {
      const bounds = L.latLngBounds(filteredProperties.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [filteredProperties, selectedPropertyId]);

  // Handle City Change
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    const target = CITIES.find((c) => c.name === cityName);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1 });
    }
  };

  // Handle Current Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationToast('Geolocation is not supported by your browser.');
      setTimeout(() => setLocationToast(null), 3500);
      return;
    }

    setLocationToast('Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.2 });
          setLocationToast('Centered on your current location');
          setTimeout(() => setLocationToast(null), 3000);
        }
      },
      (err) => {
        setLocationToast(`Location permission denied. Showing selected metro.`);
        setTimeout(() => setLocationToast(null), 3500);
      }
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden bg-[#F8F5EE]">
      {/* Toast Notification */}
      {locationToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#252A28] text-white px-4 py-2 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#D5B477]" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* LEFT PANE: Dedicated Searching Tab & Filter Explorer */}
      <div className="w-full lg:w-[460px] xl:w-[500px] h-full flex flex-col bg-white border-r border-[#252A28]/10 z-20 shrink-0 shadow-md">
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]/60 space-y-3">
          {/* Buy / Rent Segmented Switch */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex p-1 bg-[#F3EFE6] rounded-lg border border-[#252A28]/10">
              <button
                onClick={() => handleTransactionChange('rent')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  transactionType === 'rent'
                    ? 'bg-[#174D3B] text-white shadow-xs'
                    : 'text-[#252A28] hover:text-[#174D3B]'
                }`}
              >
                Rent
              </button>
              <button
                onClick={() => handleTransactionChange('buy')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  transactionType === 'buy'
                    ? 'bg-[#174D3B] text-white shadow-xs'
                    : 'text-[#252A28] hover:text-[#174D3B]'
                }`}
              >
                Buy
              </button>
            </div>

            {/* Quick Filter Drawer Toggle */}
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isFilterDrawerOpen
                  ? 'bg-[#174D3B] text-white border-[#174D3B]'
                  : 'bg-white border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#747A75] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Bandra, Indiranagar, DLF Phase 5..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#252A28]/15 rounded-lg text-sm text-[#252A28] placeholder-[#747A75]/80 focus:outline-none focus:ring-2 focus:ring-[#174D3B] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747A75] hover:text-[#252A28]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* City Chips Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city.name)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
                  selectedCity === city.name
                    ? 'bg-[#174D3B] text-white shadow-xs'
                    : 'bg-white border border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* Collapsible Advanced Filters Drawer */}
          {isFilterDrawerOpen && (
            <div className="pt-3 border-t border-[#252A28]/10 space-y-4 animate-fadeIn">
              {/* Bedroom Selection */}
              <div>
                <label className="text-xs font-semibold text-[#252A28] block mb-1.5">
                  Bedrooms (BHK)
                </label>
                <div className="flex gap-1.5">
                  {(['all', 1, 2, 3, 4] as const).map((bhk) => (
                    <button
                      key={String(bhk)}
                      onClick={() => setSelectedBhk(bhk)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                        selectedBhk === bhk
                          ? 'bg-[#174D3B] text-white border-[#174D3B]'
                          : 'bg-white border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
                      }`}
                    >
                      {bhk === 'all' ? 'Any' : `${bhk} BHK${bhk === 4 ? '+' : ''}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type Selection */}
              <div>
                <label className="text-xs font-semibold text-[#252A28] block mb-1.5">
                  Property Type
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'apartment', label: 'Apartment' },
                    { id: 'villa', label: 'Villa' },
                    { id: 'penthouse', label: 'Penthouse' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`py-1.5 px-2 text-center rounded border font-medium truncate ${
                        selectedType === t.id
                          ? 'bg-[#174D3B] text-white border-[#174D3B]'
                          : 'bg-white border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Budget Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#252A28] mb-1">
                  <span>Max Budget</span>
                  <span className="font-mono-num text-[#174D3B] font-bold">
                    {formatINR(maxBudget)}
                    {transactionType === 'rent' ? '/month' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={transactionType === 'rent' ? 30000 : 10000000}
                  max={transactionType === 'rent' ? 500000 : 150000000}
                  step={transactionType === 'rent' ? 10000 : 5000000}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-[#174D3B] cursor-pointer"
                />
              </div>

              {/* Verified Only Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-[#252A28]">
                  Verified listings only
                </span>
                <button
                  type="button"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    verifiedOnly ? 'bg-[#174D3B]' : 'bg-[#747A75]/30'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      verifiedOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count Header */}
        <div className="px-4 py-2.5 bg-white border-b border-[#252A28]/10 flex items-center justify-between text-xs text-[#747A75]">
          <span className="font-medium">
            <strong className="text-[#252A28] font-mono-num font-semibold">
              {filteredProperties.length}
            </strong>{' '}
            Properties in {selectedCity}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#174D3B] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Multi-Broker Ready
          </span>
        </div>

        {/* Searching Tab Properties List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-[#252A28]/5">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F3EFE6] text-[#747A75] flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-[#252A28]">No properties found</h4>
              <p className="text-xs text-[#747A75] max-w-xs mx-auto">
                Try widening your budget or clearing filters to view available residences.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('All Metros');
                  setSelectedBhk('all');
                  setSelectedType('all');
                  setMaxBudget(transactionType === 'rent' ? 500000 : 150000000);
                  setVerifiedOnly(false);
                }}
                className="mt-2 text-xs font-semibold text-[#174D3B] underline underline-offset-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredProperties.map((prop) => {
              const offers = prop.offers || [];
              const minPrice =
                prop.transactionType === 'rent'
                  ? Math.min(...offers.map((o) => o.rentAmount || 0))
                  : Math.min(...offers.map((o) => o.salePrice || 0));
              const isSaved = savedIds.includes(prop.id);
              const isSelected = selectedPropertyId === prop.id;

              return (
                <div
                  key={prop.id}
                  onClick={() => {
                    setSelectedPropertyId(prop.id);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([prop.lat, prop.lng], 14, { duration: 0.8 });
                    }
                  }}
                  className={`group pt-3.5 first:pt-0 cursor-pointer rounded-xl p-3 border transition-all ${
                    isSelected
                      ? 'border-[#174D3B] bg-[#F8F5EE]/70 shadow-sm'
                      : 'border-transparent hover:border-[#252A28]/15 hover:bg-[#F8F5EE]/40'
                  }`}
                >
                  <div className="flex gap-3.5">
                    {/* Thumbnail Image */}
                    <div className="relative w-28 h-24 rounded-lg overflow-hidden shrink-0 bg-[#F3EFE6]">
                      <img
                        src={prop.coverImage}
                        alt={prop.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback container
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {prop.isVerified && (
                        <div className="absolute top-1.5 left-1.5 bg-[#174D3B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Property Card Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Location unboxed metadata */}
                        <div className="flex items-center gap-1.5 text-xs text-[#747A75] truncate mb-1">
                          <MapPin className="w-3 h-3 text-[#C96F4A] shrink-0" />
                          <span className="truncate">{prop.locality}, {prop.city}</span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-[#252A28] truncate group-hover:text-[#174D3B] transition-colors">
                          {prop.title}
                        </h4>

                        {/* Unboxed Metadata Specs */}
                        <div className="flex items-center gap-2 text-xs text-[#747A75] mt-1">
                          <span>{prop.bedroomCount} BHK</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">{prop.carpetArea} sq.ft</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{prop.furnishing.replace('-', ' ')}</span>
                        </div>
                      </div>

                      {/* Price & Multi-Broker Offer Badge */}
                      <div className="flex items-end justify-between mt-2 pt-2 border-t border-[#252A28]/5">
                        <div>
                          <div className="text-sm font-bold text-[#174D3B] font-mono-num">
                            {formatINR(minPrice)}
                            {prop.transactionType === 'rent' && (
                              <span className="text-[11px] font-normal text-[#747A75]">/mo</span>
                            )}
                          </div>
                          {offers.length > 1 && (
                            <div className="text-[11px] text-[#C96F4A] font-medium flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              <span>{offers.length} Competing Broker Deals</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleToggleSave(prop.id, e)}
                            className={`p-1.5 rounded-md border text-xs transition-colors ${
                              isSaved
                                ? 'bg-[#C96F4A] border-[#C96F4A] text-white'
                                : 'bg-white border-[#252A28]/15 text-[#747A75] hover:text-[#174D3B]'
                            }`}
                            title={isSaved ? 'Saved in LocalStorage' : 'Save Property'}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCompareOffers(prop);
                            }}
                            className="px-2.5 py-1.5 bg-[#174D3B] text-white rounded-md text-xs font-medium hover:bg-[#0F3528] transition-colors whitespace-nowrap"
                          >
                            Compare Deals
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Interactive Leaflet Map View */}
      <div className="relative flex-1 h-full w-full">
        {/* The Leaflet Canvas */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Map Floating Bar (Top Controls) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          {/* Locate Me Button */}
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm border border-[#252A28]/15 rounded-lg shadow-md text-xs font-semibold text-[#252A28] hover:bg-[#F8F5EE] hover:text-[#174D3B] transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-[#174D3B]" />
            <span>Locate Me</span>
          </button>

          {/* Quick Metro Recenter */}
          <div className="hidden sm:flex items-center bg-white/95 backdrop-blur-sm border border-[#252A28]/15 rounded-lg shadow-md p-0.5 text-xs">
            <span className="px-2.5 py-1 text-[11px] font-medium text-[#747A75]">
              Quick Jump:
            </span>
            {['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune'].map((m) => (
              <button
                key={m}
                onClick={() => handleCitySelect(m)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedCity === m
                    ? 'bg-[#174D3B] text-white font-semibold'
                    : 'text-[#252A28] hover:text-[#174D3B]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Active Property Preview Card on Map (Bottom Card) */}
        {activeProperty && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:w-96 z-20 bg-white rounded-xl shadow-xl border border-[#252A28]/15 p-4 animate-slideUp">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[11px] text-[#C96F4A] font-semibold tracking-wide">
                  {activeProperty.locality}, {activeProperty.city}
                </span>
                <h3 className="text-sm font-bold text-[#252A28] leading-tight">
                  {activeProperty.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPropertyId(null)}
                className="text-[#747A75] hover:text-[#252A28] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#747A75] mb-3">
              <span>{activeProperty.bedroomCount} BHK</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">{activeProperty.carpetArea} sq.ft</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{activeProperty.propertyType}</span>
            </div>

            {/* Competing offers teaser */}
            <div className="bg-[#F8F5EE] rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-[#747A75] block">Available Offers</span>
                <strong className="text-[#174D3B] font-semibold">
                  {activeProperty.offers?.length || 1} Brokers Vying
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#747A75] block">Lowest Rate</span>
                <strong className="text-[#174D3B] font-mono-num font-bold">
                  {formatINR(
                    activeProperty.transactionType === 'rent'
                      ? activeProperty.offers?.[0]?.rentAmount
                      : activeProperty.offers?.[0]?.salePrice
                  )}
                  {activeProperty.transactionType === 'rent' ? '/mo' : ''}
                </strong>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCompareOffers(activeProperty)}
                className="flex-1 py-2 bg-[#174D3B] text-white rounded-lg text-xs font-semibold hover:bg-[#0F3528] transition-colors text-center shadow-xs"
              >
                Compare {activeProperty.offers?.length || 1} Broker Offers
              </button>
              <button
                onClick={() => onSelectProperty(activeProperty)}
                className="px-3 py-2 border border-[#252A28]/20 text-[#252A28] rounded-lg text-xs font-semibold hover:border-[#174D3B] hover:text-[#174D3B] transition-colors"
              >
                Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
