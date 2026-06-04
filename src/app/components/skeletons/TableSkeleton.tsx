export function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Summary</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Keywords</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(8)].map((_, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-750">
                <td className="px-4 py-6">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </td>
                <td className="px-6 py-6">
                  <div className="space-y-2 max-w-sm">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3.5 w-2/3 bg-gray-150 dark:bg-gray-750 rounded"></div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex gap-1.5">
                    <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </td>
                <td className="px-6 py-6">
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </td>
                <td className="px-6 py-6">
                  <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </td>
                <td className="px-6 py-6">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
