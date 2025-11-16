# NEGORA MVP - Smart Price Comparison Platform

Find the best deals across multiple vendors by combining product offers, coupons, and credit card cashback.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
In your Supabase SQL Editor, run:
```sql
-- 1. Run database/schema.sql (your existing schema)
-- 2. Run database/insert_data.sql (9,450 INSERT statements)
```

### 3. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 4. Run Application
```bash
npm run dev
# Open http://localhost:3000
```

## ✨ Features

- **Smart Price Calculation** - Combines base prices, offer discounts, coupons, and card cashback
- **Multi-Vendor Search** - Amazon, Flipkart, Croma, Apple Store, Indigo, Airbnb, and more
- **Price History Graph** - Visual price trends using Chart.js
- **Modern UI** - Responsive design with TailwindCSS

## 🧪 Test Searches

| Search | Expected Result |
|--------|-----------------|
| `iPhone 15 Pro` | iPhone with offers from multiple vendors |
| `MacBook Air M3` | MacBook with discounts |
| `Flight Delhi Goa` | Flight tickets with dates |
| `Hilton` | Hotel room bookings |

**User ID for Testing**: `1`

## 🛠️ Tech Stack

- Next.js 15 (App Router) + TypeScript
- TailwindCSS
- Supabase (PostgreSQL)
- Chart.js + react-chartjs-2

## 📊 Database

**Schema**: 11 tables (Users, Vendors, Products, Offers, Coupons, CreditCards, etc.)

**Test Data Generated**:
- 10 Vendors
- 1000+ Products (phones, laptops, flights, hotels, etc.)
- 1200+ Offers
- 500 Coupons
- 500 Credit Cards
- 1000 Price History entries
- 5000 Search Logs

## 🔑 Prerequisites

- Node.js >= 20.9.0
- Supabase account

## 🔑 Prerequisites

- Node.js >= 20.9.0
- Supabase account

## 📁 Project Structure

```
yarn/
├── app/
│   ├── api/finalPrice/      # Price calculation API
│   └── page.tsx              # Main page
├── components/
│   └── PriceHistoryGraph.tsx # Price chart
├── database/
│   ├── schema.sql            # Database schema
│   ├── insert_data.sql       # Test data (9,450 inserts)
│   └── generate_data.py      # Data generator script
├── lib/
│   └── supabase.ts           # Supabase client
└── types/
    └── index.ts              # TypeScript types
```

## 🐛 Troubleshooting

**"Product not found"**
- Search with partial names: "iPhone" instead of full name
- Verify data: `SELECT COUNT(*) FROM Products;`

**"No offers found"**
- Check: `SELECT COUNT(*) FROM Offers;`
- Verify product has offers

**API errors**
- Verify `.env.local` credentials
- Check Supabase connection
- Review browser console

## 📝 API Reference

### POST /api/finalPrice

**Request:**
```json
{
  "productName": "iPhone 15",
  "userID": "1"
}
```

**Response:**
```json
{
  "product": { "id": 101, "name": "iPhone 15 Pro" },
  "vendor": { "id": 1, "name": "Amazon" },
  "basePrice": 134900,
  "offerPrice": 129900,
  "couponValue": 5000,
  "cardSavings": 2498,
  "finalPrice": 122402,
  "link": "https://amazon.in/s?k=iPhone%2015",
  "breakdown": [...]
}
```

## 📚 Useful SQL Queries

```sql
-- Find products
SELECT * FROM Products WHERE name ILIKE '%search%';

-- Get offers
SELECT p.name, v.name, o.price 
FROM Offers o
JOIN Products p ON o.ProductID = p.ProductID
JOIN Vendors v ON o.VendorID = v.VendorID
WHERE p.ProductID = 101;

-- Get user cards
SELECT c.bank, c.cardType FROM UserCards uc
JOIN CreditCards c ON uc.CardID = c.CardID
WHERE uc.UserID = 1;
```

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT
