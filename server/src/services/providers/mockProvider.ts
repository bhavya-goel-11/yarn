import { addMinutes, formatISO } from 'date-fns';
import type { FlightSearchRequest, ProviderOffer } from '@yarn/shared';
import { KNOWN_PROVIDERS } from '@yarn/shared';
import { ProviderAdapter } from './providerAdapter';

const mockProviderMeta = KNOWN_PROVIDERS.find((provider) => provider.id === 'skyscanner');

function ensureMeta() {
  if (!mockProviderMeta) {
    throw new Error('Skyscanner metadata missing from KNOWN_PROVIDERS');
  }
  return mockProviderMeta;
}

export class MockProviderAdapter implements ProviderAdapter {
  id = 'mock-skyscanner';
  name = 'Mock Skyscanner';
  supportsRealTimeCoupons = true;

  async fetchOffers(request: FlightSearchRequest): Promise<ProviderOffer[]> {
    const meta = ensureMeta();

    const firstSlice = request.slices[0];
    if (!firstSlice) {
      return [];
    }

    const departure = new Date(`${firstSlice.departureDate}T08:00:00Z`);

    const offer: ProviderOffer = {
      offerId: 'mock-offer-1',
      provider: meta,
      legs: [
        {
          id: 'mock-leg-1',
          origin: firstSlice.origin,
          destination: firstSlice.destination,
          departure: formatISO(departure),
          arrival: formatISO(addMinutes(departure, 140)),
          durationMinutes: 140,
          carrierCode: 'YX',
          flightNumber: 'YX204',
          aircraft: '320'
        }
      ],
      baggage: {
        carryOn: 1,
        checked: 1,
        unit: 'piece'
      },
      fare: {
        baseFare: 210,
        taxes: 65,
        surcharges: 12,
        providerFees: 8,
        convenienceFees: 5,
        currency: request.currency ?? meta.defaultCurrency
      },
      pricing: {
        rawTotal: 0,
        currency: request.currency ?? meta.defaultCurrency,
        appliedDiscounts: [],
        effectiveTotal: 0
      },
      cabinClass: request.cabinClass,
      refundable: false,
      bookingUrl: 'https://www.skyscanner.net',
      fetchedAt: new Date().toISOString(),
      priceSource: 'live'
    };

    return [offer];
  }
}
