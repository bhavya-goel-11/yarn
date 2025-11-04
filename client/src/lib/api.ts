import axios from 'axios';
import type { AggregatedFlightResults, FlightSearchRequest } from '@yarn/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function searchFlights(payload: FlightSearchRequest): Promise<AggregatedFlightResults> {
  const response = await axios.post<AggregatedFlightResults>(`${API_BASE_URL}/search`, payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}
