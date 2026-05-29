import { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

interface TakeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: {
    issue: string;
    recommendation: string;
  };
}

export function TakeActionModal({ isOpen, onClose, recommendation }: TakeActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<'jira' | 'slack' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: recommendation.recommendation,
    priority: 'medium',
    assignee: '',
    channel: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Auto close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setSelectedAction(null);
        setFormData({
          title: '',
          description: recommendation.recommendation,
          priority: 'medium',
          assignee: '',
          channel: '',
        });
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Take Action</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {selectedAction === 'jira' ? 'Jira Ticket Created!' : 'Slack Notification Sent!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your team has been notified successfully.
            </p>
          </div>
        ) : (
          <div className="p-6">
            {!selectedAction ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Choose how you'd like to notify your team about this recommendation:
                </p>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setSelectedAction('jira')}
                    className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-left transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Create Jira Ticket</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Track as a task</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create a new ticket in your Jira board with all details and assign it to your team.
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedAction('slack')}
                    className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-left transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💬</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Send to Slack</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Instant notification</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send an immediate notification to your Slack channel for quick team visibility.
                    </p>
                  </button>
                </div>

                {/* Recommendation Preview */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommendation:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation.recommendation}</p>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Jira Form */}
                {selectedAction === 'jira' && (
                  <>
                    <div>
                      <Label htmlFor="ticket-title" className="text-gray-700 dark:text-gray-300">
                        Ticket Title *
                      </Label>
                      <Input
                        id="ticket-title"
                        type="text"
                        placeholder="Enter ticket title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                        Description
                      </Label>
                      <textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority" className="text-gray-700 dark:text-gray-300">
                          Priority
                        </Label>
                        <select
                          id="priority"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="assignee" className="text-gray-700 dark:text-gray-300">
                          Assignee
                        </Label>
                        <Input
                          id="assignee"
                          type="text"
                          placeholder="@username"
                          value={formData.assignee}
                          onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                          className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Slack Form */}
                {selectedAction === 'slack' && (
                  <>
                    <div>
                      <Label htmlFor="channel" className="text-gray-700 dark:text-gray-300">
                        Slack Channel *
                      </Label>
                      <Input
                        id="channel"
                        type="text"
                        placeholder="#feedback-alerts"
                        value={formData.channel}
                        onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                        className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message-title" className="text-gray-700 dark:text-gray-300">
                        Message Title *
                      </Label>
                      <Input
                        id="message-title"
                        type="text"
                        placeholder="Enter message title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="slack-message" className="text-gray-700 dark:text-gray-300">
                        Message
                      </Label>
                      <textarea
                        id="slack-message"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setSelectedAction(null)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {selectedAction === 'jira' ? 'Create Ticket' : 'Send Notification'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}