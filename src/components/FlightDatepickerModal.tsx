import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface FlightDatepickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeField: 'departure' | 'return';
  onSelectActiveField: (field: 'departure' | 'return') => void;
  departureDate: string;
  returnDate: string;
  tripType: 'round' | 'oneway' | 'multi';
  onDepartureDateChange: (date: string) => void;
  onReturnDateChange: (date: string) => void;
  onTripTypeChange?: (tripType: 'round' | 'oneway' | 'multi') => void;
}

export const FlightDatepickerModal: React.FC<FlightDatepickerModalProps> = ({
  isOpen,
  onClose,
  activeField,
  onSelectActiveField,
  departureDate,
  returnDate,
  tripType,
  onDepartureDateChange,
  onReturnDateChange,
  onTripTypeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Initialize view to departure month (or current month if none)
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (departureDate) {
      const d = new Date(departureDate + 'T00:00:00');
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Keep viewDate in sync when opened
  useEffect(() => {
    if (isOpen && departureDate) {
      const d = new Date(departureDate + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [isOpen, departureDate]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Today in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Format date readable: "Wed, 16 Sep 2026"
  const formatReadableDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Month navigation
  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const prev = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (prev >= currentMonth) {
      setViewDate(prev);
    }
  };

  // Quick Presets
  const applyPreset = (preset: 'today' | 'tomorrow' | 'weekend' | '1week' | '2weeks') => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let dep = new Date(now);
    let ret = new Date(now);

    if (preset === 'today') {
      dep = new Date(now);
      ret = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (preset === 'tomorrow') {
      dep = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      ret = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
    } else if (preset === 'weekend') {
      // Find upcoming Friday
      const day = now.getDay();
      const daysUntilFriday = (5 - day + 7) % 7 || 7;
      dep = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
      ret = new Date(dep.getTime() + 2 * 24 * 60 * 60 * 1000); // Sunday
    } else if (preset === '1week') {
      dep = departureDate ? new Date(departureDate + 'T00:00:00') : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      ret = new Date(dep.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (preset === '2weeks') {
      dep = departureDate ? new Date(departureDate + 'T00:00:00') : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      ret = new Date(dep.getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    const depStr = dep.toISOString().split('T')[0];
    const retStr = ret.toISOString().split('T')[0];

    onDepartureDateChange(depStr);
    if (tripType === 'round') {
      onReturnDateChange(retStr);
    }
    setViewDate(new Date(dep.getFullYear(), dep.getMonth(), 1));
  };

  // Month rendering helper
  const renderMonth = (monthOffset = 0) => {
    const targetMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, 1);
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();

    const monthName = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="flex-1 min-w-[280px]">
        <div className="text-center font-bold text-sm text-[#071A33] mb-3 pb-1 border-b border-slate-100 flex items-center justify-center gap-1">
          <span>{monthName}</span>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, idx) => (
            <div
              key={d}
              className={`text-[11px] font-bold ${
                idx === 5 || idx === 6 ? 'text-amber-600' : 'text-slate-600'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-9 w-full" />;
            }

            const mm = String(month + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const dateStr = `${year}-${mm}-${dd}`;

            const isPast = dateStr < todayStr;
            const isDeparture = dateStr === departureDate;
            const isReturn = tripType === 'round' && dateStr === returnDate;

            // Range highlighting logic
            const effectiveReturn =
              tripType === 'round'
                ? activeField === 'return' && hoverDate && hoverDate >= departureDate
                  ? hoverDate
                  : returnDate
                : '';

            const isInRange =
              tripType === 'round' &&
              departureDate &&
              effectiveReturn &&
              dateStr > departureDate &&
              dateStr < effectiveReturn;

            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast}
                onClick={() => {
                  if (activeField === 'departure') {
                    onDepartureDateChange(dateStr);
                    if (tripType === 'round') {
                      // If return date is before new departure, push return date out
                      if (returnDate && returnDate <= dateStr) {
                        const newD = new Date(dateStr + 'T00:00:00');
                        newD.setDate(newD.getDate() + 7);
                        onReturnDateChange(newD.toISOString().split('T')[0]);
                      }
                      onSelectActiveField('return');
                    } else {
                      onClose();
                    }
                  } else {
                    // Selecting return
                    if (dateStr < departureDate) {
                      // Selected earlier date, swap or make it departure
                      onDepartureDateChange(dateStr);
                      onSelectActiveField('return');
                    } else {
                      onReturnDateChange(dateStr);
                      onClose();
                    }
                  }
                }}
                onMouseEnter={() => {
                  if (activeField === 'return') {
                    setHoverDate(dateStr);
                  }
                }}
                onMouseLeave={() => {
                  setHoverDate(null);
                }}
                className={`h-9 w-full rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  isPast
                    ? 'text-slate-300 cursor-not-allowed pointer-events-none'
                    : isDeparture || isReturn
                    ? 'bg-[#071A33] text-white font-bold shadow-md z-10 scale-105'
                    : isInRange
                    ? 'bg-[#17BEBB]/20 text-[#071A33] rounded-none font-medium'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-black'
                } ${isDeparture && isInRange ? 'rounded-l-xl rounded-r-none' : ''} ${
                  isReturn && isInRange ? 'rounded-r-xl rounded-l-none' : ''
                }`}
              >
                <span>{day}</span>
                {isToday && !isDeparture && !isReturn && (
                  <span className="w-1 h-1 rounded-full bg-[#17BEBB] -mt-0.5" />
                )}
                {isDeparture && (
                  <span className="text-[8px] leading-none uppercase tracking-tighter text-[#17BEBB] font-mono">
                    Dep
                  </span>
                )}
                {isReturn && (
                  <span className="text-[8px] leading-none uppercase tracking-tighter text-[#17BEBB] font-mono">
                    Ret
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Flight Date Picker"
      className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 sm:w-[660px] mt-2.5 z-50 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_60px_rgba(7,26,51,0.22)] border border-white/80 p-4 sm:p-5 text-slate-900 animate-fadeIn"
    >
      {/* Top Header Controls: Active Tab Switcher & Trip Type */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Departure Field Tab */}
          <button
            type="button"
            onClick={() => onSelectActiveField('departure')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeField === 'departure'
                ? 'bg-[#071A33] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#17BEBB]" />
            <div className="text-left">
              <div className="text-[9px] uppercase tracking-wider text-slate-300 font-mono">
                Departure
              </div>
              <div className="font-bold">{formatReadableDate(departureDate) || 'Pick Date'}</div>
            </div>
          </button>

          {/* Return Field Tab */}
          <button
            type="button"
            onClick={() => {
              if (tripType === 'oneway' && onTripTypeChange) {
                onTripTypeChange('round');
              }
              onSelectActiveField('return');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeField === 'return'
                ? 'bg-[#071A33] text-white shadow-sm'
                : tripType === 'oneway'
                ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-dashed border-slate-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#17BEBB]" />
            <div className="text-left">
              <div className="text-[9px] uppercase tracking-wider text-slate-300 font-mono">
                Return
              </div>
              <div className="font-bold">
                {tripType === 'oneway'
                  ? '+ Add Return'
                  : formatReadableDate(returnDate) || 'Pick Date'}
              </div>
            </div>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
          title="Close calendar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Month Navigation & Dual-Month Display */}
      <div className="relative pt-3">
        {/* Navigation Arrows */}
        <div className="flex items-center justify-between absolute top-3 left-0 right-0 z-20 pointer-events-none px-1">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center pointer-events-auto cursor-pointer transition-transform active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center pointer-events-auto cursor-pointer transition-transform active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Months Container: 1 month on small screens, 2 months on sm+ */}
        <div className="flex flex-col sm:flex-row gap-6 pt-2">
          {renderMonth(0)}
          <div className="hidden sm:block flex-1">{renderMonth(1)}</div>
        </div>
      </div>

      {/* Quick Presets Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono mr-1">
            Quick:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('today')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#071A33] font-semibold text-xs transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tomorrow')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#071A33] font-semibold text-xs transition-colors cursor-pointer"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => applyPreset('weekend')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#071A33] font-semibold text-xs transition-colors cursor-pointer"
          >
            Next Weekend
          </button>
          <button
            type="button"
            onClick={() => applyPreset('1week')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#071A33] font-semibold text-xs transition-colors cursor-pointer"
          >
            +7 Days
          </button>
          <button
            type="button"
            onClick={() => applyPreset('2weeks')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#071A33] font-semibold text-xs transition-colors cursor-pointer"
          >
            +14 Days
          </button>
        </div>

        {/* Done / Confirm Button */}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-[#071A33] hover:bg-[#0B2545] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <Check className="w-3.5 h-3.5 text-[#17BEBB]" />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};
