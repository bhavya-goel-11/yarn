'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminStats from '@/components/AdminStats';
import { createClient } from '@supabase/supabase-js';

// Admin emails - in production, store this in database
const ADMIN_EMAILS = ['admin@negora.com', 'bhavya@negora.com', 'bhavy.goel.11@gmail.com', 'bhavyagoel1107@gmail.com'];  // Add your email here

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user, loading]);

  const checkAdminStatus = async () => {
    console.log('[Admin] Checking admin status...');
    console.log('[Admin] User:', user?.email);
    console.log('[Admin] Loading:', loading);
    
    if (!loading && !user) {
      console.log('[Admin] No user logged in, redirecting to home');
      router.push('/');
      return;
    }

    if (user) {
      console.log('[Admin] Checking if user is admin:', user.email);
      
      // Check if email is in whitelist
      const emailIsAdmin = ADMIN_EMAILS.includes(user.email || '');
      console.log('[Admin] Email in whitelist?', emailIsAdmin);
      
      // Or check database (if you added is_admin column)
      let dbIsAdmin = false;
      try {
        const { data } = await supabase
          .from('users')
          .select('is_admin')
          .eq('email', user.email)
          .single();
        
        dbIsAdmin = data?.is_admin || false;
        console.log('[Admin] DB admin check:', dbIsAdmin);
      } catch (error) {
        console.log('[Admin] DB check failed, using whitelist only');
      }

      const adminStatus = emailIsAdmin || dbIsAdmin;
      console.log('[Admin] Final admin status:', adminStatus);
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        console.log('[Admin] Not admin, redirecting to home');
        router.push('/');
      } else {
        console.log('[Admin] Access granted!');
      }
    }
    
    setCheckingAdmin(false);
  };

  if (loading || checkingAdmin || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NEGORA
              </Link>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">ADMIN</span>
            </div>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Statistics Overview */}
        <AdminStats />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'products', label: 'Products', icon: '📦' },
                { id: 'vendors', label: 'Vendors', icon: '🏪' },
                { id: 'offers', label: 'Offers', icon: '💰' },
                { id: 'coupons', label: 'Coupons', icon: '🎟️' },
                { id: 'cards', label: 'Credit Cards', icon: '💳' },
                { id: 'logs', label: 'Search Logs', icon: '📊' },
                { id: 'transactions', label: 'Transactions', icon: '🛒' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'products' && <ProductsPanel />}
            {activeTab === 'vendors' && <VendorsPanel />}
            {activeTab === 'offers' && <OffersPanel />}
            {activeTab === 'coupons' && <CouponsPanel />}
            {activeTab === 'cards' && <CreditCardsPanel />}
            {activeTab === 'logs' && <SearchLogsPanel />}
            {activeTab === 'transactions' && <TransactionsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Products Panel Component
function ProductsPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Products Management</h2>
        <Link
          href="/admin/products/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No products found. Create your first product!</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub-Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.productid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.productid}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.subcategory || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Showing {Math.min((page - 1) * 20 + 1, total)} to {Math.min(page * 20, total)} of {total} products
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Vendors Panel Component
function VendorsPanel() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Vendors Management</h2>
        <Link
          href="/admin/vendors/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Vendor
        </Link>
      </div>
      <p className="text-gray-600">Manage vendors, ratings, and vendor types.</p>
    </div>
  );
}

// Offers Panel Component
function OffersPanel() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Offers Management</h2>
        <Link
          href="/admin/offers/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Offer
        </Link>
      </div>
      <p className="text-gray-600">Manage product offers, pricing, and discounts.</p>
    </div>
  );
}

// Coupons Panel Component
function CouponsPanel() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Coupons Management</h2>
        <Link
          href="/admin/coupons/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Coupon
        </Link>
      </div>
      <p className="text-gray-600">Manage coupon codes, values, and expiry dates.</p>
    </div>
  );
}

// Credit Cards Panel Component
function CreditCardsPanel() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Credit Cards Management</h2>
        <Link
          href="/admin/cards/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Card
        </Link>
      </div>
      <p className="text-gray-600">Manage credit card offers and cashback rates.</p>
    </div>
  );
}

// Search Logs Panel Component
function SearchLogsPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/logs?page=${page}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Search Logs</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No search logs yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.logid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.logid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.users ? log.users.email : 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.query}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Showing {Math.min((page - 1) * 50 + 1, total)} to {Math.min(page * 50, total)} of {total} logs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 50 >= total}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Transactions Panel Component
function TransactionsPanel() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Transactions</h2>
      <p className="text-gray-600">View and manage user transactions.</p>
    </div>
  );
}
