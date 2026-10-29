import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#252A28] text-white/80 text-xs border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#174D3B] text-[#F8F5EE] flex items-center justify-center font-serif text-lg font-bold">
                G
              </div>
              <span className="text-xl font-serif font-bold text-white tracking-tight">
                GharSetu
              </span>
            </div>
            <p className="text-white/60 leading-relaxed text-[11px]">
              India's premier canonical real estate marketplace. Compare multiple broker offers on identical properties with zero hidden fees.
            </p>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Explore Metros
            </h4>
            <ul className="space-y-1.5 text-white/60">
              <li><button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">Mumbai (Bandra, Worli, Juhu, Powai)</button></li>
              <li><button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">Thane (Hiranandani Estate, Majiwada)</button></li>
              <li><button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">Bengaluru (Indiranagar, Koramangala)</button></li>
              <li><button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">Delhi NCR (Gurgaon DLF Phase 5)</button></li>
              <li><button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">Pune & Hyderabad</button></li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Marketplace Navigation
            </h4>
            <ul className="space-y-1.5 text-white/60">
              <li><button onClick={() => onNavigate('urban-afford')} className="hover:text-white text-emerald-400 font-bold transition-colors">🌿 Urban Afford Homes</button></li>
              <li><button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">Interactive Map Search</button></li>
              <li><button onClick={() => onNavigate('properties')} className="hover:text-white transition-colors">All Listed Residences</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">How Multi-Broker Works</button></li>
              <li><button onClick={() => onNavigate('citizen')} className="hover:text-white transition-colors">Citizen Saved Bookmarks</button></li>
              <li><button onClick={() => onNavigate('broker')} className="hover:text-white transition-colors">Broker Portal & Add Property</button></li>
            </ul>
          </div>

          {/* Trust and RERA */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D5B477]" />
              <span>RERA Compliance</span>
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed">
              GharSetu enforces strict broker license validation. Every pricing offer discloses monthly rents, security deposits, and brokerage fees in full.
            </p>
            <div className="text-[10px] text-white/40 font-mono">
              Engineered with LocalStorage Engine · No External Database Required
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50">
          <div>
            © {new Date().getFullYear()} GharSetu Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>RERA Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
