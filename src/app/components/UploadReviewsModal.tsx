import { useState, useEffect, useRef } from 'react';
import {
  X, Upload, FileText, CheckCircle, AlertCircle, Info,
  Loader2, Sparkles, Brain, BarChart3, Clock,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { supabase } from '@/app/services/supabaseClient';

const API_BASE_URL = 'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

interface ProcessingStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  positive: number;
  negative: number;
  neutral: number;
}

interface UploadReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

let logIdCounter = 0;
function makeLog(message: string, type: LogEntry['type'] = 'info'): LogEntry {
  return { id: ++logIdCounter, time: now(), message, type };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UploadReviewsModal({ isOpen, onClose, onUploadSuccess }: UploadReviewsModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<ProcessingStats>({
    total: 0, completed: 0, processing: 0, failed: 0,
    positive: 0, negative: 0, neutral: 0,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Cleanup realtime on unmount or close
  useEffect(() => {
    if (!isOpen) {
      channelRef.current && supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-49), makeLog(message, type)]); // keep last 50
  };

  // ─── File handling ───────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) setSelectedFile(file);
    else setError('Invalid file type. Please upload a .csv file.');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (file?.name.endsWith('.csv')) setSelectedFile(file);
    else if (file) setError('Invalid file type. Please upload a .csv file.');
  };

  // ─── Realtime subscription ───────────────────────────────────────────────────

  const subscribeToProgress = (projectId: string, total: number) => {
    // Track local counts to avoid stale closure issues
    const counts = { completed: 0, processing: 0, failed: 0, positive: 0, negative: 0, neutral: 0 };

    addLog(`Subscribed to real-time analysis stream for project ${projectId.slice(0, 8)}…`, 'info');

    const channel = supabase
      .channel(`upload-progress-${projectId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reviews', filter: `project_id=eq.${projectId}` },
        (payload) => {
          const row = payload.new as any;

          if (row.status === 'processing') {
            counts.processing = Math.max(0, counts.processing + 1);
            addLog(`Analyzing: "${(row.text || '').slice(0, 60)}${(row.text || '').length > 60 ? '…' : ''}"`, 'info');
          }

          if (row.status === 'completed') {
            counts.processing = Math.max(0, counts.processing - 1);
            counts.completed += 1;

            if (row.sentiment === 'positive') counts.positive += 1;
            else if (row.sentiment === 'negative') counts.negative += 1;
            else counts.neutral += 1;

            const label = row.sentiment === 'positive' ? '😊 positive'
              : row.sentiment === 'negative' ? '😟 negative' : '😐 neutral';
            const urgentTag = row.is_urgent ? ' 🚨 urgent' : '';
            const featureTag = row.is_feature_request ? ' 💡 feature req' : '';
            addLog(`✓ #${counts.completed} ${label}${urgentTag}${featureTag} — ${row.customer_name || 'Unknown'}`, 'success');
          }

          if (row.status === 'failed') {
            counts.failed += 1;
            addLog(`⚠ Failed to analyze review from ${row.customer_name || 'Unknown'}`, 'warn');
          }

          setStats({ total, ...counts });

          // All done
          if (counts.completed + counts.failed >= total) {
            addLog(`─── Analysis complete: ${counts.completed} analyzed, ${counts.failed} failed ───`, 'success');
            setPhase('done');
            supabase.removeChannel(channel);
            channelRef.current = null;
            onUploadSuccess?.();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          addLog('Real-time stream connected.', 'info');
        }
      });

    channelRef.current = channel;
  };

  // ─── Upload handler ──────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return;

    setPhase('uploading');
    setError(null);
    setLogs([]);
    setStats({ total: 0, completed: 0, processing: 0, failed: 0, positive: 0, negative: 0, neutral: 0 });

    addLog(`Reading file: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`, 'info');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Fresh session token
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session;
      }
      if (!session?.access_token) {
        throw new Error('You are not signed in. Please refresh the page and sign in again.');
      }

      addLog('Sending to backend…', 'info');

      const response = await fetch(`${API_BASE_URL}/reviews/upload-csv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
      });

      let result: any;
      try { result = await response.json(); }
      catch { throw new Error(`Server returned an unexpected response (${response.status}). Is the FastAPI backend running?`); }

      if (!response.ok) {
        throw new Error(result?.detail || result?.error || 'Upload failed');
      }

      const count: number = result?.data?.count ?? 0;
      const projectId: string = result?.data?.projectId ?? '';

      addLog(`Backend accepted ${count} reviews. Starting AI analysis…`, 'success');
      setStats(s => ({ ...s, total: count }));
      setPhase('processing');

      // Subscribe to realtime progress
      subscribeToProgress(projectId, count);

      // Safety fallback: if Realtime never fires (e.g. RLS blocks it), poll after 2 min
      setTimeout(() => {
        setPhase(p => p === 'processing' ? 'done' : p);
        onUploadSuccess?.();
      }, 120_000);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err?.message || 'Failed to upload file');
      setPhase('error');
      addLog(`Error: ${err?.message}`, 'warn');
    }
  };

  const handleClose = () => {
    if (phase === 'uploading') return; // block close mid-upload
    channelRef.current && supabase.removeChannel(channelRef.current);
    channelRef.current = null;
    setSelectedFile(null);
    setPhase('idle');
    setError(null);
    setLogs([]);
    setStats({ total: 0, completed: 0, processing: 0, failed: 0, positive: 0, negative: 0, neutral: 0 });
    onClose();
  };

  // ─── Derived values ──────────────────────────────────────────────────────────

  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const isProcessing = phase === 'processing';
  const isDone = phase === 'done';

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {isProcessing && <Brain className="w-5 h-5 text-indigo-500 animate-pulse" />}
            {isDone && <CheckCircle className="w-5 h-5 text-green-500" />}
            {!isProcessing && !isDone && <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isProcessing ? 'Analyzing Reviews…' : isDone ? 'Analysis Complete' : 'Upload Reviews'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={phase === 'uploading'}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">

          {/* ── Phase: idle / error — file picker ── */}
          {(phase === 'idle' || phase === 'error') && (
            <>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Upload Failed</h4>
                    <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2 opacity-75">
                      <strong>Tip:</strong> Make sure the backend is running on port 8000 (<code>uvicorn main:app --reload</code> in <code>backend/</code>).
                    </p>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <input type="file" accept=".csv" onChange={handleFileSelect}
                  className="hidden" id="file-upload" />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <label htmlFor="file-upload"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                      Choose a different file
                    </label>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <label htmlFor="file-upload"
                      className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                      Click to upload
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400"> or drag and drop</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">CSV files only</p>
                  </div>
                )}
              </div>

              {/* Format hint */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100">CSV Format</h4>
                </div>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5">
                  <li>• <strong>Required:</strong> a text column — <code>Review Text</code>, <code>review</code>, <code>comment</code>, or <code>feedback</code></li>
                  <li>• <strong>Optional:</strong> <code>Rating</code>, <code>Date</code>, <code>Customer Name</code>, <code>Source</code></li>
                </ul>
              </div>
            </>
          )}

          {/* ── Phase: uploading ── */}
          {phase === 'uploading' && (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                <Upload className="absolute inset-0 m-auto w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Uploading file…</p>
              {selectedFile && (
                <p className="text-xs text-gray-400 dark:text-gray-500">{selectedFile.name}</p>
              )}
              {/* Mini log during upload */}
              <LogWindow logs={logs} logEndRef={logEndRef} />
            </div>
          )}

          {/* ── Phase: processing ── */}
          {(phase === 'processing' || phase === 'done') && (
            <>
              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {isDone ? 'Analysis complete' : 'AI analysis in progress…'}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {stats.completed} / {stats.total}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? 'bg-green-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1">{progressPct}%</p>
              </div>

              {/* Stat pills */}
              <div className="grid grid-cols-3 gap-2">
                <StatPill
                  label="Completed"
                  value={stats.completed}
                  color="indigo"
                  icon={<CheckCircle className="w-3.5 h-3.5" />}
                />
                <StatPill
                  label="Processing"
                  value={stats.processing}
                  color="amber"
                  icon={<Loader2 className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />}
                />
                <StatPill
                  label="Failed"
                  value={stats.failed}
                  color="red"
                  icon={<AlertCircle className="w-3.5 h-3.5" />}
                />
              </div>

              {/* Sentiment breakdown (shows once we have data) */}
              {stats.completed > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Live Sentiment</span>
                  </div>
                  <SentimentBar positive={stats.positive} negative={stats.negative} neutral={stats.neutral} />
                </div>
              )}

              {/* Scrolling log */}
              <LogWindow logs={logs} logEndRef={logEndRef} tall />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          {/* Left: timing info when processing */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            {isProcessing && (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>~{Math.max(1, Math.round(((stats.total - stats.completed) / 5) * 8))}s remaining</span>
              </>
            )}
            {isDone && (
              <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Dashboard updated
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {(phase === 'idle' || phase === 'error') && (
              <>
                <Button variant="outline" onClick={handleClose}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!selectedFile}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  Upload &amp; Analyze
                </Button>
              </>
            )}
            {phase === 'uploading' && (
              <Button disabled className="bg-indigo-600 opacity-70 cursor-not-allowed">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading…
              </Button>
            )}
            {isProcessing && (
              <Button onClick={handleClose} variant="outline"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                Run in background
              </Button>
            )}
            {isDone && (
              <Button onClick={handleClose}
                className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" /> Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LogWindow({ logs, logEndRef, tall }: {
  logs: LogEntry[];
  logEndRef: React.RefObject<HTMLDivElement | null>;
  tall?: boolean;
}) {
  if (logs.length === 0) return null;
  return (
    <div className={`bg-gray-900 dark:bg-black rounded-lg p-3 font-mono text-xs overflow-y-auto ${tall ? 'h-36' : 'h-24'}`}>
      {logs.map(entry => (
        <div key={entry.id} className="flex gap-2 leading-5">
          <span className="text-gray-500 flex-shrink-0">{entry.time}</span>
          <span className={
            entry.type === 'success' ? 'text-green-400'
            : entry.type === 'warn' ? 'text-amber-400'
            : 'text-gray-300'
          }>
            {entry.message}
          </span>
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
}

function StatPill({ label, value, color, icon }: {
  label: string;
  value: number;
  color: 'indigo' | 'amber' | 'red';
  icon: React.ReactNode;
}) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    amber:  'bg-amber-50  dark:bg-amber-900/30  text-amber-700  dark:text-amber-300',
    red:    'bg-red-50    dark:bg-red-900/30    text-red-700    dark:text-red-300',
  };
  return (
    <div className={`${colors[color]} rounded-lg p-2.5 flex flex-col gap-1`}>
      <div className="flex items-center gap-1 opacity-70">{icon}<span className="text-xs">{label}</span></div>
      <span className="text-lg font-bold leading-none">{value}</span>
    </div>
  );
}

function SentimentBar({ positive, negative, neutral }: { positive: number; negative: number; neutral: number }) {
  const total = positive + negative + neutral;
  if (total === 0) return null;
  const pPct = Math.round((positive / total) * 100);
  const nPct = Math.round((negative / total) * 100);
  const uPct = 100 - pPct - nPct;
  return (
    <div className="space-y-1.5">
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {pPct > 0 && <div className="bg-green-400 transition-all duration-500" style={{ width: `${pPct}%` }} />}
        {uPct > 0 && <div className="bg-gray-300 dark:bg-gray-500 transition-all duration-500" style={{ width: `${uPct}%` }} />}
        {nPct > 0 && <div className="bg-red-400 transition-all duration-500" style={{ width: `${nPct}%` }} />}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="text-green-600 dark:text-green-400">😊 {positive} positive</span>
        <span className="text-gray-500">😐 {neutral}</span>
        <span className="text-red-500 dark:text-red-400">😟 {negative} negative</span>
      </div>
    </div>
  );
}