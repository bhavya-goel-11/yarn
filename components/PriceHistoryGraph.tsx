'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { supabase } from '@/lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceHistoryData {
  date: string;
  price: number;
}

interface PriceHistoryGraphProps {
  productID: string;
}

export default function PriceHistoryGraph({ productID }: PriceHistoryGraphProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('pricehistory')
          .select('date, price')
          .eq('productid', productID)
          .order('date', { ascending: true });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setPriceHistory((data as PriceHistoryData[]) || []);
      } catch (err) {
        console.error('Error fetching price history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load price history');
      } finally {
        setLoading(false);
      }
    }

    if (productID) {
      fetchPriceHistory();
    }
  }, [productID]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Price History</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Price History</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Price History</h3>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-gray-600 text-center">
          No price history available for this product.
        </div>
      </div>
    );
  }

  const chartData = {
    labels: priceHistory.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Price (₹)',
        data: priceHistory.map((item) => item.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₹${(context.parsed.y ?? 0).toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Price History</h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
