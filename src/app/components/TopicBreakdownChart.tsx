import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type TopicBreakdownItem } from '@/app/services/dataService';

interface TopicBreakdownChartProps {
  breakdown?: TopicBreakdownItem[];
}

export function TopicBreakdownChart({ breakdown }: TopicBreakdownChartProps) {
  const hasData = breakdown && breakdown.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Topic Breakdown</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {hasData ? 'Top categories detected in your reviews' : 'Upload reviews to see topic distribution'}
        </p>
      </div>

      {!hasData ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-3">
          <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No topic data yet — upload a CSV to get started</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={breakdown} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              type="category"
              dataKey="topic"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              width={130}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              cursor={{ fill: '#f9fafb' }}
              formatter={(value: any) => [`${value} reviews`, 'Count']}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {breakdown!.map((entry, index) => (
                <Cell key={`cell-${entry.topic}-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
