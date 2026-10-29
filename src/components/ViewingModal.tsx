import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { Property, BrokerOffer } from '../types';
import { createViewing } from '../services/storage';

interface ViewingModalProps {
  property: Property;
  offer?: BrokerOffer;
  onClose: () => void;
  onSuccess: () => void;
}

export const ViewingModal: React.FC<ViewingModalProps> = ({
  property,
  offer,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: 'Aditya Sharma',
    email: 'aditya.sharma@example.com',
    phone: '+91 98200 12345',
    date: '2026-11-02',
    timeSlot: '11:00 AM - 01:00 PM',
    notes: 'Please ensure high-floor balcony and parking access is ready for viewing.',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createViewing({
      propertyId: property.id,
      offerId: offer?.id,
      brokerId: offer?.brokerId,
      citizenName: formData.name,
      citizenEmail: formData.email,
      citizenPhone: formData.phone,
      preferredDate: formData.date,
      preferredTimeSlot: formData.timeSlot,
      notes: formData.notes,
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
              Schedule Property Site Visit
            </h3>
            <p className="text-xs text-white/80">
              Personalized private tour confirmed via LocalStorage
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
            <h4 className="text-lg font-bold text-[#252A28]">Viewing Scheduled!</h4>
            <p className="text-xs text-[#747A75] max-w-xs mx-auto">
              Your appointment on <strong>{formData.date}</strong> ({formData.timeSlot}) is saved in LocalStorage. Track it in your Citizen Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Property Summary */}
            <div className="bg-[#F8F5EE] rounded-xl p-3 border border-[#252A28]/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-[11px] text-[#C96F4A] font-semibold">
                  <MapPin className="w-3 h-3" />
                  <span>{property.locality}, {property.city}</span>
                </div>
                <strong className="text-sm font-semibold text-[#252A28] block truncate max-w-[280px]">
                  {property.title}
                </strong>
                {offer && (
                  <span className="text-[11px] text-[#747A75]">
                    Broker Escort: {offer.brokerName} ({offer.brokerAgency})
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#252A28] mb-1">
                  Preferred Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg focus:ring-1 focus:ring-[#174D3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#252A28] mb-1">
                  Time Slot
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg focus:ring-1 focus:ring-[#174D3B]"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#252A28] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg focus:ring-1 focus:ring-[#174D3B]"
                />
              </div>
              <div>
                <label className="block font-medium text-[#252A28] mb-1">Phone</label>
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
              <label className="block font-medium text-[#252A28] mb-1">Special Inspection Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#252A28]/15 rounded-lg focus:ring-1 focus:ring-[#174D3B]"
              />
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
                <Calendar className="w-3.5 h-3.5" />
                <span>Confirm Viewing</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
