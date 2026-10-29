import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Bookmark,
  Calendar,
  MessageSquare,
  Sliders,
  Navigation,
  MapPin,
  TrendingDown,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  User,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Property, Enquiry, ViewingAppointment, CitizenProfile, TransactionType } from '../types';
import {
  getProperties,
  getSavedPropertyIds,
  toggleSaveProperty,
  getEnquiries,
  getViewings,
  getCitizens,
  getActiveCitizen,
  setActiveCitizenId,
  getPropertiesNear,
  formatINR,
  calculateDistanceKm,
  isUrbanAfford,
} from '../services/storage';

interface CitizenPortalProps {
  onSelectProperty: (property: Property) => void;
  onCompareOffers: (property: Property) => void;
  onExploreMap: () => void;
}

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

// Fallback localities around Mumbai and Thane for manual search
const POPULAR_LOCALITIES = [
  { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  { name: 'Worli Sea Face, Mumbai', lat: 19.0176, lng: 72.8152 },
  { name: 'Powai, Mumbai', lat: 19.1197, lng: 72.9051 },
  { name: 'Juhu, Mumbai', lat: 19.1025, lng: 72.8268 },
  { name: 'Lower Parel, Mumbai', lat: 19.0015, lng: 72.8280 },
  { name: 'Hiranandani Estate, Thane', lat: 19.2480, lng: 72.9780 },
  { name: 'Majiwada, Thane', lat: 19.2150, lng: 72.9850 },
  { name: 'Vasant Vihar, Thane', lat: 19.2280, lng: 72.9720 },
];

function MapPanHandler({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap('citizen-nearby-map');
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);
  return null;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  onSelectProperty,
  onCompareOffers,
  onExploreMap,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAl2n4QZaLkVcUnM1XgUi3IXfCrVqd26OA';

  const [activeTab, setActiveTab] = useState<'nearby' | 'saved' | 'enquiries' | 'viewings' | 'preferences'>('nearby');
  const [citizens, setCitizens] = useState<CitizenProfile[]>(getCitizens());
  const [activeCitizen, setActiveCitizen] = useState<CitizenProfile>(getActiveCitizen());
  const [properties, setProperties] = useState<Property[]>(getProperties());
  const [savedIds, setSavedIds] = useState<string[]>(getSavedPropertyIds());
  const [enquiries, setEnquiries] = useState<Enquiry[]>(getEnquiries());
  const [viewings, setViewings] = useState<ViewingAppointment[]>(getViewings());

  // Nearby Search States
  const [selectedRadius, setSelectedRadius] = useState<number>(5);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedLocalityManual, setSelectedLocalityManual] = useState<string>('Bandra West, Mumbai');
  const [transactionType, setTransactionType] = useState<TransactionType>('rent');
  const [selectedBhk, setSelectedBhk] = useState<number | 'all'>('all');
  const [maxBudget, setMaxBudget] = useState<number>(250000);

  // Active Center for Map
  const searchCenter = useMemo(() => {
    if (userLocation) return userLocation;
    const manual = POPULAR_LOCALITIES.find((l) => l.name === selectedLocalityManual);
    return manual ? { lat: manual.lat, lng: manual.lng } : { lat: 19.0596, lng: 72.8295 };
  }, [userLocation, selectedLocalityManual]);

  const [mapZoom, setMapZoom] = useState(13);

  // Switch Citizen Persona
  const handleSwitchCitizen = (citizenId: string) => {
    setActiveCitizenId(citizenId);
    const target = citizens.find((c) => c.id === citizenId) || citizens[0];
    setActiveCitizen(target);
  };

  // Find Properties Near Me (Browser Geolocation)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser geolocation is not supported on your device.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);
        setMapZoom(selectedRadius <= 3 ? 14 : selectedRadius <= 5 ? 13 : 12);
      },
      (err) => {
        setIsLocating(false);
        setLocationError('Location permission denied or unavailable. You can search by locality below.');
        // Default to Bandra West
        setUserLocation({ lat: 19.0596, lng: 72.8295 });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Auto-detect on first load of Nearby tab if not set
  useEffect(() => {
    if (!userLocation && activeTab === 'nearby') {
      handleDetectLocation();
    }
  }, [activeTab]);

  // Compute nearby properties filtered by radius and criteria
  const nearbyProperties = useMemo(() => {
    const center = searchCenter;
    const nearby = getPropertiesNear(center.lat, center.lng, selectedRadius, properties);

    return nearby.filter((p) => {
      if (p.transactionType !== transactionType) return false;
      if (selectedBhk !== 'all') {
        if (selectedBhk === 4 && p.bedroomCount < 4) return false;
        if (selectedBhk !== 4 && p.bedroomCount !== selectedBhk) return false;
      }
      const lowestOffer = p.offers?.[0];
      if (lowestOffer) {
        const price = transactionType === 'rent' ? lowestOffer.rentAmount : lowestOffer.salePrice;
        if (price && price > maxBudget) return false;
      }
      return true;
    });
  }, [searchCenter, selectedRadius, properties, transactionType, selectedBhk, maxBudget]);

  const handleToggleBookmark = (id: string) => {
    toggleSaveProperty(id);
    setSavedIds(getSavedPropertyIds());
  };

  const savedPropertyList = properties.filter((p) => savedIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#252A28] pb-16">
      {/* Citizen Portal Header - Terracotta + Warm Cream Visual Theme */}
      <div className="bg-[#C96F4A] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>Citizen Resident Portal</span>
              <span aria-hidden="true">·</span>
              <span>Mumbai & Thane Metropolitan Region</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Welcome, {activeCitizen.fullName}
            </h1>
            <p className="text-xs text-white/90 mt-1 max-w-xl">
              {activeCitizen.occupation} · Preferred: {activeCitizen.preferences.preferredLocalities.join(', ')} ({activeCitizen.preferences.preferredCity})
            </p>
          </div>

          {/* Citizen Switcher / Demo Persona Selector */}
          <div className="bg-black/15 backdrop-blur-md rounded-xl p-3 border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Users className="w-4 h-4 text-white" />
              <span>Switch Citizen Persona:</span>
            </div>
            <select
              value={activeCitizen.id}
              onChange={(e) => handleSwitchCitizen(e.target.value)}
              className="bg-white text-[#252A28] text-xs font-semibold px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-[#174D3B]"
            >
              {citizens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.city} · {c.occupation})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#252A28]/15 gap-2 overflow-x-auto pb-px mb-8 text-xs font-medium">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'nearby'
                ? 'border-[#C96F4A] text-[#C96F4A] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Find Properties Near Me ({nearbyProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'saved'
                ? 'border-[#C96F4A] text-[#C96F4A] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Residences ({savedPropertyList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'enquiries'
                ? 'border-[#C96F4A] text-[#C96F4A] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Enquiries ({enquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('viewings')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'viewings'
                ? 'border-[#C96F4A] text-[#C96F4A] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Viewing Appointments ({viewings.length})</span>
          </button>
        </div>

        {/* TAB 1: FIND PROPERTIES NEAR ME (Flagship Citizen Requirement) */}
        {activeTab === 'nearby' && (
          <div className="space-y-6">
            {/* Control Panel: Radius selector, Geolocation button, Filters */}
            <div className="bg-white rounded-2xl border border-[#252A28]/15 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#252A28] flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#C96F4A]" />
                    <span>Real-Time Proximity Search</span>
                  </h3>
                  <p className="text-xs text-[#747A75] mt-0.5">
                    Calculates exact geodesic distances to canonical properties in Mumbai and Thane.
                  </p>
                </div>

                {/* Geolocation Button */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="px-4 py-2 bg-[#C96F4A] hover:bg-[#b05f3d] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting Location...' : userLocation ? 'Re-detect My Location' : 'Detect My Location'}</span>
                  </button>

                  {/* Locality Selector fallback */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#747A75] font-medium">Or center on:</span>
                    <select
                      value={selectedLocalityManual}
                      onChange={(e) => {
                        setSelectedLocalityManual(e.target.value);
                        setUserLocation(null);
                      }}
                      className="bg-[#F8F5EE] border border-[#252A28]/15 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      {POPULAR_LOCALITIES.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Radius Buttons: 1km, 3km, 5km, 10km, 20km */}
              <div className="pt-3 border-t border-[#252A28]/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#252A28]">Search Radius:</span>
                  <div className="flex gap-1.5 bg-[#F8F5EE] p-1 rounded-lg border border-[#252A28]/10">
                    {RADIUS_OPTIONS.map((km) => (
                      <button
                        key={km}
                        onClick={() => {
                          setSelectedRadius(km);
                          setMapZoom(km <= 3 ? 14 : km <= 5 ? 13 : 12);
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                          selectedRadius === km
                            ? 'bg-[#C96F4A] text-white shadow-xs'
                            : 'text-[#252A28] hover:text-[#C96F4A]'
                        }`}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buy / Rent & BHK Quick Toggles */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex bg-[#F8F5EE] p-1 rounded-lg border border-[#252A28]/10 text-xs">
                    <button
                      onClick={() => setTransactionType('rent')}
                      className={`px-3 py-1 font-bold rounded-md transition-all ${
                        transactionType === 'rent'
                          ? 'bg-[#174D3B] text-white'
                          : 'text-[#252A28]'
                      }`}
                    >
                      Rent
                    </button>
                    <button
                      onClick={() => setTransactionType('buy')}
                      className={`px-3 py-1 font-bold rounded-md transition-all ${
                        transactionType === 'buy'
                          ? 'bg-[#174D3B] text-white'
                          : 'text-[#252A28]'
                      }`}
                    >
                      Buy
                    </button>
                  </div>

                  {/* BHK */}
                  <div className="flex gap-1 text-xs">
                    {(['all', 2, 3, 4] as const).map((bhk) => (
                      <button
                        key={String(bhk)}
                        onClick={() => setSelectedBhk(bhk)}
                        className={`px-2.5 py-1 rounded-md border font-medium ${
                          selectedBhk === bhk
                            ? 'bg-[#174D3B] text-white border-[#174D3B]'
                            : 'bg-white border-[#252A28]/15 text-[#252A28]'
                        }`}
                      >
                        {bhk === 'all' ? 'All BHK' : `${bhk} BHK${bhk === 4 ? '+' : ''}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {locationError && (
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium">
                  {locationError}
                </div>
              )}
            </div>

            {/* Split View: Google Map + Proximity Results List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Google Map Box */}
              <div className="lg:col-span-7 h-[480px] rounded-2xl overflow-hidden border border-[#252A28]/15 shadow-md relative">
                <APIProvider apiKey={apiKey} libraries={['marker', 'geometry']}>
                  <Map
                    id="citizen-nearby-map"
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    defaultCenter={searchCenter}
                    defaultZoom={mapZoom}
                    gestureHandling="greedy"
                    className="w-full h-full"
                  >
                    <MapPanHandler center={searchCenter} zoom={mapZoom} />

                    {/* User Detected Pin */}
                    <AdvancedMarker position={searchCenter} title="Search Center / Your Location">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-8 h-8 rounded-full bg-[#C96F4A]/30 animate-ping" />
                        <div className="w-5 h-5 rounded-full bg-[#C96F4A] border-2 border-white shadow-lg flex items-center justify-center text-white text-[9px] font-bold">
                          📍
                        </div>
                      </div>
                    </AdvancedMarker>

                    {/* Nearby Property Pins */}
                    {nearbyProperties.map((prop) => (
                      <AdvancedMarker
                        key={prop.id}
                        position={{ lat: prop.lat, lng: prop.lng }}
                        onClick={() => onSelectProperty(prop)}
                        title={prop.title}
                      >
                        <div className="cursor-pointer bg-[#174D3B] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white hover:scale-110 transition-transform flex items-center gap-1">
                          <span>{prop.distanceKm} km</span>
                        </div>
                      </AdvancedMarker>
                    ))}
                  </Map>
                </APIProvider>

                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-[#252A28] border border-[#252A28]/10 shadow-sm">
                  {nearbyProperties.length} Properties within {selectedRadius} km
                </div>
              </div>

              {/* Property Cards within Radius */}
              <div className="lg:col-span-5 space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                {nearbyProperties.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-[#252A28]/15 space-y-2">
                    <MapPin className="w-8 h-8 text-[#747A75] mx-auto opacity-40" />
                    <h4 className="font-bold text-sm text-[#252A28]">No properties within {selectedRadius} km</h4>
                    <p className="text-xs text-[#747A75]">
                      Try increasing the radius to 10 km or 20 km to see more verified residences.
                    </p>
                    <button
                      onClick={() => setSelectedRadius(10)}
                      className="mt-2 px-4 py-1.5 bg-[#C96F4A] text-white text-xs font-bold rounded-lg"
                    >
                      Expand to 10 km
                    </button>
                  </div>
                ) : (
                  nearbyProperties.map((prop) => {
                    const offers = prop.offers || [];
                    const minPrice =
                      prop.transactionType === 'rent'
                        ? Math.min(...offers.map((o) => o.rentAmount || 0))
                        : Math.min(...offers.map((o) => o.salePrice || 0));

                    return (
                      <div
                        key={prop.id}
                        onClick={() => onSelectProperty(prop)}
                        className="bg-white rounded-xl border border-[#252A28]/15 p-3.5 hover:shadow-md transition-all cursor-pointer flex gap-3.5 group"
                      >
                        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-[#F3EFE6] relative">
                          <img
                            src={prop.coverImage}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-1 left-1 bg-[#C96F4A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {prop.distanceKm} km
                          </div>
                          {isUrbanAfford(prop) && (
                            <div className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              🌿 Afford
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] text-[#747A75] block truncate">
                              {prop.locality}, {prop.city}
                            </span>
                            <h4 className="text-sm font-bold text-[#252A28] truncate group-hover:text-[#C96F4A] transition-colors">
                              {prop.title}
                            </h4>
                            <div className="text-xs text-[#747A75] mt-0.5">
                              {prop.bedroomCount} BHK · {prop.carpetArea} sq.ft
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-[#252A28]/5">
                            <div>
                              <strong className="text-sm font-bold text-[#174D3B] font-mono-num">
                                {formatINR(minPrice)}
                                {prop.transactionType === 'rent' ? '/mo' : ''}
                              </strong>
                              {offers.length > 1 && (
                                <span className="text-[10px] text-[#C96F4A] block font-medium">
                                  {offers.length} Competing Broker Deals
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCompareOffers(prop);
                              }}
                              className="px-2.5 py-1 bg-[#174D3B] text-white rounded text-xs font-semibold hover:bg-[#0F3528]"
                            >
                              Compare
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVED RESIDENCES */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            {savedPropertyList.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#252A28]/15 space-y-3">
                <Bookmark className="w-8 h-8 text-[#747A75] mx-auto opacity-40" />
                <h4 className="text-base font-bold text-[#252A28]">No saved residences</h4>
                <p className="text-xs text-[#747A75]">
                  Click the bookmark button on any property card to save it here for quick access.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPropertyList.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-xl border border-[#252A28]/15 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 w-full bg-[#F3EFE6] relative">
                        <img src={prop.coverImage} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 space-y-2">
                        <span className="text-xs text-[#C96F4A] font-semibold">{prop.locality}, {prop.city}</span>
                        <h4 className="font-bold text-sm text-[#252A28] line-clamp-1">{prop.title}</h4>
                        <div className="text-xs text-[#747A75]">
                          {prop.bedroomCount} BHK · {prop.carpetArea} sq.ft · {prop.offers?.length || 1} Competing Offers
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        onClick={() => onCompareOffers(prop)}
                        className="flex-1 py-2 bg-[#174D3B] text-white rounded-lg text-xs font-semibold hover:bg-[#0F3528]"
                      >
                        Compare Deals
                      </button>
                      <button
                        onClick={() => onSelectProperty(prop)}
                        className="px-3 py-2 border border-[#252A28]/20 text-[#252A28] rounded-lg text-xs font-semibold"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-2xl border border-[#252A28]/15 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]">
              <h3 className="text-sm font-bold text-[#252A28]">Dispatched Enquiries to Brokers</h3>
            </div>
            <div className="divide-y divide-[#252A28]/10">
              {enquiries.map((enq) => (
                <div key={enq.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-[#252A28]">Enquiry #{enq.id}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#174D3B]/10 text-[#174D3B] uppercase">
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-[#252A28] italic">"{enq.message}"</p>
                    <span className="text-[11px] text-[#747A75] font-mono">Property: {enq.propertyId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VIEWINGS */}
        {activeTab === 'viewings' && (
          <div className="bg-white rounded-2xl border border-[#252A28]/15 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]">
              <h3 className="text-sm font-bold text-[#252A28]">Scheduled Property Site Visits</h3>
            </div>
            <div className="divide-y divide-[#252A28]/10">
              {viewings.map((view) => (
                <div key={view.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-sm font-bold text-[#252A28]">
                      {view.preferredDate} ({view.preferredTimeSlot})
                    </strong>
                    <p className="text-[#747A75]">Property: {view.propertyId}</p>
                    {view.notes && <p className="italic text-[#252A28]">Note: {view.notes}</p>}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {view.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
