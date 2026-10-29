import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import {
  PlusCircle,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Navigation,
  Sparkles,
  Phone,
  Mail,
  Save,
  Check,
  AlertCircle,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { Property, BrokerOffer, Enquiry, ViewingAppointment, BrokerProfile, TransactionType, PropertyType } from '../types';
import {
  getProperties,
  saveProperty,
  saveOffer,
  getEnquiries,
  updateEnquiryStatus,
  getViewings,
  updateViewingStatus,
  getBrokers,
  getActiveBroker,
  setActiveBrokerId,
  formatINR,
} from '../services/storage';

interface BrokerPortalProps {
  onPropertyCreated: () => void;
  onExploreMap: () => void;
}

const SAMPLE_IMAGES = [
  { label: 'Mumbai Sea High-Rise', url: '/src/assets/images/hero_mumbai_luxury_home_1793260661654.jpg' },
  { label: 'Bangalore Courtyard Villa', url: '/src/assets/images/villa_bangalore_greenery_1793260662740.jpg' },
  { label: 'Delhi NCR Designer Suite', url: '/src/assets/images/apartment_delhi_interior_1793260662950.jpg' },
  { label: 'Pune Skyline Penthouse', url: '/src/assets/images/penthouse_pune_terrace_1793260662346.jpg' },
];

export const BrokerPortal: React.FC<BrokerPortalProps> = ({ onPropertyCreated, onExploreMap }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAl2n4QZaLkVcUnM1XgUi3IXfCrVqd26OA';

  const [activeTab, setActiveTab] = useState<'overview' | 'add-property' | 'my-properties' | 'submit-offer' | 'leads' | 'viewings'>('overview');
  const [brokers, setBrokers] = useState<BrokerProfile[]>(getBrokers());
  const [activeBroker, setActiveBroker] = useState<BrokerProfile>(getActiveBroker());
  const [properties, setProperties] = useState<Property[]>(getProperties());
  const [enquiries, setEnquiries] = useState<Enquiry[]>(getEnquiries());
  const [viewings, setViewings] = useState<ViewingAppointment[]>(getViewings());
  const [createdToast, setCreatedToast] = useState(false);

  // Form State for Add Property
  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: 'apartment' as PropertyType,
    transactionType: 'rent' as TransactionType,
    city: 'Mumbai',
    locality: 'Bandra West',
    postalCode: '400050',
    address: 'Near Carter Road Promenade, Bandra West',
    lat: 19.0624,
    lng: 72.8285,
    bedroomCount: 3,
    bathroomCount: 3,
    balconyCount: 2,
    carpetArea: 1650,
    builtUpArea: 1950,
    furnishing: 'fully-furnished' as const,
    floorNumber: 8,
    totalFloors: 18,
    parking: '2 Covered Bays',
    amenities: ['Arabian Sea View', 'Swimming Pool', '24/7 Power Backup', 'Gymnasium'],
    coverImage: SAMPLE_IMAGES[0].url,
    priceOrRent: 195000,
    depositAmount: 600000,
    brokerageType: 'fixed' as 'fixed' | 'percentage',
    brokerageValue: 95000,
    specialConditions: 'Exclusive broker agreement with clean title and quick possession',
  });

  // Location Confirmation Modal State
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [showLocationConfirmModal, setShowLocationConfirmModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Offer on existing property state
  const [selectedCanonicalPropId, setSelectedCanonicalPropId] = useState<string>(properties[0]?.id || '');
  const [offerPrice, setOfferPrice] = useState<number>(200000);
  const [offerDeposit, setOfferDeposit] = useState<number>(600000);
  const [offerBrokerageVal, setOfferBrokerageVal] = useState<number>(85000);
  const [offerPerk, setOfferPerk] = useState<string>('Includes 1st month maintenance fee waived');
  const [offerToast, setOfferToast] = useState(false);

  // Switch Broker Persona
  const handleSwitchBroker = (brokerId: string) => {
    setActiveBrokerId(brokerId);
    const target = brokers.find((b) => b.id === brokerId) || brokers[0];
    setActiveBroker(target);
  };

  // Working Geolocation Detection for Add Property
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationToast('Browser geolocation is not available.');
      setTimeout(() => setLocationToast(null), 3000);
      return;
    }

    setIsLocating(true);
    setLocationToast('Detecting property coordinates via GPS...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({
          ...prev,
          lat: Math.round(latitude * 10000) / 10000,
          lng: Math.round(longitude * 10000) / 10000,
        }));
        setIsLocating(false);
        setIsLocationConfirmed(false); // require re-confirmation on change
        setLocationToast(`Detected: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        setTimeout(() => setLocationToast(null), 3500);
      },
      (err) => {
        setIsLocating(false);
        setLocationToast('Location access denied. Please click on the map or type coordinates.');
        setTimeout(() => setLocationToast(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Click on Google Map to adjust marker
  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail?.latLng) {
      const lat = Math.round(e.detail.latLng.lat * 10000) / 10000;
      const lng = Math.round(e.detail.latLng.lng * 10000) / 10000;
      setForm((prev) => ({ ...prev, lat, lng }));
      setIsLocationConfirmed(false);
    }
  };

  // Submit new property
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.locality || !form.address) return;

    // Require location confirmation
    if (!isLocationConfirmed) {
      setShowLocationConfirmModal(true);
      return;
    }

    const canonicalKey = `IN-MH-${form.city.substring(0, 3).toUpperCase()}-${form.locality.replace(/\s+/g, '').substring(0, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newProp = saveProperty({
      canonicalKey,
      title: form.title,
      description: form.description || 'Premium urban residence with modern amenities and high connectivity.',
      propertyType: form.propertyType,
      transactionType: form.transactionType,
      city: form.city,
      locality: form.locality,
      postalCode: form.postalCode,
      address: form.address,
      lat: Number(form.lat),
      lng: Number(form.lng),
      bedroomCount: Number(form.bedroomCount),
      bathroomCount: Number(form.bathroomCount),
      balconyCount: Number(form.balconyCount),
      carpetArea: Number(form.carpetArea),
      builtUpArea: Number(form.builtUpArea),
      furnishing: form.furnishing,
      floorNumber: Number(form.floorNumber),
      totalFloors: Number(form.totalFloors),
      parking: form.parking,
      amenities: form.amenities,
      coverImage: form.coverImage,
      images: [form.coverImage, SAMPLE_IMAGES[1].url, SAMPLE_IMAGES[2].url],
      isVerified: true,
      moderationStatus: 'active',
      isDemoDataset: false,
    });

    // Link broker's initial offer
    saveOffer({
      propertyId: newProp.id,
      brokerId: activeBroker.id,
      brokerName: activeBroker.fullName,
      brokerAgency: activeBroker.businessName,
      brokerPhone: activeBroker.phone,
      brokerEmail: activeBroker.email,
      brokerRating: activeBroker.rating,
      brokerReraId: activeBroker.reraId,
      isVerifiedBroker: activeBroker.verificationStatus === 'verified',
      transactionType: form.transactionType,
      rentAmount: form.transactionType === 'rent' ? Number(form.priceOrRent) : undefined,
      salePrice: form.transactionType === 'buy' ? Number(form.priceOrRent) : undefined,
      depositAmount: Number(form.depositAmount),
      brokerageType: form.brokerageType,
      brokerageValue: Number(form.brokerageValue),
      maintenanceChargesMonthly: 8000,
      negotiable: true,
      availability: 'Immediate',
      specialConditions: form.specialConditions,
    });

    setProperties(getProperties());
    setCreatedToast(true);
    onPropertyCreated();

    setTimeout(() => {
      setCreatedToast(false);
      setActiveTab('my-properties');
    }, 1800);
  };

  // Submit new offer on canonical property
  const handleAddOfferToCanonical = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProp = properties.find((p) => p.id === selectedCanonicalPropId);
    if (!targetProp) return;

    saveOffer({
      propertyId: targetProp.id,
      brokerId: activeBroker.id,
      brokerName: activeBroker.fullName,
      brokerAgency: activeBroker.businessName,
      brokerPhone: activeBroker.phone,
      brokerEmail: activeBroker.email,
      brokerRating: activeBroker.rating,
      brokerReraId: activeBroker.reraId,
      isVerifiedBroker: activeBroker.verificationStatus === 'verified',
      transactionType: targetProp.transactionType,
      rentAmount: targetProp.transactionType === 'rent' ? offerPrice : undefined,
      salePrice: targetProp.transactionType === 'buy' ? offerPrice : undefined,
      depositAmount: offerDeposit,
      brokerageType: 'fixed',
      brokerageValue: offerBrokerageVal,
      maintenanceChargesMonthly: 7500,
      negotiable: true,
      availability: 'Immediate',
      specialConditions: offerPerk,
    });

    setProperties(getProperties());
    setOfferToast(true);
    onPropertyCreated();
    setTimeout(() => setOfferToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#252A28] pb-16">
      {/* Toast Alert */}
      {locationToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#252A28] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20">
          <Navigation className="w-3.5 h-3.5 text-[#D5B477] animate-spin" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* Broker Portal Header - Forest Green + Champagne Gold Theme */}
      <div className="bg-[#174D3B] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D5B477] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#D5B477]" />
              <span>RERA-Verified Broker Portal</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="font-mono text-emerald-300">RERA: {activeBroker.reraId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {activeBroker.businessName}
            </h1>
            <p className="text-xs text-white/90 mt-1">
              Broker: {activeBroker.fullName} · {activeBroker.operatingCities.join(', ')} · Stored in LocalStorage
            </p>
          </div>

          {/* Broker Persona Switcher */}
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D5B477]">
              <Users className="w-4 h-4" />
              <span>Broker Persona:</span>
            </div>
            <select
              value={activeBroker.id}
              onChange={(e) => handleSwitchBroker(e.target.value)}
              className="bg-white text-[#252A28] text-xs font-semibold px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-[#D5B477]"
            >
              {brokers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.fullName} ({b.businessName} - {b.verificationStatus})
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
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#174D3B] text-[#174D3B] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('add-property')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'add-property'
                ? 'border-[#174D3B] text-[#174D3B] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Property & Map Pin</span>
          </button>

          <button
            onClick={() => setActiveTab('my-properties')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'my-properties'
                ? 'border-[#174D3B] text-[#174D3B] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>My Listings ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submit-offer')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'submit-offer'
                ? 'border-[#174D3B] text-[#174D3B] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D5B477]" />
            <span>Offer on Existing Property</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'leads'
                ? 'border-[#174D3B] text-[#174D3B] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Leads ({enquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('viewings')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'viewings'
                ? 'border-[#174D3B] text-[#174D3B] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Viewing Tours ({viewings.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-[#252A28]/15 shadow-sm">
                <span className="text-xs font-semibold text-[#747A75]">Canonical Listings</span>
                <div className="text-3xl font-serif font-bold text-[#174D3B] font-mono-num mt-2">
                  {properties.length}
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                  Persisted in LocalStorage
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#252A28]/15 shadow-sm">
                <span className="text-xs font-semibold text-[#747A75]">Received Enquiries</span>
                <div className="text-3xl font-serif font-bold text-[#C96F4A] font-mono-num mt-2">
                  {enquiries.length}
                </div>
                <span className="text-[11px] text-[#747A75] mt-1 block">Citizen direct inquiries</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#252A28]/15 shadow-sm">
                <span className="text-xs font-semibold text-[#747A75]">Scheduled Visits</span>
                <div className="text-3xl font-serif font-bold text-[#252A28] font-mono-num mt-2">
                  {viewings.length}
                </div>
                <span className="text-[11px] text-[#747A75] mt-1 block">Confirmed bookings</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#252A28]/15 shadow-sm">
                <span className="text-xs font-semibold text-[#747A75]">RERA Rating</span>
                <div className="text-3xl font-serif font-bold text-[#D5B477] font-mono-num mt-2">
                  {activeBroker.rating} ★
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                  Status: {activeBroker.verificationStatus.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#252A28]/15 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-[#174D3B]">Publish Property with Geolocation Pinning</h3>
                <p className="text-xs text-[#747A75] max-w-xl">
                  Use the Google Maps location detector to lock property coordinates and give citizens accurate proximity calculations.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('add-property')}
                className="px-5 py-2.5 bg-[#174D3B] text-white rounded-xl text-xs font-bold hover:bg-[#0F3528] transition-colors shadow-sm shrink-0"
              >
                Add Property & Pin Location
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ADD PROPERTY WITH LOCATION DETECTION & GOOGLE MAP PIN ADJUSTMENT */}
        {activeTab === 'add-property' && (
          <form onSubmit={handleCreateProperty} className="bg-white rounded-2xl border border-[#252A28]/15 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-[#252A28]/10 pb-4">
              <h3 className="text-lg font-bold text-[#174D3B]">
                List New Property & Pin Exact Coordinates
              </h3>
              <p className="text-xs text-[#747A75]">
                Use browser geolocation and the interactive Google Map to verify the exact building marker.
              </p>
            </div>

            {createdToast && (
              <div className="p-4 bg-[#174D3B]/10 text-[#174D3B] rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Property created, location confirmed, and published to LocalStorage!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-[#252A28] mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pali Hill Luxury Coastal Suite"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-[#252A28]/15 rounded-lg text-sm focus:ring-1 focus:ring-[#174D3B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A28] mb-1">City Metro</label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#252A28]/15 rounded-lg font-medium"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Thane">Thane</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252A28] mb-1">Locality</label>
                <input
                  type="text"
                  required
                  value={form.locality}
                  onChange={(e) => setForm({ ...form, locality: e.target.value })}
                  placeholder="e.g. Bandra West, Majiwada"
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-[#252A28] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Near Zig Zag Road, Pali Hill"
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg"
                />
              </div>

              {/* BROKER LOCATION DETECTION & INTERACTIVE PIN ADJUSTMENT (Requirement 2) */}
              <div className="md:col-span-2 bg-[#F8F5EE] p-5 rounded-2xl border border-[#252A28]/15 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#174D3B] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#C96F4A]" />
                      <span>Property Geolocation & Interactive Map Marker</span>
                    </h4>
                    <p className="text-[11px] text-[#747A75]">
                      Click "Detect My Location" or click directly anywhere on the map below to position the pin accurately.
                    </p>
                  </div>

                  {/* Detect My Location button */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="px-4 py-2 bg-[#174D3B] hover:bg-[#0F3528] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting GPS...' : 'Detect My Location'}</span>
                  </button>
                </div>

                {/* Google Map for Broker Pin Placement */}
                <div className="h-64 rounded-xl overflow-hidden border border-[#252A28]/15 shadow-inner relative">
                  <APIProvider apiKey={apiKey} libraries={['marker']}>
                    <Map
                      id="broker-add-prop-map"
                      mapId="DEMO_MAP_ID"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      defaultCenter={{ lat: form.lat, lng: form.lng }}
                      defaultZoom={14}
                      onClick={handleMapClick}
                      gestureHandling="greedy"
                      className="w-full h-full"
                    >
                      <AdvancedMarker
                        position={{ lat: form.lat, lng: form.lng }}
                        title="Adjustable Property Marker"
                      >
                        <div className="bg-[#174D3B] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D5B477]" />
                          <span>Property Pin</span>
                        </div>
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>

                  <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded text-[11px] text-[#747A75] font-mono border border-[#252A28]/10 shadow-sm">
                    Lat: {form.lat.toFixed(4)}, Lng: {form.lng.toFixed(4)} · Click map to adjust
                  </div>
                </div>

                {/* Manual Coordinate Inputs & Location Confirmation Indicator */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#252A28] mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.lat}
                      onChange={(e) => {
                        setForm({ ...form, lat: Number(e.target.value) });
                        setIsLocationConfirmed(false);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-[#252A28]/15 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#252A28] mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.lng}
                      onChange={(e) => {
                        setForm({ ...form, lng: Number(e.target.value) });
                        setIsLocationConfirmed(false);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-[#252A28]/15 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#252A28] mb-0.5">Location Check</label>
                    <button
                      type="button"
                      onClick={() => setIsLocationConfirmed(true)}
                      className={`w-full py-1.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        isLocationConfirmed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#D5B477] text-[#252A28] hover:bg-[#c4a366]'
                      }`}
                    >
                      {isLocationConfirmed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Location Confirmed</span>
                        </>
                      ) : (
                        <span>Confirm Location Pin</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label className="block font-semibold text-[#252A28] mb-1">Configuration (BHK)</label>
                <select
                  value={form.bedroomCount}
                  onChange={(e) => setForm({ ...form, bedroomCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg"
                >
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK Luxury</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252A28] mb-1">Carpet Area (sq.ft)</label>
                <input
                  type="number"
                  required
                  value={form.carpetArea}
                  onChange={(e) => setForm({ ...form, carpetArea: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg font-mono-num"
                />
              </div>

              {/* Photos Asset Selection */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-[#252A28] mb-2">
                  High-Resolution Property Photography
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SAMPLE_IMAGES.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setForm({ ...form, coverImage: img.url })}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1 bg-white ${
                        form.coverImage === img.url ? 'border-[#174D3B] ring-2 ring-[#174D3B]/20' : 'border-transparent'
                      }`}
                    >
                      <div className="h-20 w-full rounded-lg overflow-hidden">
                        <img src={img.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-[#252A28] block truncate mt-1 text-center font-semibold">
                        {img.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Broker Initial Offer Pricing */}
              <div className="md:col-span-2 bg-[#F8F5EE] p-4 rounded-xl border border-[#252A28]/10 space-y-3">
                <h4 className="font-bold text-[#174D3B]">
                  Your Broker Offer on this Canonical Property
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#252A28] mb-1">
                      {form.transactionType === 'rent' ? 'Monthly Rent (INR)' : 'Sale Price (INR)'}
                    </label>
                    <input
                      type="number"
                      required
                      value={form.priceOrRent}
                      onChange={(e) => setForm({ ...form, priceOrRent: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-[#252A28]/15 rounded-md font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#252A28] mb-1">Security Deposit</label>
                    <input
                      type="number"
                      value={form.depositAmount}
                      onChange={(e) => setForm({ ...form, depositAmount: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-[#252A28]/15 rounded-md font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#252A28] mb-1">Brokerage (Fixed INR)</label>
                    <input
                      type="number"
                      value={form.brokerageValue}
                      onChange={(e) => setForm({ ...form, brokerageValue: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-[#252A28]/15 rounded-md font-mono-num"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#252A28]/10">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#174D3B] text-white rounded-lg text-xs font-bold hover:bg-[#0F3528] transition-colors flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Property to LocalStorage</span>
              </button>
            </div>
          </form>
        )}

        {/* MODAL: Require Location Confirmation if not confirmed */}
        {showLocationConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#252A28]/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D5B477]/20 text-[#174D3B] flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5 text-[#174D3B]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#252A28]">Confirm Property Location</h3>
                  <p className="text-xs text-[#747A75]">Verify coordinates before saving</p>
                </div>
              </div>

              <div className="bg-[#F8F5EE] p-3 rounded-xl border border-[#252A28]/10 text-xs space-y-1 font-mono">
                <div><strong>Address:</strong> {form.address}, {form.locality}, {form.city}</div>
                <div><strong>Latitude:</strong> {form.lat.toFixed(4)}</div>
                <div><strong>Longitude:</strong> {form.lng.toFixed(4)}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLocationConfirmModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Adjust Pin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationConfirmed(true);
                    setShowLocationConfirmModal(false);
                  }}
                  className="px-5 py-2 bg-[#174D3B] text-white rounded-lg text-xs font-bold hover:bg-[#0F3528]"
                >
                  Confirm & Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MY PROPERTIES */}
        {activeTab === 'my-properties' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#252A28]">
                Canonical Listings in Database ({properties.length})
              </h3>
              <button
                onClick={onExploreMap}
                className="text-xs font-semibold text-[#174D3B] underline"
              >
                View on Google Map
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-xl border border-[#252A28]/15 overflow-hidden shadow-xs p-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-40 w-full rounded-lg overflow-hidden bg-[#F3EFE6]">
                      <img src={prop.coverImage} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#C96F4A] font-semibold">{prop.locality}, {prop.city}</span>
                      <h4 className="font-bold text-sm text-[#252A28] line-clamp-1">{prop.title}</h4>
                      <span className="text-xs text-[#747A75] font-mono">{prop.canonicalKey}</span>
                    </div>
                    <div className="bg-[#F8F5EE] p-2.5 rounded-lg text-xs flex justify-between items-center">
                      <span className="text-[#747A75]">Broker Offers</span>
                      <strong className="text-[#174D3B] font-bold">{prop.offers?.length || 1} Competing Offers</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SUBMIT OFFER ON EXISTING CANONICAL PROPERTY (Multi-broker requirement) */}
        {activeTab === 'submit-offer' && (
          <form onSubmit={handleAddOfferToCanonical} className="bg-white rounded-2xl border border-[#252A28]/15 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-[#174D3B]">
                Compete on an Existing Canonical Property
              </h3>
              <p className="text-xs text-[#747A75]">
                Multiple brokers can submit distinct rates and brokerage terms for the same real-world residence without duplicating the listing.
              </p>
            </div>

            {offerToast && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your competitive broker offer has been linked to the canonical property!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#252A28] mb-1">Select Canonical Property</label>
                <select
                  value={selectedCanonicalPropId}
                  onChange={(e) => setSelectedCanonicalPropId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#252A28]/15 rounded-lg font-semibold"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.locality}, {p.city} · {p.bedroomCount} BHK · {p.offers?.length || 1} Offers)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252A28] mb-1">Your Quoted Rate (INR)</label>
                <input
                  type="number"
                  required
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md font-mono-num"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A28] mb-1">Security Deposit (INR)</label>
                <input
                  type="number"
                  value={offerDeposit}
                  onChange={(e) => setOfferDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md font-mono-num"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A28] mb-1">Brokerage Commission (Fixed INR)</label>
                <input
                  type="number"
                  value={offerBrokerageVal}
                  onChange={(e) => setOfferBrokerageVal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md font-mono-num"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A28] mb-1">Special Perk / Disclosed Inclusions</label>
                <input
                  type="text"
                  value={offerPerk}
                  onChange={(e) => setOfferPerk(e.target.value)}
                  placeholder="e.g. Free registration assistance, 1 mo maintenance free"
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#252A28]/10">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#174D3B] text-white rounded-lg text-xs font-bold hover:bg-[#0F3528] transition-colors shadow-xs"
              >
                Publish Competing Offer
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: LEADS */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-2xl border border-[#252A28]/15 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]">
              <h3 className="text-sm font-bold text-[#252A28]">Citizen Leads ({enquiries.length})</h3>
            </div>
            <div className="divide-y divide-[#252A28]/10">
              {enquiries.map((enq) => (
                <div key={enq.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-sm font-bold text-[#252A28]">{enq.citizenName}</strong>
                    <p className="text-[#252A28] italic">"{enq.message}"</p>
                    <span className="text-[#747A75]">Phone: {enq.citizenPhone} · Property: {enq.propertyId}</span>
                  </div>
                  <select
                    value={enq.status}
                    onChange={(e) => {
                      updateEnquiryStatus(enq.id, e.target.value as any);
                      setEnquiries(getEnquiries());
                    }}
                    className="px-3 py-1.5 bg-white border rounded-lg text-xs font-semibold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="viewing_scheduled">Viewing Scheduled</option>
                    <option value="closed">Closed Deal</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: VIEWINGS */}
        {activeTab === 'viewings' && (
          <div className="bg-white rounded-2xl border border-[#252A28]/15 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]">
              <h3 className="text-sm font-bold text-[#252A28]">Scheduled Property Tours ({viewings.length})</h3>
            </div>
            <div className="divide-y divide-[#252A28]/10">
              {viewings.map((view) => (
                <div key={view.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-sm font-bold text-[#252A28]">
                      {view.preferredDate} ({view.preferredTimeSlot})
                    </strong>
                    <div className="text-[#747A75]">Citizen: {view.citizenName} · Phone: {view.citizenPhone}</div>
                  </div>
                  <select
                    value={view.status}
                    onChange={(e) => {
                      updateViewingStatus(view.id, e.target.value as any);
                      setViewings(getViewings());
                    }}
                    className="px-3 py-1.5 bg-white border rounded-lg text-xs font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
