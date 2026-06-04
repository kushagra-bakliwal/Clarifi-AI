export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-4 w-80 bg-gray-150 dark:bg-gray-750 rounded-lg"></div>
        </div>
        <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-250 dark:bg-gray-650 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-32 bg-gray-150 dark:bg-gray-750 rounded"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-[380px] shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-250 dark:bg-gray-650 rounded"></div>
            <div className="h-4 w-60 bg-gray-150 dark:bg-gray-750 rounded"></div>
          </div>
          <div className="h-48 w-full bg-gray-100 dark:bg-gray-750 rounded-lg flex items-end gap-2 p-4">
            {[...Array(12)].map((_, idx) => (
              <div key={idx} className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t" style={{ height: `${20 + (idx % 4) * 20}%` }}></div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-[380px] shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-250 dark:bg-gray-650 rounded"></div>
            <div className="h-4 w-48 bg-gray-150 dark:bg-gray-750 rounded"></div>
          </div>
          <div className="h-48 w-48 mx-auto rounded-full border-[16px] border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-850 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Recent Reviews Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-gray-250 dark:bg-gray-650 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-750 last:border-0">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-[60%] bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-[40%] bg-gray-150 dark:bg-gray-750 rounded"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
