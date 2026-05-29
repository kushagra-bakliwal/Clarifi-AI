import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { type SentimentTrendPoint } from '@/app/services/dataService';

interface SentimentTrendChartProps {
  trend?: SentimentTrendPoint[];
}

export function SentimentTrendChart({ trend }: SentimentTrendChartProps) {
  const hasData = trend && trend.length > 0;

  const chartData = hasData
    ? trend!.map(p => ({
        date: p.date,
        Sentiment: p.sentiment,
        Positive: p.positive,
        Negative: p.negative,
        Neutral: p.neutral,
      }))
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sentiment Trend Over Time</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {hasData ? 'Average sentiment score (0–10) grouped by month' : 'Upload reviews to see sentiment trends'}
        </p>
      </div>

      {!hasData ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-3">
          <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-sm">No trend data yet — upload a CSV to get started</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: any, name: string) =>
                name === 'Sentiment'
                  ? [`${value}/10`, 'Avg Sentiment']
                  : [value, name]
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Sentiment"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {hasData && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-3 text-center text-xs text-gray-500 dark:text-gray-400">
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400 text-sm">
              {trend!.reduce((s, p) => s + p.positive, 0)}
            </p>
            <p>Positive</p>
          </div>
          <div>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400 text-sm">
              {trend!.reduce((s, p) => s + p.neutral, 0)}
            </p>
            <p>Neutral</p>
          </div>
          <div>
            <p className="font-semibold text-red-600 dark:text-red-400 text-sm">
              {trend!.reduce((s, p) => s + p.negative, 0)}
            </p>
            <p>Negative</p>
          </div>
        </div>
      )}
    </div>
  );
}
