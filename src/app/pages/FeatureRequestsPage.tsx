import { useState } from 'react';
import { TrendingUp, Users, Upload, AlertCircle } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { fetchFeatureRequests, type FeatureRequest } from '@/app/services/dataService';
import { UploadReviewsModal } from '@/app/components/UploadReviewsModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CardListSkeleton } from '@/app/components/skeletons/CardListSkeleton';

const STATUS_COLORS: Record<string, string> = {
  'Under Review':   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
  'Planned':        'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700',
  'In Progress':    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  'Completed':      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  'Declined':       'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
};

export function FeatureRequestsPage() {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: requests = [], isLoading, isError, refetch } = useQuery<FeatureRequest[]>({
    queryKey: ['feature-requests'],
    queryFn: fetchFeatureRequests,
    select: (data) => [...data].sort((a, b) => b.votes - a.votes),
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries();
  };

  const filtered = requests.filter(r => {
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!r.feature?.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalMentions = requests.length;
  const topRequest = requests[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Feature Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-extracted feature backlog from customer feedback</p>
        </div>
        <CardListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load feature requests</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          We encountered an error loading the feature requests backlog. Please verify your connection or try again.
        </p>
        <Button onClick={() => refetch()} className="bg-indigo-600 hover:bg-indigo-700">
          Retry Fetch
        </Button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Feature Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-extracted feature backlog from customer feedback</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No feature requests detected yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Upload reviews where customers mention wishes, feature ideas, or missing functionality. The AI will extract and rank them automatically.
          </p>
          <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 mt-2">
            Upload Reviews CSV
          </Button>
        </div>
        <UploadReviewsModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadSuccess={handleUploadSuccess} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Feature Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-extracted feature backlog from customer feedback</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500">
          + Upload More
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unique Feature Requests</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalMentions}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Extracted from customer reviews</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        {topRequest && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Feature Request</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">{topRequest.feature}</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Requested by {topRequest.requestedBy} • {topRequest.source}
                  </span>
                </div>
              </div>
              <Badge className="shrink-0 ml-3" style={{ backgroundColor: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
                #{1}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search feature requests..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            All Feature Requests ({filtered.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Feature Request</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((req, index) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 max-w-md">{req.feature}</p>
                    {req.description && req.description !== req.feature && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{req.description?.substring(0, 120)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{req.requestedBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{req.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{req.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}>
                      {req.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <p>No results match your filters.</p>
          </div>
        )}
      </div>

      <UploadReviewsModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadSuccess={loadData} />
    </div>
  );
}
