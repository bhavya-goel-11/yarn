import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Track user clicks on product links
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productName, vendor, price, action } = body;

    // Log the click/interaction to SearchLogs with additional context
    let numericUserId: number | null = null;
    
    if (userId && userId !== 'guest') {
      const { data: userData } = await supabase
        .from('users')
        .select('userid')
        .eq('email', userId)
        .single();
      
      if (userData) {
        numericUserId = userData.userid;
      }
    }

    // Log interaction as a search log entry with action context
    const query = `${action || 'CLICK'}: ${productName} on ${vendor} at ₹${price}`;
    
    const { error } = await supabase
      .from('searchlogs')
      .insert({
        userid: numericUserId,
        query: query,
      });

    if (error) {
      console.error('Error logging user interaction:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track interaction' },
      { status: 500 }
    );
  }
}
