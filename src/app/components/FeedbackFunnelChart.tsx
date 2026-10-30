import { type FunnelStage } from '@/app/services/dataService';

interface FeedbackFunnelChartProps {
  funnel?: FunnelStage[];
}

const STAGE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

export function FeedbackFunnelChart({ funnel }: FeedbackFunnelChartProps) {
  const hasData = funnel && funnel.length > 0 && funnel[0].count > 0;

  const stages = hasData ? funnel! : [];

  const actionable = hasData ? stages.find(s => s.name === 'Actionable') : null;
  const total = hasData ? stages[0]?.count || 1 : 1;
  const conversionRate = actionable ? Math.round((actionable.count / total) * 100) : 0;
  const inQueue = hasData ? Math.max(0, total - (actionable?.count || 0)) : 0;

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 shadow-xs border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Feedback Funnel</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {hasData ? 'Processing pipeline status for uploaded reviews' : 'Upload reviews to see processing pipeline'}
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
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
                  <span className="text-sm font-medium text-foreground">{stage.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.count.toLocaleString()} ({stage.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: STAGE_COLORS[index] || 'var(--chart-1)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground font-medium">
              {conversionRate}% conversion rate from received to actionable feedback
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {inQueue.toLocaleString()} items classified as non-critical / informational
            </p>
          </div>
        </>
      )}
    </div>
  );
}
