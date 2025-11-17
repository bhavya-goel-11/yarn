import { ClassificationResult, Vertical } from '@/types/scraper';

// Keywords for each vertical
const ECOMMERCE_KEYWORDS = [
  'buy', 'purchase', 'price', 'shop', 'product', 'laptop', 'phone', 'mobile',
  'iphone', 'samsung', 'tv', 'camera', 'watch', 'headphone', 'speaker',
  'tablet', 'computer', 'gaming', 'console', 'appliance', 'refrigerator',
  'ac', 'washing machine', 'microwave', 'furniture', 'shoes', 'clothing',
  'book', 'electronic', 'gadget', 'accessory', 'deal', 'offer', 'discount'
];

const FLIGHT_KEYWORDS = [
  'flight', 'flights', 'fly', 'flying', 'airline', 'air', 'plane', 'ticket',
  'tickets', 'travel', 'trip', 'journey', 'departure', 'arrival', 'airport',
  'booking', 'book flight', 'air travel', 'domestic flight', 'international flight'
];

const HOTEL_KEYWORDS = [
  'hotel', 'hotels', 'accommodation', 'stay', 'room', 'rooms', 'booking',
  'resort', 'lodge', 'inn', 'motel', 'hostel', 'guesthouse', 'check-in',
  'check-out', 'night', 'nights', 'bed', 'breakfast'
];

function countMatches(query: string, keywords: string[]): number {
  const lowerQuery = query.toLowerCase();
  return keywords.filter(keyword => lowerQuery.includes(keyword)).length;
}

export function classifyQuery(query: string): ClassificationResult {
  const ecommerceScore = countMatches(query, ECOMMERCE_KEYWORDS);
  const flightScore = countMatches(query, FLIGHT_KEYWORDS);
  const hotelScore = countMatches(query, HOTEL_KEYWORDS);
  
  const total = ecommerceScore + flightScore + hotelScore;
  
  // If no specific keywords, default to ECOMMERCE (product search)
  if (total === 0) {
    return {
      vertical: 'ECOMMERCE',
      confidence: 0.5,
    };
  }
  
  // Determine vertical with highest score
  let vertical: Vertical = 'ECOMMERCE';
  let maxScore = ecommerceScore;
  
  if (flightScore > maxScore) {
    vertical = 'FLIGHT';
    maxScore = flightScore;
  }
  
  if (hotelScore > maxScore) {
    vertical = 'HOTEL';
    maxScore = hotelScore;
  }
  
  const confidence = maxScore / total;
  
  // Extract parameters based on vertical
  let extractedParams: Record<string, any> = {};
  
  if (vertical === 'FLIGHT') {
    extractedParams = extractFlightParams(query);
  } else if (vertical === 'HOTEL') {
    extractedParams = extractHotelParams(query);
  }
  
  return {
    vertical,
    confidence,
    extractedParams,
  };
}

function extractFlightParams(query: string): Record<string, any> {
  const params: Record<string, any> = {};
  
  // Extract cities (from X to Y pattern)
  const fromToMatch = query.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s|$)/i);
  if (fromToMatch) {
    params.from = fromToMatch[1].trim();
    params.to = fromToMatch[2].trim();
  }
  
  // Extract dates (basic pattern matching)
  const dateMatch = query.match(/on\s+(\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4})/i);
  if (dateMatch) {
    params.departDate = dateMatch[1];
  }
  
  // Extract passengers
  const passengerMatch = query.match(/(\d+)\s+passenger/i);
  if (passengerMatch) {
    params.passengers = parseInt(passengerMatch[1]);
  }
  
  return params;
}

function extractHotelParams(query: string): Record<string, any> {
  const params: Record<string, any> = {};
  
  // Extract location
  const inMatch = query.match(/(?:in|at)\s+([a-zA-Z\s]+?)(?:\s+from|\s+for|\s+on|$)/i);
  if (inMatch) {
    params.location = inMatch[1].trim();
  }
  
  // Extract check-in date
  const fromMatch = query.match(/from\s+(\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4})/i);
  if (fromMatch) {
    params.checkIn = fromMatch[1];
  }
  
  // Extract check-out date
  const toMatch = query.match(/to\s+(\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4})/i);
  if (toMatch) {
    params.checkOut = toMatch[1];
  }
  
  // Extract guests
  const guestMatch = query.match(/(\d+)\s+guest/i);
  if (guestMatch) {
    params.guests = parseInt(guestMatch[1]);
  }
  
  return params;
}
