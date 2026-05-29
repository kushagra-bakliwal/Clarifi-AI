import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  highlighted?: boolean;
}

export function MetricCard({ title, value, trend, icon: Icon, highlighted }: MetricCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${highlighted ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className={`text-3xl font-semibold ${highlighted ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.value}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${highlighted ? 'bg-red-100 dark:bg-red-900/50' : 'bg-indigo-50 dark:bg-indigo-900/50'}`}>
          <Icon className={`w-6 h-6 ${highlighted ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
        </div>
      </div>
    </div>
  );
}