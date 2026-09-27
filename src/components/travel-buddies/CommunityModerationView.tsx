import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Trash2,
  UserX,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { apiGetAdminReports, apiResolveAdminReport } from '../../lib/communityApi';
import { useAuth } from '../../context/AuthContext';

export const CommunityModerationView: React.FC = () => {
  const { user, showToast } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [deleteContent, setDeleteContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await apiGetAdminReports(statusFilter);
      setReports(data);
    } catch {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const handleResolve = async (action: 'resolved' | 'dismissed') => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    const res = await apiResolveAdminReport(selectedReport.id, {
      action,
      resolutionNotes,
      deleteContent,
    });
    setIsSubmitting(false);

    if (res.success) {
      showToast(`Report marked as ${action}.`, 'success');
      setSelectedReport(null);
      setResolutionNotes('');
      setDeleteContent(false);
      loadReports();
    } else {
      showToast(res.error || 'Failed to update report', 'error');
    }
  };

  return (
    <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            Community Moderation Console
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Review user reports, enforce community safety guidelines, and remove violating content.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
          {(['pending', 'resolved', 'dismissed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all ${
                statusFilter === s ? 'bg-[#0047BA] text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={loadReports}
            className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-white/50 text-sm">Loading moderation reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-sm flex flex-col items-center">
            <CheckCircle className="w-10 h-10 text-emerald-400/40 mb-2" />
            <p className="font-semibold text-white/70">All clear!</p>
            <p className="text-xs text-white/50 mt-1">No {statusFilter} reports found in queue.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {report.targetType}
                  </span>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">Reason: {report.reason}</p>
                {report.details && (
                  <p className="text-xs text-white/70 italic bg-black/20 p-2 rounded-lg">
                    "{report.details}"
                  </p>
                )}
                <p className="text-[11px] text-white/40">
                  Target ID: <code className="text-[#17BEBB]">{report.targetId}</code> • Reporter ID: {report.reporterId}
                </p>
              </div>

              {report.status === 'pending' ? (
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-4 py-2 bg-[#0047BA] hover:bg-[#0759B8] text-white text-xs font-bold rounded-xl self-start md:self-center transition-all shadow-md active:scale-95"
                >
                  Take Action
                </button>
              ) : (
                <div className="text-xs text-white/50 self-start md:self-center">
                  Status: <strong className="capitalize text-white/80">{report.status}</strong>
                  {report.adminNotes && <p className="italic">Note: {report.adminNotes}</p>}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Moderate Report ({selectedReport.targetType})
            </h3>
            <div className="p-3 bg-white/5 rounded-xl text-xs text-white/70 mb-4 space-y-1">
              <p><strong>Reason:</strong> {selectedReport.reason}</p>
              {selectedReport.details && <p><strong>Notes:</strong> {selectedReport.details}</p>}
              <p><strong>Target ID:</strong> {selectedReport.targetId}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Moderator Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record justification for internal audit log..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:outline-none"
                />
              </div>

              {(selectedReport.targetType === 'post' || selectedReport.targetType === 'comment') && (
                <label className="flex items-center gap-2 text-xs text-red-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteContent}
                    onChange={(e) => setDeleteContent(e.target.checked)}
                    className="rounded border-white/20 text-red-500 focus:ring-0"
                  />
                  <span>Permanently delete this reported {selectedReport.targetType}</span>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-sm rounded-xl text-white/70 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleResolve('dismissed')}
                className="px-4 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold"
              >
                Dismiss Report
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleResolve('resolved')}
                className="px-5 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg"
              >
                Resolve & Apply Actions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
