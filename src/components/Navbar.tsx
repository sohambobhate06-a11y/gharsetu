import React from 'react';
import { Building2, Bookmark, UserCheck, ShieldCheck, Compass, Home } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  userRole,
  onRoleChange,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F8F5EE]/95 backdrop-blur-md border-b border-[#252A28]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174D3B]"
        >
          <div className="w-10 h-10 rounded-lg bg-[#174D3B] text-[#F8F5EE] flex items-center justify-center font-serif text-xl font-bold tracking-tight shadow-sm group-hover:bg-[#0F3528] transition-colors">
            G
          </div>
          <div>
            <span className="text-2xl font-serif font-bold tracking-tight text-[#174D3B] block leading-none">
              GharSetu
            </span>
            <span className="text-[11px] text-[#747A75] font-medium tracking-wide">
              Every Deal · One Destination
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#252A28]">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-1.5 transition-colors pb-0.5 ${
              currentTab === 'home'
                ? 'text-[#174D3B] font-semibold border-b-2 border-[#174D3B]'
                : 'text-[#747A75] hover:text-[#174D3B]'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>

          <button
            onClick={() => onNavigate('map')}
            className={`flex items-center gap-1.5 transition-colors pb-0.5 ${
              currentTab === 'map'
                ? 'text-[#174D3B] font-semibold border-b-2 border-[#174D3B]'
                : 'text-[#747A75] hover:text-[#174D3B]'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore Map & Search
          </button>

          <button
            onClick={() => onNavigate('properties')}
            className={`flex items-center gap-1.5 transition-colors pb-0.5 ${
              currentTab === 'properties'
                ? 'text-[#174D3B] font-semibold border-b-2 border-[#174D3B]'
                : 'text-[#747A75] hover:text-[#174D3B]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            All Properties
          </button>

          <button
            onClick={() => onNavigate('urban-afford')}
            className={`flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-md text-xs font-bold ${
              currentTab === 'urban-afford'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span>🌿 Urban Afford</span>
          </button>

          <button
            onClick={() => onNavigate('how-it-works')}
            className={`transition-colors pb-0.5 ${
              currentTab === 'how-it-works'
                ? 'text-[#174D3B] font-semibold border-b-2 border-[#174D3B]'
                : 'text-[#747A75] hover:text-[#174D3B]'
            }`}
          >
            How Multi-Broker Works
          </button>
        </nav>

        {/* Zone 3: Portal Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Saved Bookmarks Button */}
          <button
            onClick={() => onNavigate('citizen')}
            className="relative p-2.5 rounded-lg border border-[#252A28]/15 bg-white text-[#252A28] hover:border-[#174D3B] hover:text-[#174D3B] transition-colors focus:outline-none"
            title="Saved Properties"
          >
            <Bookmark className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#C96F4A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center font-mono-num">
                {savedCount}
              </span>
            )}
          </button>

          {/* Role Mode Selector Dropdown */}
          <div className="relative inline-flex items-center bg-[#F3EFE6] border border-[#252A28]/15 rounded-lg p-1 text-xs">
            <button
              onClick={() => {
                onRoleChange('citizen');
                onNavigate('citizen');
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                userRole === 'citizen' && currentTab === 'citizen'
                  ? 'bg-[#C96F4A] text-white shadow-xs'
                  : 'text-[#252A28] hover:text-[#C96F4A]'
              }`}
            >
              Citizen Portal
            </button>
            <button
              onClick={() => {
                onRoleChange('broker');
                onNavigate('broker');
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                userRole === 'broker' && currentTab === 'broker'
                  ? 'bg-[#174D3B] text-white shadow-xs'
                  : 'text-[#252A28] hover:text-[#174D3B]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Broker Portal
            </button>
            <button
              onClick={() => {
                onRoleChange('admin');
                onNavigate('admin');
              }}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                userRole === 'admin' && currentTab === 'admin'
                  ? 'bg-[#252A28] text-[#F59E0B] shadow-xs'
                  : 'text-[#747A75] hover:text-[#252A28]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#252A28]/10 py-2.5 px-3 bg-white text-xs">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'home' ? 'text-[#174D3B] font-bold' : 'text-[#747A75]'}`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('map')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'map' ? 'text-[#174D3B] font-bold' : 'text-[#747A75]'}`}
        >
          <Compass className="w-4 h-4" />
          <span>Map Search</span>
        </button>
        <button
          onClick={() => onNavigate('properties')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'properties' ? 'text-[#174D3B] font-bold' : 'text-[#747A75]'}`}
        >
          <Building2 className="w-4 h-4" />
          <span>Listings</span>
        </button>
        <button
          onClick={() => onNavigate(userRole === 'broker' ? 'broker' : userRole === 'admin' ? 'admin' : 'citizen')}
          className={`flex flex-col items-center gap-1 ${['citizen', 'broker', 'admin'].includes(currentTab) ? 'text-[#174D3B] font-bold' : 'text-[#747A75]'}`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Portal</span>
        </button>
      </div>
    </header>
  );
};
