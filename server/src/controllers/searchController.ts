import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { FlightSearchRequest } from '@yarn/shared';
import { FlightAggregator } from '../services/flightAggregator';

const aggregator = new FlightAggregator();

const sliceSchema = z.object({
  origin: z
    .string()
    .trim()
    .length(3, 'origin must be IATA code')
    .transform((value: string) => value.toUpperCase()),
  destination: z
    .string()
    .trim()
    .length(3, 'destination must be IATA code')
    .transform((value: string) => value.toUpperCase()),
  departureDate: z.string().regex(/\d{4}-\d{2}-\d{2}/, 'departureDate must be YYYY-MM-DD')
});

const passengerSchema = z.object({
  adults: z.number().int().min(1),
  children: z.number().int().min(0).optional(),
  infantsInLap: z.number().int().min(0).optional(),
  infantsInSeat: z.number().int().min(0).optional()
});

const cardPreferenceSchema = z.object({
  issuer: z.string().min(1),
  network: z.string().min(1),
  productName: z.string().optional(),
  lastFour: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const couponSchema = z.object({
  code: z.string().min(3),
  providerId: z.string().optional()
});

const loyaltySchema = z.object({
  programId: z.string().min(2),
  accountId: z.string().optional()
});

const flightSearchSchema = z.object({
  slices: z.array(sliceSchema).min(1).max(6),
  passengers: passengerSchema,
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']),
  currency: z.string().length(3).optional(),
  couponHints: z.array(couponSchema).optional(),
  preferredCards: z.array(cardPreferenceSchema).optional(),
  loyaltyPrograms: z.array(loyaltySchema).optional(),
  allowSplitTickets: z.boolean().optional()
});

export async function searchFlights(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = flightSearchSchema.parse(req.body) as FlightSearchRequest;
    const result = await aggregator.search(payload);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = (err as z.ZodError).flatten();
      res.status(400).json({ message: 'Invalid request', issues });
      return;
    }

    next(err);
  }
}
