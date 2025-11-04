import type { FlightSearchRequest, ProviderOffer } from '@yarn/shared';

export interface ProviderAdapter {
  id: string;
  name: string;
  supportsRealTimeCoupons: boolean;
  fetchOffers(request: FlightSearchRequest): Promise<ProviderOffer[]>;
}
