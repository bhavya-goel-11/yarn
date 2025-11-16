import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Offer {
  offerid: number;
  productid: number;
  vendorid: number;
  price: number;
  discounttype: string | null;
  discountvalue: number;
}

interface Coupon {
  couponid: number;
  vendorid: number;
  value: number;
  code: string;
  type: string | null;
  minspend: number | null;
}

interface CreditCard {
  cardid: number;
  bank: string;
  cardtype: string;
  cashbackrate: number;
  offercategory: string | null;
}

interface CardOffer {
  cardofferid: number;
  cardid: number;
  vendorid: number;
  offerdesc: string | null;
}

interface Vendor {
  vendorid: number;
  name: string;
  type: string | null;
}

interface Product {
  productid: number;
  name: string;
  category: string | null;
}

interface BreakdownItem {
  type: string;
  description: string;
  value: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, userID } = body;

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!userID) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Convert userID to number
    const userIdNum = parseInt(userID);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'User ID must be a valid number' },
        { status: 400 }
      );
    }

    // Step 1: Fetch product ID by name from Supabase
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${productName}%`)
      .limit(1);

    if (productError) {
      console.error('Error fetching product:', productError);
      return NextResponse.json(
        { error: 'Failed to fetch product', details: productError.message },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0] as Product;

    // Step 2: Fetch all offers for that product across vendors
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('productid', product.productid);

    if (offersError) {
      console.error('Error fetching offers:', offersError);
      return NextResponse.json(
        { error: 'Failed to fetch offers', details: offersError.message },
        { status: 500 }
      );
    }

    if (!offers || offers.length === 0) {
      return NextResponse.json(
        { error: 'No offers found for this product' },
        { status: 404 }
      );
    }

    // Step 4: Fetch user's credit cards
    const { data: userCards, error: userCardsError } = await supabase
      .from('usercards')
      .select('cardid')
      .eq('userid', userIdNum);

    if (userCardsError) {
      console.error('Error fetching user cards:', userCardsError);
      return NextResponse.json(
        { error: 'Failed to fetch user cards', details: userCardsError.message },
        { status: 500 }
      );
    }

    const userCardIds = userCards?.map((uc: { cardid: number }) => uc.cardid) || [];

    let creditCards: CreditCard[] = [];
    if (userCardIds.length > 0) {
      const { data: cards, error: cardsError } = await supabase
        .from('creditcards')
        .select('*')
        .in('cardid', userCardIds);

      if (cardsError) {
        console.error('Error fetching credit cards:', cardsError);
      } else {
        creditCards = (cards as CreditCard[]) || [];
      }
    }

    // Calculate deals for ALL vendors
    const allDeals: any[] = [];

    for (const offer of offers as Offer[]) {
      // Step 3: Fetch applicable coupons for this offer (using OfferCouponMap)
      const { data: offerCouponMaps, error: ocmError } = await supabase
        .from('offercouponmap')
        .select('couponid')
        .eq('offerid', offer.offerid);

      if (ocmError) {
        console.error('Error fetching offer coupon maps:', ocmError);
      }

      const couponIds = offerCouponMaps?.map((ocm: { couponid: number }) => ocm.couponid) || [];
      
      let coupons: Coupon[] = [];
      if (couponIds.length > 0) {
        const { data: couponData, error: couponsError } = await supabase
          .from('coupons')
          .select('*')
          .in('couponid', couponIds);

        if (couponsError) {
          console.error('Error fetching coupons:', couponsError);
        } else {
          coupons = (couponData as Coupon[]) || [];
        }
      }

      // Step 5: Fetch applicable card offers for this offer (using OfferCardMap)
      const { data: offerCardMaps, error: ocardmError } = await supabase
        .from('offercardmap')
        .select('cardofferid')
        .eq('offerid', offer.offerid);

      if (ocardmError) {
        console.error('Error fetching offer card maps:', ocardmError);
      }

      const cardOfferIds = offerCardMaps?.map((ocm: { cardofferid: number }) => ocm.cardofferid) || [];
      
      let cardOffers: CardOffer[] = [];
      if (cardOfferIds.length > 0) {
        const { data: cardOfferData, error: cardOffersError } = await supabase
          .from('cardoffers')
          .select('*')
          .in('cardofferid', cardOfferIds);

        if (cardOffersError) {
          console.error('Error fetching card offers:', cardOffersError);
        } else {
          cardOffers = (cardOfferData as CardOffer[]) || [];
        }
      }

      // Calculate offer price (base price with any discount)
      let offerPrice = offer.price;
      if (offer.discountvalue && offer.discountvalue > 0) {
        if (offer.discounttype === 'percentage') {
          offerPrice = offer.price - (offer.price * offer.discountvalue / 100);
        } else if (offer.discounttype === 'fixed') {
          offerPrice = offer.price - offer.discountvalue;
        }
      }

      // Find best coupon that meets min spend requirement
      const applicableCoupons = coupons?.filter((c: Coupon) => 
        !c.minspend || offerPrice >= c.minspend
      ) || [];
      
      const bestCoupon = applicableCoupons.length > 0
        ? (applicableCoupons as Coupon[]).reduce((max, c) => c.value > max.value ? c : max)
        : null;

      // Find best card savings
      let bestCardSavings = 0;
      let bestCard: CreditCard | null = null;
      let bestCardOffer: CardOffer | null = null;

      for (const card of creditCards) {
        // Check for specific card offer for this vendor
        const cardOffer = cardOffers?.find((co: CardOffer) => co.cardid === card.cardid);
        
        let savings = 0;
        if (cardOffer) {
          // Card offer exists - use a standard discount (assume 5-10% based on description)
          savings = (offerPrice * 7.5) / 100; // Average of 5-10%
        } else {
          // Use regular cashback
          savings = (offerPrice * card.cashbackrate) / 100;
        }

        if (savings > bestCardSavings) {
          bestCardSavings = savings;
          bestCard = card;
          bestCardOffer = cardOffer as CardOffer || null;
        }
      }

      // Step 6: Compute final price
      const couponValue = bestCoupon ? bestCoupon.value : 0;
      const finalPrice = offerPrice - couponValue - bestCardSavings;

      // Fetch vendor details
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendorid', offer.vendorid)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        continue;
      }

      const vendor = vendorData as Vendor;

      // Step 7: Generate vendor link
      const link = generateVendorLink(vendor.name, productName);

      // Build breakdown
      const breakdown: BreakdownItem[] = [
        {
          type: 'Original Price',
          description: `Base price at ${vendor.name}`,
          value: offer.price
        }
      ];

      if (offer.discountvalue && offer.discountvalue > 0) {
        breakdown.push({
          type: 'Offer Discount',
          description: `${offer.discounttype || 'Discount'} - ${offer.discountvalue}${offer.discounttype === 'percentage' ? '%' : '₹'} off`,
          value: -(offer.price - offerPrice)
        });
      }

      if (bestCoupon) {
        breakdown.push({
          type: 'Applied Coupon',
          description: `${bestCoupon.code} - ${bestCoupon.type || 'Coupon'} (₹${bestCoupon.value})`,
          value: -bestCoupon.value
        });
      }

      if (bestCard) {
        const cardDescription = bestCardOffer
          ? `${bestCard.bank} ${bestCard.cardtype} - Special offer`
          : `${bestCard.bank} ${bestCard.cardtype} - Cashback (${bestCard.cashbackrate}%)`;
        
        breakdown.push({
          type: 'Applied Credit Card Offer',
          description: cardDescription,
          value: -bestCardSavings
        });
      }

      allDeals.push({
        product: {
          id: product.productid,
          name: product.name,
          category: product.category
        },
        vendor: {
          id: vendor.vendorid,
          name: vendor.name,
          type: vendor.type
        },
        basePrice: offer.price,
        offerPrice: offerPrice,
        couponValue,
        cardSavings: bestCardSavings,
        finalPrice: Math.max(0, finalPrice),
        link,
        breakdown
      });
    }

    if (allDeals.length === 0) {
      return NextResponse.json(
        { error: 'Could not calculate prices' },
        { status: 500 }
      );
    }

    // Sort by final price (lowest to highest)
    allDeals.sort((a, b) => a.finalPrice - b.finalPrice);

    return NextResponse.json({ results: allDeals });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateVendorLink(vendorName: string, productName: string): string {
  const query = encodeURIComponent(productName);
  const vendorLower = vendorName.toLowerCase();

  if (vendorLower.includes('amazon')) {
    return `https://amazon.in/s?k=${query}`;
  } else if (vendorLower.includes('flipkart')) {
    return `https://flipkart.com/search?q=${query}`;
  } else if (vendorLower.includes('croma')) {
    return `https://www.croma.com/search/?text=${query}`;
  } else if (vendorLower.includes('apple')) {
    return `https://www.apple.com/in/shop/search/${query}`;
  } else {
    // Default fallback
    return `https://google.com/search?q=${query}`;
  }
}
