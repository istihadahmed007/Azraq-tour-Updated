import React, { useState } from 'react';
import { QuoteRequest, FlightQuoteRequest, VisaQuoteRequest } from '../../types';
import {
  Activity,
  Plane,
  Stamp,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  FileText,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Calendar,
  Users,
  ShieldCheck,
  Printer,
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
    // Search query
    const matchQuery =
      !searchQuery ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.type === 'flight' &&
        (`${q.from} ${q.to} ${q.airlinePreference || ''}`).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.type === 'visa' && (q as any).destinationCountry?.toLowerCase().includes(searchQuery.toLowerCase()));

    // Type filter
    const matchType = typeFilter === 'all' || q.type === typeFilter;

    // Status filter
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
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'Quoted':
      case 'Quoted via WhatsApp':
      case 'Quoted via Email':
      case 'Sent':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Quotation Ready</span>
          </span>
        );
      case 'Processing':
      case 'Quotation Prepared':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Reviewing</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0a192f] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
            <Activity className="w-3.5 h-3.5" />
            <span>Real-Time Operations & Quotes</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-white">
            Travel Activity & Quote History ({userQuotes.length})
          </h2>
          <p className="text-xs text-sky-200/80 max-w-xl">
            Live tracking of your flight quotes, visa assessments, and dedicated staff updates for your journeys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshQuotes}
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingQuotes ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-white/10 bg-slate-900/90 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quote ID, route, country..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 min-h-[40px]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Type filters */}
          <div className="flex bg-slate-800 rounded-2xl p-1 border border-white/10">
            {(['all', 'flight', 'visa'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  typeFilter === t ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
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
            className="px-4 py-2 rounded-2xl bg-slate-800 border border-white/10 text-xs text-white font-semibold focus:outline-none focus:border-amber-400 min-h-[40px]"
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
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 bg-slate-900/80 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
            <Activity className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-serif-display">No matching quotes found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
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
                  className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  <Plane className="w-4 h-4" />
                  <span>Request Flight Quote</span>
                </button>
              )}
              {onOpenVisaQuote && (
                <button
                  type="button"
                  onClick={onOpenVisaQuote}
                  className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-transform flex items-center gap-1.5 cursor-pointer"
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
            const fq = q as FlightQuoteRequest;
            const vq = q as VisaQuoteRequest;

            return (
              <div
                key={q.id}
                className="glass-card rounded-3xl border border-white/15 bg-slate-900/90 shadow-xl overflow-hidden hover:border-amber-400/40 transition-all flex flex-col justify-between group"
              >
                <div className="p-6 space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isFlight
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                        }`}
                      >
                        {isFlight ? <Plane className="w-5 h-5" /> : <Stamp className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold text-amber-300 block">
                          {q.id}
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {isFlight ? 'Flight Quote' : 'Visa Application'}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(q.status)}
                  </div>

                  {/* Route or Country */}
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white font-serif-display group-hover:text-amber-300 transition-colors">
                      {isFlight ? `${fq.from} ✈️ ${fq.to}` : `${vq.destinationCountry} Visa`}
                    </h4>
                    <p className="text-xs text-slate-300">
                      Travel Date:{' '}
                      <strong className="text-white">
                        {isFlight ? fq.departureDate : vq.intendedTravelDate || 'Flexible'}
                      </strong>
                    </p>
                  </div>

                  {/* Quoted Price if prepared */}
                  {q.quotedPrice && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-xs flex items-center justify-between">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Official Quotation:</span>
                      </span>
                      <span className="text-sm font-extrabold text-white">{q.quotedPrice}</span>
                    </div>
                  )}

                  {/* Staff Notes */}
                  {q.staffNote && (
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 space-y-1">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        Specialist Assessment
                      </span>
                      <p className="text-xs leading-relaxed italic">{q.staffNote}</p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-950/70 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(q)}
                    className="px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Assessment</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Activity Timeline Section */}
      {timelineEvents.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4 pt-6 mt-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Live Operations Milestone Updates</span>
            </h3>
            <span className="text-[11px] text-slate-400">{timelineEvents.length} events logged</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {timelineEvents.slice(0, 5).map((evt, idx) => (
              <div key={evt.id || idx} className="relative group">
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-amber-300">{evt.quoteId}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-sm">{evt.title}</h5>
                  <p className="text-slate-300">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0a192f] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif-display">Official Quotation Dossier</h3>
                  <p className="text-xs text-sky-200/80">Ref: {selectedQuote.id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 hide-scrollbar text-xs sm:text-sm">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Service Type</span>
                  <span className="text-sm font-bold text-white capitalize">{selectedQuote.type} Assistance</span>
                </div>
                {getStatusBadge(selectedQuote.status)}
              </div>

              {/* Passenger and Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Customer Name</span>
                  <span className="font-bold text-white">{selectedQuote.customerName}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Phone / WhatsApp</span>
                  <span className="font-bold text-emerald-300">{selectedQuote.phone}</span>
                </div>
              </div>

              {/* Quoted Price if any */}
              {selectedQuote.quotedPrice && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400/20 to-emerald-400/20 border border-amber-400/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                      Confirmed Quotation Rate
                    </span>
                    <p className="text-xs text-slate-300">Guaranteed rate via Azraq Travel Desk</p>
                  </div>
                  <span className="text-lg font-black text-white">{selectedQuote.quotedPrice}</span>
                </div>
              )}

              {/* Staff Assessment */}
              {selectedQuote.staffNote && (
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/20 space-y-1.5">
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Travel Desk Notes & Guidance</span>
                  </span>
                  <p className="text-xs text-sky-100/90 leading-relaxed">{selectedQuote.staffNote}</p>
                </div>
              )}

              {/* WhatsApp direct agent link */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Need Instant Booking or Hold?</h4>
                  <p className="text-[11px] text-slate-300">Connect with operations agent for reference #{selectedQuote.id}</p>
                </div>

                <a
                  href={`https://wa.me/8801851172032?text=${encodeURIComponent(
                    `Hello Azraq Trips, I would like to confirm my quote #${selectedQuote.id} (${selectedQuote.type}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Agent</span>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
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
