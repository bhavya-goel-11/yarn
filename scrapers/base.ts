import axios from 'axios';
import Bottleneck from 'bottleneck';
import NodeCache from 'node-cache';
import { ScrapedResult } from '@/types/scraper';

export abstract class BaseScraper {
  protected name: string;
  protected timeout: number;
  protected retries: number;
  protected limiter: Bottleneck;
  protected cache: NodeCache;

  constructor(name: string, options: { timeout?: number; retries?: number } = {}) {
    this.name = name;
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 2;
    
    // Rate limiter: 2 requests per second
    this.limiter = new Bottleneck({
      minTime: 500,
      maxConcurrent: 1,
    });
    
    // Cache with 5-minute TTL
    this.cache = new NodeCache({ stdTTL: 300 });
  }

  abstract scrape(query: string, params?: any): Promise<ScrapedResult[]>;

  protected async fetchWithRetry(url: string): Promise<string> {
    const cacheKey = url;
    const cached = this.cache.get<string>(cacheKey);
    
    if (cached) {
      console.log(`[${this.name}] Cache hit for ${url}`);
      return cached;
    }

    return this.limiter.schedule(async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= this.retries; attempt++) {
        try {
          console.log(`[${this.name}] Fetching ${url} (attempt ${attempt}/${this.retries})`);
          
          const response = await axios.get(url, {
            timeout: this.timeout,
            headers: {
              'User-Agent': this.getRandomUserAgent(),
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
            },
          });
          
          const html = response.data;
          this.cache.set(cacheKey, html);
          return html;
          
        } catch (error: any) {
          lastError = error;
          console.log(`[${this.name}] Attempt ${attempt} failed: ${error.message}`);
          
          if (attempt < this.retries) {
            // Exponential backoff
            await this.sleep(1000 * attempt);
          }
        }
      }
      
      throw new Error(`Failed to fetch ${url} after ${this.retries} attempts: ${lastError?.message}`);
    });
  }

  protected extractPrice(text: string): number {
    // Remove currency symbols and commas
    const cleanText = text.replace(/[₹$,]/g, '').trim();
    
    // Extract first number
    const match = cleanText.match(/[\d,]+(?:\.\d{2})?/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    
    return 0;
  }

  protected sanitizeText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  protected getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    ];
    
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
