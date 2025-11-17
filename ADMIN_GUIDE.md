# Admin Dashboard Guide

## Access Admin Dashboard

Visit: `http://localhost:3000/admin`

**Admin Access Control:**
- Only users with emails in the admin list can access
- Current admin emails (update in `/app/admin/page.tsx`):
  - `admin@negora.com`
  - `bhavya@negora.com`

## Features

### 📦 Products Management
- **Add New Products**: Create products with name, category, sub-category, and description
- **View All Products**: Paginated table showing all products in database
- **Track Product Count**: See total number of products

### 🏪 Vendors Management
- **Add New Vendors**: Create vendors with name, type, and rating (0-5)
- **Vendor Types**: E-commerce, Retail, Marketplace, Direct Seller
- **View All Vendors**: Paginated listing of all vendors

### 💰 Offers Management
- **Create Offers**: Link products to vendors with pricing
- **Discount Types**: Percentage, Fixed Amount, BOGO
- **Set Expiry Dates**: Time-limited offers
- **View All Offers**: See product-vendor-price combinations

### 🎟️ Coupons Management
- **Create Coupon Codes**: Generate vendor-specific coupons
- **Set Minimum Spend**: Require minimum purchase amount
- **Track Expiry**: Time-limited coupon codes

### 💳 Credit Cards Management
- **Add Card Offers**: Bank-specific credit card deals
- **Cashback Rates**: Configure percentage cashback
- **Offer Categories**: Target specific product categories

### 📊 Search Logs Analytics
- **View All Searches**: See what users are searching for
- **User Tracking**: Anonymous and registered user searches
- **Timestamp Data**: When searches occurred
- **Query Analysis**: Understand user intent

### 🛒 Transactions Log
- **View Purchase History**: Track all user transactions
- **Revenue Analytics**: See final prices paid
- **Vendor Performance**: Which vendors get most sales
- **Payment Methods**: Track payment modes

## User Interaction Tracking

### Automatic Logging

The system automatically tracks:

1. **Search Queries** → `SearchLogs` table
   - Every search is logged with user ID (or null for anonymous)
   - Timestamp auto-generated
   - Query text stored for analysis

2. **Product Clicks** → `SearchLogs` table
   - Format: `PRODUCT_CLICK: [Product Name] on [Vendor] at ₹[Price]`
   - Tracks when users click "View on Vendor" buttons
   - Links to user account if logged in

3. **User Registration** → `Users` table
   - Auto-created on first search/interaction
   - Syncs with Supabase Auth
   - Stores name, email, preferences

### Manual Transaction Logging

To log a purchase transaction, call the API:

```javascript
fetch('/api/admin/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user@example.com',
    productId: 123,
    vendorId: 456,
    finalPrice: 49999.00,
    paymentMode: 'Credit Card'
  })
});
```

## Database Schema Mapping

### Tables Created/Used:

| Table | Purpose | Admin Feature |
|-------|---------|---------------|
| `Users` | User accounts | Auto-created on interaction |
| `Vendors` | E-commerce platforms | Vendors Management |
| `Products` | Product catalog | Products Management |
| `Offers` | Product-Vendor-Price mapping | Offers Management |
| `Coupons` | Discount codes | Coupons Management |
| `CreditCards` | Bank card offers | Credit Cards Management |
| `SearchLogs` | Search + interaction tracking | Search Logs Analytics |
| `Transactions` | Purchase records | Transactions Log |
| `PriceHistory` | Historical pricing | (Future feature) |

## API Endpoints

### Admin CRUD Operations

```
POST   /api/admin/products      - Create product
GET    /api/admin/products      - List products (paginated)

POST   /api/admin/vendors       - Create vendor
GET    /api/admin/vendors       - List vendors (paginated)

POST   /api/admin/offers        - Create offer
GET    /api/admin/offers        - List offers (paginated)

GET    /api/admin/logs          - View search logs
GET    /api/admin/transactions  - View transactions
POST   /api/admin/transactions  - Log new transaction
```

### User Interaction Tracking

```
POST   /api/track               - Track user clicks/interactions
POST   /api/search              - Search + auto-log to SearchLogs
```

## Usage Examples

### Add a Product
1. Go to Admin Dashboard → Products tab
2. Click "+ Add Product"
3. Fill in:
   - Name: "iPhone 15 Pro"
   - Category: "Electronics"
   - Sub-Category: "Smartphones"
   - Description: "Latest iPhone model"
4. Submit

### Create an Offer
1. Go to Offers tab → "+ Add Offer"
2. Select Product (must exist first)
3. Select Vendor (must exist first)
4. Set Price: 119900
5. Optional: Add discount (10% off)
6. Optional: Set expiry date
7. Submit

### View Search Analytics
1. Go to Search Logs tab
2. See all user searches with:
   - User email (if logged in) or "Anonymous"
   - Search query
   - Timestamp
3. Use pagination to browse history

## Security Notes

⚠️ **Important for Production:**

1. **Admin Email List**: Move to database/environment variable
2. **Service Role Key**: Use `SUPABASE_SERVICE_ROLE_KEY` env var for admin operations
3. **Row Level Security**: Enable RLS policies on all tables
4. **API Authentication**: Add middleware to verify admin status
5. **Rate Limiting**: Implement rate limiting on admin endpoints

## Next Steps

### Recommended Enhancements:

1. **Analytics Dashboard**
   - Popular search terms
   - Click-through rates
   - Revenue by vendor
   - User engagement metrics

2. **Bulk Operations**
   - CSV import for products
   - Batch offer creation
   - Mass coupon generation

3. **Price History**
   - Track price changes over time
   - Alert on price drops
   - Historical charts

4. **User Management**
   - View all registered users
   - User preferences
   - Ban/suspend users

5. **Email Notifications**
   - Price drop alerts
   - New offers notifications
   - Weekly analytics report
