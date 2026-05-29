import { HelpCircle, X, FileText, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';

export function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-12 h-12 bg-gray-700 dark:bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center z-40 transition-colors"
        title="Help & Guide"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">How to Use Clarifi AI</h2>
              <p className="text-indigo-100 text-sm mt-1">Quick guide to get started</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1 */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Upload Your Reviews
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Click the <strong>"+"</strong> button in the dashboard to upload a CSV file with your customer reviews.
                </p>
                <div className="mt-3 bg-white dark:bg-gray-700 rounded p-3 text-xs">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Required CSV columns:</p>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• <strong>Review Text</strong> - The actual review content</li>
                    <li>• <strong>Rating</strong> - Star rating (1-5)</li>
                    <li>• <strong>Date</strong> - Review date (optional)</li>
                    <li>• <strong>Customer Name</strong> - Reviewer name (optional)</li>
                    <li>• <strong>Source</strong> - Where it came from (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                  AI Analyzes Your Data
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Our AI automatically processes each review to extract insights:
                </p>
                <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <span><strong>Sentiment Analysis</strong> - Positive, negative, or neutral</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <span><strong>TL;DR Summaries</strong> - Concise review summaries</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <span><strong>Priority Detection</strong> - Critical, high, medium, low urgency</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <span><strong>Keyword Extraction</strong> - Main topics and themes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <span><strong>Feature Requests</strong> - Automatically identified suggestions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Explore Insights
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  View AI-powered insights across your dashboard:
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-gray-700 rounded p-2">
                    <p className="font-medium text-gray-900 dark:text-white">📊 KPI Cards</p>
                    <p className="text-gray-600 dark:text-gray-400">Key metrics at a glance</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-2">
                    <p className="font-medium text-gray-900 dark:text-white">📈 Charts</p>
                    <p className="text-gray-600 dark:text-gray-400">Visual data trends</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-2">
                    <p className="font-medium text-gray-900 dark:text-white">💡 Recommendations</p>
                    <p className="text-gray-600 dark:text-gray-400">AI action items</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-2">
                    <p className="font-medium text-gray-900 dark:text-white">☁️ Word Cloud</p>
                    <p className="text-gray-600 dark:text-gray-400">Key themes visual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Chat with Your Data
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Ask questions in natural language using the chat feature:
                </p>
                <div className="mt-3 bg-white dark:bg-gray-700 rounded p-3 text-xs space-y-1.5">
                  <p className="font-medium text-gray-900 dark:text-white">Try asking:</p>
                  <p className="text-gray-600 dark:text-gray-400">"How many reviews do we have?"</p>
                  <p className="text-gray-600 dark:text-gray-400">"What's the overall sentiment?"</p>
                  <p className="text-gray-600 dark:text-gray-400">"Show me critical issues"</p>
                  <p className="text-gray-600 dark:text-gray-400">"What are customers requesting?"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample CSV */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sample CSV Format</h3>
            <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
{`Review Text,Rating,Date,Customer Name,Source
"Amazing product!",5,2024-02-20,John,App Store
"Needs improvement",3,2024-02-19,Jane,Support`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Got it! Let's get started
          </Button>
        </div>
      </div>
    </div>
  );
}
