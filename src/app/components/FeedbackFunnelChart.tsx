import { type FunnelStage } from '@/app/services/dataService';

interface FeedbackFunnelChartProps {
  funnel?: FunnelStage[];
}

const STAGE_COLORS = ['bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300', 'bg-indigo-200'];

export function FeedbackFunnelChart({ funnel }: FeedbackFunnelChartProps) {
  const hasData = funnel && funnel.length > 0 && funnel[0].count > 0;

  const stages = hasData ? funnel! : [];

  const actionable = hasData ? stages.find(s => s.name === 'Actionable') : null;
  const total = hasData ? stages[0]?.count || 1 : 1;
  const conversionRate = actionable ? Math.round((actionable.count / total) * 100) : 0;
  const inQueue = hasData ? Math.max(0, total - (actionable?.count || 0)) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback Funnel</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {hasData ? 'Processing pipeline status for uploaded reviews' : 'Upload reviews to see processing pipeline'}
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600 gap-3">
          <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <p className="text-sm">No pipeline data yet — upload a CSV to get started</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stage.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stage.count.toLocaleString()} ({stage.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${STAGE_COLORS[index] || 'bg-indigo-400'} transition-all duration-700 rounded-full`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium">
              {conversionRate}% conversion rate from received to actionable feedback
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
              {inQueue.toLocaleString()} items classified as non-critical / informational
            </p>
          </div>
        </>
      )}
    </div>
  );
}
