import { NextRequest, NextResponse } from 'next/server';
import { classifyQuery } from '@/nlp/classifier';
import { AmazonScraper } from '@/scrapers/ecommerce/amazon';
import { FlipkartScraper } from '@/scrapers/ecommerce/flipkart';
import { PriceCompareEngine } from '@/engine/priceCompare';
import { ScrapedResult } from '@/types/scraper';
import { createClient } from '@supabase/supabase-js';

// Increase timeout for scraping operations
export const maxDuration = 60;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`[Search API] Processing query: "${query}"`);

    // Step 1: Classify the query
    const classification = classifyQuery(query);
    console.log(`[Search API] Classified as: ${classification.vertical} (confidence: ${classification.confidence})`);

    // Step 2: Handle different verticals
    if (classification.vertical === 'FLIGHT') {
      return await handleFlightSearch(query, classification.extractedParams);
    }
    
    if (classification.vertical === 'HOTEL') {
      return await handleHotelSearch(query, classification.extractedParams);
    }

    // Step 3: E-commerce - use working real scrapers
    const scrapers = [
      new AmazonScraper(),
      new FlipkartScraper(),
    ];

    console.log(`[Search API] Running ${scrapers.length} scrapers...`);

    // Step 4: Scrape in parallel
    const scrapePromises = scrapers.map(scraper => 
      scraper.scrape(query).catch(err => {
        console.error(`[Search API] Scraper ${scraper} failed:`, err);
        return [];
      })
    );

    const scraperResults = await Promise.all(scrapePromises);
    
    // Flatten results
    const allResults: ScrapedResult[] = scraperResults.flat();
    
    console.log(`[Search API] Found ${allResults.length} total results`);

    if (allResults.length === 0) {
      return NextResponse.json(
        { 
          error: 'No results found',
          message: 'We couldn\'t find any products matching your search. Please try different keywords.'
        },
        { status: 404 }
      );
    }

    // Step 5: Compare prices and rank results
    const comparisonResult = PriceCompareEngine.compare(
      allResults,
      classification.vertical,
      query
    );

    // Step 6: Log search to database (async, don't wait)
    logSearch(query, userId, classification.vertical, allResults.length, comparisonResult.bestDeal?.finalPrice);

    // Step 7: Return results
    return NextResponse.json({
      success: true,
      vertical: classification.vertical,
      ...comparisonResult,
    });

  } catch (error: any) {
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

async function handleFlightSearch(query: string, params: any) {
  // Check if we have all required parameters
  const missingParams: string[] = [];
  
  if (!params?.from) missingParams.push('from');
  if (!params?.to) missingParams.push('to');
  if (!params?.departDate) missingParams.push('departDate');
  
  if (missingParams.length > 0) {
    return NextResponse.json({
      requiresInput: true,
      vertical: 'FLIGHT',
      message: 'Please provide flight details',
      missingParams,
      extractedParams: params || {},
      formFields: [
        { name: 'from', label: 'From City', type: 'text', required: true, placeholder: 'Delhi' },
        { name: 'to', label: 'To City', type: 'text', required: true, placeholder: 'Mumbai' },
        { name: 'departDate', label: 'Departure Date', type: 'date', required: true },
        { name: 'returnDate', label: 'Return Date (Optional)', type: 'date', required: false },
        { name: 'passengers', label: 'Passengers', type: 'number', required: false, default: 1 },
        { name: 'class', label: 'Class', type: 'select', required: false, options: ['Economy', 'Business', 'First'], default: 'Economy' },
      ]
    }, { status: 400 });
  }
  
  return NextResponse.json({
    success: false,
    vertical: 'FLIGHT',
    message: 'Flight search is coming soon! Flight scrapers are ready but need more testing.',
    results: [],
  }, { status: 200 });
}

async function handleHotelSearch(query: string, params: any) {
  // Check if we have all required parameters
  const missingParams: string[] = [];
  
  if (!params?.location) missingParams.push('location');
  if (!params?.checkIn) missingParams.push('checkIn');
  if (!params?.checkOut) missingParams.push('checkOut');
  
  if (missingParams.length > 0) {
    return NextResponse.json({
      requiresInput: true,
      vertical: 'HOTEL',
      message: 'Please provide hotel booking details',
      missingParams,
      extractedParams: params || {},
      formFields: [
        { name: 'location', label: 'Location/City', type: 'text', required: true, placeholder: 'Goa' },
        { name: 'checkIn', label: 'Check-in Date', type: 'date', required: true },
        { name: 'checkOut', label: 'Check-out Date', type: 'date', required: true },
        { name: 'guests', label: 'Number of Guests', type: 'number', required: false, default: 2 },
        { name: 'rooms', label: 'Number of Rooms', type: 'number', required: false, default: 1 },
      ]
    }, { status: 400 });
  }
  
  return NextResponse.json({
    success: false,
    vertical: 'HOTEL',
    message: 'Hotel search is coming soon! Hotel scrapers are ready but need more testing.',
    results: [],
  }, { status: 200 });
}

async function logSearch(query: string, userId: string | undefined, vertical: string, resultsCount: number, bestPrice: number | undefined) {
  try {
    // First, ensure user exists in Users table or create if needed
    if (userId && userId !== 'guest' && userId !== 'anonymous') {
      const { data: existingUser } = await supabase
        .from('users')
        .select('userid')
        .eq('email', userId)
        .single();

      if (!existingUser) {
        // Try to get user from auth
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          await supabase
            .from('users')
            .upsert({
              email: authData.user.email,
              name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0],
              preferences: {},
            }, { onConflict: 'email' });
        }
      }
    }

    // Get the numeric user ID from Users table
    let numericUserId: number | null = null;
    if (userId && userId !== 'guest' && userId !== 'anonymous') {
      const { data: userData } = await supabase
        .from('users')
        .select('userid')
        .eq('email', userId)
        .single();
      
      if (userData) {
        numericUserId = userData.userid;
      }
    }

    // Log to SearchLogs table (matching schema: UserID, query, timestamp)
    const { error } = await supabase
      .from('searchlogs')
      .insert({
        userid: numericUserId,  // BigInt or NULL
        query: query,           // TEXT
        // timestamp is auto-generated with default now()
      });

    if (error) {
      console.error('[Search API] Failed to log search to SearchLogs:', error);
    } else {
      console.log(`[Search API] Logged search to SearchLogs: "${query}" for user ${numericUserId || 'anonymous'}`);
    }
  } catch (err) {
    console.error('[Search API] Error logging search:', err);
  }
}
