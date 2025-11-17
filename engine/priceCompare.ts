import { ScrapedResult, Vertical } from '@/types/scraper';

export class PriceCompareEngine {
  static compare(results: ScrapedResult[], vertical: Vertical, query: string) {
    if (results.length === 0) {
      return {
        results: [],
        totalResults: 0,
      };
    }

    // Sort by final price (lowest first)
    const sortedResults = [...results].sort((a, b) => a.finalPrice - b.finalPrice);

    // Calculate statistics
    const totalResults = results.length;
    const bestDeal = sortedResults[0];
    const averagePrice = results.reduce((sum, r) => sum + r.finalPrice, 0) / results.length;

    return {
      results: sortedResults,
      totalResults,
      bestDeal,
      averagePrice: Math.round(averagePrice),
    };
  }
}
