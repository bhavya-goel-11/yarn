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
    if (offers.length === 0) return basePrice;
    
    // Apply SINGLE BEST OFFER (most realistic)
    const bestOffer = offers.reduce((best, curr) => 
      curr.value > best.value ? curr : best
    );
    
    return basePrice - bestOffer.value;
  }
}
