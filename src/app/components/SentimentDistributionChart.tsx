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
    { name: 'Positive', value: positivePercent, color: 'var(--chart-1)' },
    { name: 'Neutral', value: neutralPercent, color: 'var(--chart-3)' },
    { name: 'Negative', value: negativePercent, color: 'var(--destructive)' },
  ];

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 shadow-xs border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Sentiment Distribution</h3>
        <p className="text-sm text-muted-foreground mt-1">Breakdown of customer sentiment</p>
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
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--card-foreground)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)'
            }}
            formatter={(value: number) => `${value}%`}
          />
          <Legend
            key="legend"
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
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
