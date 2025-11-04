"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AggregatedFlightResults, CabinClass, FlightSearchRequest } from '@yarn/shared';
import { searchFlights } from '@/lib/api';

const cabinClasses: CabinClass[] = ['economy', 'premium_economy', 'business', 'first'];
const defaultCurrency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'USD';

export interface FlightSearchFormProps {
  onResults: (results: AggregatedFlightResults) => void;
}

export function FlightSearchForm({ onResults }: FlightSearchFormProps) {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('DXB');
  const [departureDate, setDepartureDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cabinClass, setCabinClass] = useState<CabinClass>('economy');
  const [adults, setAdults] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [issuer, setIssuer] = useState('');
  const [network, setNetwork] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);

  const mutation = useMutation({
    mutationFn: (payload: FlightSearchRequest) => searchFlights(payload),
    onSuccess: (data: AggregatedFlightResults) => {
      onResults(data);
    }
  });

  const isSearching = mutation.isPending;
  const errorMessage = useMemo(() => {
    if (!mutation.error) {
      return undefined;
    }

    if (mutation.error instanceof Error) {
      return mutation.error.message;
    }

    return 'Search failed. Please try again.';
  }, [mutation.error]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: FlightSearchRequest = {
      slices: [
        {
          origin: origin.trim().toUpperCase(),
          destination: destination.trim().toUpperCase(),
          departureDate
        }
      ],
      passengers: {
        adults
      },
      cabinClass,
      currency,
      couponHints: coupon ? [{ code: coupon.trim().toUpperCase() }] : undefined,
      preferredCards:
        issuer && network
          ? [
              {
                issuer: issuer.trim(),
                network: network.trim().toUpperCase()
              }
            ]
          : undefined
    };

    mutation.mutate(payload);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-header">
        <h2>Search flights</h2>
        <p>We will evaluate live fares, coupons, and issuer offers to give the true total.</p>
      </div>

      <div className="card-grid">
        <label>
          Origin
          <input value={origin} onChange={(event: ChangeEvent<HTMLInputElement>) => setOrigin(event.target.value)} maxLength={3} required />
        </label>

        <label>
          Destination
          <input
            value={destination}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDestination(event.target.value)}
            maxLength={3}
            required
          />
        </label>

        <label>
          Depart
          <input type="date" value={departureDate} onChange={(event: ChangeEvent<HTMLInputElement>) => setDepartureDate(event.target.value)} required />
        </label>

        <label>
          Cabin
          <select value={cabinClass} onChange={(event: ChangeEvent<HTMLSelectElement>) => setCabinClass(event.target.value as CabinClass)}>
            {cabinClasses.map((value) => (
              <option key={value} value={value}>
                {value.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label>
          Adults
          <input
            type="number"
            min={1}
            max={9}
            value={adults}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setAdults(Number(event.target.value))}
            required
          />
        </label>

        <label>
          Currency
          <input value={currency} onChange={(event: ChangeEvent<HTMLInputElement>) => setCurrency(event.target.value.toUpperCase())} maxLength={3} required />
        </label>
      </div>

      <div className="card-grid">
        <label>
          Coupon code
          <input value={coupon} onChange={(event: ChangeEvent<HTMLInputElement>) => setCoupon(event.target.value)} placeholder="E.g. FLY50" />
        </label>

        <label>
          Card issuer
          <input value={issuer} onChange={(event: ChangeEvent<HTMLInputElement>) => setIssuer(event.target.value)} placeholder="E.g. Amex" />
        </label>

        <label>
          Card network
          <input value={network} onChange={(event: ChangeEvent<HTMLInputElement>) => setNetwork(event.target.value)} placeholder="E.g. VISA" />
        </label>
      </div>

      <div className="card-footer">
        <button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Find the best price'}
        </button>
        {errorMessage ? <span className="error-text">{errorMessage}</span> : null}
      </div>

      <style jsx>{`
        .card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .card-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .card-header p {
          margin: 0.25rem 0 0;
          color: #94a3b8;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.9rem;
          color: #cbd5f5;
        }

        input,
        select {
          background: rgba(148, 163, 184, 0.14);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 12px;
          padding: 0.6rem 0.75rem;
          color: #e2e8f0;
        }

        input:focus,
        select:focus {
          outline: 2px solid #38bdf8;
          border-color: transparent;
        }

        .card-footer {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        button {
          background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
          color: #0f172a;
          border: none;
          border-radius: 999px;
          padding: 0.75rem 1.75rem;
          font-weight: 600;
        }

        button:disabled {
          opacity: 0.6;
          cursor: progress;
        }

        .error-text {
          color: #fca5a5;
        }
      `}</style>
    </form>
  );
}
