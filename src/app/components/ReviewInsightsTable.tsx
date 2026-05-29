import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Fragment } from 'react';
import { fetchReviews, type Review as ReviewType } from '@/app/services/dataService';

export function ReviewInsightsTable() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      const data = await fetchReviews();
      setReviews(data);
      setLoading(false);
    };
    loadReviews();
  }, []);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No reviews uploaded yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Upload a CSV file to see AI-powered insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Review Insights</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Smart summaries with urgency detection</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="w-8 px-4 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">TL;DR Summary</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Keywords</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reviews.slice(0, 10).map((review) => (
              <Fragment key={review.id}>
                <tr 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => toggleRow(review.id)}
                >
                  <td className="px-4 py-4">
                    {expandedRows.has(review.id) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{review.summary}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getSentimentColor(review.sentiment)}>
                      {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {review.keywords.slice(0, 3).map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getPriorityColor(review.priority)}>
                      {review.priority.charAt(0).toUpperCase() + review.priority.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{review.source}</span>
                  </td>
                </tr>
                {expandedRows.has(review.id) && (
                  <tr className="bg-gray-50 dark:bg-gray-700/30">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Full Review:</h4>
                          <p className="text-sm text-gray-800 dark:text-gray-200">{review.text}</p>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Customer: {review.customer}</span>
                          <span>•</span>
                          <span>Date: {review.date}</span>
                          <span>•</span>
                          <span>Rating: {review.rating}/5</span>
                          {review.isFeatureRequest && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Feature Request</span>
                            </>
                          )}
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
    </div>
  );
}