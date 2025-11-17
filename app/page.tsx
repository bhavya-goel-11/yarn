'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Offer {
  type: string;
  description: string;
  value: number;
  code?: string;
}

interface SearchResult {
  vendor: string;
  title: string;
  basePrice: number;
  discountedPrice: number;
  finalPrice: number;
  productUrl: string;
  imageUrl?: string;
  rating?: number;
  offersApplied: {
    platformOffers: Offer[];
    bankOffers: Offer[];
    cardOffers: Offer[];
    coupons: Offer[];
    cashback: Offer[];
  };
}

interface SearchResponse {
  success: boolean;
  vertical: string;
  results: SearchResult[];
  totalResults: number;
  bestDeal?: SearchResult;
  averagePrice?: number;
  message?: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<{ vertical: string; total: number } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: user?.email || 'guest',
        }),
      });

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch results');
      }

      setResults(data.results || []);
      setSearchInfo({
        vertical: data.vertical,
        total: data.totalResults,
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/login');
  };

  const trackProductClick = async (result: SearchResult) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email || 'guest',
          productName: result.title,
          vendor: result.vendor,
          price: result.finalPrice,
          action: 'PRODUCT_CLICK',
        }),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const getAllOffers = (result: SearchResult): Offer[] => {
    return [
      ...result.offersApplied.platformOffers,
      ...result.offersApplied.bankOffers,
      ...result.offersApplied.cardOffers,
      ...result.offersApplied.coupons,
      ...result.offersApplied.cashback,
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header with Auth */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-center flex-1">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              NEGORA
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Real-time price comparison across e-commerce, flights & hotels
            </p>
            <p className="text-sm text-gray-500">
              AI-powered • Multi-vertical • Live scraping
            </p>
          </div>

          {/* User Menu */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_metadata?.name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-gray-400">▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="query" className="block text-sm font-semibold text-gray-700 mb-2">
                  What are you looking for?
                </label>
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="iPhone 15"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900"
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  💡 Tip: Use natural language - we'll automatically detect if you're searching for products, flights, or hotels
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching Best Deals...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🔍</span>
                    <span>Search Best Deals</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                <p className="text-red-700 font-medium flex items-center gap-2">
                  <span>❌</span>
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="max-w-6xl mx-auto">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Found {results.length} results for "{query}"
              </h2>
              {searchInfo && (
                <p className="text-gray-600">
                  Category: {searchInfo.vertical} • Total: {searchInfo.total} results
                </p>
              )}
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((result, index) => {
                const allOffers = getAllOffers(result);
                const savings = result.basePrice - result.finalPrice;
                const savingsPercent = ((savings / result.basePrice) * 100).toFixed(0);

                return (
                  <div 
                    key={index} 
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden ${
                      index === 0 ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    {/* Vendor Header */}
                    <div className={`px-6 py-4 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">
                          {result.vendor}
                        </h3>
                        {index === 0 && (
                          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                            🏆 Best Deal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      {result.imageUrl && (
                        <div className="mb-4 flex justify-center">
                          <img 
                            src={result.imageUrl} 
                            alt={result.title}
                            className="h-48 object-contain"
                          />
                        </div>
                      )}
                      
                      <h4 className="text-gray-900 font-semibold mb-4 line-clamp-2 hover:line-clamp-none">
                        {result.title}
                      </h4>

                      {/* Price Section */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-3xl font-bold text-gray-900">
                            ₹{result.finalPrice.toLocaleString()}
                          </span>
                          {result.basePrice !== result.finalPrice && (
                            <>
                              <span className="text-lg text-gray-400 line-through">
                                ₹{result.basePrice.toLocaleString()}
                              </span>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm font-bold">
                                {savingsPercent}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        {savings > 0 && (
                          <p className="text-sm text-green-600 font-medium">
                            You save ₹{savings.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Offers Applied */}
                      {allOffers.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Applied Offer:</p>
                          {allOffers.map((offer, idx) => (
                            <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                              <p className="text-sm font-medium text-amber-900">
                                {offer.description}
                              </p>
                              <p className="text-xs text-amber-700 mt-1">
                                Save ₹{offer.value.toLocaleString()}
                                {offer.code && ` • Code: ${offer.code}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rating */}
                      {result.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold text-gray-900">{result.rating}</span>
                          {result.reviews && (
                            <span className="text-gray-500 text-sm">
                              ({result.reviews.toLocaleString()} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA Button */}
                      <a
                        href={result.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackProductClick(result)}
                        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-center"
                      >
                        View on {result.vendor} →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
