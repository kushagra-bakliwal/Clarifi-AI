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
    <div className={`bg-card text-card-foreground rounded-xl p-6 shadow-xs border transition-colors ${
      highlighted
        ? 'border-destructive/30 bg-destructive/5'
        : 'border-border'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className={`text-3xl font-semibold tracking-tight ${highlighted ? 'text-destructive' : 'text-card-foreground'}`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
                {trend.value}
              </span>
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${highlighted ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}