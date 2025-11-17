export type Vertical = 'ECOMMERCE' | 'FLIGHT' | 'HOTEL';

export interface Offer {
  type: 'PLATFORM' | 'BANK' | 'CARD' | 'COUPON' | 'CASHBACK';
  description: string;
  value: number;
  code?: string;
  minPurchase?: number;
  maxDiscount?: number;
}

export interface OffersApplied {
  platformOffers: Offer[];
  bankOffers: Offer[];
  cardOffers: Offer[];
  coupons: Offer[];
  cashback: Offer[];
}

export interface ScrapedResult {
  vendor: string;
  title: string;
  basePrice: number;
  discountedPrice: number;
  offersApplied: OffersApplied;
  finalPrice: number;
  productUrl: string;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  success: boolean;
  vertical: Vertical;
  results: ScrapedResult[];
  totalResults: number;
  bestDeal?: ScrapedResult;
  averagePrice?: number;
  message?: string;
}

export interface ClassificationResult {
  vertical: Vertical;
  confidence: number;
  extractedParams?: Record<string, any>;
}
