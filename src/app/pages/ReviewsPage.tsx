import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Flag, Upload } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Fragment } from 'react';
import { fetchReviews, type Review } from '@/app/services/dataService';
import { UploadReviewsModal } from '@/app/components/UploadReviewsModal';
import { supabase } from '@/app/services/supabaseClient';

const ITEMS_PER_PAGE = 15;

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    const data = await fetchReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();

    // Set up Realtime subscription
    const channel = supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New row from DB — keywords array is empty until keywords table is updated
            setReviews(prev => [{ ...(payload.new as Review), keywords: [] }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Bug Fix #9: Realtime UPDATE payload does NOT include the joined keywords relation.
            // Preserve the existing keywords from the local state to prevent them disappearing.
            setReviews(prev => prev.map(r => {
              if (r.id !== payload.new.id) return r;
              const updatedRow = payload.new as Review;
              return {
                ...r,
                ...updatedRow,
                // Keep existing keywords unless the update explicitly provides them
                keywords: (updatedRow.keywords && updatedRow.keywords.length > 0)
                  ? updatedRow.keywords
                  : r.keywords,
              };
            }));
          } else if (payload.eventType === 'DELETE') {
            setReviews(prev => prev.filter(r => r.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case 'neutral':  return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'negative': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      default:         return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      case 'high':     return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700';
      case 'medium':   return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      default:         return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600';
    }
  };

  // Unique sources for filter
  const sources = ['all', ...Array.from(new Set(reviews.map(r => r.source))).filter(Boolean)];

  const filtered = reviews.filter(r => {
    if (selectedSentiment !== 'all' && r.sentiment !== selectedSentiment) return false;
    if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false;
    if (selectedSource !== 'all' && r.source !== selectedSource) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!r.text.toLowerCase().includes(q) && !r.summary?.toLowerCase().includes(q) && !r.customer_name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = () => setCurrentPage(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mr-3" />
        <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Detailed feedback analysis with AI-powered insights</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No reviews uploaded yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Upload a CSV file of customer reviews to see AI-generated summaries, sentiment analysis, keyword extraction, and priority scoring.
          </p>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 mt-2"
          >
            Upload Reviews CSV
          </Button>
        </div>
        <UploadReviewsModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={loadReviews}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Detailed feedback analysis with AI-powered insights</p>
        </div>
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          + Upload More
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); handleFilterChange(); }}
              placeholder="Search reviews..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Sentiment */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sentiment</label>
            <select
              value={selectedSentiment}
              onChange={e => { setSelectedSentiment(e.target.value); handleFilterChange(); }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Priority */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={e => { setSelectedPriority(e.target.value); handleFilterChange(); }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Source */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
            <select
              value={selectedSource}
              onChange={e => { setSelectedSource(e.target.value); handleFilterChange(); }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {sources.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Sources' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{paginated.length}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> reviews
          {filtered.length !== reviews.length && ` (filtered from ${reviews.length} total)`}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">AI Summary</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Sentiment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Keywords</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginated.map(review => (
                <Fragment key={review.id}>
                  <tr
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                    onClick={() => toggleRow(review.id)}
                  >
                    <td className="px-4 py-4">
                      {expandedRows.has(review.id)
                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                        : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </td>
                    <td className="px-6 py-4">
                      {review.status !== 'completed' ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full" />
                          <span className="text-xs text-gray-500 animate-pulse">
                            {review.status === 'processing' ? 'Analyzing...' : 'Queued'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2 max-w-sm">
                            {review.summary || review.text?.substring(0, 100)}
                          </p>
                          {review.is_feature_request && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 block">
                              ✦ Feature Request
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getSentimentColor(review.sentiment)}>
                        {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(review.keywords || []).slice(0, 3).map((kw, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPriorityColor(review.priority)}>
                        {review.priority ? review.priority.charAt(0).toUpperCase() + review.priority.slice(1) : '—'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{review.source}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {review.rating > 0 ? `${review.rating}★` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
                    </td>
                  </tr>

                  {expandedRows.has(review.id) && (
                    <tr className="bg-gray-50 dark:bg-gray-700/30">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Full Review</h4>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{review.text}</p>
                          </div>
                          <div className="flex gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span>Customer: <strong className="text-gray-700 dark:text-gray-300">{review.customer_name}</strong></span>
                            <span>•</span>
                            <span>Date: <strong className="text-gray-700 dark:text-gray-300">{review.date}</strong></span>
                            <span>•</span>
                            <span>Rating: <strong className="text-gray-700 dark:text-gray-300">{review.rating}/5</strong></span>
                            <span>•</span>
                            <span>Sentiment Score: <strong className="text-gray-700 dark:text-gray-300">{(review.sentiment_score * 10).toFixed(1)}/10</strong></span>
                            {review.is_urgent && (
                              <>
                                <span>•</span>
                                <span className="text-red-600 dark:text-red-400 font-medium">⚠ Urgent</span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                              <CheckCircle className="w-3 h-3 mr-1" /> Mark Reviewed
                            </Button>
                            <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                              <Flag className="w-3 h-3 mr-1" /> Flag
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <UploadReviewsModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={loadReviews}
      />
    </div>
  );
}
