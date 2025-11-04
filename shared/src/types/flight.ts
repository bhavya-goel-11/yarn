export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface PassengerMix {
  adults: number;
  children?: number;
  infantsInLap?: number;
  infantsInSeat?: number;
}

export interface FlightSlice {
  origin: string;
  destination: string;
  departureDate: string;
}

export interface PaymentCardPreference {
  issuer: string;
  network: string;
  productName?: string;
  lastFour?: string;
  tags?: string[];
}

export interface CouponHint {
  code: string;
  providerId?: string;
}

export interface LoyaltyProgram {
  programId: string;
  accountId?: string;
}

export interface FlightSearchRequest {
  slices: FlightSlice[];
  passengers: PassengerMix;
  cabinClass: CabinClass;
  currency?: string;
  couponHints?: CouponHint[];
  preferredCards?: PaymentCardPreference[];
  loyaltyPrograms?: LoyaltyProgram[];
  allowSplitTickets?: boolean;
}

export interface BaggageAllowance {
  carryOn?: number;
  checked?: number;
  unit?: 'kg' | 'lb' | 'piece';
}

export interface DiscountDetail {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: 'coupon' | 'card' | 'loyalty' | 'cashback';
  providerId: string;
  stackable: boolean;
  source: 'provider' | 'yarn';
  expiresAt?: string;
}

export interface FareBreakdown {
  baseFare: number;
  taxes: number;
  surcharges: number;
  providerFees: number;
  convenienceFees: number;
  currency: string;
}

export interface PricingSummary {
  rawTotal: number;
  currency: string;
  appliedDiscounts: DiscountDetail[];
  effectiveTotal: number;
}

export interface FlightLeg {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  carrierCode: string;
  flightNumber: string;
  aircraft?: string;
  layoverMinutes?: number;
  operatingCarrier?: string;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  website: string;
  defaultCurrency: string;
  supportsInstantCoupons: boolean;
  supportsCardDiscounts: boolean;
  supportsLoyalty: boolean;
}

export interface ProviderOffer {
  offerId: string;
  provider: ProviderMetadata;
  legs: FlightLeg[];
  baggage: BaggageAllowance;
  fare: FareBreakdown;
  pricing: PricingSummary;
  cabinClass: CabinClass;
  refundable: boolean;
  changePenalties?: string;
  bookingUrl: string;
  fetchedAt: string;
  priceSource: 'live' | 'cache';
}

export interface AggregatedResultMetadata {
  totalProviders: number;
  providersSucceeded: string[];
  providersErrored: string[];
  cacheHit: boolean;
  searchLatencyMs: number;
  generatedAt: string;
}

export interface AggregatedFlightResults {
  query: FlightSearchRequest;
  offers: ProviderOffer[];
  cheapest?: ProviderOffer;
  fastest?: ProviderOffer;
  bestOverall?: ProviderOffer;
  meta: AggregatedResultMetadata;
}
