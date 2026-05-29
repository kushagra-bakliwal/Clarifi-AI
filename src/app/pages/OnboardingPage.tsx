import { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { UploadReviewsModal } from '@/app/components/UploadReviewsModal';
import clarifiLogo from 'figma:asset/f04d43a48a1d50b46f6f1bbbb319070b7bb5678b.png';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  // Bug Fix #12: The upload button was permanently disabled.
  // Now the Onboarding page shows the real upload modal with a skip option.
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleUploadSuccess = () => {
    // After uploading, proceed to the Dashboard
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
            <img src={clarifiLogo} alt="Clarifi AI Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Clarifi AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload a CSV of customer reviews and let AI generate insights instantly.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Drag & Drop Area (visual only — clicking opens modal) */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full border-2 border-dashed rounded-xl p-12 text-center border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
          >
            <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 mx-auto mb-4 transition-colors" />
            <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              Click to upload your CSV
            </p>
            <span className="text-lg text-gray-500 dark:text-gray-400">or drag and drop</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Supported format: CSV
            </p>
          </button>

          {/* Upload Button */}
          <div className="mt-8">
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 text-lg font-medium"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Upload & Analyze
            </Button>
          </div>

          {/* Format Guidelines */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              CSV Format Guidelines:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Include columns: Review Text, Rating, Date, Customer Name (optional)</li>
              <li>• Use comma-separated values with headers in the first row</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>

          {/* Skip Option */}
          <div className="mt-6 text-center">
            <button
              onClick={onComplete}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              Skip for now and explore the dashboard →
            </button>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your data is securely stored and processed locally.
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadReviewsModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}