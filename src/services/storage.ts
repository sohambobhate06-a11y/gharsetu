/**
 * GharSetu - LocalStorage Data Engine
 * Persists canonical properties, multi-broker offers, inquiries, viewing visits,
 * 6 fictional brokers, 8 citizens, and 32 realistic Mumbai & Thane sample properties.
 */

import {
  Property,
  BrokerOffer,
  Enquiry,
  ViewingAppointment,
  CitizenPreferences,
  CitizenProfile,
  BrokerProfile,
  AuditLog,
  UserRole,
  TransactionType,
} from '../types';

const STORAGE_KEYS = {
  PROPERTIES: 'gharsetu_properties_v2',
  OFFERS: 'gharsetu_offers_v2',
  SAVED_PROPERTIES: 'gharsetu_saved_properties_v2',
  ENQUIRIES: 'gharsetu_enquiries_v2',
  VIEWINGS: 'gharsetu_viewings_v2',
  PREFERENCES: 'gharsetu_preferences_v2',
  BROKERS: 'gharsetu_brokers_v2',
  CITIZENS: 'gharsetu_citizens_v2',
  ACTIVE_CITIZEN_ID: 'gharsetu_active_citizen_id_v2',
  ACTIVE_BROKER_ID: 'gharsetu_active_broker_id_v2',
  AUDIT_LOGS: 'gharsetu_audit_logs_v2',
  USER_ROLE: 'gharsetu_active_role_v2',
};

// Curated high-res property assets generated for GharSetu
const IMAGES = {
  mumbaiHero: '/src/assets/images/hero_mumbai_luxury_home_1793260661654.jpg',
  bangaloreVilla: '/src/assets/images/villa_bangalore_greenery_1793260662740.jpg',
  delhiInterior: '/src/assets/images/apartment_delhi_interior_1793260662950.jpg',
  punePenthouse: '/src/assets/images/penthouse_pune_terrace_1793260662346.jpg',
};

// 6 Fictional Licensed Brokers in Mumbai & Thane
export const SEED_BROKERS: BrokerProfile[] = [
  {
    id: 'broker-101',
    userId: 'user-broker-101',
    fullName: 'Rajesh Varma',
    businessName: 'Varma Prime Realty Bandra',
    email: 'rajesh@varmaprime.in',
    phone: '+91 98201 44521',
    reraId: 'A51900018472',
    operatingCities: ['Mumbai', 'Thane'],
    verificationStatus: 'verified',
    rating: 4.9,
    activeListingsCount: 16,
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'broker-102',
    userId: 'user-broker-102',
    fullName: 'Anita Shroff',
    businessName: 'Coastline Luxe Homes Mumbai',
    email: 'anita@coastlineluxe.com',
    phone: '+91 98190 77319',
    reraId: 'A51900029381',
    operatingCities: ['Mumbai'],
    verificationStatus: 'verified',
    rating: 4.8,
    activeListingsCount: 11,
    createdAt: '2025-03-20T00:00:00Z',
  },
  {
    id: 'broker-103',
    userId: 'user-broker-103',
    fullName: 'Vikram Mehta',
    businessName: 'Heritage Estates Mumbai',
    email: 'vikram@heritageestates.co.in',
    phone: '+91 98211 99014',
    reraId: 'A51900041120',
    operatingCities: ['Mumbai'],
    verificationStatus: 'verified',
    rating: 4.7,
    activeListingsCount: 9,
    createdAt: '2025-05-10T00:00:00Z',
  },
  {
    id: 'broker-104',
    userId: 'user-broker-104',
    fullName: 'Prashant Deshmukh',
    businessName: 'Thane Greens Realty & Projects',
    email: 'prashant@thanegreens.in',
    phone: '+91 98230 55112',
    reraId: 'A51700019283',
    operatingCities: ['Thane', 'Mumbai'],
    verificationStatus: 'verified',
    rating: 4.9,
    activeListingsCount: 14,
    createdAt: '2025-02-18T00:00:00Z',
  },
  {
    id: 'broker-105',
    userId: 'user-broker-105',
    fullName: 'Kavita Saxena',
    businessName: 'Metro Suburban Property Advisors',
    email: 'kavita@metrosuburban.com',
    phone: '+91 98200 88219',
    reraId: 'A51900088219',
    operatingCities: ['Mumbai', 'Thane'],
    verificationStatus: 'verified',
    rating: 4.8,
    activeListingsCount: 8,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'broker-106',
    userId: 'user-broker-106',
    fullName: 'Sameer Patil',
    businessName: 'Lake City Real Estate Thane',
    email: 'sameer@lakecitythane.in',
    phone: '+91 98215 34912',
    reraId: 'A51700034912',
    operatingCities: ['Thane'],
    verificationStatus: 'pending',
    rating: 4.6,
    activeListingsCount: 4,
    createdAt: '2026-10-20T00:00:00Z',
  },
];

// 8 Fictional Citizens
export const SEED_CITIZENS: CitizenProfile[] = [
  {
    id: 'citizen-001',
    fullName: 'Aditya Sharma',
    email: 'aditya.sharma@example.com',
    phone: '+91 98200 12345',
    city: 'Mumbai',
    occupation: 'Fintech Product Lead',
    savedPropertyIds: ['prop-mum-01', 'prop-mum-02'],
    preferences: {
      preferredCity: 'Mumbai',
      preferredLocalities: ['Bandra West', 'Worli', 'Pali Hill'],
      transactionType: 'rent',
      minBudget: 150000,
      maxBudget: 350000,
      propertyTypes: ['apartment', 'penthouse'],
      bedroomCount: [2, 3],
      minCarpetArea: 1200,
      furnishing: ['fully-furnished'],
      requiredAmenities: ['Arabian Sea View', 'Gated Concierge'],
    },
  },
  {
    id: 'citizen-002',
    fullName: 'Sneha Mukherjee',
    email: 'sneha.m@example.com',
    phone: '+91 98300 44512',
    city: 'Mumbai',
    occupation: 'Creative Director',
    savedPropertyIds: ['prop-mum-03', 'prop-mum-05'],
    preferences: {
      preferredCity: 'Mumbai',
      preferredLocalities: ['Powai', 'Versova'],
      transactionType: 'rent',
      minBudget: 80000,
      maxBudget: 180000,
      propertyTypes: ['apartment'],
      bedroomCount: [2, 3],
      minCarpetArea: 950,
      furnishing: ['semi-furnished', 'fully-furnished'],
      requiredAmenities: ['Gymnasium', 'Lake View'],
    },
  },
  {
    id: 'citizen-003',
    fullName: 'Rohan Deshpande',
    email: 'rohan.d@example.com',
    phone: '+91 98220 77314',
    city: 'Thane',
    occupation: 'Enterprise Solutions Architect',
    savedPropertyIds: ['prop-tha-01', 'prop-tha-04'],
    preferences: {
      preferredCity: 'Thane',
      preferredLocalities: ['Hiranandani Estate', 'Vasant Vihar', 'Majiwada'],
      transactionType: 'buy',
      minBudget: 15000000,
      maxBudget: 32000000,
      propertyTypes: ['apartment', 'villa'],
      bedroomCount: [3, 4],
      minCarpetArea: 1400,
      furnishing: ['semi-furnished'],
      requiredAmenities: ['Swimming Pool', 'Clubhouse'],
    },
  },
  {
    id: 'citizen-004',
    fullName: 'Pooja Iyer',
    email: 'pooja.iyer@example.com',
    phone: '+91 98205 66789',
    city: 'Mumbai',
    occupation: 'Senior Corporate Counsel',
    savedPropertyIds: ['prop-mum-04', 'prop-mum-08'],
    preferences: {
      preferredCity: 'Mumbai',
      preferredLocalities: ['Juhu', 'Khar West'],
      transactionType: 'buy',
      minBudget: 50000000,
      maxBudget: 120000000,
      propertyTypes: ['apartment', 'penthouse'],
      bedroomCount: [3, 4],
      minCarpetArea: 1800,
      furnishing: ['fully-furnished'],
      requiredAmenities: ['Private Balcony', 'High Speed Elevators'],
    },
  },
  {
    id: 'citizen-005',
    fullName: 'Kunal Verma',
    email: 'kunal.v@example.com',
    phone: '+91 98110 33245',
    city: 'Mumbai',
    occupation: 'Investment Banker',
    savedPropertyIds: ['prop-mum-06', 'prop-mum-07'],
    preferences: {
      preferredCity: 'Mumbai',
      preferredLocalities: ['Lower Parel', 'Prabhadevi'],
      transactionType: 'rent',
      minBudget: 120000,
      maxBudget: 280000,
      propertyTypes: ['apartment'],
      bedroomCount: [2, 3],
      minCarpetArea: 1100,
      furnishing: ['fully-furnished'],
      requiredAmenities: ['Infinity Pool', '24/7 Security'],
    },
  },
  {
    id: 'citizen-006',
    fullName: 'Meera Nair',
    email: 'meera.n@example.com',
    phone: '+91 98450 11984',
    city: 'Mumbai',
    occupation: 'Physician & Healthcare Consultant',
    savedPropertyIds: ['prop-mum-12', 'prop-mum-13'],
    preferences: {
      preferredCity: 'Mumbai',
      preferredLocalities: ['Dadar West', 'Matunga'],
      transactionType: 'buy',
      minBudget: 30000000,
      maxBudget: 60000000,
      propertyTypes: ['apartment'],
      bedroomCount: [2, 3],
      minCarpetArea: 1000,
      furnishing: ['semi-furnished'],
      requiredAmenities: ['Gated Security', 'Covered Parking'],
    },
  },
  {
    id: 'citizen-007',
    fullName: 'Farhan Shaikh',
    email: 'farhan.s@example.com',
    phone: '+91 98214 78901',
    city: 'Mumbai',
    occupation: 'Film & Media Producer',
    savedPropertyIds: ['prop-mum-10', 'prop-mum-11'],
    preferences: {
      preferredCity: 'Mumbai',
      preferredLocalities: ['Andheri West', 'Versova'],
      transactionType: 'rent',
      minBudget: 75000,
      maxBudget: 160000,
      propertyTypes: ['apartment'],
      bedroomCount: [2, 3],
      minCarpetArea: 950,
      furnishing: ['fully-furnished'],
      requiredAmenities: ['Pet Friendly', 'Balcony'],
    },
  },
  {
    id: 'citizen-008',
    fullName: 'Ananya Gupta',
    email: 'ananya.g@example.com',
    phone: '+91 98330 99412',
    city: 'Thane',
    occupation: 'Biotech Research Scientist',
    savedPropertyIds: ['prop-tha-02', 'prop-tha-08'],
    preferences: {
      preferredCity: 'Thane',
      preferredLocalities: ['Ghodbunder Road', 'Kolshet Road'],
      transactionType: 'rent',
      minBudget: 35000,
      maxBudget: 70000,
      propertyTypes: ['apartment'],
      bedroomCount: [2],
      minCarpetArea: 750,
      furnishing: ['semi-furnished'],
      requiredAmenities: ['Clubhouse', 'Children Play Area'],
    },
  },
];

// Helper to create 32 Geographically Consistent Properties across Mumbai & Thane
function generateSeedProperties(): { properties: Property[]; offers: BrokerOffer[] } {
  const rawData: Array<{
    id: string;
    key: string;
    title: string;
    city: 'Mumbai' | 'Thane';
    locality: string;
    address: string;
    lat: number;
    lng: number;
    bhk: number;
    carpet: number;
    type: Property['propertyType'];
    transaction: 'rent' | 'buy';
    furnishing: Property['furnishing'];
    img: string;
    amenities: string[];
    // Offer templates for multiple brokers
    brokerOffers: Array<{
      brokerIdx: number; // index in SEED_BROKERS
      price: number;
      deposit: number;
      brokerageType: 'fixed' | 'percentage';
      brokerageVal: number;
      negotiable: boolean;
      availability: BrokerOffer['availability'];
      perk: string;
    }>;
  }> = [
    // 1. Bandra West (Pali Hill)
    {
      id: 'prop-mum-01',
      key: 'IN-MH-MUM-PALI-402',
      title: 'The Solitaire Skyline Sea-Facing Residence',
      city: 'Mumbai',
      locality: 'Bandra West',
      address: 'Pali Hill, Near Zig Zag Road, Bandra West',
      lat: 19.0624,
      lng: 72.8285,
      bhk: 3,
      carpet: 1850,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.mumbaiHero,
      amenities: ['Arabian Sea View', 'Infinity Pool', '24/7 Power Backup', 'Gymnasium', 'Gated Concierge'],
      brokerOffers: [
        { brokerIdx: 0, price: 220000, deposit: 800000, brokerageType: 'fixed', brokerageVal: 110000, negotiable: true, availability: 'Immediate', perk: 'Includes deep cleaning & quarterly AC check' },
        { brokerIdx: 1, price: 215000, deposit: 1000000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'Direct owner mandate, preferred MNC corporate lease' },
        { brokerIdx: 2, price: 225000, deposit: 600000, brokerageType: 'fixed', brokerageVal: 80000, negotiable: true, availability: 'Immediate', perk: 'Flexible deposit terms with quarterly advance rent' },
      ],
    },
    // 2. Worli Sea Face
    {
      id: 'prop-mum-02',
      key: 'IN-MH-MUM-WORLI-801',
      title: 'Sea Promenade High Floor Coastal Panorama',
      city: 'Mumbai',
      locality: 'Worli',
      address: 'Worli Sea Face, Khan Abdul Ghaffar Khan Road',
      lat: 19.0176,
      lng: 72.8152,
      bhk: 2,
      carpet: 1150,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.mumbaiHero,
      amenities: ['Sea Link View', 'Health Club', '24/7 Treated Water', 'Automated Access'],
      brokerOffers: [
        { brokerIdx: 0, price: 140000, deposit: 500000, brokerageType: 'fixed', brokerageVal: 70000, negotiable: true, availability: 'Immediate', perk: 'Includes sheltered parking & high speed broadband' },
        { brokerIdx: 1, price: 135000, deposit: 550000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'Owner is family friend, fast legal agreement processing' },
      ],
    },
    // 3. Bandra West (Carter Road)
    {
      id: 'prop-mum-03',
      key: 'IN-MH-MUM-CARTER-504',
      title: 'Breeze Point Waterfront Suites',
      city: 'Mumbai',
      locality: 'Bandra West',
      address: 'Carter Road, Near Otters Club, Bandra West',
      lat: 19.0655,
      lng: 72.8252,
      bhk: 3,
      carpet: 1650,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.punePenthouse,
      amenities: ['Promenade Walkway', 'Clubhouse', 'Swimming Pool', 'EV Charging'],
      brokerOffers: [
        { brokerIdx: 0, price: 240000, deposit: 900000, brokerageType: 'fixed', brokerageVal: 120000, negotiable: true, availability: 'Immediate', perk: 'Complimentary private parking bay' },
        { brokerIdx: 2, price: 235000, deposit: 850000, brokerageType: 'fixed', brokerageVal: 115000, negotiable: true, availability: 'Within 15 Days', perk: 'All electrical fittings pre-inspected' },
      ],
    },
    // 4. Juhu Tara Road
    {
      id: 'prop-mum-04',
      key: 'IN-MH-MUM-JUHU-VILLA-08',
      title: 'The Palms Contemporary Beachside Villa',
      city: 'Mumbai',
      locality: 'Juhu',
      address: 'Juhu Tara Road, Near Sea Princess, Juhu',
      lat: 19.1025,
      lng: 72.8268,
      bhk: 4,
      carpet: 3600,
      type: 'villa',
      transaction: 'buy',
      furnishing: 'semi-furnished',
      img: IMAGES.bangaloreVilla,
      amenities: ['Private Garden', 'Private Pool', 'Servant Quarters', 'Solar Panel Grid'],
      brokerOffers: [
        { brokerIdx: 1, price: 125000000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Direct owner power of attorney & clear title search' },
        { brokerIdx: 0, price: 122000000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.5, negotiable: false, availability: 'Within 30 Days', perk: 'Includes luxury kitchen appliance package' },
      ],
    },
    // 5. Powai (Hiranandani Gardens)
    {
      id: 'prop-mum-05',
      key: 'IN-MH-MUM-POWAI-1202',
      title: 'Somerset Neoclassical Lake Vista Flat',
      city: 'Mumbai',
      locality: 'Powai',
      address: 'Hiranandani Gardens, Central Avenue, Powai',
      lat: 19.1197,
      lng: 72.9051,
      bhk: 3,
      carpet: 1420,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Powai Lake View', 'Gymnasium', 'Tennis Court', 'Clubhouse'],
      brokerOffers: [
        { brokerIdx: 4, price: 110000, deposit: 400000, brokerageType: 'fixed', brokerageVal: 55000, negotiable: true, availability: 'Immediate', perk: 'Immediate possession, society NOC expedited' },
        { brokerIdx: 0, price: 105000, deposit: 450000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'Corporate lease preferred' },
      ],
    },
    // 6. Lower Parel
    {
      id: 'prop-mum-06',
      key: 'IN-MH-MUM-LPAREL-1801',
      title: 'The Imperial Heights High-Floor Sky Suite',
      city: 'Mumbai',
      locality: 'Lower Parel',
      address: 'Senapati Bapat Marg, Near Palladium Mall',
      lat: 19.0015,
      lng: 72.8280,
      bhk: 3,
      carpet: 1550,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Sky Lounge', 'Infinity Pool', 'Concierge Service', 'High Speed Lifts'],
      brokerOffers: [
        { brokerIdx: 0, price: 175000, deposit: 600000, brokerageType: 'fixed', brokerageVal: 85000, negotiable: true, availability: 'Immediate', perk: '2 Covered parking slots included' },
        { brokerIdx: 2, price: 170000, deposit: 700000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'High acoustic insulation' },
      ],
    },
    // 7. Prabhadevi
    {
      id: 'prop-mum-07',
      key: 'IN-MH-MUM-PRABHA-PH-02',
      title: 'Arabian Crest Grand Duplex Penthouse',
      city: 'Mumbai',
      locality: 'Prabhadevi',
      address: 'Near Siddhivinayak Temple & Beach, Prabhadevi',
      lat: 19.0144,
      lng: 72.8258,
      bhk: 4,
      carpet: 3100,
      type: 'penthouse',
      transaction: 'buy',
      furnishing: 'fully-furnished',
      img: IMAGES.punePenthouse,
      amenities: ['Private Rooftop Terrace', 'Jacuzzi', 'Fire Pit', 'Smart Automation'],
      brokerOffers: [
        { brokerIdx: 1, price: 92000000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Bespoke Italian furniture included' },
        { brokerIdx: 2, price: 89500000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.5, negotiable: false, availability: 'Within 30 Days', perk: 'Ready to move in with complete legal clearance' },
      ],
    },
    // 8. Khar West
    {
      id: 'prop-mum-08',
      key: 'IN-MH-MUM-KHAR-601',
      title: 'Serenade Residence 14th Road Corner Flat',
      city: 'Mumbai',
      locality: 'Khar West',
      address: '14th Road, Off Linking Road, Khar West',
      lat: 19.0710,
      lng: 72.8340,
      bhk: 2,
      carpet: 980,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Gated Security', 'Gymnasium', 'Covered Parking', 'Power Backup'],
      brokerOffers: [
        { brokerIdx: 0, price: 95000, deposit: 350000, brokerageType: 'fixed', brokerageVal: 47500, negotiable: true, availability: 'Immediate', perk: 'Quiet green lane, low maintenance' },
        { brokerIdx: 4, price: 92000, deposit: 400000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'Newly painted and deep cleaned' },
      ],
    },
    // 9. Santacruz West
    {
      id: 'prop-mum-09',
      key: 'IN-MH-MUM-SANT-402',
      title: 'Avenue Green Sunlit Garden Apartment',
      city: 'Mumbai',
      locality: 'Santacruz West',
      address: 'Saraswati Road, Near Podar School, Santacruz West',
      lat: 19.0830,
      lng: 72.8360,
      bhk: 3,
      carpet: 1350,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.mumbaiHero,
      amenities: ['Garden View', 'Children Play Area', '24/7 Security'],
      brokerOffers: [
        { brokerIdx: 0, price: 130000, deposit: 450000, brokerageType: 'fixed', brokerageVal: 65000, negotiable: true, availability: 'Immediate', perk: 'Includes modular kitchen appliances' },
      ],
    },
    // 10. Andheri West (Lokhandwala)
    {
      id: 'prop-mum-10',
      key: 'IN-MH-MUM-LOKH-903',
      title: 'Crestview Manor High-Rise Suite',
      city: 'Mumbai',
      locality: 'Andheri West',
      address: 'Lokhandwala Complex, 2nd Cross Road',
      lat: 19.1415,
      lng: 72.8270,
      bhk: 2,
      carpet: 1050,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Clubhouse', 'Gymnasium', 'Power Backup', 'Near Metro'],
      brokerOffers: [
        { brokerIdx: 4, price: 78000, deposit: 250000, brokerageType: 'fixed', brokerageVal: 39000, negotiable: true, availability: 'Immediate', perk: 'Close to cafes and Infinity Mall' },
        { brokerIdx: 1, price: 75000, deposit: 300000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'High floor, good cross ventilation' },
      ],
    },
    // 11. Versova
    {
      id: 'prop-mum-11',
      key: 'IN-MH-MUM-VERS-301',
      title: 'Coastal Haven Sea Breeze Retreat',
      city: 'Mumbai',
      locality: 'Versova',
      address: 'Yari Road, Near Versova Beach Promenade',
      lat: 19.1350,
      lng: 72.8120,
      bhk: 2,
      carpet: 920,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.mumbaiHero,
      amenities: ['Sea Breeze', 'Pet Friendly', 'Balcony', 'Covered Parking'],
      brokerOffers: [
        { brokerIdx: 4, price: 72000, deposit: 250000, brokerageType: 'fixed', brokerageVal: 36000, negotiable: true, availability: 'Immediate', perk: 'Peaceful artist community vibe' },
      ],
    },
    // 12. Dadar West (Shivaji Park)
    {
      id: 'prop-mum-12',
      key: 'IN-MH-MUM-DADAR-702',
      title: 'Shivaji Park Heritage Crest Apartment',
      city: 'Mumbai',
      locality: 'Dadar West',
      address: 'Rani Laxmibai Marg, Shivaji Park, Dadar West',
      lat: 19.0270,
      lng: 72.8375,
      bhk: 3,
      carpet: 1450,
      type: 'apartment',
      transaction: 'buy',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Park View', 'Clubhouse', 'Power Backup', '2 Covered Bays'],
      brokerOffers: [
        { brokerIdx: 2, price: 46000000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Unobstructed view of Shivaji Park grounds' },
        { brokerIdx: 0, price: 44500000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.5, negotiable: false, availability: 'Within 30 Days', perk: 'Direct owner mandate with bank NOC ready' },
      ],
    },
    // 13. Matunga East (Five Gardens)
    {
      id: 'prop-mum-13',
      key: 'IN-MH-MUM-MATU-502',
      title: 'Five Gardens Tree-Lined Modern Suite',
      city: 'Mumbai',
      locality: 'Matunga East',
      address: 'Jame Jamshed Road, Near Five Gardens',
      lat: 19.0240,
      lng: 72.8530,
      bhk: 3,
      carpet: 1300,
      type: 'apartment',
      transaction: 'buy',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Lush Green Surroundings', '24/7 Security', 'Elevator', 'Covered Parking'],
      brokerOffers: [
        { brokerIdx: 2, price: 39000000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Rare low-density Parsi colony locality' },
      ],
    },
    // 14. Chembur East (Diamond Garden)
    {
      id: 'prop-mum-14',
      key: 'IN-MH-MUM-CHEM-1102',
      title: 'Diamond Court Contemporary High-Rise',
      city: 'Mumbai',
      locality: 'Chembur',
      address: 'Central Avenue, Near Diamond Garden, Chembur',
      lat: 19.0520,
      lng: 72.8980,
      bhk: 3,
      carpet: 1250,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Clubhouse', 'Gymnasium', 'Quick SCLR Access', 'Swimming Pool'],
      brokerOffers: [
        { brokerIdx: 4, price: 85000, deposit: 300000, brokerageType: 'fixed', brokerageVal: 42500, negotiable: true, availability: 'Immediate', perk: 'Easy commute to BKC and South Mumbai via Eastern Freeway' },
        { brokerIdx: 0, price: 82000, deposit: 350000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'Spacious balcony with garden view' },
      ],
    },
    // 15. Ghatkopar East
    {
      id: 'prop-mum-15',
      key: 'IN-MH-MUM-GHAT-801',
      title: 'Sunrise Vista Gated Community Residence',
      city: 'Mumbai',
      locality: 'Ghatkopar East',
      address: 'Tilak Road, Near Metro Station, Ghatkopar',
      lat: 19.0850,
      lng: 72.9080,
      bhk: 2,
      carpet: 850,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Metro Proximity', 'Gymnasium', 'Power Backup'],
      brokerOffers: [
        { brokerIdx: 4, price: 58000, deposit: 200000, brokerageType: 'fixed', brokerageVal: 30000, negotiable: true, availability: 'Immediate', perk: 'Pure vegetarian community' },
      ],
    },
    // 16. Vile Parle East
    {
      id: 'prop-mum-16',
      key: 'IN-MH-MUM-VPARLE-401',
      title: 'Prabhat Heights Suburban Suite',
      city: 'Mumbai',
      locality: 'Vile Parle East',
      address: 'Nehru Road, Near Station & Domestic Airport',
      lat: 19.0980,
      lng: 72.8510,
      bhk: 2,
      carpet: 880,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Airport Connectivity', 'Security', 'Covered Parking'],
      brokerOffers: [
        { brokerIdx: 0, price: 65000, deposit: 250000, brokerageType: 'fixed', brokerageVal: 32500, negotiable: true, availability: 'Immediate', perk: 'Well maintained building with zero water issues' },
      ],
    },
    // 17. Malad West
    {
      id: 'prop-mum-17',
      key: 'IN-MH-MUM-MALAD-1402',
      title: 'Grandeur Tower Link Road High-Rise',
      city: 'Mumbai',
      locality: 'Malad West',
      address: 'New Link Road, Near Inorbit Mall, Malad West',
      lat: 19.1860,
      lng: 72.8390,
      bhk: 2,
      carpet: 890,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Shopping Mall Proximity', 'Gymnasium', 'Swimming Pool', 'Security'],
      brokerOffers: [
        { brokerIdx: 4, price: 55000, deposit: 200000, brokerageType: 'fixed', brokerageVal: 27500, negotiable: true, availability: 'Immediate', perk: 'High floor with open views towards the creek' },
      ],
    },
    // 18. Kandivali West
    {
      id: 'prop-mum-18',
      key: 'IN-MH-MUM-KAND-1004',
      title: 'Mahavir Heights Family Apartment',
      city: 'Mumbai',
      locality: 'Kandivali West',
      address: 'Mahavir Nagar, Off Link Road, Kandivali West',
      lat: 19.2080,
      lng: 72.8350,
      bhk: 3,
      carpet: 1180,
      type: 'apartment',
      transaction: 'buy',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Gated Complex', 'Clubhouse', 'Children Play Park', 'Reserved Parking'],
      brokerOffers: [
        { brokerIdx: 4, price: 23500000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Heart of food & shopping street' },
      ],
    },
    // 19. Borivali West
    {
      id: 'prop-mum-19',
      key: 'IN-MH-MUM-BORI-802',
      title: 'Green Meadows Shimpoli Corner Flat',
      city: 'Mumbai',
      locality: 'Borivali West',
      address: 'Shimpoli Road, Near Borivali Station West',
      lat: 19.2310,
      lng: 72.8420,
      bhk: 2,
      carpet: 820,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Proximity to SGNP', 'Security', 'Power Backup'],
      brokerOffers: [
        { brokerIdx: 4, price: 46000, deposit: 160000, brokerageType: 'fixed', brokerageVal: 23000, negotiable: true, availability: 'Immediate', perk: 'Clean quiet residential society' },
      ],
    },
    // 20. Mulund West
    {
      id: 'prop-mum-20',
      key: 'IN-MH-MUM-MULUND-1501',
      title: 'Sarvodaya Crest Premium High-Floor Flat',
      city: 'Mumbai',
      locality: 'Mulund West',
      address: 'Sarvodaya Nagar, LBS Marg, Mulund West',
      lat: 19.1720,
      lng: 72.9460,
      bhk: 3,
      carpet: 1220,
      type: 'apartment',
      transaction: 'buy',
      furnishing: 'fully-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['LBS Marg Access', 'Gymnasium', 'Tennis Court', 'Clubhouse'],
      brokerOffers: [
        { brokerIdx: 3, price: 28500000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Direct access to Thane and Eastern Express Highway' },
        { brokerIdx: 4, price: 27800000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.5, negotiable: false, availability: 'Within 15 Days', perk: 'Completely renovated modern interior' },
      ],
    },

    // --- THANE PROPERTIES (21 to 32) ---
    // 21. Thane West - Hiranandani Estate
    {
      id: 'prop-tha-01',
      key: 'IN-MH-THA-HESTATE-1601',
      title: 'Rodas Enclave Luxury Lakeside Residence',
      city: 'Thane',
      locality: 'Hiranandani Estate',
      address: 'Rodas Enclave, Hiranandani Estate, Ghodbunder Rd, Thane',
      lat: 19.2480,
      lng: 72.9780,
      bhk: 4,
      carpet: 2200,
      type: 'apartment',
      transaction: 'buy',
      furnishing: 'fully-furnished',
      img: IMAGES.punePenthouse,
      amenities: ['Lakeside Promenade', 'The Walk High Street', 'Clubhouse', 'Olympic Pool', 'School in Township'],
      brokerOffers: [
        { brokerIdx: 3, price: 34500000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Includes 2 covered podium parkings and club membership' },
        { brokerIdx: 5, price: 33800000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.5, negotiable: false, availability: 'Within 30 Days', perk: 'Unobstructed Yeoor hills and Ulhas creek vista' },
      ],
    },
    // 22. Thane West - Majiwada Junction
    {
      id: 'prop-tha-02',
      key: 'IN-MH-THA-MAJIWADA-1102',
      title: 'Lodha Crown High-Floor Urban Flat',
      city: 'Thane',
      locality: 'Majiwada',
      address: 'Majiwada Junction, Eastern Express Highway, Thane',
      lat: 19.2150,
      lng: 72.9850,
      bhk: 2,
      carpet: 780,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Highway Proximity', 'Viviana Mall 5 min', 'Gymnasium', '24/7 Security'],
      brokerOffers: [
        { brokerIdx: 3, price: 38000, deposit: 140000, brokerageType: 'fixed', brokerageVal: 19000, negotiable: true, availability: 'Immediate', perk: 'Excellent connectivity to BKC and Mumbai via EEH' },
        { brokerIdx: 5, price: 36500, deposit: 150000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'High floor, completely ventilated' },
      ],
    },
    // 23. Thane - Ghodbunder Road (Kasarvadavali)
    {
      id: 'prop-tha-03',
      key: 'IN-MH-THA-GHOD-901',
      title: 'Rosa Bella Greenery Facing Residence',
      city: 'Thane',
      locality: 'Ghodbunder Road',
      address: 'Near Hypercity & D-Mart, Kasarvadavali, Thane',
      lat: 19.2680,
      lng: 72.9650,
      bhk: 2,
      carpet: 740,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Yeoor Hills Breeze', 'Children Play Park', 'Power Backup'],
      brokerOffers: [
        { brokerIdx: 3, price: 28000, deposit: 100000, brokerageType: 'fixed', brokerageVal: 15000, negotiable: true, availability: 'Immediate', perk: 'Walking distance to upcoming Metro Line 4' },
      ],
    },
    // 24. Thane - Vasant Vihar (Pokhran Rd 2)
    {
      id: 'prop-tha-04',
      key: 'IN-MH-THA-VVIHAR-803',
      title: 'Vasant Lawns Premium Parkview Apartment',
      city: 'Thane',
      locality: 'Vasant Vihar',
      address: 'Pokhran Road No. 2, Near Jupiter Hospital, Thane',
      lat: 19.2280,
      lng: 72.9720,
      bhk: 3,
      carpet: 1350,
      type: 'apartment',
      transaction: 'buy',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Near Jupiter Hospital', 'Singhania School 5 Min', 'Swimming Pool', 'Tennis Court'],
      brokerOffers: [
        { brokerIdx: 3, price: 23000000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Prestigious gated society with established community' },
        { brokerIdx: 5, price: 22400000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.5, negotiable: false, availability: 'Within 30 Days', perk: 'Single owner registered title' },
      ],
    },
    // 25. Thane - Panchpakhadi
    {
      id: 'prop-tha-05',
      key: 'IN-MH-THA-PANCH-502',
      title: 'Heritage Crest Civic Center Flat',
      city: 'Thane',
      locality: 'Panchpakhadi',
      address: 'Almeida Road, Near TMC Headquarters, Panchpakhadi',
      lat: 19.1920,
      lng: 72.9680,
      bhk: 2,
      carpet: 860,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Heart of City', 'Kachrali Lake Proximity', 'Covered Parking'],
      brokerOffers: [
        { brokerIdx: 5, price: 39000, deposit: 150000, brokerageType: 'fixed', brokerageVal: 20000, negotiable: true, availability: 'Immediate', perk: 'High convenience area with top restaurants and banks' },
      ],
    },
    // 26. Thane - Naupada
    {
      id: 'prop-tha-06',
      key: 'IN-MH-THA-NAUP-302',
      title: 'Shree Ganesh Heritage Walkable Residence',
      city: 'Thane',
      locality: 'Naupada',
      address: 'Gokhale Road, Near Thane Railway Station West',
      lat: 19.1850,
      lng: 72.9720,
      bhk: 2,
      carpet: 810,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['5 Min Walk to Station', '24/7 Water Supply', 'Lift with Generator'],
      brokerOffers: [
        { brokerIdx: 5, price: 35000, deposit: 120000, brokerageType: 'fixed', brokerageVal: 17500, negotiable: true, availability: 'Immediate', perk: 'Ideal for daily suburban train commuters' },
      ],
    },
    // 27. Thane - Wagle Estate
    {
      id: 'prop-tha-07',
      key: 'IN-MH-THA-WAGLE-1201',
      title: 'Cyber City Tech View Suite',
      city: 'Thane',
      locality: 'Wagle Estate',
      address: 'Road No. 16, Near IT Parks & Passport Office',
      lat: 19.1950,
      lng: 72.9510,
      bhk: 1,
      carpet: 520,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['IT Hub Proximity', 'Gymnasium', 'Security', 'High Speed Wifi'],
      brokerOffers: [
        { brokerIdx: 3, price: 26000, deposit: 80000, brokerageType: 'fixed', brokerageVal: 13000, negotiable: true, availability: 'Immediate', perk: 'Perfect for single tech professional or young couple' },
      ],
    },
    // 28. Thane - Kolshet Road
    {
      id: 'prop-tha-08',
      key: 'IN-MH-THA-KOLSHET-1402',
      title: 'Lodha Amara Grand Forest Suite',
      city: 'Thane',
      locality: 'Kolshet Road',
      address: 'Kolshet Road, Off Ghodbunder Rd, Thane',
      lat: 19.2350,
      lng: 72.9910,
      bhk: 3,
      carpet: 1120,
      type: 'apartment',
      transaction: 'buy',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['40 Acre Forest Park', '6 Clubhouses', 'Sports Arenas', 'Swimming Pools'],
      brokerOffers: [
        { brokerIdx: 3, price: 16500000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Private forest views and podium car parking' },
        { brokerIdx: 5, price: 16100000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.5, negotiable: false, availability: 'Within 15 Days', perk: 'Attractive payment schedule' },
      ],
    },
    // 29. Thane - Kalwa West
    {
      id: 'prop-tha-09',
      key: 'IN-MH-THA-KALWA-602',
      title: 'Creekview Enclave Riverfront Home',
      city: 'Thane',
      locality: 'Kalwa',
      address: 'Near Old Kalwa Bridge & Station Road',
      lat: 19.2010,
      lng: 72.9980,
      bhk: 2,
      carpet: 790,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Ulhas River View', 'Station Walkable', 'Security'],
      brokerOffers: [
        { brokerIdx: 5, price: 29000, deposit: 100000, brokerageType: 'fixed', brokerageVal: 14500, negotiable: true, availability: 'Immediate', perk: 'Affordable family rental with water abundance' },
      ],
    },
    // 30. Thane - Ghodbunder Road (Waghbil)
    {
      id: 'prop-tha-10',
      key: 'IN-MH-THA-WAGHBIL-1802',
      title: 'Vijay Orovia High-Altitude Sky Flat',
      city: 'Thane',
      locality: 'Ghodbunder Road',
      address: 'Near Waghbil Naka, Ghodbunder Road, Thane',
      lat: 19.2550,
      lng: 72.9710,
      bhk: 3,
      carpet: 1150,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'fully-furnished',
      img: IMAGES.punePenthouse,
      amenities: ['Sky Garden', 'Swimming Pool', 'Gymnasium', 'EV Charging Bays'],
      brokerOffers: [
        { brokerIdx: 3, price: 42000, deposit: 160000, brokerageType: 'fixed', brokerageVal: 21000, negotiable: true, availability: 'Immediate', perk: 'Panoramic view of national park hills' },
        { brokerIdx: 5, price: 40000, deposit: 170000, brokerageType: 'percentage', brokerageVal: 100, negotiable: false, availability: 'Within 15 Days', perk: 'Includes high-end furnishings' },
      ],
    },
    // 31. Thane - Pokhran Road 1 (Upvan Lake)
    {
      id: 'prop-tha-11',
      key: 'IN-MH-THA-UPVAN-VILLA-02',
      title: 'Upvan Lake Serenity Nature Villa',
      city: 'Thane',
      locality: 'Pokhran Road 1',
      address: 'Opposite Upvan Lake, Yeoor Foothills, Thane',
      lat: 19.2210,
      lng: 72.9600,
      bhk: 4,
      carpet: 2850,
      type: 'villa',
      transaction: 'buy',
      furnishing: 'semi-furnished',
      img: IMAGES.bangaloreVilla,
      amenities: ['Direct Lake Frontage', 'Private Courtyard', 'Yeoor Forest Breeze', 'Staff Quarters'],
      brokerOffers: [
        { brokerIdx: 3, price: 48000000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.0, negotiable: true, availability: 'Immediate', perk: 'Exclusive lakeside address, bird sanctuary zone' },
        { brokerIdx: 0, price: 46800000, deposit: 0, brokerageType: 'percentage', brokerageVal: 1.5, negotiable: false, availability: 'Within 30 Days', perk: 'Includes rainwater harvesting and solar backup' },
      ],
    },
    // 32. Thane East (Kopri Colony)
    {
      id: 'prop-tha-12',
      key: 'IN-MH-THA-KOPRI-402',
      title: 'Kopri Green Gated Society Flat',
      city: 'Thane',
      locality: 'Thane East',
      address: 'Kopri Colony, Near Eastern Express Highway Exit',
      lat: 19.1780,
      lng: 72.9820,
      bhk: 2,
      carpet: 830,
      type: 'apartment',
      transaction: 'rent',
      furnishing: 'semi-furnished',
      img: IMAGES.delhiInterior,
      amenities: ['Highway Access', 'Quiet Residential Pocket', 'Security'],
      brokerOffers: [
        { brokerIdx: 5, price: 32000, deposit: 110000, brokerageType: 'fixed', brokerageVal: 16000, negotiable: true, availability: 'Immediate', perk: 'Lowest traffic exit to Mulund and Mumbai' },
      ],
    },
  ];

  const properties: Property[] = [];
  const offers: BrokerOffer[] = [];

  rawData.forEach((item, pIdx) => {
    const now = new Date(Date.now() - pIdx * 3600000 * 12).toISOString();
    const prop: Property = {
      id: item.id,
      canonicalKey: item.key,
      title: item.title,
      description: `Bespoke residence in ${item.locality}, ${item.city}. Features floor-to-ceiling fenestration, premium fittings, and swift connectivity. Represented under multiple verified broker mandates.`,
      propertyType: item.type,
      transactionType: item.transaction,
      city: item.city,
      locality: item.locality,
      postalCode: item.city === 'Mumbai' ? '400050' : '400601',
      address: item.address,
      lat: item.lat,
      lng: item.lng,
      bedroomCount: item.bhk,
      bathroomCount: Math.min(item.bhk, 4),
      balconyCount: Math.max(1, item.bhk - 1),
      carpetArea: item.carpet,
      builtUpArea: Math.round(item.carpet * 1.25),
      furnishing: item.furnishing,
      floorNumber: 5 + (pIdx % 15),
      totalFloors: 14 + (pIdx % 20),
      parking: item.bhk >= 3 ? '2 Covered Bays' : '1 Covered Bay',
      amenities: item.amenities,
      coverImage: item.img,
      images: [item.img, IMAGES.mumbaiHero, IMAGES.delhiInterior],
      isVerified: true,
      moderationStatus: 'active',
      isDemoDataset: true,
      createdAt: now,
      updatedAt: now,
    };

    const propOffers: BrokerOffer[] = item.brokerOffers.map((bo, oIdx) => {
      const broker = SEED_BROKERS[bo.brokerIdx];
      const offerId = `offer-${item.id}-${oIdx + 1}`;
      return {
        id: offerId,
        propertyId: item.id,
        brokerId: broker.id,
        brokerName: broker.fullName,
        brokerAgency: broker.businessName,
        brokerPhone: broker.phone,
        brokerEmail: broker.email,
        brokerRating: broker.rating,
        brokerReraId: broker.reraId,
        isVerifiedBroker: broker.verificationStatus === 'verified',
        transactionType: item.transaction,
        rentAmount: item.transaction === 'rent' ? bo.price : undefined,
        salePrice: item.transaction === 'buy' ? bo.price : undefined,
        depositAmount: bo.deposit,
        brokerageType: bo.brokerageType,
        brokerageValue: bo.brokerageVal,
        maintenanceChargesMonthly: Math.round(item.carpet * 5),
        negotiable: bo.negotiable,
        availability: bo.availability,
        specialConditions: bo.perk,
        updatedAt: now,
      };
    });

    prop.offers = propOffers;
    properties.push(prop);
    offers.push(...propOffers);
  });

  return { properties, offers };
}

// Initialize LocalStorage with seed dataset
export function initStorage(): void {
  try {
    const existingProps = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!existingProps) {
      const { properties, offers } = generateSeedProperties();
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
      localStorage.setItem(STORAGE_KEYS.BROKERS, JSON.stringify(SEED_BROKERS));
      localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(SEED_CITIZENS));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CITIZEN_ID, SEED_CITIZENS[0].id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BROKER_ID, SEED_BROKERS[0].id);
      localStorage.setItem(STORAGE_KEYS.SAVED_PROPERTIES, JSON.stringify(['prop-mum-01', 'prop-mum-02']));

      const initialEnquiries: Enquiry[] = [
        {
          id: 'enq-seed-01',
          propertyId: 'prop-mum-01',
          offerId: 'offer-prop-mum-01-1',
          brokerId: 'broker-101',
          citizenId: 'citizen-001',
          citizenName: 'Aditya Sharma',
          citizenEmail: 'aditya.sharma@example.com',
          citizenPhone: '+91 98200 12345',
          message: 'Interested in corporate lease for The Solitaire Pali Hill. Can we schedule inspection on Saturday?',
          status: 'contacted',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'enq-seed-02',
          propertyId: 'prop-tha-01',
          offerId: 'offer-prop-tha-01-1',
          brokerId: 'broker-104',
          citizenId: 'citizen-003',
          citizenName: 'Rohan Deshpande',
          citizenEmail: 'rohan.d@example.com',
          citizenPhone: '+91 98220 77314',
          message: 'Looking to purchase Rodas Enclave villa flat. Please share payment milestone schedule.',
          status: 'viewing_scheduled',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(initialEnquiries));

      const initialViewings: ViewingAppointment[] = [
        {
          id: 'view-seed-01',
          propertyId: 'prop-mum-01',
          offerId: 'offer-prop-mum-01-1',
          brokerId: 'broker-101',
          citizenId: 'citizen-001',
          citizenName: 'Aditya Sharma',
          citizenEmail: 'aditya.sharma@example.com',
          citizenPhone: '+91 98200 12345',
          preferredDate: '2026-11-01',
          preferredTimeSlot: '11:00 AM - 01:00 PM',
          status: 'confirmed',
          notes: 'High floor sea view demonstration requested.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.VIEWINGS, JSON.stringify(initialViewings));

      const initialLogs: AuditLog[] = [
        {
          id: 'log-seed-01',
          timestamp: new Date().toISOString(),
          actor: 'System Bootstrapper',
          role: 'admin',
          action: 'Dataset Seeded',
          details: 'Initialized 32 realistic canonical properties across Mumbai and Thane with 6 verified brokers.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'citizen');
    }
  } catch (err) {
    console.warn('Storage initialization error:', err);
  }
}

// Reset data back to default demo dataset
export function resetDemoDataset(): void {
  localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
  localStorage.removeItem(STORAGE_KEYS.OFFERS);
  localStorage.removeItem(STORAGE_KEYS.BROKERS);
  localStorage.removeItem(STORAGE_KEYS.CITIZENS);
  localStorage.removeItem(STORAGE_KEYS.SAVED_PROPERTIES);
  localStorage.removeItem(STORAGE_KEYS.ENQUIRIES);
  localStorage.removeItem(STORAGE_KEYS.VIEWINGS);
  initStorage();
}

// ---- PROPERTIES API ----

export function getProperties(): Property[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    const properties: Property[] = raw ? JSON.parse(raw) : [];
    const offers = getOffers();

    return properties.map((prop) => ({
      ...prop,
      offers: offers.filter((o) => o.propertyId === prop.id),
    }));
  } catch {
    return [];
  }
}

export function getPropertyById(id: string): Property | undefined {
  return getProperties().find((p) => p.id === id);
}

export function saveProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
  const properties = getProperties();
  const newId = `prop-${Date.now()}`;
  const now = new Date().toISOString();

  const newProperty: Property = {
    ...property,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  properties.unshift(newProperty);
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  addAuditLog('Broker', 'broker', 'Property Created', `Created: ${newProperty.title} in ${newProperty.locality}, ${newProperty.city}`);
  return newProperty;
}

export function updateProperty(property: Property): void {
  const properties = getProperties();
  const idx = properties.findIndex((p) => p.id === property.id);
  if (idx !== -1) {
    properties[idx] = { ...property, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  }
}

export function deleteProperty(id: string): void {
  const properties = getProperties().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  addAuditLog('Admin', 'admin', 'Property Deleted', `Deleted property ID: ${id}`);
}

// ---- OFFERS API ----

export function getOffers(propertyId?: string): BrokerOffer[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFERS);
    const all: BrokerOffer[] = raw ? JSON.parse(raw) : [];
    return propertyId ? all.filter((o) => o.propertyId === propertyId) : all;
  } catch {
    return [];
  }
}

export function saveOffer(offer: Omit<BrokerOffer, 'id' | 'updatedAt'>): BrokerOffer {
  const offers = getOffers();
  const newOffer: BrokerOffer = {
    ...offer,
    id: `offer-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };

  offers.unshift(newOffer);
  localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  addAuditLog(offer.brokerName, 'broker', 'Offer Submitted', `Submitted offer for ${offer.propertyId} by ${offer.brokerAgency}`);
  return newOffer;
}

// ---- CITIZEN & BROKER PROFILES ----

export function getCitizens(): CitizenProfile[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CITIZENS);
    return raw ? JSON.parse(raw) : SEED_CITIZENS;
  } catch {
    return SEED_CITIZENS;
  }
}

export function getActiveCitizen(): CitizenProfile {
  const citizens = getCitizens();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CITIZEN_ID);
  return citizens.find((c) => c.id === activeId) || citizens[0];
}

export function setActiveCitizenId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CITIZEN_ID, id);
}

export function getBrokers(): BrokerProfile[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BROKERS);
    return raw ? JSON.parse(raw) : SEED_BROKERS;
  } catch {
    return SEED_BROKERS;
  }
}

export function getActiveBroker(): BrokerProfile {
  const brokers = getBrokers();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BROKER_ID);
  return brokers.find((b) => b.id === activeId) || brokers[0];
}

export function setActiveBrokerId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_BROKER_ID, id);
}

export function updateBrokerVerification(id: string, status: BrokerProfile['verificationStatus']): void {
  const brokers = getBrokers();
  const target = brokers.find((b) => b.id === id);
  if (target) {
    target.verificationStatus = status;
    localStorage.setItem(STORAGE_KEYS.BROKERS, JSON.stringify(brokers));
    addAuditLog('Admin', 'admin', 'Broker Status Changed', `Updated ${target.fullName} status to ${status}`);
  }
}

// ---- BOOKMARKS / SAVED PROPERTIES ----

export function getSavedPropertyIds(): string[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROPERTIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveProperty(propertyId: string): boolean {
  const saved = getSavedPropertyIds();
  const exists = saved.includes(propertyId);
  const updated = exists ? saved.filter((id) => id !== propertyId) : [...saved, propertyId];
  localStorage.setItem(STORAGE_KEYS.SAVED_PROPERTIES, JSON.stringify(updated));
  return !exists;
}

// ---- ENQUIRIES & VIEWINGS ----

export function getEnquiries(): Enquiry[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>): Enquiry {
  const enquiries = getEnquiries();
  const newEnq: Enquiry = {
    ...enquiry,
    id: `enq-${Date.now()}`,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  enquiries.unshift(newEnq);
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
  addAuditLog(enquiry.citizenName, 'citizen', 'Enquiry Sent', `Enquiry sent for property ${enquiry.propertyId}`);
  return newEnq;
}

export function updateEnquiryStatus(id: string, status: Enquiry['status']): void {
  const enquiries = getEnquiries();
  const target = enquiries.find((e) => e.id === id);
  if (target) {
    target.status = status;
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
    addAuditLog('Broker', 'broker', 'Enquiry Status', `Enquiry ${id} set to ${status}`);
  }
}

export function getViewings(): ViewingAppointment[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIEWINGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createViewing(viewing: Omit<ViewingAppointment, 'id' | 'createdAt' | 'status'>): ViewingAppointment {
  const viewings = getViewings();
  const newView: ViewingAppointment = {
    ...viewing,
    id: `view-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  viewings.unshift(newView);
  localStorage.setItem(STORAGE_KEYS.VIEWINGS, JSON.stringify(viewings));
  addAuditLog(viewing.citizenName, 'citizen', 'Viewing Scheduled', `Viewing scheduled for ${viewing.propertyId} on ${viewing.preferredDate}`);
  return newView;
}

export function updateViewingStatus(id: string, status: ViewingAppointment['status']): void {
  const viewings = getViewings();
  const target = viewings.find((v) => v.id === id);
  if (target) {
    target.status = status;
    localStorage.setItem(STORAGE_KEYS.VIEWINGS, JSON.stringify(viewings));
    addAuditLog('Broker', 'broker', 'Viewing Status', `Viewing ${id} set to ${status}`);
  }
}

// ---- AUDIT LOGS & USER ROLES ----

export function getAuditLogs(): AuditLog[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addAuditLog(actor: string, role: UserRole, action: string, details: string): void {
  try {
    const logs = getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      details,
    });
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 60)));
  } catch {
    // Ignore
  }
}

export function getUserRole(): UserRole {
  initStorage();
  return (localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole) || 'citizen';
}

export function setUserRole(role: UserRole): void {
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
}

// ---- GEOLOCATION & DISTANCE CALCULATIONS ----

// Haversine formula for distance between 2 coordinates in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

// Filter properties within radius (1, 3, 5, 10, 20 km)
export function getPropertiesNear(
  lat: number,
  lng: number,
  radiusKm: number,
  propertiesList?: Property[]
): Array<Property & { distanceKm: number }> {
  const source = propertiesList || getProperties();
  return source
    .map((p) => ({
      ...p,
      distanceKm: calculateDistanceKm(lat, lng, p.lat, p.lng),
    }))
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Format INR currency
export function formatINR(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh.toFixed(lakh % 1 === 0 ? 0 : 2)} Lakh`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface EstimatedInitialCost {
  headlinePrice: number;
  depositOrDownPayment: number;
  brokerageFee: number;
  maintenanceFee: number;
  totalInitialOutlay: number;
  isRental: boolean;
}

export function calculateInitialCost(offer: BrokerOffer): EstimatedInitialCost {
  const isRental = offer.transactionType === 'rent';

  if (isRental) {
    const rent = offer.rentAmount || 0;
    const deposit = offer.depositAmount || 0;
    const maintenance = offer.maintenanceChargesMonthly || 0;
    let brokerage = 0;
    if (offer.brokerageType === 'fixed') {
      brokerage = offer.brokerageValue;
    } else {
      brokerage = (rent * offer.brokerageValue) / 100;
    }
    return {
      headlinePrice: rent,
      depositOrDownPayment: deposit,
      brokerageFee: brokerage,
      maintenanceFee: maintenance,
      totalInitialOutlay: rent + deposit + brokerage + maintenance,
      isRental: true,
    };
  } else {
    const price = offer.salePrice || 0;
    let brokerage = 0;
    if (offer.brokerageType === 'fixed') {
      brokerage = offer.brokerageValue;
    } else {
      brokerage = (price * offer.brokerageValue) / 100;
    }
    const bookingToken = Math.round(price * 0.1);
    return {
      headlinePrice: price,
      depositOrDownPayment: bookingToken,
      brokerageFee: brokerage,
      maintenanceFee: 0,
      totalInitialOutlay: bookingToken + brokerage,
      isRental: false,
    };
  }
}

/**
 * Helper to determine if a property qualifies under the "Urban Afford" segment
 * (Budget-friendly starter homes under ₹45K/mo rent or under ₹1.8 Cr purchase)
 */
export function isUrbanAfford(property: Property): boolean {
  if (!property.offers || property.offers.length === 0) return false;
  if (property.transactionType === 'rent') {
    const minRent = Math.min(...property.offers.map((o) => o.rentAmount || 99999999));
    return minRent <= 45000;
  } else {
    const minPrice = Math.min(...property.offers.map((o) => o.salePrice || 999999999));
    return minPrice <= 18000000; // 1.8 Cr
  }
}

/**
 * Filter properties by Urban Afford collection
 */
export function getUrbanAffordProperties(): Property[] {
  return getProperties().filter(isUrbanAfford);
}

/**
 * Affordability insights for an offer
 */
export function getUrbanAffordMetrics(offer: BrokerOffer, transactionType: TransactionType) {
  if (transactionType === 'rent') {
    const rent = offer.rentAmount || 0;
    const deposit = offer.depositAmount || 0;
    const depositMonths = rent > 0 ? (deposit / rent).toFixed(1) : '0';
    const isAffordableDeposit = Number(depositMonths) <= 3.5;
    const isBudgetRent = rent <= 45000;

    return {
      isUrbanAfford: isBudgetRent,
      depositMonths: Number(depositMonths),
      badgeText: isBudgetRent ? '🌿 Urban Afford' : '🏙️ Premium Tier',
      affordabilityTag: isAffordableDeposit ? `Capped Deposit (${depositMonths}x)` : `Standard Deposit (${depositMonths}x)`,
      lowBrokerage: offer.brokerageType === 'fixed' || offer.brokerageValue <= 1.0,
    };
  } else {
    const price = offer.salePrice || 0;
    const isBudgetBuy = price <= 18000000;
    return {
      isUrbanAfford: isBudgetBuy,
      depositMonths: 0,
      badgeText: isBudgetBuy ? '🌿 Urban Afford Starter Home' : '💎 Luxury Estate',
      affordabilityTag: isBudgetBuy ? 'High Affordability Starter' : 'High Value Asset',
      lowBrokerage: offer.brokerageType === 'fixed' || offer.brokerageValue <= 1.0,
    };
  }
}

