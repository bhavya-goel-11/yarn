import { Offer } from '@/types/scraper';

export class OfferEngine {
  static extractOffers(html: string, basePrice: number): {
    platformOffers: Offer[];
    bankOffers: Offer[];
    cardOffers: Offer[];
    coupons: Offer[];
    cashback: Offer[];
  } {
    // This is a simplified version
    // In reality, you'd parse the HTML to extract real offers
    return {
      platformOffers: [],
      bankOffers: [],
      cardOffers: [],
      coupons: [],
      cashback: [],
    };
  }

  static calculateFinalPrice(basePrice: number, offers: Offer[]): number {
    if (!offers || offers.length === 0) return basePrice;

    // Pick the single best offer by absolute value
    const bestOffer = offers.reduce((best, curr) => (curr.value > best.value ? curr : best));

    // Apply maxDiscount cap if provided
    let appliedValue = bestOffer.value || 0;
    if (bestOffer.maxDiscount && appliedValue > bestOffer.maxDiscount) {
      appliedValue = bestOffer.maxDiscount;
    }

    // Never apply more discount than the price itself
    appliedValue = Math.min(appliedValue, basePrice);

    // Final price should never be negative
    return Math.max(0, basePrice - appliedValue);
  }
}
