import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building,
  Users,
  Layers,
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { BrokerProfile, AuditLog, Property, CitizenProfile } from '../types';
import {
  getBrokers,
  updateBrokerVerification,
  getAuditLogs,
  getProperties,
  getOffers,
  getEnquiries,
  getViewings,
  getCitizens,
  resetDemoDataset,
  formatINR,
} from '../services/storage';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brokers' | 'citizens' | 'moderation' | 'audit'>('brokers');
  const [brokers, setBrokers] = useState<BrokerProfile[]>(getBrokers());
  const [citizens, setCitizens] = useState<CitizenProfile[]>(getCitizens());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs());
  const [resetToast, setResetToast] = useState(false);

  const properties = getProperties();
  const offers = getOffers();
  const enquiries = getEnquiries();
  const viewings = getViewings();

  const handleVerify = (id: string, status: BrokerProfile['verificationStatus']) => {
    updateBrokerVerification(id, status);
    setBrokers(getBrokers());
    setAuditLogs(getAuditLogs());
  };

  const handleResetDataset = () => {
    if (window.confirm('Reset local dataset to the 32 Mumbai/Thane sample properties?')) {
      resetDemoDataset();
      setBrokers(getBrokers());
      setCitizens(getCitizens());
      setAuditLogs(getAuditLogs());
      setResetToast(true);
      setTimeout(() => setResetToast(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#252A28] pb-16">
      {/* Admin Portal Header - Charcoal + Muted Amber Visual Theme */}
      <div className="bg-[#252A28] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              <span>Administrator & Governance Console</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span>RERA Compliance Enforcement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              GharSetu Central Administration
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-xl">
              Supervise broker credentials, prevent duplicate canonical listings, and audit system events stored in LocalStorage.
            </p>
          </div>

          {/* Reset Demo Dataset Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDataset}
              className="px-4 py-2 bg-[#D97706] hover:bg-[#b45309] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Resets sample dataset to 32 properties across Mumbai and Thane"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Dataset (32 Properties)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {resetToast && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully reloaded 32 sample properties, 6 brokers, and 8 citizens in LocalStorage!</span>
          </div>
        )}

        {/* Global Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-[#252A28]/15 shadow-xs">
            <span className="text-xs text-[#747A75]">Canonical Properties</span>
            <div className="text-2xl font-serif font-bold text-[#174D3B] font-mono-num mt-1">
              {properties.length}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Mumbai & Thane Metros</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#252A28]/15 shadow-xs">
            <span className="text-xs text-[#747A75]">Competing Offers</span>
            <div className="text-2xl font-serif font-bold text-[#C96F4A] font-mono-num mt-1">
              {offers.length}
            </div>
            <span className="text-[10px] text-[#747A75]">~2.5 offers per property</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#252A28]/15 shadow-xs">
            <span className="text-xs text-[#747A75]">Verified Brokers</span>
            <div className="text-2xl font-serif font-bold text-[#252A28] font-mono-num mt-1">
              {brokers.filter((b) => b.verificationStatus === 'verified').length} / {brokers.length}
            </div>
            <span className="text-[10px] text-[#D97706] font-semibold">1 Pending Review</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#252A28]/15 shadow-xs">
            <span className="text-xs text-[#747A75]">Citizen Accounts</span>
            <div className="text-2xl font-serif font-bold text-[#D97706] font-mono-num mt-1">
              {citizens.length}
            </div>
            <span className="text-[10px] text-[#747A75]">Active Profiles</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#252A28]/15 gap-2 overflow-x-auto pb-px mb-8 text-xs font-medium">
          <button
            onClick={() => setActiveTab('brokers')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'brokers'
                ? 'border-[#D97706] text-[#D97706] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Broker RERA Verification ({brokers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('citizens')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'citizens'
                ? 'border-[#D97706] text-[#D97706] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Citizen Directory ({citizens.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'border-[#D97706] text-[#D97706] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Duplicate & Canonical Review</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-[#D97706] text-[#D97706] font-bold'
                : 'border-transparent text-[#747A75] hover:text-[#252A28]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: BROKER VERIFICATION */}
        {activeTab === 'brokers' && (
          <div className="bg-white rounded-2xl border border-[#252A28]/15 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]">
              <h3 className="text-sm font-bold text-[#252A28]">Fictional Broker Licensing Roster</h3>
              <p className="text-xs text-[#747A75]">
                Review RERA registration codes and approve or reject representation privileges.
              </p>
            </div>

            <div className="divide-y divide-[#252A28]/10">
              {brokers.map((broker) => (
                <div key={broker.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-[#252A28]">{broker.fullName}</strong>
                      <span className="text-[#747A75]">({broker.businessName})</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          broker.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : broker.verificationStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {broker.verificationStatus}
                      </span>
                    </div>
                    <div className="text-[#747A75] font-mono">
                      RERA: <strong className="text-[#252A28]">{broker.reraId}</strong> · Metros: {broker.operatingCities.join(', ')} · Phone: {broker.phone}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {broker.verificationStatus === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleVerify(broker.id, 'verified')}
                          className="px-3 py-1.5 bg-[#174D3B] text-white rounded-md text-xs font-semibold hover:bg-[#0F3528]"
                        >
                          Approve RERA
                        </button>
                        <button
                          onClick={() => handleVerify(broker.id, 'rejected')}
                          className="px-3 py-1.5 border border-rose-300 text-rose-700 rounded-md text-xs font-semibold hover:bg-rose-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleVerify(broker.id, 'suspended')}
                        className="px-3 py-1.5 border border-[#252A28]/20 text-[#252A28] rounded-md text-xs font-medium hover:bg-gray-50"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CITIZEN DIRECTORY */}
        {activeTab === 'citizens' && (
          <div className="bg-white rounded-2xl border border-[#252A28]/15 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]">
              <h3 className="text-sm font-bold text-[#252A28]">Registered Citizen Residents ({citizens.length})</h3>
            </div>
            <div className="divide-y divide-[#252A28]/10">
              {citizens.map((citizen) => (
                <div key={citizen.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-sm font-bold text-[#252A28]">{citizen.fullName}</strong>
                    <div className="text-[#747A75]">
                      {citizen.occupation} · {citizen.city} · Phone: {citizen.phone} · Email: {citizen.email}
                    </div>
                    <div className="text-[11px] text-[#174D3B] font-semibold">
                      Target: {citizen.preferences.preferredLocalities.join(', ')} ({formatINR(citizen.preferences.minBudget)} - {formatINR(citizen.preferences.maxBudget)})
                    </div>
                  </div>
                  <span className="text-xs bg-[#F8F5EE] px-2.5 py-1 rounded border font-mono">
                    {citizen.savedPropertyIds.length} Saved Homes
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DUPLICATE & CANONICAL REVIEW */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-2xl border border-[#252A28]/15 overflow-hidden shadow-xs p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#252A28]">
                Automated Duplicate Prevention Monitor
              </h3>
              <p className="text-xs text-[#747A75]">
                GharSetu merges identical buildings into single canonical records and lists competing broker offers underneath.
              </p>
            </div>

            <div className="space-y-3">
              {properties.slice(0, 10).map((prop) => (
                <div key={prop.id} className="p-4 rounded-xl border border-[#252A28]/10 bg-[#F8F5EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-sm font-bold text-[#252A28] block">{prop.title}</strong>
                    <span className="text-[#747A75] font-mono">Key: {prop.canonicalKey}</span>
                    <div className="text-[#747A75] mt-0.5">
                      Coordinates: ({prop.lat.toFixed(4)}, {prop.lng.toFixed(4)}) · {prop.locality}, {prop.city}
                    </div>
                  </div>

                  <div className="bg-white px-3.5 py-2 rounded-lg border border-[#252A28]/10 text-right">
                    <span className="text-[11px] text-[#747A75] block">Unified Offers</span>
                    <strong className="text-sm font-bold text-[#174D3B]">
                      {prop.offers?.length || 1} Competing Offers
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-[#252A28]/15 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#252A28]/10 bg-[#F8F5EE]">
              <h3 className="text-sm font-bold text-[#252A28]">System Audit Trail</h3>
            </div>
            <div className="divide-y divide-[#252A28]/10 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#174D3B] font-sans">{log.action}</span>
                      <span className="text-[10px] text-[#747A75]">by {log.actor} ({log.role})</span>
                    </div>
                    <p className="text-[#252A28] text-[11px] font-sans">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-[#747A75] shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
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
