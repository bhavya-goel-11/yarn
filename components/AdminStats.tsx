'use client';

import { useEffect, useState } from 'react';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalVendors: 0,
    totalSearches: 0,
    totalTransactions: 0,
    recentSearches: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, vendors, logs, transactions] = await Promise.all([
        fetch('/api/admin/products?limit=1').then(r => r.json()),
        fetch('/api/admin/vendors?limit=1').then(r => r.json()),
        fetch('/api/admin/logs?limit=5').then(r => r.json()),
        fetch('/api/admin/transactions?limit=1').then(r => r.json()),
      ]);

      setStats({
        totalProducts: products.total || 0,
        totalVendors: vendors.total || 0,
        totalSearches: logs.total || 0,
        totalTransactions: transactions.total || 0,
        recentSearches: logs.logs || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors}
          icon="🏪"
          color="green"
        />
        <StatCard
          title="Search Queries"
          value={stats.totalSearches}
          icon="🔍"
          color="purple"
        />
        <StatCard
          title="Transactions"
          value={stats.totalTransactions}
          icon="💰"
          color="orange"
        />
      </div>

      {stats.recentSearches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Searches</h3>
          <div className="space-y-2">
            {stats.recentSearches.map((search) => (
              <div key={search.logid} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{search.query}</p>
                  <p className="text-xs text-gray-500">
                    {search.users?.email || 'Anonymous'} • {new Date(search.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <div className={`px-3 py-1 bg-gradient-to-r ${colorClasses} rounded-full`}>
          <span className="text-white text-xs font-bold">LIVE</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}
