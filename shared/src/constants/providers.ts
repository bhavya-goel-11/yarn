import type { ProviderMetadata } from '../types/flight';

export const KNOWN_PROVIDERS: ProviderMetadata[] = [
  {
    id: 'amadeus',
    name: 'Amadeus Travel Platform',
    website: 'https://developers.amadeus.com',
    defaultCurrency: 'USD',
    supportsInstantCoupons: false,
    supportsCardDiscounts: false,
    supportsLoyalty: true
  },
  {
    id: 'skyscanner',
    name: 'Skyscanner',
    website: 'https://www.skyscanner.net',
    defaultCurrency: 'USD',
    supportsInstantCoupons: true,
    supportsCardDiscounts: true,
    supportsLoyalty: false
  },
  {
    id: 'makemytrip',
    name: 'MakeMyTrip',
    website: 'https://www.makemytrip.com',
    defaultCurrency: 'INR',
    supportsInstantCoupons: true,
    supportsCardDiscounts: true,
    supportsLoyalty: false
  }
];
