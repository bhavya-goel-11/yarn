import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, vendorId, price, discountType, discountValue, expiryDate } = body;

    if (!productId || !vendorId || !price) {
      return NextResponse.json(
        { error: 'Product, vendor, and price are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('offers')
      .insert([{
        productid: productId,
        vendorid: vendorId,
        price,
        discounttype: discountType || null,
        discountvalue: discountValue || 0,
        expirydate: expiryDate || null,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, offer: data });
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create offer' },
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
      .from('offers')
      .select(`
        *,
        products (name),
        vendors (name)
      `, { count: 'exact' })
      .order('offerid', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      offers: data,
      total: count,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}
