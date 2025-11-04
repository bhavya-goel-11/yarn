"use client";

import type { AggregatedFlightResults, ProviderOffer } from '@yarn/shared';

interface OfferListProps {
  results?: AggregatedFlightResults;
}

export function OfferList({ results }: OfferListProps) {
  if (!results) {
    return (
      <div className="placeholder">
        <p>Search to see stacked offers.</p>
        <style jsx>{`
          .placeholder {
            margin-top: 2rem;
            padding: 2rem;
            border-radius: 16px;
            border: 1px dashed rgba(148, 163, 184, 0.4);
            text-align: center;
            color: #94a3b8;
          }
        `}</style>
      </div>
    );
  }

  if (!results.offers.length) {
    return (
      <div className="placeholder">
        <p>No offers found. Try adjusting dates or removing filters.</p>
        <style jsx>{`
          .placeholder {
            margin-top: 2rem;
            padding: 2rem;
            border-radius: 16px;
            border: 1px dashed rgba(248, 113, 113, 0.6);
            text-align: center;
            color: #f8fafc;
          }
        `}</style>
      </div>
    );
  }

  const { meta, cheapest, bestOverall } = results;

  return (
    <section className="offer-list">
      <div className="summary">
        <div>
          <h3>{results.offers.length} stacked offers</h3>
          <p>
            Providers queried: {meta.providersSucceeded.length} / {meta.totalProviders}.{' '}
            {meta.providersErrored.length ? `${meta.providersErrored.length} failed.` : 'All responsive.'}
          </p>
        </div>
        {cheapest ? (
          <div className="badge">
            <span>Cheapest: {formatMoney(cheapest.pricing.effectiveTotal, cheapest.pricing.currency)}</span>
          </div>
        ) : null}
      </div>

      <div className="grid">
        {results.offers.map((offer) => (
          <OfferCard key={offer.offerId} offer={offer} highlight={offer.offerId === bestOverall?.offerId} />
        ))}
      </div>

      <style jsx>{`
        .offer-list {
          margin-top: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(37, 99, 235, 0.15));
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .summary h3 {
          margin: 0 0 0.35rem;
        }

        .summary p {
          margin: 0;
          color: #cbd5f5;
        }

        .badge {
          background: rgba(20, 184, 166, 0.2);
          color: #5eead4;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
      `}</style>
    </section>
  );
}

function OfferCard({ offer, highlight }: { offer: ProviderOffer; highlight: boolean }) {
  const totalDuration = offer.legs.reduce((acc, leg) => acc + leg.durationMinutes, 0);

  return (
    <article className={`offer-card ${highlight ? 'highlight' : ''}`}>
      <header>
        <div>
          <h4>{offer.provider.name}</h4>
          <p>{offer.legs[0]?.origin} → {offer.legs.at(-1)?.destination}</p>
        </div>
        <strong>{formatMoney(offer.pricing.effectiveTotal, offer.pricing.currency)}</strong>
      </header>

      <ul>
        <li>Base fare: {formatMoney(offer.fare.baseFare + offer.fare.taxes + offer.fare.surcharges, offer.fare.currency)}</li>
        <li>Fees: {formatMoney(offer.fare.providerFees + offer.fare.convenienceFees, offer.fare.currency)}</li>
        <li>Discounts: -{formatMoney(sumDiscounts(offer), offer.pricing.currency)}</li>
        <li>Total duration: {Math.round(totalDuration / 60)}h {totalDuration % 60}m</li>
        <li>Baggage: {offer.baggage.carryOn ?? 0} cabin, {offer.baggage.checked ?? 0} checked</li>
      </ul>

      <footer>
        <a href={offer.bookingUrl} target="_blank" rel="noreferrer">
          Book on {offer.provider.name}
        </a>
        <span className="timestamp">Fetched {new Date(offer.fetchedAt).toLocaleTimeString()}</span>
      </footer>

      <style jsx>{`
        .offer-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.1);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .offer-card.highlight {
          border-color: rgba(34, 197, 94, 0.6);
          box-shadow: 0 18px 36px rgba(34, 197, 94, 0.15);
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.75rem;
        }

        header h4,
        header p {
          margin: 0;
        }

        header p {
          color: #94a3b8;
          font-size: 0.95rem;
        }

        strong {
          font-size: 1.35rem;
        }

        ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          color: #cbd5f5;
        }

        footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        a {
          background: rgba(59, 130, 246, 0.2);
          color: #38bdf8;
          padding: 0.5rem 0.9rem;
          border-radius: 12px;
        }

        .timestamp {
          color: #94a3b8;
          font-size: 0.85rem;
        }
      `}</style>
    </article>
  );
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

function sumDiscounts(offer: ProviderOffer): number {
  return offer.pricing.appliedDiscounts.reduce((total, discount) => total + discount.amount, 0);
}
