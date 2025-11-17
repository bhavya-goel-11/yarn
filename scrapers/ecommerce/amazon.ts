import * as cheerio from 'cheerio';
import { BaseScraper } from '../base';
import { ScrapedResult, Offer } from '@/types/scraper';

export class AmazonScraper extends BaseScraper {
  constructor() {
    super('Amazon India', {
      timeout: 30000,
      retries: 2,
    });
  }

  async scrape(query: string): Promise<ScrapedResult[]> {
    try {
      const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
      const html = await this.fetchWithRetry(searchUrl);
      
      const $ = cheerio.load(html);
      const results: ScrapedResult[] = [];
      
      // Amazon search results selector
      const items = $('.s-result-item[data-component-type="s-search-result"]');
      console.log(`[Amazon India] Found ${items.length} result items on page`);
      
      $('.s-result-item[data-component-type="s-search-result"]').each((i, elem) => {
        if (i >= 5) return false; // Limit to top 5 results
        
        const $elem = $(elem);
        
        // Extract title - try multiple selectors
        const title = this.sanitizeText(
          $elem.find('h2 span').first().text() ||
          $elem.find('.a-size-medium').first().text() ||
          $elem.find('h2').first().text()
        );
        
        if (!title) {
          console.log('[Amazon India] Skipping item: no title found');
          return;
        }
        
        // Extract price
        const priceText = $elem.find('.a-price-whole').first().text();
        const basePrice = this.extractPrice(priceText);
        
        if (!basePrice) {
          console.log(`[Amazon India] Skipping "${title.substring(0, 50)}": no price found (text: "${priceText}")`);
          return;
        }
        
        // Extract original price (if discounted)
        const originalPriceText = $elem.find('.a-price.a-text-price .a-offscreen').text();
        const originalPrice = originalPriceText ? this.extractPrice(originalPriceText) : basePrice;
        
        // Extract product URL - make it absolute and clean
        const relativeUrl = 
          $elem.find('a.a-link-normal').first().attr('href') ||
          $elem.find('h2 a').attr('href') ||
          $elem.find('a[href*="/dp/"]').first().attr('href') ||
          '';
        
        let productUrl = '';
        if (relativeUrl) {
          // Clean the URL - extract the actual product path
          if (relativeUrl.includes('/dp/')) {
            // Extract /dp/ part from URL or encoded URL parameter
            const dpMatch = relativeUrl.match(/\/dp\/([A-Z0-9]+)/);
            if (dpMatch) {
              productUrl = `https://www.amazon.in/dp/${dpMatch[1]}`;
            }
          } else if (relativeUrl.includes('/sspa/click')) {
            // Sponsored product - try to extract /dp/ from encoded URL parameter
            try {
              const urlMatch = relativeUrl.match(/url=([^&]+)/);
              if (urlMatch) {
                const decoded = decodeURIComponent(urlMatch[1]);
                const dpMatch = decoded.match(/\/dp\/([A-Z0-9]+)/);
                if (dpMatch) {
                  productUrl = `https://www.amazon.in/dp/${dpMatch[1]}`;
                }
              }
            } catch (e) {
              // If decoding fails, skip this product
            }
          } else if (relativeUrl.startsWith('/')) {
            productUrl = 'https://www.amazon.in' + relativeUrl.split('?')[0];
          } else if (relativeUrl.startsWith('http')) {
            productUrl = relativeUrl.split('?')[0];
          }
        }
        
        if (!productUrl) {
          console.log(`[Amazon India] Skipping "${title.substring(0, 50)}": no product URL found`);
          return;
        }
        
        // Extract rating
        const ratingText = $elem.find('.a-icon-star-small .a-icon-alt').text();
        const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : undefined;
        
        // Extract reviews count
        const reviewsText = $elem.find('[aria-label*="stars"]').parent().parent().find('span').last().text();
        const reviews = reviewsText ? parseInt(reviewsText.replace(/,/g, '')) : undefined;
        
        // Extract image
        const imageUrl = $elem.find('img.s-image').attr('src');
        
        // Platform discount
        const platformOffers: Offer[] = [];
        if (originalPrice > basePrice) {
          platformOffers.push({
            type: 'PLATFORM',
            description: `Amazon Discount`,
            value: originalPrice - basePrice,
          });
        }
        
        // Check for Prime badge (simulated offer)
        const isPrime = $elem.find('[aria-label="Amazon Prime"]').length > 0;
        if (isPrime) {
          platformOffers.push({
            type: 'PLATFORM',
            description: 'Prime Exclusive Deal',
            value: 0,
          });
        }
        
        // Bank offers (simulated - in reality would extract from product page)
        const bankOffers: Offer[] = [
          {
            type: 'BANK',
            description: 'HDFC Bank Credit Card - 10% Instant Discount',
            value: Math.round(basePrice * 0.10),
            maxDiscount: 3000,
          }
        ];
        
        // Card offers
        const cardOffers: Offer[] = [];
        
        // Coupons
        const coupons: Offer[] = [];
        
        // Cashback
        const cashback: Offer[] = [];
        
        // Apply SINGLE BEST OFFER (safe)
        const allOffers = [...platformOffers, ...bankOffers, ...cardOffers, ...coupons, ...cashback];
        const bestOffer = allOffers.length > 0
          ? allOffers.reduce((best, curr) => curr.value > best.value ? curr : best)
          : undefined;

        // Compute applied discount respecting maxDiscount and not exceeding the discounted price
        let appliedValue = bestOffer?.value || 0;
        if (bestOffer?.maxDiscount && appliedValue > bestOffer.maxDiscount) {
          appliedValue = bestOffer.maxDiscount;
        }
        appliedValue = Math.min(appliedValue, basePrice);

        const finalPrice = Math.max(0, basePrice - appliedValue);
        
        // Only include the best offer in the result
        const appliedPlatform = bestOffer?.type === 'PLATFORM' ? [bestOffer] : [];
        const appliedBank = bestOffer?.type === 'BANK' ? [bestOffer] : [];
        const appliedCard = bestOffer?.type === 'CARD' ? [bestOffer] : [];
        const appliedCoupon = bestOffer?.type === 'COUPON' ? [bestOffer] : [];
        const appliedCashback = bestOffer?.type === 'CASHBACK' ? [bestOffer] : [];
        
        results.push({
          vendor: 'Amazon India',
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
          reviews,
        });
      });
      
      console.log(`[Amazon India] Extracted ${results.length} valid products`);
      return results;
    } catch (error) {
      console.error('[Amazon India] Scraping error:', error);
      return [];
    }
  }
}
