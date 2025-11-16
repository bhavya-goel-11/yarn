-- =====================================================
-- NEGORA COMPREHENSIVE DUMMY DATA
-- Generated: 2025-11-16 07:41:13
-- =====================================================

-- ========================================
-- 1. INSERT USERS (10 users)
-- ========================================
INSERT INTO Users (UserID, name, email, preferences) VALUES (1, 'Rahul Sharma', 'rahul.sharma@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (2, 'Priya Patel', 'priya.patel@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (3, 'Amit Kumar', 'amit.kumar@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (4, 'Sneha Reddy', 'sneha.reddy@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (5, 'Vikram Singh', 'vikram.singh@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (6, 'Anjali Gupta', 'anjali.gupta@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (7, 'Rohan Malhotra', 'rohan.malhotra@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (8, 'Kavya Iyer', 'kavya.iyer@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (9, 'Arjun Desai', 'arjun.desai@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');
INSERT INTO Users (UserID, name, email, preferences) VALUES (10, 'Pooja Nair', 'pooja.nair@email.com', '{"preferredVendors": ["Amazon", "Flipkart"], "budget": "medium"}');

-- ========================================
-- 2. INSERT VENDORS
-- ========================================
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (1, 'Amazon', 'E-commerce', 4.5);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (2, 'Flipkart', 'E-commerce', 4.3);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (3, 'Croma', 'Electronics Retail', 4.2);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (4, 'Apple Store', 'Electronics Retail', 4.8);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (5, 'Indigo', 'Airlines', 4.0);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (6, 'Airbnb', 'Hospitality', 4.4);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (7, 'MakeMyTrip', 'Travel', 4.1);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (8, 'Goibibo', 'Travel', 4.0);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (9, 'BookMyShow', 'Entertainment', 4.2);
INSERT INTO Vendors (VendorID, name, type, rating) VALUES (10, 'Myntra', 'Fashion', 4.1);

