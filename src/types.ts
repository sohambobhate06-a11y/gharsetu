/**
 * GharSetu - Types definition
 */

export type TransactionType = 'rent' | 'buy';
export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'independent_house';
export type FurnishingType = 'unfurnished' | 'semi-furnished' | 'fully-furnished';
export type UserRole = 'citizen' | 'broker' | 'admin';

export interface BrokerOffer {
  id: string;
  propertyId: string;
  brokerId: string;
  brokerName: string;
  brokerAgency: string;
  brokerPhone: string;
  brokerEmail: string;
  brokerRating: number;
  brokerReraId: string;
  isVerifiedBroker: boolean;
  transactionType: TransactionType;
  rentAmount?: number; // Monthly INR
  salePrice?: number; // Total INR
  depositAmount?: number; // Refundable deposit INR
  brokerageType: 'fixed' | 'percentage';
  brokerageValue: number; // e.g. 25000 (INR) or 1.5 (%)
  maintenanceChargesMonthly?: number;
  negotiable: boolean;
  availability: 'Immediate' | 'Within 15 Days' | 'Within 30 Days' | 'Specific Date';
  availableFrom?: string;
  specialConditions?: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  canonicalKey: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  city: 'Mumbai' | 'Thane' | string;
  locality: string;
  postalCode: string;
  address: string;
  lat: number;
  lng: number;
  bedroomCount: number;
  bathroomCount: number;
  balconyCount: number;
  carpetArea: number; // sq ft
  builtUpArea?: number;
  furnishing: FurnishingType;
  floorNumber?: number;
  totalFloors?: number;
  parking: string;
  amenities: string[];
  coverImage: string;
  images: string[];
  isVerified: boolean;
  moderationStatus: 'active' | 'pending_review' | 'rejected' | 'rented' | 'sold';
  isDemoDataset?: boolean;
  createdAt: string;
  updatedAt: string;
  offers?: BrokerOffer[];
}

export interface Enquiry {
  id: string;
  propertyId: string;
  offerId?: string;
  brokerId?: string;
  citizenId?: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone: string;
  message: string;
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'closed';
  createdAt: string;
}

export interface ViewingAppointment {
  id: string;
  propertyId: string;
  offerId?: string;
  brokerId?: string;
  citizenId?: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface CitizenPreferences {
  preferredCity: string;
  preferredLocalities: string[];
  transactionType: TransactionType;
  minBudget: number;
  maxBudget: number;
  propertyTypes: PropertyType[];
  bedroomCount: number[];
  minCarpetArea: number;
  furnishing: FurnishingType[];
  requiredAmenities: string[];
}

export interface CitizenProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  occupation?: string;
  savedPropertyIds: string[];
  preferences: CitizenPreferences;
}

export interface BrokerProfile {
  id: string;
  userId: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  reraId: string;
  operatingCities: string[];
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended';
  rating: number;
  activeListingsCount: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface SearchFilters {
  searchQuery: string;
  transactionType: TransactionType;
  city: string;
  locality?: string;
  propertyType?: string;
  bedrooms?: number | 'all';
  minPrice?: number;
  maxPrice?: number;
  furnishing?: string;
  minArea?: number;
  amenities?: string[];
  onlyVerified?: boolean;
  radiusKm?: number;
  userCoords?: { lat: number; lng: number } | null;
}
