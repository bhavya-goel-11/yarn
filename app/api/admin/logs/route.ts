import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('searchlogs')
      .select(`
        logid,
        userid,
        query,
        timestamp,
        users (name, email)
      `, { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      logs: data,
      total: count,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching search logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch search logs' },
      { status: 500 }
    );
  }
}
