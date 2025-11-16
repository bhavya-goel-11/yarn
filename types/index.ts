// Database Types
export interface Product {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
  website: string;
}

export interface Offer {
  id: string;
  product_id: string;
  vendor_id: string;
  price: number;
}

export interface Coupon {
  id: string;
  vendor_id: string;
  code: string;
  description: string;
  value: number;
}

export interface CreditCard {
  id: string;
  name: string;
  cashback_rate: number;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_id: string;
}

export interface CardOffer {
  id: string;
  card_id: string;
  vendor_id: string;
  discount_percentage: number;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  date: string;
  price: number;
}

// API Response Types
export interface BreakdownItem {
  type: string;
  description: string;
  value: number;
}

export interface FinalPriceResponse {
  product: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    name: string;
  };
  basePrice: number;
  couponValue: number;
  cardSavings: number;
  finalPrice: number;
  link: string;
  breakdown: BreakdownItem[];
}

// API Request Types
export interface FinalPriceRequest {
  productName: string;
  userID: string;
}
