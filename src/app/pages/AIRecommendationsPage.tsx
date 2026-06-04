import { useState } from 'react';
import { AlertCircle, TrendingUp, Zap, Shield, Clock, Upload } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { TakeActionModal } from '@/app/components/TakeActionModal';
import { fetchRecommendations, type Recommendation } from '@/app/services/dataService';
import { UploadReviewsModal } from '@/app/components/UploadReviewsModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CardListSkeleton } from '@/app/components/skeletons/CardListSkeleton';

function getImpactColor(impact: string) {
  switch (impact) {
    case 'high':   return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700';
    case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700';
    default:       return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700';
  }
}

function getIconColor(impact: string) {
  switch (impact) {
    case 'high':   return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
    default:       return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
  }
}

function getBorderColor(impact: string) {
  switch (impact) {
    case 'high':   return 'border-l-red-500 dark:border-l-red-600';
    case 'medium': return 'border-l-orange-500 dark:border-l-orange-600';
    default:       return 'border-l-green-500 dark:border-l-green-600';
  }
}

function RecIcon({ icon, impact }: { icon: string; impact: string }) {
  const cls = `w-5 h-5`;
  const map: Record<string, JSX.Element> = {
    alert:  <AlertCircle className={cls} />,
    trend:  <TrendingUp className={cls} />,
    zap:    <Zap className={cls} />,
    shield: <Shield className={cls} />,
    clock:  <Clock className={cls} />,
  };
  return map[icon] ?? <AlertCircle className={cls} />;
}

export function AIRecommendationsPage() {
  const queryClient = useQueryClient();
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: recommendations = [], isLoading, isError, refetch } = useQuery<Recommendation[]>({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries();
  };

  const openModal = (rec: Recommendation) => {
    setSelectedRec(rec);
    setIsModalOpen(true);
  };

  const highImpact   = recommendations.filter(r => r.impact === 'high').length;
  const mediumImpact = recommendations.filter(r => r.impact === 'medium').length;
  const lowImpact    = recommendations.filter(r => r.impact === 'low').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Recommendations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Actionable insights powered by AI analysis</p>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load recommendations</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          We encountered an error loading your AI recommendations list. Please verify your connection or try again.
        </p>
        <Button onClick={() => refetch()} className="bg-indigo-600 hover:bg-indigo-700">
          Retry Fetch
        </Button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Recommendations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Actionable insights powered by AI analysis</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No recommendations yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Upload customer reviews and the AI will automatically generate targeted, prioritized action plans based on what your users are saying.
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Recommendations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Actionable insights powered by AI analysis of your customer reviews</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500">
          + Upload More
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Impact</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{highImpact}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Medium Impact</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{mediumImpact}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Impact</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{lowImpact}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow border-l-4 ${getBorderColor(rec.impact)}`}
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(rec.impact)}`}>
                  <RecIcon icon={rec.icon || 'zap'} impact={rec.impact} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{rec.title}</h3>
                      {rec.detectedPattern && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{rec.detectedPattern}</p>
                      )}
                    </div>
                    <Badge className={`${getImpactColor(rec.impact)} shrink-0`}>
                      {rec.impact} impact
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {rec.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {rec.affectedArea && (
                        <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                          {rec.affectedArea}
                        </Badge>
                      )}
                      {rec.estimatedEffort && (
                        <span>⏱ {rec.estimatedEffort}</span>
                      )}
                      {rec.affectedUsers > 0 && (
                        <span>👥 ~{rec.affectedUsers.toLocaleString()} users</span>
                      )}
                      {rec.actionable && (
                        <span className="text-green-600 dark:text-green-400 font-medium">✓ Actionable</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        onClick={() => openModal(rec)}
                      >
                        Take Action
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedRec && (
        <TakeActionModal
          isOpen={isModalOpen}
          recommendation={selectedRec}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <UploadReviewsModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadSuccess={handleUploadSuccess} />
    </div>
  );
}
