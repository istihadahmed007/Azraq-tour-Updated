import React, { useState } from 'react';
import { QuoteRequest } from '../../types';
import {
  Activity,
  Plane,
  Stamp,
  Search,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  MessageCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  X,
} from 'lucide-react';

interface TravelActivityTabProps {
  userQuotes: QuoteRequest[];
  timelineEvents: any[];
  isLoadingQuotes: boolean;
  onRefreshQuotes: () => void;
  onOpenFlightQuote?: () => void;
  onOpenVisaQuote?: () => void;
}

export const TravelActivityTab: React.FC<TravelActivityTabProps> = ({
  userQuotes,
  timelineEvents,
  isLoadingQuotes,
  onRefreshQuotes,
  onOpenFlightQuote,
  onOpenVisaQuote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'flight' | 'visa'>('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const filteredQuotes = userQuotes.filter((q) => {
    const matchQuery =
      !searchQuery ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.type === 'flight' &&
        (`${q.from} ${q.to} ${q.airlinePreference || ''}`).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.type === 'visa' && (q as any).destinationCountry?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchType = typeFilter === 'all' || q.type === typeFilter;

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && (q.status === 'Pending' || q.status === 'New' || q.status === 'Reviewing')) ||
      (statusFilter === 'processing' && (q.status === 'Processing' || q.status === 'Quotation Prepared')) ||
      (statusFilter === 'quoted' && (q.status === 'Quoted' || q.status === 'Sent' || q.status === 'Quoted via WhatsApp' || q.status === 'Quoted via Email')) ||
      (statusFilter === 'confirmed' && (q.status === 'Customer Confirmed' || q.status === 'Booked'));

    return matchQuery && matchType && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Booked':
      case 'Customer Confirmed':
        return (
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'Quoted':
      case 'Quoted via WhatsApp':
      case 'Quoted via Email':
      case 'Sent':
        return (
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-[#2DD4BF] border border-teal-400/30 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Quotation Ready</span>
          </span>
        );
      case 'Processing':
      case 'Quotation Prepared':
        return (
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-[#CBD5E1] border border-white/10 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Reviewing</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40">
            <Activity className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Live Quotation Tracking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Travel Activity & Quote History ({userQuotes.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl">
            Live tracking of your flight fare holds, visa assessments, and operations desk updates for your trips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshQuotes}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-2 transition-colors cursor-pointer min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingQuotes ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-2xl p-4 sm:p-5 border border-white/10 bg-[#0F2339]/90 shadow-md flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quote ID, route, country..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#071426] border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[40px]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Type filters */}
          <div className="flex bg-[#071426] rounded-xl p-1 border border-white/10">
            {(['all', 'flight', 'visa'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  typeFilter === t ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#CBD5E1] hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Services' : t === 'flight' ? 'Flights' : 'Visas'}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#071426] border border-white/15 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[40px]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Reviewing / Pending</option>
            <option value="processing">Processing</option>
            <option value="quoted">Quoted / Ready</option>
            <option value="confirmed">Confirmed / Booked</option>
          </select>
        </div>
      </div>

      {/* Quote Cards Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="rounded-2xl p-10 sm:p-12 text-center border border-white/10 bg-[#0F2339]/80 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/15 text-[#2DD4BF] flex items-center justify-center mx-auto shadow-inner">
            <Activity className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-white">No matching quotes found</h3>
            <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
              {userQuotes.length === 0
                ? 'You have not submitted any flight or visa quotation requests yet. Request an instant quote to view live agent status here.'
                : 'Try adjusting your search query or filters above.'}
            </p>
          </div>

          {userQuotes.length === 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onOpenFlightQuote && (
                <button
                  type="button"
                  onClick={onOpenFlightQuote}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plane className="w-4 h-4" />
                  <span>Request Flight Quote</span>
                </button>
              )}
              {onOpenVisaQuote && (
                <button
                  type="button"
                  onClick={onOpenVisaQuote}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Stamp className="w-4 h-4" />
                  <span>Request Visa Quote</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((q) => {
            const isFlight = q.type === 'flight';
            return (
              <div
                key={q.id}
                className="rounded-2xl border border-white/10 bg-[#0F2339]/90 shadow-md overflow-hidden hover:border-[#2563EB]/50 transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/30 flex items-center gap-1">
                      {isFlight ? <Plane className="w-3 h-3" /> : <Stamp className="w-3 h-3 text-[#2DD4BF]" />}
                      <span className="capitalize">{q.type} Request</span>
                    </span>
                    {getStatusBadge(q.status)}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">
                      {isFlight
                        ? `${q.from} ➔ ${q.to}`
                        : `${(q as any).destinationCountry || 'International'} Visa`}
                    </h4>
                    <p className="text-xs text-[#CBD5E1]">
                      Ref: <span className="font-mono text-white font-semibold">{q.id}</span>
                    </p>
                  </div>

                  {q.quotedPrice && (
                    <div className="p-3 rounded-xl bg-[#071426]/70 border border-white/5 flex items-center justify-between">
                      <span className="text-xs text-[#CBD5E1]">Quoted Price:</span>
                      <span className="text-sm font-bold text-[#2DD4BF]">{q.quotedPrice}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#071426]/70 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-xs text-[#CBD5E1]">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(q)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Activity Timeline Section */}
      {timelineEvents.length > 0 && (
        <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4 pt-6 mt-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2DD4BF]" />
              <span>Operations Milestone Updates</span>
            </h3>
            <span className="text-xs text-slate-400">{timelineEvents.length} events logged</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {timelineEvents.slice(0, 5).map((evt, idx) => (
              <div key={evt.id || idx} className="relative group">
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#2DD4BF] ring-4 ring-[#2DD4BF]/20" />
                <div className="p-4 rounded-xl bg-[#071426]/80 border border-white/10 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sky-200">{evt.quoteId}</span>
                    <span className="text-xs text-[#CBD5E1]">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-sm">{evt.title}</h5>
                  <p className="text-[#CBD5E1]">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0F2339] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-6 text-[#F8FAFC] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#071426] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center text-[#2DD4BF]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Quotation Assessment</h3>
                  <p className="text-xs text-[#CBD5E1]">Ref: {selectedQuote.id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                aria-label="Close dialog"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 hide-scrollbar text-xs sm:text-sm">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#071426]/70 border border-white/10">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Service</span>
                  <span className="text-sm font-bold text-white capitalize">{selectedQuote.type} Request</span>
                </div>
                {getStatusBadge(selectedQuote.status)}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
                  <span className="text-xs text-[#CBD5E1] block">Customer Name</span>
                  <span className="font-bold text-white">{selectedQuote.customerName}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
                  <span className="text-xs text-[#CBD5E1] block">Phone / WhatsApp</span>
                  <span className="font-bold text-[#2DD4BF]">{selectedQuote.phone}</span>
                </div>
              </div>

              {/* Quoted Price if any */}
              {selectedQuote.quotedPrice && (
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#2DD4BF] font-semibold uppercase tracking-wider block">
                      Confirmed Fare / Fee
                    </span>
                    <p className="text-xs text-[#CBD5E1]">Verified rate via Azraq Travel Desk</p>
                  </div>
                  <span className="text-lg font-bold text-white">{selectedQuote.quotedPrice}</span>
                </div>
              )}

              {/* Staff Notes */}
              {selectedQuote.staffNote && (
                <div className="p-4 rounded-xl bg-[#071426]/80 border border-white/10 space-y-1.5">
                  <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Travel Desk Notes</span>
                  </span>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">{selectedQuote.staffNote}</p>
                </div>
              )}

              {/* WhatsApp direct agent link */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Need Instant Booking or Hold?</h4>
                  <p className="text-xs text-[#CBD5E1]">Direct WhatsApp desk for quote #{selectedQuote.id}</p>
                </div>

                <a
                  href={`https://wa.me/8801851172032?text=${encodeURIComponent(
                    `Hello Azraq Trips, I would like to confirm my quote #${selectedQuote.id} (${selectedQuote.type}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Agent</span>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#071426] border-t border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
