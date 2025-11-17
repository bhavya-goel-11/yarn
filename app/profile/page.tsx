'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface SearchHistory {
  id: number;
  query: string;
  vertical: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadSearchHistory();
    }
  }, [user]);

  const loadSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('searches')
        .select('id, query, vertical, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 inline-block">
            ← Back to Search
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view search history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user.user_metadata?.name || 'User'}
                </h2>
                <p className="text-sm text-gray-600 break-all">{user.email}</p>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account ID:</span>
                  <span className="font-mono text-xs text-gray-900">{user.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Joined:</span>
                  <span className="text-gray-900">
                    {new Date(user.created_at!).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Searches:</span>
                  <span className="font-semibold text-gray-900">{searchHistory.length}</span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full mt-6 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Search History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Search History</h2>

              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : searchHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No search history yet</p>
                  <Link
                    href="/"
                    className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-6 rounded-xl hover:shadow-lg transition-all"
                  >
                    Start Searching
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {searchHistory.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{search.query}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md font-medium">
                            {search.vertical}
                          </span>
                          <span>{new Date(search.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <Link
                        href={`/?q=${encodeURIComponent(search.query)}`}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        Search Again →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
