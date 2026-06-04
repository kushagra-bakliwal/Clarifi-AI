import { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, Target, AlertCircle, Plus } from 'lucide-react';
import { MetricCard } from '@/app/components/MetricCard';
import { SentimentTrendChart } from '@/app/components/SentimentTrendChart';
import { SentimentDistributionChart } from '@/app/components/SentimentDistributionChart';
import { TopicBreakdownChart } from '@/app/components/TopicBreakdownChart';
import { FeedbackFunnelChart } from '@/app/components/FeedbackFunnelChart';
import { ReviewInsightsTable } from '@/app/components/ReviewInsightsTable';
import { FeatureRequestsPanel } from '@/app/components/FeatureRequestsPanel';
import { AIRecommendationsPanel } from '@/app/components/AIRecommendationsPanel';
import { KeywordsCloud } from '@/app/components/KeywordsCloud';
import { Button } from '@/app/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { UploadReviewsModal } from '@/app/components/UploadReviewsModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { fetchKPIs, type KPIs } from '@/app/services/dataService';
import { supabase } from '@/app/services/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardSkeleton } from '@/app/components/skeletons/DashboardSkeleton';

export function DashboardPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: kpis = null, isLoading, isError, refetch } = useQuery<KPIs | null>({
    queryKey: ['kpis'],
    queryFn: fetchKPIs,
  });

  useEffect(() => {
    // Subscribe to KPI cache updates via Supabase Realtime
    const channel = supabase
      .channel('dashboard-kpi-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kpi_cache' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            // kpi_cache.data holds the full KPIs object
            const newKpiData = (payload.new as any).data as KPIs;
            queryClient.setQueryData(['kpis'], newKpiData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleUploadSuccess = () => {
    // Invalidate queries to trigger a fresh background refresh
    queryClient.invalidateQueries();
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load dashboard data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          We encountered an error loading your project metrics. Please verify your connection or try again.
        </p>
        <Button onClick={() => refetch()} className="bg-indigo-600 hover:bg-indigo-700">
          Retry Fetch
        </Button>
      </div>
    );
  }

  const noData = !kpis;

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {kpis
                ? `${kpis.totalReviews.toLocaleString()} reviews • ${kpis.completedReviews ?? kpis.totalReviews} analyzed • Last updated ${new Date(kpis.lastUpdated).toLocaleDateString()}`
                : 'Overview of your customer feedback intelligence'}
            </p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-full w-10 h-10 p-0 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload Reviews (CSV)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Empty State Banner */}
        {noData && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">No data uploaded yet</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-0.5">
                Upload a CSV file of customer reviews to see all charts, KPIs, and AI-powered insights.
              </p>
            </div>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
            >
              Upload CSV
            </Button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Reviews"
            value={loading ? '...' : kpis?.totalReviews?.toLocaleString() ?? '0'}
            trend={{
              value: kpis ? `${kpis.positiveReviews} positive` : 'No data yet',
              isPositive: true,
            }}
            icon={MessageSquare}
          />
          <MetricCard
            title="Average Rating"
            value={loading ? '...' : kpis ? `${kpis.avgRating}★` : '—'}
            trend={{
              value: kpis ? `${(parseFloat(kpis.avgSentiment) * 10).toFixed(1)}/10 sentiment` : 'No data yet',
              isPositive: kpis ? parseFloat(kpis.avgSentiment) > 0.5 : true,
            }}
            icon={TrendingUp}
          />
          <MetricCard
            title="Feature Requests"
            value={loading ? '...' : String(kpis?.featureRequests ?? '0')}
            trend={{
              value: kpis ? 'From customer reviews' : 'No data yet',
              isPositive: true,
            }}
            icon={Target}
          />
          <MetricCard
            title="Critical Issues"
            value={loading ? '...' : String(kpis?.criticalIssues ?? '0')}
            trend={{
              value: kpis ? (kpis.criticalIssues > 0 ? 'Need immediate attention' : 'No critical issues') : 'No data yet',
              isPositive: kpis ? kpis.criticalIssues === 0 : true,
            }}
            icon={AlertCircle}
            highlighted={!!kpis && kpis.criticalIssues > 0}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SentimentTrendChart trend={kpis?.sentimentTrend} />
          <SentimentDistributionChart kpis={kpis} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopicBreakdownChart breakdown={kpis?.topicBreakdown} />
          <FeedbackFunnelChart funnel={kpis?.funnelStats} />
        </div>

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIRecommendationsPanel />
          </div>
          <div>
            <FeatureRequestsPanel />
          </div>
        </div>

        {/* Keywords Cloud */}
        <div>
          <KeywordsCloud keywords={kpis?.topNegativeKeywords} />
        </div>

        {/* Review Insights Table */}
        <div>
          <ReviewInsightsTable />
        </div>

        {/* Reports & Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reports & Export</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download comprehensive reports and data exports</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <FileText className="w-4 h-4" />
                Download PDF Report
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Processed CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <UploadReviewsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
