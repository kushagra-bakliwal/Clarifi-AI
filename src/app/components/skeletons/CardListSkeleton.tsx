export function CardListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-6 w-[80%] bg-gray-250 dark:bg-gray-650 rounded"></div>
            <div className="h-4 w-[60%] bg-gray-150 dark:bg-gray-750 rounded"></div>
            <div className="flex items-center gap-4 text-xs">
              <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
