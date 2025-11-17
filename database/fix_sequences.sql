-- Fix auto-increment sequences for all tables
-- Run this in your Supabase SQL Editor

-- Fix Products sequence
SELECT setval('products_productid_seq', COALESCE((SELECT MAX(productid) FROM products), 0) + 1, false);

-- Fix Vendors sequence
SELECT setval('vendors_vendorid_seq', COALESCE((SELECT MAX(vendorid) FROM vendors), 0) + 1, false);

-- Fix Offers sequence
SELECT setval('offers_offerid_seq', COALESCE((SELECT MAX(offerid) FROM offers), 0) + 1, false);

-- Fix Coupons sequence
SELECT setval('coupons_couponid_seq', COALESCE((SELECT MAX(couponid) FROM coupons), 0) + 1, false);

-- Fix CreditCards sequence
SELECT setval('creditcards_cardid_seq', COALESCE((SELECT MAX(cardid) FROM creditcards), 0) + 1, false);

-- Fix CardOffers sequence
SELECT setval('cardoffers_cardofferid_seq', COALESCE((SELECT MAX(cardofferid) FROM cardoffers), 0) + 1, false);

-- Fix Transactions sequence
SELECT setval('transactions_txnid_seq', COALESCE((SELECT MAX(txnid) FROM transactions), 0) + 1, false);

-- Fix SearchLogs sequence
SELECT setval('searchlogs_logid_seq', COALESCE((SELECT MAX(logid) FROM searchlogs), 0) + 1, false);

-- Fix Users sequence
SELECT setval('users_userid_seq', COALESCE((SELECT MAX(userid) FROM users), 0) + 1, false);

-- Verify sequences are fixed
SELECT 
    'products' as table_name,
    last_value as next_id
FROM products_productid_seq
UNION ALL
SELECT 'vendors', last_value FROM vendors_vendorid_seq
UNION ALL
SELECT 'offers', last_value FROM offers_offerid_seq
UNION ALL
SELECT 'coupons', last_value FROM coupons_couponid_seq
UNION ALL
SELECT 'creditcards', last_value FROM creditcards_cardid_seq
UNION ALL
SELECT 'cardoffers', last_value FROM cardoffers_cardofferid_seq
UNION ALL
SELECT 'transactions', last_value FROM transactions_txnid_seq
UNION ALL
SELECT 'searchlogs', last_value FROM searchlogs_logid_seq
UNION ALL
SELECT 'users', last_value FROM users_userid_seq;
