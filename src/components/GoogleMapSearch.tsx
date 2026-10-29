import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  MapCameraChangedEvent,
} from '@vis.gl/react-google-maps';
import {
  Search,
  Navigation,
  MapPin,
  Bookmark,
  SlidersHorizontal,
  X,
  CloudSun,
  Wind,
  Droplets,
  TrendingDown,
  CheckCircle2,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { Property, TransactionType } from '../types';
import { formatINR, toggleSaveProperty, getSavedPropertyIds, isUrbanAfford } from '../services/storage';
import { fetchLiveWeather, LiveWeatherData } from '../services/weather';

interface GoogleMapSearchProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onCompareOffers: (property: Property) => void;
  initialCity?: string;
  initialType?: TransactionType;
}

// Major Mumbai & Thane Real Estate Localities with coordinates for autocomplete suggestions
const POPULAR_LOCALITIES = [
  { name: 'Bandra West, Mumbai', city: 'Mumbai', lat: 19.0596, lng: 72.8295 },
  { name: 'Worli Sea Face, Mumbai', city: 'Mumbai', lat: 19.0176, lng: 72.8152 },
  { name: 'Pali Hill, Mumbai', city: 'Mumbai', lat: 19.0624, lng: 72.8285 },
  { name: 'Carter Road, Bandra West', city: 'Mumbai', lat: 19.0655, lng: 72.8252 },
  { name: 'Juhu Tara Road, Mumbai', city: 'Mumbai', lat: 19.1025, lng: 72.8268 },
  { name: 'Hiranandani Gardens, Powai', city: 'Mumbai', lat: 19.1197, lng: 72.9051 },
  { name: 'Lower Parel, Mumbai', city: 'Mumbai', lat: 19.0015, lng: 72.8280 },
  { name: 'Prabhadevi Beach, Mumbai', city: 'Mumbai', lat: 19.0144, lng: 72.8258 },
  { name: 'Khar West 14th Rd, Mumbai', city: 'Mumbai', lat: 19.0710, lng: 72.8340 },
  { name: 'Dadar West (Shivaji Park)', city: 'Mumbai', lat: 19.0270, lng: 72.8375 },
  { name: 'Andheri West (Lokhandwala)', city: 'Mumbai', lat: 19.1415, lng: 72.8270 },
  { name: 'Hiranandani Estate, Thane', city: 'Thane', lat: 19.2480, lng: 72.9780 },
  { name: 'Majiwada Junction, Thane', city: 'Thane', lat: 19.2150, lng: 72.9850 },
  { name: 'Ghodbunder Road, Thane', city: 'Thane', lat: 19.2680, lng: 72.9650 },
  { name: 'Vasant Vihar, Pokhran Rd 2', city: 'Thane', lat: 19.2280, lng: 72.9720 },
  { name: 'Panchpakhadi, Thane', city: 'Thane', lat: 19.1920, lng: 72.9680 },
  { name: 'Kolshet Road, Thane', city: 'Thane', lat: 19.2350, lng: 72.9910 },
  { name: 'Upvan Lake, Pokhran Rd 1', city: 'Thane', lat: 19.2210, lng: 72.9600 },
];

const METRO_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'All Metros': { lat: 19.120, lng: 72.900, zoom: 11 },
  Mumbai: { lat: 19.0596, lng: 72.8295, zoom: 12 },
  Thane: { lat: 19.2150, lng: 72.9800, zoom: 13 },
};

// Calculate distance in kilometers using the Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Controller component to control Google Map camera
function MapCameraHandler({
  targetCenter,
  targetZoom,
}: {
  targetCenter: { lat: number; lng: number };
  targetZoom: number;
}) {
  const map = useMap('gharsetu-google-map');

  useEffect(() => {
    if (!map) return;
    map.panTo(targetCenter);
    map.setZoom(targetZoom);
  }, [map, targetCenter, targetZoom]);

  return null;
}

export const GoogleMapSearch: React.FC<GoogleMapSearchProps> = ({
  properties,
  onSelectProperty,
  onCompareOffers,
  initialCity = 'Mumbai',
  initialType = 'rent',
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(initialType);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedBhk, setSelectedBhk] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(transactionType === 'rent' ? 300000 : 100000000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [urbanAffordOnly, setUrbanAffordOnly] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(getSavedPropertyIds());
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // User location and geolocation status
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Camera Target
  const [cameraCenter, setCameraCenter] = useState<{ lat: number; lng: number }>(
    METRO_CENTERS[initialCity] ? { lat: METRO_CENTERS[initialCity].lat, lng: METRO_CENTERS[initialCity].lng } : { lat: 19.0596, lng: 72.8295 }
  );
  const [cameraZoom, setCameraZoom] = useState<number>(METRO_CENTERS[initialCity]?.zoom || 12);

  // Live OpenWeather state
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Fetch weather for the active center
  const loadWeather = useCallback(async (lat: number, lng: number, placeName: string) => {
    setWeatherLoading(true);
    try {
      const data = await fetchLiveWeather(lat, lng, placeName);
      setWeatherData(data);
    } catch {
      // Ignored
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Initial weather load
  useEffect(() => {
    const center = METRO_CENTERS[selectedCity] || METRO_CENTERS['Mumbai'];
    loadWeather(center.lat, center.lng, selectedCity);
  }, [selectedCity, loadWeather]);

  // Handle Geolocation: "Detect My Location"
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationToast('Geolocation is not supported by your browser.');
      setTimeout(() => setLocationToast(null), 3500);
      return;
    }

    setIsLocating(true);
    setLocationToast('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserLocation(coords);
        setCameraCenter(coords);
        setCameraZoom(14);
        setIsLocating(false);
        setLocationToast(`Located you accurately (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
        loadWeather(latitude, longitude, 'My Location');
        setTimeout(() => setLocationToast(null), 3500);
      },
      (error) => {
        setIsLocating(false);
        setLocationToast('Location access denied. Please select your locality manually in the search bar.');
        setTimeout(() => setLocationToast(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filter autocomplete suggestions for the search bar
  const suggestedLocalities = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_LOCALITIES.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return POPULAR_LOCALITIES.filter(
      (loc) => loc.name.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle selecting a suggested locality from the search bar
  const handleSelectLocality = (loc: (typeof POPULAR_LOCALITIES)[0]) => {
    setSearchQuery(loc.name);
    setSelectedCity(loc.city);
    setShowSuggestions(false);
    setCameraCenter({ lat: loc.lat, lng: loc.lng });
    setCameraZoom(14);
    loadWeather(loc.lat, loc.lng, loc.name);
  };

  // Switch Buy / Rent
  const handleTransactionChange = (type: TransactionType) => {
    setTransactionType(type);
    if (type === 'rent') {
      setMaxBudget(250000);
    } else {
      setMaxBudget(80000000);
    }
  };

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (prop.transactionType !== transactionType) return false;

      if (selectedCity !== 'All Metros' && prop.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(query);
        const matchLoc = prop.locality.toLowerCase().includes(query);
        const matchCity = prop.city.toLowerCase().includes(query);
        const matchAddr = prop.address.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchCity && !matchAddr) return false;
      }

      if (selectedBhk !== 'all') {
        if (selectedBhk === 4) {
          if (prop.bedroomCount < 4) return false;
        } else if (prop.bedroomCount !== selectedBhk) {
          return false;
        }
      }

      if (selectedType !== 'all' && prop.propertyType !== selectedType) {
        return false;
      }

      if (verifiedOnly && !prop.isVerified) return false;
      if (urbanAffordOnly && !isUrbanAfford(prop)) return false;

      const bestOffer = prop.offers?.[0];
      if (bestOffer) {
        const price = transactionType === 'rent' ? bestOffer.rentAmount : bestOffer.salePrice;
        if (price && price > maxBudget) return false;
      }

      return true;
    });
  }, [properties, transactionType, selectedCity, searchQuery, selectedBhk, selectedType, verifiedOnly, urbanAffordOnly, maxBudget]);

  const activeProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  const handleToggleSave = (propId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleSaveProperty(propId);
    setSavedIds(getSavedPropertyIds());
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    const target = METRO_CENTERS[cityName];
    if (target) {
      setCameraCenter({ lat: target.lat, lng: target.lng });
      setCameraZoom(target.zoom);
      loadWeather(target.lat, target.lng, cityName);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden bg-[#F8F5EE]">
      {/* Toast Alert */}
      {locationToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#252A28] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20">
          <Navigation className="w-4 h-4 text-[#D5B477] animate-spin" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* LEFT PANE: Dedicated Searching Tab & Filter Explorer */}
      <div className="w-full lg:w-[470px] xl:w-[510px] h-full flex flex-col bg-white border-r border-[#252A28]/10 z-20 shrink-0 shadow-lg">
        {/* Search Header Container */}
        <div className="p-4 sm:p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]/70 space-y-3">
          {/* Top Bar with Buy/Rent Switch & Detect Location Button */}
          <div className="flex items-center justify-between gap-2">
            {/* Buy / Rent Switch */}
            <div className="flex p-1 bg-[#F3EFE6] rounded-lg border border-[#252A28]/10">
              <button
                onClick={() => handleTransactionChange('rent')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  transactionType === 'rent'
                    ? 'bg-[#174D3B] text-white shadow-xs'
                    : 'text-[#252A28] hover:text-[#174D3B]'
                }`}
              >
                Rent
              </button>
              <button
                onClick={() => handleTransactionChange('buy')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  transactionType === 'buy'
                    ? 'bg-[#174D3B] text-white shadow-xs'
                    : 'text-[#252A28] hover:text-[#174D3B]'
                }`}
              >
                Buy
              </button>
            </div>

            {/* Detect My Location Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-xs ${
                userLocation
                  ? 'bg-[#174D3B] text-white border-[#174D3B]'
                  : 'bg-white border-[#252A28]/20 text-[#174D3B] hover:bg-[#F8F5EE]'
              }`}
              title="Detect my current coordinates and show nearby homes"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : userLocation ? 'Located' : 'Detect Location'}</span>
            </button>

            {/* Filters Drawer Toggle */}
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isFilterDrawerOpen
                  ? 'bg-[#174D3B] text-white border-[#174D3B]'
                  : 'bg-white border-[#252A28]/20 text-[#252A28]'
              }`}
              title="Advanced Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#747A75] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search Bandra, Indiranagar, DLF Phase 5, Worli..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#252A28]/15 rounded-lg text-sm text-[#252A28] placeholder-[#747A75]/80 focus:outline-none focus:ring-2 focus:ring-[#174D3B] focus:border-transparent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747A75] hover:text-[#252A28]"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-[#252A28]/15 z-50 overflow-hidden divide-y divide-[#252A28]/5">
                <div className="px-3 py-1.5 bg-[#F8F5EE] text-[10px] font-bold text-[#747A75] uppercase tracking-wider flex justify-between items-center">
                  <span>Suggested Localities</span>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-[10px] text-[#747A75] hover:text-[#252A28]"
                  >
                    Close
                  </button>
                </div>
                {suggestedLocalities.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectLocality(loc)}
                    className="w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#F8F5EE] transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C96F4A] group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-[#252A28]">{loc.name}</span>
                    </div>
                    <span className="text-[10px] text-[#747A75] font-medium">{loc.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metro Quick Selection Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setUrbanAffordOnly(!urbanAffordOnly)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-bold flex items-center gap-1 ${
                urbanAffordOnly
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <span>🌿 Urban Afford</span>
              {urbanAffordOnly && <span className="text-[10px] ml-1">✓</span>}
            </button>
            {['All Metros', 'Mumbai', 'Thane', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad'].map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-semibold ${
                  selectedCity === city
                    ? 'bg-[#174D3B] text-white shadow-xs'
                    : 'bg-white border border-[#252A28]/15 text-[#252A28] hover:border-[#174D3B]'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* OpenWeather Live Meteorological Strip */}
          {weatherData && (
            <div className="bg-white rounded-xl p-3 border border-[#252A28]/10 shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#174D3B]/10 text-[#174D3B] flex items-center justify-center">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#252A28]">{weatherData.locationName}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                      Live Weather
                    </span>
                  </div>
                  <span className="text-[11px] text-[#747A75]">
                    {weatherData.condition} · Feels like {weatherData.feelsLike}°C
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-[#174D3B] font-mono-num">
                  {weatherData.temperature}°C
                </span>
                <div className="text-[10px] text-[#747A75] flex items-center justify-end gap-1">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{weatherData.humidity}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Advanced Filters */}
          {isFilterDrawerOpen && (
            <div className="pt-3 border-t border-[#252A28]/10 space-y-3.5 animate-fadeIn">
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
                          : 'bg-white border-[#252A28]/15 text-[#252A28]'
                      }`}
                    >
                      {bhk === 'all' ? 'Any' : `${bhk} BHK${bhk === 4 ? '+' : ''}`}
                    </button>
                  ))}
                </div>
              </div>

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

        {/* Results Count Bar */}
        <div className="px-4 py-2 bg-white border-b border-[#252A28]/10 flex items-center justify-between text-xs text-[#747A75]">
          <span className="font-medium">
            <strong className="text-[#252A28] font-mono-num font-semibold">
              {filteredProperties.length}
            </strong>{' '}
            Properties in {selectedCity}
          </span>
          {userLocation && (
            <span className="text-[11px] text-[#174D3B] font-semibold flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#174D3B]" />
              <span>Distance Calculated</span>
            </span>
          )}
        </div>

        {/* Properties List in Searching Tab */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#252A28]/5">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F3EFE6] text-[#747A75] flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-[#252A28]">No properties found</h4>
              <p className="text-xs text-[#747A75] max-w-xs mx-auto">
                Try widening your budget or clearing locality filters to see matching homes.
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

              // Distance from user if detected
              const distanceKm = userLocation
                ? calculateDistanceKm(userLocation.lat, userLocation.lng, prop.lat, prop.lng)
                : null;

              return (
                <div
                  key={prop.id}
                  onClick={() => {
                    setSelectedPropertyId(prop.id);
                    setCameraCenter({ lat: prop.lat, lng: prop.lng });
                    setCameraZoom(15);
                    loadWeather(prop.lat, prop.lng, prop.locality);
                  }}
                  className={`group pt-3 first:pt-0 cursor-pointer rounded-xl p-3 border transition-all ${
                    isSelected
                      ? 'border-[#174D3B] bg-[#F8F5EE]/80 shadow-md ring-1 ring-[#174D3B]'
                      : 'border-transparent hover:border-[#252A28]/15 hover:bg-[#F8F5EE]/40'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail Image */}
                    <div className="relative w-28 h-24 rounded-lg overflow-hidden shrink-0 bg-[#F3EFE6]">
                      <img
                        src={prop.coverImage}
                        alt={prop.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {prop.isVerified && (
                        <div className="absolute top-1.5 left-1.5 bg-[#174D3B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Verified
                        </div>
                      )}
                      {isUrbanAfford(prop) && (
                        <div className="absolute bottom-1.5 left-1.5 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          🌿 Afford
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#747A75] mb-0.5">
                          <span className="truncate">{prop.locality}, {prop.city}</span>
                          {distanceKm !== null && (
                            <span className="text-[11px] font-semibold text-[#174D3B] font-mono-num shrink-0">
                              {distanceKm} km away
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-[#252A28] truncate group-hover:text-[#174D3B] transition-colors">
                          {prop.title}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-[#747A75] mt-1">
                          <span>{prop.bedroomCount} BHK</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">{prop.carpetArea} sq.ft</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{prop.furnishing.replace('-', ' ')}</span>
                        </div>
                      </div>

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
                              <span>{offers.length} Broker Deals</span>
                            </div>
                          )}
                        </div>

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
                            className="px-2.5 py-1.5 bg-[#174D3B] text-white rounded-md text-xs font-semibold hover:bg-[#0F3528] transition-colors whitespace-nowrap"
                          >
                            Compare
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

      {/* RIGHT PANE: Interactive Google Map */}
      <div className="relative flex-1 h-full w-full">
        <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'geometry']}>
          <Map
            id="gharsetu-google-map"
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            defaultCenter={cameraCenter}
            defaultZoom={cameraZoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
          >
            {/* Camera handler hook */}
            <MapCameraHandler targetCenter={cameraCenter} targetZoom={cameraZoom} />

            {/* User Location Pulsing Marker */}
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Your Detected Location">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[9px] font-bold">
                    ★
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Property Advanced Markers */}
            {filteredProperties.map((prop) => {
              const offers = prop.offers || [];
              let displayPrice = '';

              if (prop.transactionType === 'rent') {
                const minRent = offers.length > 0 ? Math.min(...offers.map((o) => o.rentAmount || 0)) : 100000;
                displayPrice = `₹${(minRent / 1000).toFixed(0)}k`;
              } else {
                const minSale = offers.length > 0 ? Math.min(...offers.map((o) => o.salePrice || 0)) : 50000000;
                displayPrice = formatINR(minSale);
              }

              const isSelected = selectedPropertyId === prop.id;

              return (
                <AdvancedMarker
                  key={prop.id}
                  position={{ lat: prop.lat, lng: prop.lng }}
                  onClick={() => {
                    setSelectedPropertyId(prop.id);
                    setCameraCenter({ lat: prop.lat, lng: prop.lng });
                    setCameraZoom(15);
                    loadWeather(prop.lat, prop.lng, prop.locality);
                  }}
                  title={prop.title}
                >
                  <div
                    className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg transition-transform ${
                      isSelected
                        ? 'bg-[#C96F4A] text-white scale-110 ring-2 ring-white z-50'
                        : 'bg-[#174D3B] text-white hover:scale-105'
                    }`}
                  >
                    <span>{displayPrice}</span>
                    {offers.length > 1 && (
                      <span className="text-[10px] bg-white/20 px-1 rounded-full">
                        {offers.length}
                      </span>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {/* Floating Top Control Overlay */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={handleDetectLocation}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/95 backdrop-blur-sm border border-[#252A28]/15 rounded-xl shadow-lg text-xs font-bold text-[#174D3B] hover:bg-[#F8F5EE] transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-[#174D3B]" />
            <span>{userLocation ? 'Re-center Location' : 'Detect My Location'}</span>
          </button>
        </div>

        {/* Selected Property Preview Bottom Drawer on Map */}
        {activeProperty && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:w-96 z-20 bg-white rounded-2xl shadow-2xl border border-[#252A28]/15 p-4 animate-slideUp">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[11px] text-[#C96F4A] font-bold tracking-wide">
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

            {/* Multi-broker teaser */}
            <div className="bg-[#F8F5EE] rounded-xl p-3 mb-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-[#747A75] block">Competing Brokers</span>
                <strong className="text-[#174D3B] font-semibold">
                  {activeProperty.offers?.length || 1} Offers Linked
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#747A75] block">Starting At</span>
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => onCompareOffers(activeProperty)}
                className="flex-1 py-2 bg-[#174D3B] text-white rounded-xl text-xs font-bold hover:bg-[#0F3528] transition-colors text-center shadow-xs"
              >
                Compare {activeProperty.offers?.length || 1} Broker Offers
              </button>
              <button
                onClick={() => onSelectProperty(activeProperty)}
                className="px-3.5 py-2 border border-[#252A28]/20 text-[#252A28] rounded-xl text-xs font-bold hover:border-[#174D3B] hover:text-[#174D3B] transition-colors"
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
