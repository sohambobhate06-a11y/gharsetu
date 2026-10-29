import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, Phone, Mail, Building } from 'lucide-react';
import { Property, BrokerOffer } from '../types';
import { createEnquiry, formatINR } from '../services/storage';

interface EnquiryModalProps {
  property: Property;
  offer?: BrokerOffer;
  onClose: () => void;
  onSuccess: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  property,
  offer,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: 'Aditya Sharma',
    email: 'aditya.sharma@example.com',
    phone: '+91 98200 12345',
    message: offer
      ? `Hello ${offer.brokerName}, I reviewed your offer for ${property.title} quoted at ${formatINR(offer.transactionType === 'rent' ? offer.rentAmount : offer.salePrice)}. I would like to discuss move-in terms and lease conditions.`
      : `Hello, I am interested in ${property.title} in ${property.locality}. Please connect regarding current availability.`,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEnquiry({
      propertyId: property.id,
      offerId: offer?.id,
      brokerId: offer?.brokerId,
      citizenName: formData.name,
      citizenEmail: formData.email,
      citizenPhone: formData.phone,
      message: formData.message,
    });

    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#252A28]/15 overflow-hidden">
        {/* Header */}
        <div className="bg-[#174D3B] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-serif">
              Direct Broker Enquiry
            </h3>
            <p className="text-xs text-white/80">
              Saved directly to LocalStorage
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#174D3B]/10 text-[#174D3B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-[#252A28]">Enquiry Dispatched!</h4>
            <p className="text-xs text-[#747A75] max-w-xs mx-auto">
              Your inquiry has been stored in LocalStorage and linked to {offer?.brokerName || 'the assigned broker'}. Check Citizen Dashboard to monitor responses.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Target offer summary box */}
            <div className="bg-[#F8F5EE] rounded-xl p-3 border border-[#252A28]/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#747A75] block">Inquiring About:</span>
                <strong className="text-[#252A28] font-semibold text-xs block truncate max-w-[240px]">
                  {property.title}
                </strong>
                {offer && (
                  <span className="text-[11px] text-[#174D3B] font-medium">
                    Broker: {offer.brokerName} ({offer.brokerAgency})
                  </span>
                )}
              </div>
              {offer && (
                <div className="text-right">
                  <span className="text-xs font-bold text-[#174D3B] font-mono-num block">
                    {formatINR(offer.transactionType === 'rent' ? offer.rentAmount : offer.salePrice)}
                  </span>
                  <span className="text-[10px] text-[#747A75]">
                    Brokerage: {offer.brokerageType === 'fixed' ? formatINR(offer.brokerageValue) : `${offer.brokerageValue}%`}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-[#252A28] mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg focus:ring-1 focus:ring-[#174D3B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#252A28] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg focus:ring-1 focus:ring-[#174D3B]"
                />
              </div>
              <div>
                <label className="block font-medium text-[#252A28] mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg focus:ring-1 focus:ring-[#174D3B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#252A28] mb-1">Message for Broker</label>
              <textarea
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg focus:ring-1 focus:ring-[#174D3B]"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#747A75] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#174D3B] shrink-0" />
              <span>GharSetu verified escrow data guarantee · No unsolicited spam.</span>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#252A28]/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#747A75] hover:text-[#252A28]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#174D3B] text-white rounded-lg text-xs font-semibold hover:bg-[#0F3528] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Enquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
