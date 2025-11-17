import * as cheerio from 'cheerio';
import { BaseScraper } from '../base';
import { ScrapedResult, Offer } from '@/types/scraper';

export class FlipkartScraper extends BaseScraper {
  constructor() {
    super('Flipkart', {
      timeout: 30000,
      retries: 2,
    });
  }

  async scrape(query: string): Promise<ScrapedResult[]> {
    try {
      const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
      const html = await this.fetchWithRetry(searchUrl);
      
      const $ = cheerio.load(html);
      const results: ScrapedResult[] = [];
      
      // Flipkart search results - try multiple selectors (they change frequently)
      const productSelectors = [
        '.tUxRFH',      // Current 2024
        '._1AtVbE',
        '._1fQZEK',
        '._13oc-S',
        '[data-id]',
        '._2kHMtA',
        '.s1Q9rs',
      ];
      
      let $products = $('');
      for (const selector of productSelectors) {
        const found = $(selector);
        if (found.length > 0) {
          $products = found;
          console.log(`[Flipkart] Found ${$products.length} items using selector: ${selector}`);
          break;
        }
      }
      
      if ($products.length === 0) {
        console.log('[Flipkart] No products found with any selector');
        return [];
      }
      
      $products.each((i, elem) => {
            if (i >= 5) return false; // Limit to top 5
            
            const $elem = $(elem);
            
            // Extract title - try current selectors first
            const title = this.sanitizeText(
              $elem.find('.CGtC98').first().text() ||
              $elem.find('._4rR01T, .IRpwTa, ._2WkVRV').first().text() ||
              $elem.find('a[title]').first().attr('title') || ''
            );
            
            if (!title) {
              console.log('[Flipkart] Skipping item: no title found');
              return;
            }
            
            // Extract price with current selectors
            const priceText = 
              $elem.find('.Nx9bqj').first().text() ||
              $elem.find('._30jeq3, ._1_WHN1').first().text() ||
              $elem.text();
            
            const basePrice = this.extractPrice(priceText);
            
            if (!basePrice) {
              console.log(`[Flipkart] Skipping "${title.substring(0, 50)}": no price found (text: "${priceText.substring(0, 30)}")`);
              return;
            }
            
            // Extract original price
            const originalPriceText = $elem.find('._3I9_wc, ._2lQ_WZ').first().text();
            const originalPrice = originalPriceText ? this.extractPrice(originalPriceText) : basePrice;
            
            // Extract discount percentage
            const discountText = $elem.find('._3Ay6Sb, ._1eFVc9').first().text();
            
            // Extract product URL - get the full href including all query parameters
            const rawUrl = $elem.find('a').first().attr('href') || '';
            let productUrl = '';
            
            if (rawUrl) {
              // If URL starts with /, it's relative - add domain
              if (rawUrl.startsWith('/')) {
                productUrl = 'https://www.flipkart.com' + rawUrl;
              } 
              // If it already has domain, use as is
              else if (rawUrl.startsWith('http')) {
                productUrl = rawUrl;
              }
              // Otherwise prepend domain
              else {
                productUrl = 'https://www.flipkart.com/' + rawUrl;
              }
            }
            
            if (!productUrl) return;
            
            console.log(`[Flipkart] Product URL: ${productUrl}`);
            
            // Extract image
            const imageUrl = $elem.find('img').first().attr('src');
            
            // Extract rating
            const ratingText = $elem.find('._3LWZlK, .XQDdHH').first().text();
            const rating = ratingText ? parseFloat(ratingText) : undefined;
            
            // Platform offers
            const platformOffers: Offer[] = [];
            if (originalPrice > basePrice) {
              platformOffers.push({
                type: 'PLATFORM',
                description: 'Flipkart Discount',
                value: originalPrice - basePrice,
              });
            }
            
            // Bank offers (simulated)
            const bankOffers: Offer[] = [
              {
                type: 'BANK',
                description: 'Axis Bank Credit Card - 10% Instant Discount',
                value: Math.round(basePrice * 0.10),
                maxDiscount: 2000,
              }
            ];
            
            // Card offers
            const cardOffers: Offer[] = [];
            
            // Coupons
            const coupons: Offer[] = [];
            
            // Cashback
            const cashback: Offer[] = [];
            
            // Apply SINGLE BEST OFFER
            const allOffers = [...platformOffers, ...bankOffers, ...cardOffers, ...coupons, ...cashback];
            const bestOffer = allOffers.reduce((best, curr) => curr.value > best.value ? curr : best, allOffers[0]);
            
            const finalPrice = basePrice - (bestOffer?.value || 0);
            
            // Only include the best offer
            let appliedPlatform: Offer[] = [];
            let appliedBank: Offer[] = [];
            let appliedCard: Offer[] = [];
            let appliedCoupon: Offer[] = [];
            let appliedCashback: Offer[] = [];
            
            if (bestOffer?.type === 'PLATFORM') appliedPlatform = [bestOffer];
            else if (bestOffer?.type === 'BANK') appliedBank = [bestOffer];
            else if (bestOffer?.type === 'CARD') appliedCard = [bestOffer];
            else if (bestOffer?.type === 'COUPON') appliedCoupon = [bestOffer];
            else if (bestOffer?.type === 'CASHBACK') appliedCashback = [bestOffer];
            
            results.push({
              vendor: 'Flipkart',
              title,
              basePrice: originalPrice,
              discountedPrice: basePrice,
              offersApplied: {
                platformOffers: appliedPlatform,
                cardOffers: appliedCard,
                coupons: appliedCoupon,
                bankOffers: appliedBank,
                cashback: appliedCashback,
              },
              finalPrice,
              productUrl,
              imageUrl,
              rating,
            });
          });
      
      console.log(`[Flipkart] Extracted ${results.length} valid products`);
      return results;
    } catch (error) {
      console.error('[Flipkart] Scraping error:', error);
      return [];
    }
  }
}
