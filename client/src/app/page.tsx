"use client";

import { useState } from 'react';
import type { AggregatedFlightResults } from '@yarn/shared';
import { FlightSearchForm } from '@/components/FlightSearchForm';
import { OfferList } from '@/components/OfferList';

export default function HomePage() {
  const [results, setResults] = useState<AggregatedFlightResults | undefined>();

  return (
    <main className="page">
      <header className="hero">
        <span className="tag">Beta</span>
        <h1>Yarn Flight Savings Engine</h1>
        <p>
          Real-time metasearch that stacks coupons, card perks, and loyalty credits to expose the cheapest bookable
          airfare.
        </p>
      </header>

      <FlightSearchForm onResults={setResults} />
      <OfferList results={results} />

      <footer className="footer">
        <span>Latency: {results ? `${results.meta.searchLatencyMs} ms` : '—'}</span>
        <span>Cache status: {results ? (results.meta.cacheHit ? 'hit' : 'miss') : '—'}</span>
      </footer>

      <style jsx>{`
        .page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 960px;
          margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
        }

        .hero {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tag {
          align-self: flex-start;
          background: rgba(56, 189, 248, 0.25);
          color: #38bdf8;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        h1 {
          margin: 0;
          font-size: clamp(2rem, 3vw, 3.25rem);
        }

        p {
          margin: 0;
          color: #cbd5f5;
          max-width: 680px;
          line-height: 1.6;
        }

        .footer {
          display: flex;
          gap: 1.5rem;
          color: #94a3b8;
          font-size: 0.9rem;
        }
      `}</style>
    </main>
  );
}
