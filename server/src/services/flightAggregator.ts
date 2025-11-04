import type {
  AggregatedFlightResults,
  FlightSearchRequest,
  ProviderOffer
} from '@yarn/shared';
import { DiscountEngine } from './discountEngine';
import { getProviderAdapters } from './providerRegistry';
import { logger } from '../utils/logger';

export class FlightAggregator {
  private readonly discountEngine = new DiscountEngine();

  async search(request: FlightSearchRequest): Promise<AggregatedFlightResults> {
    const adapters = getProviderAdapters();
    const started = Date.now();
    const offers: ProviderOffer[] = [];
    const providersSucceeded: string[] = [];
    const providersErrored: string[] = [];

    await Promise.allSettled(
      adapters.map(async (adapter) => {
        try {
          const providerOffers = await adapter.fetchOffers(request);
          providerOffers.forEach((offer) => {
            const enriched = this.discountEngine.applyBestStack(offer, { request });
            offers.push(enriched);
          });

          providersSucceeded.push(adapter.id);
        } catch (error) {
          providersErrored.push(adapter.id);
          logger.error(
            {
              err: error,
              providerId: adapter.id
            },
            'Provider fetch failed'
          );
        }
      })
    );

    const sortedOffers = offers.sort(
      (left, right) => left.pricing.effectiveTotal - right.pricing.effectiveTotal
    );

    const cheapest = sortedOffers[0];
    const fastest = this.selectFastest(sortedOffers);
    const bestOverall = cheapest ?? fastest;

    return {
      query: request,
      offers: sortedOffers,
      cheapest,
      fastest,
      bestOverall,
      meta: {
        totalProviders: adapters.length,
        providersSucceeded,
        providersErrored,
        cacheHit: false,
        searchLatencyMs: Date.now() - started,
        generatedAt: new Date().toISOString()
      }
    };
  }

  private selectFastest(offers: ProviderOffer[]): ProviderOffer | undefined {
    return offers.reduce<ProviderOffer | undefined>((fastest, offer) => {
      if (!fastest) {
        return offer;
      }

      return this.totalDuration(offer) < this.totalDuration(fastest) ? offer : fastest;
    }, undefined);
  }

  private totalDuration(offer: ProviderOffer): number {
    return offer.legs.reduce((total, leg) => total + (leg.durationMinutes ?? 0), 0);
  }
}
