import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, vendorId, finalPrice, paymentMode } = body;

    if (!userId || !productId || !vendorId || !finalPrice) {
      return NextResponse.json(
        { error: 'userId, productId, vendorId, and finalPrice are required' },
        { status: 400 }
      );
    }

    // Get numeric user ID from Users table
    const { data: userData } = await supabase
      .from('users')
      .select('userid')
      .eq('email', userId)
      .single();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Log transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        userid: userData.userid,
        productid: productId,
        vendorid: vendorId,
        finalprice: finalPrice,
        paymentmode: paymentMode || null,
        // date is auto-generated with default now()
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, transaction: data });
  } catch (error: any) {
    console.error('Error logging transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log transaction' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('transactions')
      .select(`
        *,
        users (name, email),
        products (name),
        vendors (name)
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      transactions: data,
      total: count,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
