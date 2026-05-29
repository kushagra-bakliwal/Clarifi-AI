import { TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchFeatureRequests, type FeatureRequest } from '@/app/services/dataService';

export function FeatureRequestsPanel() {
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchFeatureRequests();
      // Sort by votes and take top 6
      const sorted = data.sort((a, b) => b.votes - a.votes).slice(0, 6);
      setFeatureRequests(sorted);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (featureRequests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Feature Requests</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-extracted from customer feedback</p>
        </div>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>No feature requests detected yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Feature Requests</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-extracted from customer feedback</p>
      </div>
      <div className="space-y-3">
        {featureRequests.map((request, index) => (
          <div 
            key={request.id}
            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{request.feature}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {request.votes} votes • {request.source}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">{request.votes}</span>
              {request.votes > 20 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/50">
                  <TrendingUp className="w-3 h-3 text-green-700 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Hot</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
          View all feature requests →
        </button>
      </div>
    </div>
  );
}