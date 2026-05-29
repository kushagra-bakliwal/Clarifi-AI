import { Sparkles, AlertTriangle, TrendingUp, Zap, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchRecommendations, type Recommendation } from '@/app/services/dataService';
import { TakeActionModal } from '@/app/components/TakeActionModal';

export function AIRecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchRecommendations();
      setRecommendations(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const getIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getColors = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high': 
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          iconBg: 'bg-red-100 dark:bg-red-900/40',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-900 dark:text-red-100'
        };
      case 'medium':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          iconBg: 'bg-blue-100 dark:bg-blue-900/40',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-900 dark:text-blue-100'
        };
      default:
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          iconBg: 'bg-green-100 dark:bg-green-900/40',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-900 dark:text-green-100'
        };
    }
  };

  const handleTakeAction = (rec: Recommendation) => {
    setSelectedRec(rec);
    setShowActionModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Intelligent insights powered by AI</p>
        </div>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>Upload reviews to get AI-powered recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Intelligent insights powered by AI</p>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = getIcon(rec.priority);
            const colors = getColors(rec.priority);
            
            return (
              <div 
                key={rec.id}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colors.iconBg} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-semibold text-sm ${colors.textColor}`}>{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${colors.iconBg} ${colors.iconColor}`}>
                        {rec.impact} impact
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {rec.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-medium">{rec.category}</span> • {rec.estimatedEffort} • Affects {rec.affectedUsers} users
                      </div>
                      <button
                        onClick={() => handleTakeAction(rec)}
                        className={`text-xs font-medium ${colors.iconColor} hover:underline flex items-center gap-1`}
                      >
                        Take Action
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedRec && (
        <TakeActionModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          recommendation={selectedRec}
        />
      )}
    </>
  );
}