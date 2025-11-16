-- ========================================
-- NEGORA DATA VERIFICATION QUERIES
-- Run these to verify all data loaded correctly
-- ========================================

-- 1. Check table counts
SELECT 'Users' as table_name, COUNT(*) as record_count FROM Users
UNION ALL
SELECT 'Vendors', COUNT(*) FROM Vendors
UNION ALL
SELECT 'Products', COUNT(*) FROM Products
UNION ALL
SELECT 'Offers', COUNT(*) FROM Offers
UNION ALL
SELECT 'Coupons', COUNT(*) FROM Coupons
UNION ALL
SELECT 'CreditCards', COUNT(*) FROM CreditCards
UNION ALL
SELECT 'UserCards', COUNT(*) FROM UserCards
UNION ALL
SELECT 'CardOffers', COUNT(*) FROM CardOffers
UNION ALL
SELECT 'PriceHistory', COUNT(*) FROM PriceHistory
UNION ALL
SELECT 'SearchLogs', COUNT(*) FROM SearchLogs
UNION ALL
SELECT 'OfferCouponMap', COUNT(*) FROM OfferCouponMap
UNION ALL
SELECT 'OfferCardMap', COUNT(*) FROM OfferCardMap
ORDER BY table_name;

-- Expected Results:
-- CardOffers: 500
-- CreditCards: 500
-- Coupons: 500
-- OfferCardMap: ~4500
-- OfferCouponMap: ~6500
-- Offers: 1200+
-- PriceHistory: 1000
-- Products: 1000+
-- SearchLogs: 5000
-- UserCards: 40
-- Users: 10
-- Vendors: 10

-- ========================================
-- 2. Check User 1's credit cards
-- ========================================
SELECT 
    u.UserID,
    u.name,
    c.CardID,
    c.bank,
    c.cardType,
    c.cashbackRate
FROM Users u
JOIN UserCards uc ON u.UserID = uc.UserID
JOIN CreditCards c ON uc.CardID = c.CardID
WHERE u.UserID = 1;

-- ========================================
-- 3. Check iPhone 15 Pro offers across vendors
-- ========================================
SELECT 
    p.ProductID,
    p.name as product_name,
    v.name as vendor_name,
    o.price,
    o.discountType,
    o.discountValue
FROM Products p
JOIN Offers o ON p.ProductID = o.ProductID
JOIN Vendors v ON o.VendorID = v.VendorID
WHERE p.name ILIKE '%iPhone 15 Pro%'
ORDER BY o.price;

-- ========================================
-- 4. Check OfferCouponMap for first offer
-- ========================================
SELECT 
    ocm.OfferID,
    ocm.CouponID,
    c.code,
    c.type,
    c.value,
    c.minSpend
FROM OfferCouponMap ocm
JOIN Coupons c ON ocm.CouponID = c.CouponID
WHERE ocm.OfferID = 1
LIMIT 10;

-- ========================================
-- 5. Check OfferCardMap for first offer
-- ========================================
SELECT 
    ocm.OfferID,
    ocm.CardOfferID,
    co.CardID,
    co.VendorID,
    co.offerDesc
FROM OfferCardMap ocm
JOIN CardOffers co ON ocm.CardOfferID = co.CardOfferID
WHERE ocm.OfferID = 1
LIMIT 10;

-- ========================================
-- 6. Sample products for testing
-- ========================================
SELECT 
    ProductID,
    name,
    category,
    COUNT(o.OfferID) as offer_count
FROM Products p
LEFT JOIN Offers o ON p.ProductID = o.ProductID
WHERE p.name ILIKE '%iPhone%' OR p.name ILIKE '%Samsung%' OR p.name ILIKE '%MacBook%'
GROUP BY p.ProductID, p.name, p.category
ORDER BY p.name
LIMIT 20;
