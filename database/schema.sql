create table Users (
  UserID BIGSERIAL primary key,
  name TEXT not null,
  email TEXT not null unique,
  preferences JSONB
);

create table Vendors (
  VendorID BIGSERIAL primary key,
  name TEXT not null,
  type TEXT,
  rating NUMERIC check (rating between 0 and 5)
);

create table Products (
  ProductID BIGSERIAL primary key,
  name TEXT not null,
  category TEXT,
  subCategory TEXT,
  description TEXT
);

create table Offers (
  OfferID BIGSERIAL primary key,
  ProductID BIGINT not null,
  VendorID BIGINT not null,
  price NUMERIC not null check (price > 0),
  discountType TEXT,
  discountValue NUMERIC default 0,
  expiryDate DATE,
  constraint fk_offers_product foreign KEY (ProductID) references Products (ProductID),
  constraint fk_offers_vendor foreign KEY (VendorID) references Vendors (VendorID)
);

create table Coupons (
  CouponID BIGSERIAL primary key,
  VendorID BIGINT not null,
  code TEXT not null unique,
  type TEXT,
  value NUMERIC check (value >= 0),
  minSpend NUMERIC,
  expiryDate DATE,
  constraint fk_coupons_vendor foreign KEY (VendorID) references Vendors (VendorID)
);

create table CreditCards (
  CardID BIGSERIAL primary key,
  bank TEXT,
  cardType TEXT,
  cashbackRate NUMERIC check (
    cashbackRate >= 0
    and cashbackRate <= 100
  ),
  offerCategory TEXT
);

create table UserCards (
  UserID BIGINT not null,
  CardID BIGINT not null,
  primary key (UserID, CardID),
  constraint fk_usercards_user foreign KEY (UserID) references Users (UserID) on delete CASCADE,
  constraint fk_usercards_card foreign KEY (CardID) references CreditCards (CardID) on delete CASCADE
);

create table CardOffers (
  CardOfferID BIGSERIAL primary key,
  CardID BIGINT not null,
  VendorID BIGINT not null,
  offerDesc TEXT,
  validTill DATE,
  constraint fk_cardoffers_card foreign KEY (CardID) references CreditCards (CardID),
  constraint fk_cardoffers_vendor foreign KEY (VendorID) references Vendors (VendorID)
);

create table Transactions (
  TxnID BIGSERIAL primary key,
  UserID BIGINT not null,
  ProductID BIGINT not null,
  VendorID BIGINT not null,
  finalPrice NUMERIC not null,
  paymentMode TEXT,
  date timestamp without time zone default now(),
  constraint fk_txn_user foreign KEY (UserID) references Users (UserID),
  constraint fk_txn_product foreign KEY (ProductID) references Products (ProductID),
  constraint fk_txn_vendor foreign KEY (VendorID) references Vendors (VendorID)
);

create table PriceHistory (
  ProductID BIGINT not null,
  VendorID BIGINT not null,
  date DATE not null,
  price NUMERIC not null check (price > 0),
  primary key (ProductID, VendorID, date),
  constraint fk_pricehistory_product foreign KEY (ProductID) references Products (ProductID) on delete CASCADE,
  constraint fk_pricehistory_vendor foreign KEY (VendorID) references Vendors (VendorID) on delete CASCADE
);

create table SearchLogs (
  LogID BIGSERIAL primary key,
  UserID BIGINT,
  query TEXT,
  timestamp timestamp without time zone default now(),
  constraint fk_searchlogs_user foreign KEY (UserID) references Users (UserID)
);

create table OfferCouponMap (
  OfferID BIGINT not null,
  CouponID BIGINT not null,
  primary key (OfferID, CouponID),
  constraint fk_offercouponmap_offer foreign KEY (OfferID) references Offers (OfferID) on delete CASCADE,
  constraint fk_offercouponmap_coupon foreign KEY (CouponID) references Coupons (CouponID) on delete CASCADE
);

create table OfferCardMap (
  OfferID BIGINT not null,
  CardOfferID BIGINT not null,
  primary key (OfferID, CardOfferID),
  constraint fk_offercardmap_offer foreign KEY (OfferID) references Offers (OfferID) on delete CASCADE,
  constraint fk_offercardmap_cardoffer foreign KEY (CardOfferID) references CardOffers (CardOfferID) on delete CASCADE
);