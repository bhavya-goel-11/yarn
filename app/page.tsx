'use client';

import { useState } from 'react';
import PriceHistoryGraph from '@/components/PriceHistoryGraph';

interface BreakdownItem {
  type: string;
  description: string;
  value: number;
}

interface PriceResult {
  product: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    name: string;
  };
  basePrice: number;
  couponValue: number;
  cardSavings: number;
  finalPrice: number;
  link: string;
  breakdown: BreakdownItem[];
}

export default function Home() {
  const [productName, setProductName] = useState('');
  const [userID, setUserID] = useState('1');  // Default to user 1 for testing
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      setError('Please enter a product name');
      return;
    }

    if (!userID.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/finalPrice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          userID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch price');
      }

      setResults(data.results || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            NEGORA
          </h1>
          <p className="text-xl text-gray-600">
            Find the best deals across vendors
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  id="productName"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Search for a product..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="userID" className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  id="userID"
                  type="text"
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                  placeholder="Enter your user ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Find Best Price'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Found {results.length} vendor{results.length > 1 ? 's' : ''} for "{productName}"
              </h2>
              <p className="text-gray-600">
                Showing prices from lowest to highest
              </p>
            </div>

            {/* Vendor Cards Grid */}
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                <div className={`px-8 py-6 ${index === 0 ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {result.vendor.name}
                      </h3>
                      <p className="text-blue-100">
                        {result.product.name}
                      </p>
                    </div>
                    {index === 0 && (
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-white font-bold text-sm">🏆 BEST PRICE</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Base Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{result.basePrice.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Coupons</p>
                      <p className="text-lg font-bold text-green-600">
                        -₹{result.couponValue.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Card Savings</p>
                      <p className="text-lg font-bold text-blue-600">
                        -₹{result.cardSavings.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <p className="text-xs text-white mb-1">Final Price</p>
                      <p className="text-xl font-bold text-white">
                        ₹{result.finalPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      Total Savings: <span className="font-bold text-green-600">₹{(result.couponValue + result.cardSavings).toLocaleString('en-IN')}</span>
                    </p>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      Buy Now →
                    </a>
                  </div>

                  {/* Collapsible Breakdown */}
                  <details className="group">
                    <summary className="cursor-pointer list-none flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">View Price Breakdown</span>
                      <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-3 space-y-2">
                      {result.breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{item.type}</p>
                            <p className="text-xs text-gray-600">{item.description}</p>
                          </div>
                          <p className={`font-bold ${item.value < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {item.value < 0 ? '-' : ''}₹{Math.abs(item.value).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            ))}

            {/* Price History Graph for first result */}
            {results[0] && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Price History - {results[0].product.name}
                </h3>
                <PriceHistoryGraph productID={results[0].product.id} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
