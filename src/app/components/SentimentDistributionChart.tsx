import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { type KPIs } from '@/app/services/dataService';

interface SentimentDistributionChartProps {
  kpis?: KPIs | null;
}

export function SentimentDistributionChart({ kpis }: SentimentDistributionChartProps) {
  const total = kpis?.totalReviews || 100;
  const positivePercent = kpis ? Math.round(((kpis.positiveReviews ?? 0) / total) * 100) : 58;
  const negativePercent = kpis ? Math.round(((kpis.negativeReviews ?? 0) / total) * 100) : 17;
  const neutralPercent = kpis ? Math.round(((kpis.neutralReviews ?? 0) / total) * 100) : 25;

  const data = [
    { name: 'Positive', value: positivePercent, color: '#10b981' },
    { name: 'Neutral', value: neutralPercent, color: '#f59e0b' },
    { name: 'Negative', value: negativePercent, color: '#ef4444' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sentiment Distribution</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Breakdown of customer sentiment</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            key="pie"
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            key="tooltip"
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number) => `${value}%`}
          />
          <Legend
            key="legend"
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <p className="text-2xl font-semibold" style={{ color: item.color }}>{item.value}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
