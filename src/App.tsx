/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GoogleMapSearch } from './components/GoogleMapSearch';
import { FeaturedProperties } from './components/FeaturedProperties';
import { HowItWorks } from './components/HowItWorks';
import { CitizenPortal } from './components/CitizenPortal';
import { BrokerPortal } from './components/BrokerPortal';
import { AdminPortal } from './components/AdminPortal';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { CompareOffersModal } from './components/CompareOffersModal';
import { EnquiryModal } from './components/EnquiryModal';
import { ViewingModal } from './components/ViewingModal';
import { Footer } from './components/Footer';
import { Property, BrokerOffer, UserRole, TransactionType } from './types';
import {
  initStorage,
  getProperties,
  getSavedPropertyIds,
  getUserRole,
  setUserRole,
} from './services/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userRole, setActiveUserRole] = useState<UserRole>('citizen');
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [compareProperty, setCompareProperty] = useState<Property | null>(null);
  const [enquiryTarget, setEnquiryTarget] = useState<{ property: Property; offer?: BrokerOffer } | null>(null);
  const [viewingTarget, setViewingTarget] = useState<{ property: Property; offer?: BrokerOffer } | null>(null);

  // Map search initial filters passed from Hero
  const [mapInitialCity, setMapInitialCity] = useState<string>('Mumbai');
  const [mapInitialType, setMapInitialType] = useState<TransactionType>('rent');

  // Load from local storage on mount & listen to Google Maps quota events
  useEffect(() => {
    initStorage();
    refreshData();
    setActiveUserRole(getUserRole());

    const quotaHandler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', quotaHandler);
    return () => window.removeEventListener('gmp-quota-exceeded', quotaHandler);
  }, []);

  const refreshData = () => {
    const props = getProperties();
    setProperties(props);
    setSavedCount(getSavedPropertyIds().length);
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveUserRole(role);
    setUserRole(role);
  };

  const handleHeroSearch = (city: string, type: TransactionType, bhk: number | 'all') => {
    setMapInitialCity(city);
    setMapInitialType(type);
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EE] text-[#252A28]">
      {/* Tier 2 Demo Key Quota Warning Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          refreshData();
        }}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        savedCount={savedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* TAB 1: HOME LANDING PAGE */}
        {currentTab === 'home' && (
          <div>
            <HeroSection
              onSearch={handleHeroSearch}
              onExploreMap={() => setCurrentTab('map')}
            />
            <FeaturedProperties
              properties={properties}
              onSelectProperty={(p) => setSelectedProperty(p)}
              onCompareOffers={(p) => setCompareProperty(p)}
            />
            <HowItWorks />
          </div>
        )}

        {/* TAB 2: INTERACTIVE GOOGLE MAP & SEARCHING TAB */}
        {currentTab === 'map' && (
          <GoogleMapSearch
            properties={properties}
            onSelectProperty={(p) => setSelectedProperty(p)}
            onCompareOffers={(p) => setCompareProperty(p)}
            initialCity={mapInitialCity}
            initialType={mapInitialType}
          />
        )}

        {/* TAB 3: ALL PROPERTIES CATALOG */}
        {currentTab === 'properties' && (
          <div className="py-8">
            <FeaturedProperties
              properties={properties}
              onSelectProperty={(p) => setSelectedProperty(p)}
              onCompareOffers={(p) => setCompareProperty(p)}
              initialCategory="all"
            />
          </div>
        )}

        {/* TAB 3B: URBAN AFFORD DEDICATED COLLECTION */}
        {currentTab === 'urban-afford' && (
          <div className="py-8">
            <FeaturedProperties
              properties={properties}
              onSelectProperty={(p) => setSelectedProperty(p)}
              onCompareOffers={(p) => setCompareProperty(p)}
              initialCategory="afford"
            />
          </div>
        )}

        {/* TAB 4: HOW IT WORKS EXPLAINER */}
        {currentTab === 'how-it-works' && (
          <div className="py-8">
            <HowItWorks />
          </div>
        )}

        {/* TAB 5: CITIZEN WORKSPACE */}
        {currentTab === 'citizen' && (
          <CitizenPortal
            onSelectProperty={(p) => setSelectedProperty(p)}
            onCompareOffers={(p) => setCompareProperty(p)}
            onExploreMap={() => setCurrentTab('map')}
          />
        )}

        {/* TAB 6: BROKER PORTAL */}
        {currentTab === 'broker' && (
          <BrokerPortal
            onPropertyCreated={refreshData}
            onExploreMap={() => setCurrentTab('map')}
          />
        )}

        {/* TAB 7: ADMIN PORTAL */}
        {currentTab === 'admin' && <AdminPortal />}
      </main>

      {/* Footer */}
      {currentTab !== 'map' && <Footer onNavigate={(t) => setCurrentTab(t)} />}

      {/* MODAL 1: Compare Broker Offers Modal */}
      {compareProperty && (
        <CompareOffersModal
          property={compareProperty}
          onClose={() => setCompareProperty(null)}
          onEnquire={(prop, offer) => {
            setCompareProperty(null);
            setEnquiryTarget({ property: prop, offer });
          }}
          onBookViewing={(prop, offer) => {
            setCompareProperty(null);
            setViewingTarget({ property: prop, offer });
          }}
          onOfferAdded={() => {
            refreshData();
            const updated = getProperties().find((p) => p.id === compareProperty.id);
            if (updated) setCompareProperty(updated);
          }}
        />
      )}

      {/* MODAL 2: Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onCompareOffers={(prop) => {
            setSelectedProperty(null);
            setCompareProperty(prop);
          }}
          onEnquire={(prop, offer) => {
            setSelectedProperty(null);
            setEnquiryTarget({ property: prop, offer });
          }}
          onBookViewing={(prop, offer) => {
            setSelectedProperty(null);
            setViewingTarget({ property: prop, offer });
          }}
        />
      )}

      {/* MODAL 3: Direct Broker Enquiry Modal */}
      {enquiryTarget && (
        <EnquiryModal
          property={enquiryTarget.property}
          offer={enquiryTarget.offer}
          onClose={() => setEnquiryTarget(null)}
          onSuccess={() => {
            setEnquiryTarget(null);
            refreshData();
          }}
        />
      )}

      {/* MODAL 4: Schedule Viewing Modal */}
      {viewingTarget && (
        <ViewingModal
          property={viewingTarget.property}
          offer={viewingTarget.offer}
          onClose={() => setViewingTarget(null)}
          onSuccess={() => {
            setViewingTarget(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
