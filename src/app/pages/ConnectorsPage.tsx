import { useState } from 'react';
import { Plug, CheckCircle, AlertCircle } from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: string;
  isConnected: boolean;
  category: 'social' | 'store' | 'review';
}

const initialConnectors: Connector[] = [
  { id: 'reddit', name: 'Reddit', description: 'Monitor discussions and community feedback', icon: '🔴', isConnected: false, category: 'social' },
  { id: 'instagram', name: 'Instagram', description: 'Collect comments and direct messages', icon: '📷', isConnected: false, category: 'social' },
  { id: 'x-twitter', name: 'X (Twitter)', description: 'Track mentions, replies, and DMs', icon: '🐦', isConnected: true, category: 'social' },
  { id: 'facebook', name: 'Facebook', description: 'Analyze posts and page reviews', icon: '📘', isConnected: false, category: 'social' },
  { id: 'linkedin', name: 'LinkedIn', description: 'Monitor professional feedback', icon: '💼', isConnected: false, category: 'social' },
  { id: 'app-store', name: 'App Store', description: 'iOS app reviews and ratings', icon: '🍎', isConnected: true, category: 'store' },
  { id: 'play-store', name: 'Google Play', description: 'Android app reviews and ratings', icon: '📱', isConnected: true, category: 'store' },
  { id: 'trustpilot', name: 'Trustpilot', description: 'Customer reviews and ratings', icon: '⭐', isConnected: false, category: 'review' },
  { id: 'g2', name: 'G2', description: 'B2B software reviews', icon: '🔷', isConnected: false, category: 'review' },
  { id: 'capterra', name: 'Capterra', description: 'Software reviews and comparisons', icon: '📊', isConnected: false, category: 'review' },
  { id: 'youtube', name: 'YouTube', description: 'Video comments and feedback', icon: '📺', isConnected: false, category: 'social' },
  { id: 'tiktok', name: 'TikTok', description: 'Short-form video comments', icon: '🎵', isConnected: false, category: 'social' },
];

export function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [filter, setFilter] = useState<'all' | 'social' | 'store' | 'review'>('all');

  const handleToggle = (id: string) => {
    setConnectors(prev =>
      prev.map(conn =>
        conn.id === id ? { ...conn, isConnected: !conn.isConnected } : conn
      )
    );
  };

  const filteredConnectors = filter === 'all' 
    ? connectors 
    : connectors.filter(c => c.category === filter);

  const connectedCount = connectors.filter(c => c.isConnected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Plug className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Connectors</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your data sources to ingest live customer feedback
          </p>
        </div>
        
        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected Sources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{connectedCount}/{connectors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          All Sources
        </button>
        <button
          onClick={() => setFilter('social')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'social'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Social Media
        </button>
        <button
          onClick={() => setFilter('store')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'store'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          App Stores
        </button>
        <button
          onClick={() => setFilter('review')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'review'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Review Platforms
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Admin Access Required
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Toggle switches to enable or disable data ingestion from each source. Changes take effect immediately. Make sure you have the necessary API credentials configured.
            </p>
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => (
          <div
            key={connector.id}
            className={`bg-white dark:bg-gray-800 border rounded-xl p-6 transition-all ${
              connector.isConnected
                ? 'border-green-300 dark:border-green-700 shadow-sm'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{connector.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {connector.name}
                  </h3>
                  {connector.isConnected && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </span>
                  )}
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(connector.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  connector.isConnected
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    connector.isConnected ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {connector.description}
            </p>

            {connector.isConnected && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                  Configure Settings →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredConnectors.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Plug className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No connectors found in this category</p>
        </div>
      )}
    </div>
  );
}
