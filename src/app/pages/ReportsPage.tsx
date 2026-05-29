import { FileText, Download, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [includeSentiment, setIncludeSentiment] = useState(true);
  const [includeTopics, setIncludeTopics] = useState(true);
  const [includeFeatures, setIncludeFeatures] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Export and share feedback intelligence insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
            
            <div className="space-y-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="last-7-days">Last 7 days</option>
                  <option value="last-30-days">Last 30 days</option>
                  <option value="last-90-days">Last 90 days</option>
                  <option value="last-year">Last year</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>

              {/* Included Sections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Included Sections</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={includeSentiment}
                      onChange={(e) => setIncludeSentiment(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        Sentiment Analysis
                      </p>
                      <p className="text-xs text-gray-500">Overall sentiment trends and distribution</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={includeTopics}
                      onChange={(e) => setIncludeTopics(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        Topic Breakdown
                      </p>
                      <p className="text-xs text-gray-500">Most discussed topics and categories</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={includeFeatures}
                      onChange={(e) => setIncludeFeatures(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        Feature Requests
                      </p>
                      <p className="text-xs text-gray-500">Top requested features and improvements</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={includeRecommendations}
                      onChange={(e) => setIncludeRecommendations(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        AI Recommendations
                      </p>
                      <p className="text-xs text-gray-500">Actionable insights and suggestions</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            
            <div className="space-y-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF Report
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Export Processed CSV
              </Button>

              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Email Report
              </Button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Pro Tip:</strong> Schedule automated weekly reports from Settings → Notifications
              </p>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Executive Summary</p>
                  <p className="text-xs text-gray-500 mt-1">High-level overview with key metrics</p>
                </div>
              </div>

              {includeSentiment && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sentiment Analysis</p>
                    <p className="text-xs text-gray-500 mt-1">Charts and trend analysis</p>
                  </div>
                </div>
              )}

              {includeTopics && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Topic Breakdown</p>
                    <p className="text-xs text-gray-500 mt-1">Category distribution and insights</p>
                  </div>
                </div>
              )}

              {includeFeatures && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Feature Requests</p>
                    <p className="text-xs text-gray-500 mt-1">Top 10 requested features</p>
                  </div>
                </div>
              )}

              {includeRecommendations && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI Recommendations</p>
                    <p className="text-xs text-gray-500 mt-1">Actionable insights and next steps</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Detailed Data Tables</p>
                  <p className="text-xs text-gray-500 mt-1">Complete feedback listings</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Estimated report size</p>
              <p className="text-sm font-semibold text-gray-900">12-15 pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          <p className="text-sm text-gray-500 mt-1">Previously generated reports</p>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { name: 'Monthly Feedback Report - January 2026', date: '2026-02-01', size: '2.4 MB' },
            { name: 'Q4 2025 Customer Intelligence Summary', date: '2026-01-05', size: '3.1 MB' },
            { name: 'Weekly Report - Week of Jan 20', date: '2026-01-27', size: '1.8 MB' },
          ].map((report, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.name}</p>
                  <p className="text-xs text-gray-500">Generated on {report.date} • {report.size}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
