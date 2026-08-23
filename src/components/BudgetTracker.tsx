import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BudgetItem,
  ExpenseCategory,
  Itinerary,
  ItineraryBudget,
  BudgetTier,
  BUDGET_TIER_OPTIONS,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  PieChart,
  Download,
  Plane,
  Building,
  Ticket,
  Utensils,
  Car,
  ShoppingBag,
  ShieldCheck,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Compass,
  Search,
  CheckCheck,
  RotateCcw,
  Smartphone,
  Gift,
  HelpCircle,
  X,
} from 'lucide-react';

interface BudgetTrackerProps {
  itinerary: Itinerary;
  onUpdateItinerary?: (updatedItinerary: Itinerary) => void;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  ratePerUSD: number; // base reference relative to 1 USD
}

export const CURRENCY_CONFIGS: CurrencyConfig[] = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka (৳)', ratePerUSD: 120 },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', ratePerUSD: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', ratePerUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)', ratePerUSD: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', ratePerUSD: 155 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', ratePerUSD: 3.67 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (RM)', ratePerUSD: 4.45 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)', ratePerUSD: 1.34 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht (฿)', ratePerUSD: 36.5 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', ratePerUSD: 83.5 },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)', ratePerUSD: 3.75 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)', ratePerUSD: 1.37 },
];

export const CATEGORY_DEFINITIONS: {
  name: ExpenseCategory;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentBg: string;
  borderColor: string;
}[] = [
  {
    name: 'Flights',
    icon: Plane,
    color: 'text-sky-400',
    accentBg: 'bg-sky-500/20',
    borderColor: 'border-sky-400/30',
  },
  {
    name: 'Accommodation',
    icon: Building,
    color: 'text-purple-400',
    accentBg: 'bg-purple-500/20',
    borderColor: 'border-purple-400/30',
  },
  {
    name: 'Activities',
    icon: Ticket,
    color: 'text-amber-400',
    accentBg: 'bg-amber-500/20',
    borderColor: 'border-amber-400/30',
  },
  {
    name: 'Food & Dining',
    icon: Utensils,
    color: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20',
    borderColor: 'border-emerald-400/30',
  },
  {
    name: 'Transport',
    icon: Car,
    color: 'text-blue-400',
    accentBg: 'bg-blue-500/20',
    borderColor: 'border-blue-400/30',
  },
  {
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'text-pink-400',
    accentBg: 'bg-pink-500/20',
    borderColor: 'border-pink-400/30',
  },
  {
    name: 'Visa & Insurance',
    icon: ShieldCheck,
    color: 'text-teal-400',
    accentBg: 'bg-teal-500/20',
    borderColor: 'border-teal-400/30',
  },
  {
    name: 'Miscellaneous',
    icon: MoreHorizontal,
    color: 'text-slate-300',
    accentBg: 'bg-slate-500/20',
    borderColor: 'border-slate-400/30',
  },
];

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  itinerary,
  onUpdateItinerary,
}) => {
  const { showToast } = useAuth();
  const storageKey = `azraq_itinerary_budget_${itinerary.id || 'default'}`;

  // Default initial budget items generator with tailored everyday normal price ranges
  const getInitialBudget = useCallback((): ItineraryBudget => {
    if (itinerary.budget && itinerary.budget.items?.length) return itinerary.budget;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          return parsed;
        }
      }
    } catch {}

    const days = itinerary.durationDays || itinerary.days?.length || 5;
    const destName = itinerary.destination ? itinerary.destination.split(',')[0] : 'Destination';

    return {
      currency: 'BDT',
      totalBudget: 98000,
      items: [
        {
          id: `init_fl_${Date.now()}`,
          name: `Round-trip Scheduled Flights to ${destName}`,
          category: 'Flights',
          estimatedCost: 42000,
          isPaid: false,
          notes: 'Standard scheduled economy seats with 20-30kg baggage allowance',
        },
        {
          id: `init_stay_${Date.now()}`,
          name: `Comfort 2-3★ Hotel / Airbnb (${days} Nights)`,
          category: 'Accommodation',
          estimatedCost: 24000,
          isPaid: false,
          notes: 'Clean private ensuite room with AC, breakfast & Wi-Fi',
        },
        {
          id: `init_food_${Date.now()}`,
          name: `Casual Dining, Cafes & Local Specialties (${days} Days)`,
          category: 'Food & Dining',
          estimatedCost: 14000,
          isPaid: false,
          notes: 'Authentic local restaurants, night markets & cafe brunches',
        },
        {
          id: `init_transit_${Date.now()}`,
          name: 'City Metro Passes, Airport Rail & Rideshares',
          category: 'Transport',
          estimatedCost: 7000,
          isPaid: false,
          notes: 'Metro smartcard passes, airport transfers & Grab/Uber rides',
        },
        {
          id: `init_act_${Date.now()}`,
          name: 'Attraction Entries, Visa & Sightseeing Pass',
          category: 'Activities',
          estimatedCost: 11000,
          isPaid: false,
          notes: 'Key cultural landmark passes, visa fees & day tour entries',
        },
      ],
    };
  }, [itinerary, storageKey]);

  // State Management
  const [budget, setBudget] = useState<ItineraryBudget>(getInitialBudget);
  const [selectedTier, setSelectedTier] = useState<BudgetTier>('economy');
  const [showTips, setShowTips] = useState<boolean>(true);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [tempTotalInput, setTempTotalInput] = useState(budget.totalBudget.toString());

  // Filter & Search Controls
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Activities');
  const [formCost, setFormCost] = useState('');
  const [formDayNumber, setFormDayNumber] = useState<number | undefined>(undefined);
  const [formSpotName, setFormSpotName] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsPaid, setFormIsPaid] = useState(false);

  // Sync to parent and localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(budget));
      if (onUpdateItinerary) {
        onUpdateItinerary({
          ...itinerary,
          budget,
        });
      }
    } catch {}
  }, [budget]);

  // Computed Totals & Metrics
  const totalEstimatedCost = useMemo(() => {
    return budget.items.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
  }, [budget.items]);

  const totalPaidCost = useMemo(() => {
    return budget.items
      .filter((item) => item.isPaid)
      .reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
  }, [budget.items]);

  const remainingBudget = useMemo(() => {
    return budget.totalBudget - totalEstimatedCost;
  }, [budget.totalBudget, totalEstimatedCost]);

  const percentUsed = useMemo(() => {
    if (budget.totalBudget <= 0) return 0;
    return Math.round((totalEstimatedCost / budget.totalBudget) * 100);
  }, [totalEstimatedCost, budget.totalBudget]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      Flights: 0,
      Accommodation: 0,
      Activities: 0,
      'Food & Dining': 0,
      Transport: 0,
      Shopping: 0,
      'Visa & Insurance': 0,
      Miscellaneous: 0,
    };

    budget.items.forEach((item) => {
      if (map[item.category] !== undefined) {
        map[item.category] += Number(item.estimatedCost) || 0;
      } else {
        map['Miscellaneous'] += Number(item.estimatedCost) || 0;
      }
    });

    return CATEGORY_DEFINITIONS.map((cat) => ({
      ...cat,
      total: map[cat.name],
      percentage: totalEstimatedCost > 0 ? Math.round((map[cat.name] / totalEstimatedCost) * 100) : 0,
    })).filter((cat) => cat.total > 0);
  }, [budget.items, totalEstimatedCost]);

  // Currency Formatter
  const formatMoney = useCallback(
    (amount: number) => {
      const cur = CURRENCY_CONFIGS.find((c) => c.code === budget.currency) || CURRENCY_CONFIGS[0];
      return `${cur.symbol} ${Math.round(amount).toLocaleString()}`;
    },
    [budget.currency]
  );

  // Seamless Multi-Currency Converter
  const handleCurrencyChange = (newCurrencyCode: string) => {
    const oldCode = budget.currency;
    if (oldCode === newCurrencyCode) return;

    const oldCfg = CURRENCY_CONFIGS.find((c) => c.code === oldCode) || CURRENCY_CONFIGS[0];
    const newCfg = CURRENCY_CONFIGS.find((c) => c.code === newCurrencyCode) || CURRENCY_CONFIGS[0];

    // Conversion factor = targetRate / sourceRate
    const conversionFactor = newCfg.ratePerUSD / oldCfg.ratePerUSD;

    setBudget((prev) => ({
      ...prev,
      currency: newCurrencyCode,
      totalBudget: Math.round(prev.totalBudget * conversionFactor),
      items: prev.items.map((it) => ({
        ...it,
        estimatedCost: Math.round(it.estimatedCost * conversionFactor),
        actualCost: it.actualCost ? Math.round(it.actualCost * conversionFactor) : undefined,
      })),
    }));

    setTempTotalInput(Math.round(budget.totalBudget * conversionFactor).toString());
    showToast(`Currency converted to ${newCfg.name}`, 'info');
  };

  // Select Preset Budget Tier for Normal Everyday People
  const handleSelectTierPreset = (tierId: BudgetTier) => {
    setSelectedTier(tierId);
    const daysCount = itinerary.durationDays || itinerary.days?.length || 5;
    const dest = itinerary.destination ? itinerary.destination.split(',')[0] : 'Destination';

    const cur = CURRENCY_CONFIGS.find((c) => c.code === budget.currency) || CURRENCY_CONFIGS[0];
    const usdFactor = cur.ratePerUSD;

    let targetUSD = 380;
    let itemsUSD: {
      name: string;
      category: ExpenseCategory;
      costUSD: number;
      notes: string;
    }[] = [];

    if (tierId === 'backpacker') {
      targetUSD = 560;
      itemsUSD = [
        {
          name: `Budget Flight / Value Airline Connection to ${dest}`,
          category: 'Flights',
          costUSD: 265,
          notes: 'Promotional discount flight / saver economy ticket',
        },
        {
          name: `Hostel / Clean Guesthouse Stay (${daysCount} Nights)`,
          category: 'Accommodation',
          costUSD: 115,
          notes: 'Clean top-rated dorm/private room in traveler hub',
        },
        {
          name: `Street Food & Local Market Dining (${daysCount} Days)`,
          category: 'Food & Dining',
          costUSD: 75,
          notes: 'Authentic local food courts, night markets & budget meals',
        },
        {
          name: 'City Metro Passes, Shared Vans & Buses',
          category: 'Transport',
          costUSD: 38,
          notes: 'Public transport smartcards & walking routes',
        },
        {
          name: 'Attraction Entries, Visa Fee & Self-Guided Tours',
          category: 'Activities',
          costUSD: 67,
          notes: 'Standard visa processing, temple passes & landmark entries',
        },
      ];
    } else if (tierId === 'economy') {
      targetUSD = 820;
      itemsUSD = [
        {
          name: `Round-trip Scheduled Flights to ${dest}`,
          category: 'Flights',
          costUSD: 350,
          notes: 'Standard airline ticket with 20-30kg checked luggage',
        },
        {
          name: `Comfort 2-3★ Hotel / Airbnb (${daysCount} Nights)`,
          category: 'Accommodation',
          costUSD: 200,
          notes: 'Private ensuite room with AC, breakfast & Wi-Fi',
        },
        {
          name: `Authentic Casual Dining & Cafes (${daysCount} Days)`,
          category: 'Food & Dining',
          costUSD: 115,
          notes: 'Family-owned restaurants, cafes & local specialties',
        },
        {
          name: 'City Metro Cards, Airport Rail & Rideshares',
          category: 'Transport',
          costUSD: 60,
          notes: 'Metro smart passes, airport train & Grab/Bolt/Uber rides',
        },
        {
          name: 'Museums, Visa & Key Attraction Passes',
          category: 'Activities',
          costUSD: 95,
          notes: 'Visa processing, iconic landmark tickets & day excursion',
        },
      ];
    } else if (tierId === 'moderate') {
      targetUSD = 1380;
      itemsUSD = [
        {
          name: `Direct Scheduled Flights to ${dest}`,
          category: 'Flights',
          costUSD: 540,
          notes: 'Prime time daytime flights with baggage & halal meals',
        },
        {
          name: `4★ Central Hotel with Buffet Breakfast (${daysCount} Nights)`,
          category: 'Accommodation',
          costUSD: 400,
          notes: 'City center hotel with swimming pool & full buffet breakfast',
        },
        {
          name: `Curated Restaurants & Rooftop Dining (${daysCount} Days)`,
          category: 'Food & Dining',
          costUSD: 185,
          notes: 'Sit-down specialty dining, seafood & scenic dinners',
        },
        {
          name: 'Private Airport Transfers & Air-conditioned Cabs',
          category: 'Transport',
          costUSD: 100,
          notes: 'Pre-booked private transfers & comfortable city rides',
        },
        {
          name: 'Guided Day Tours, Visa & Fast-Track Tickets',
          category: 'Activities',
          costUSD: 155,
          notes: 'Skip-the-line attraction tickets, visa & day boat cruise',
        },
      ];
    } else {
      targetUSD = 2400;
      itemsUSD = [
        {
          name: `Premium / Business Class Flights to ${dest}`,
          category: 'Flights',
          costUSD: 950,
          notes: 'Flexible flight bookings with premium baggage allowance & lounge access',
        },
        {
          name: `5★ Luxury Resort / Suite (${daysCount} Nights)`,
          category: 'Accommodation',
          costUSD: 790,
          notes: 'Luxury suites with spa access & premier lounge perks',
        },
        {
          name: `Fine Dining, Michelin-Guide & Gourmet Feasts`,
          category: 'Food & Dining',
          costUSD: 315,
          notes: 'Multi-course tasting menus & premium beachfront dining',
        },
        {
          name: 'Private Chauffeur & Executive Vehicles',
          category: 'Transport',
          costUSD: 165,
          notes: 'Dedicated driver & private transfers throughout trip',
        },
        {
          name: 'VIP Private Tour Guide & Bespoke Excursions',
          category: 'Activities',
          costUSD: 180,
          notes: 'Exclusive private yacht/boat tour, visa VIP & personalized guide',
        },
      ];
    }

    const calculatedTotal = Math.round(targetUSD * usdFactor);
    const convertedItems: BudgetItem[] = itemsUSD.map((item, idx) => ({
      id: `tier_${tierId}_${Date.now()}_${idx}`,
      name: item.name,
      category: item.category,
      estimatedCost: Math.round(item.costUSD * usdFactor),
      isPaid: false,
      notes: item.notes,
    }));

    setBudget({
      currency: budget.currency,
      totalBudget: calculatedTotal,
      items: convertedItems,
    });
    setTempTotalInput(calculatedTotal.toString());
    showToast(`Recalibrated to ${tierId.toUpperCase()} tier estimates for everyday travelers!`, 'success');
  };

  // Toggle Single Item Paid Status
  const handleTogglePaid = (itemId: string) => {
    setBudget((prev) => {
      const item = prev.items.find((it) => it.id === itemId);
      const nextStatus = !item?.isPaid;
      const updated = prev.items.map((it) =>
        it.id === itemId ? { ...it, isPaid: nextStatus } : it
      );
      if (item) {
        showToast(
          nextStatus ? `Marked "${item.name}" as Paid` : `Marked "${item.name}" as Pending`,
          'info'
        );
      }
      return { ...prev, items: updated };
    });
  };

  // Bulk Actions: Mark All Paid / Pending
  const handleToggleAllPaid = (makeAllPaid: boolean) => {
    setBudget((prev) => ({
      ...prev,
      items: prev.items.map((it) => ({ ...it, isPaid: makeAllPaid })),
    }));
    showToast(
      makeAllPaid ? 'All expenses marked as Paid!' : 'All expenses marked as Pending.',
      'info'
    );
  };

  // Delete Single Item
  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = budget.items.find((it) => it.id === itemId);
    setBudget((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== itemId),
    }));
    showToast(`Removed "${itemToDelete?.name || 'Expense'}"`, 'info');
  };

  // Save Total Ceiling
  const handleSaveTotalBudget = () => {
    const parsed = parseFloat(tempTotalInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setBudget((prev) => ({
        ...prev,
        totalBudget: Math.round(parsed),
      }));
      setIsEditingTotal(false);
      showToast(`Target budget updated to ${formatMoney(parsed)}`, 'success');
    }
  };

  // Quick One-Click Add Common Essentials
  const handleAddQuickEssential = (preset: {
    name: string;
    category: ExpenseCategory;
    costInUSD: number;
    notes: string;
  }) => {
    const cur = CURRENCY_CONFIGS.find((c) => c.code === budget.currency) || CURRENCY_CONFIGS[0];
    const cost = Math.max(50, Math.round(preset.costInUSD * cur.ratePerUSD));

    const newItem: BudgetItem = {
      id: `quick_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: preset.name,
      category: preset.category,
      estimatedCost: cost,
      isPaid: false,
      notes: preset.notes,
    };

    setBudget((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    showToast(`Added "${preset.name}" (${formatMoney(cost)})`, 'success');
  };

  // Open Modal Helpers
  const handleOpenAddModal = () => {
    setEditingItemId(null);
    setFormName('');
    setFormCategory('Activities');
    setFormCost('');
    setFormDayNumber(undefined);
    setFormSpotName('');
    setFormNotes('');
    setFormIsPaid(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormCost(item.estimatedCost.toString());
    setFormDayNumber(item.dayNumber);
    setFormSpotName(item.spotName || '');
    setFormNotes(item.notes || '');
    setFormIsPaid(item.isPaid || false);
    setShowAddModal(true);
  };

  // Save Form Handler
  const handleSaveExpenseForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(formCost);
    if (!formName.trim()) {
      showToast('Please enter an expense name or description', 'error');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      showToast('Please enter a valid positive cost amount', 'error');
      return;
    }

    if (editingItemId) {
      setBudget((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === editingItemId
            ? {
                ...it,
                name: formName.trim(),
                category: formCategory,
                estimatedCost: Math.round(cost),
                dayNumber: formDayNumber,
                spotName: formSpotName.trim() || undefined,
                notes: formNotes.trim() || undefined,
                isPaid: formIsPaid,
              }
            : it
        ),
      }));
      showToast('Expense item updated successfully!', 'success');
    } else {
      const newItem: BudgetItem = {
        id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: formName.trim(),
        category: formCategory,
        estimatedCost: Math.round(cost),
        dayNumber: formDayNumber,
        spotName: formSpotName.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isPaid: formIsPaid,
      };

      setBudget((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
      showToast('New expense item added to your trip!', 'success');
    }

    setShowAddModal(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Category',
      'Expense Item',
      `Cost (${budget.currency})`,
      'Status',
      'Assigned Day',
      'Associated Spot',
      'Notes & Details',
    ];

    const rows = budget.items.map((it) => [
      `"${it.category}"`,
      `"${it.name.replace(/"/g, '""')}"`,
      it.estimatedCost,
      it.isPaid ? 'PAID / BOOKED' : 'PENDING',
      it.dayNumber ? `Day ${it.dayNumber}` : 'General / Pre-Trip',
      `"${(it.spotName || '').replace(/"/g, '""')}"`,
      `"${(it.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      `"Azraq Travel Budget Plan: ${itinerary.destination}"`,
      `"Budget Ceiling: ${budget.currency} ${budget.totalBudget}"`,
      `"Total Planned: ${budget.currency} ${totalEstimatedCost}"`,
      `"Total Paid: ${budget.currency} ${totalPaidCost}"`,
      `"Remaining Balance: ${budget.currency} ${remainingBudget}"`,
      `"Export Date: ${new Date().toLocaleDateString()}"`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Azraq_Budget_${(itinerary.destination || 'Trip').replace(/[^a-zA-Z0-9]/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Trip budget CSV exported successfully!', 'success');
  };

  // Filtered Expense Items List
  const filteredItems = useMemo(() => {
    return budget.items.filter((item) => {
      // 1. Status Filter
      if (statusFilter === 'paid' && !item.isPaid) return false;
      if (statusFilter === 'pending' && item.isPaid) return false;

      // 2. Category Filter
      if (selectedCategoryFilter !== 'All' && item.category !== selectedCategoryFilter)
        return false;

      // 3. Day Filter
      if (selectedDayFilter !== 'all') {
        if (selectedDayFilter === 'general') {
          if (item.dayNumber !== undefined && item.dayNumber !== null) return false;
        } else {
          const dayNum = parseInt(selectedDayFilter, 10);
          if (item.dayNumber !== dayNum) return false;
        }
      }

      // 4. Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesNotes = item.notes ? item.notes.toLowerCase().includes(query) : false;
        const matchesSpot = item.spotName ? item.spotName.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesNotes && !matchesSpot) return false;
      }

      return true;
    });
  }, [
    budget.items,
    statusFilter,
    selectedCategoryFilter,
    selectedDayFilter,
    searchTerm,
  ]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn text-slate-100">
      {/* 1. Header & Currency & Recalibrate Bar */}
      <div className="bg-slate-900/95 rounded-3xl p-5 sm:p-7 border border-slate-700/80 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        {/* Glow ambient background */}
        <div
          className={`absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-25 transition-all ${
            remainingBudget < 0 ? 'bg-rose-500' : 'bg-sky-500'
          }`}
        />

        {/* Top Title & Utilities Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <span className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-inner flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-poppins text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Trip Budget & Expense Tracker
                </h3>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Live Calculator
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-200/90 font-medium mt-0.5">
                Realistic everyday price ranges for Bangladeshi & international travelers to{' '}
                <strong className="text-white font-bold">{itinerary.destination}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Currency Selector */}
            <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700/90 rounded-2xl px-3.5 py-2 text-xs text-white shadow-inner">
              <span className="text-sky-300 font-bold uppercase tracking-wider text-[11px]">
                Currency:
              </span>
              <select
                value={budget.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                aria-label="Select trip budget currency"
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
              >
                {CURRENCY_CONFIGS.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white font-medium">
                    {c.code} ({c.symbol}) – {c.name.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Recalibrate Tier Button */}
            <button
              onClick={() => handleSelectTierPreset(selectedTier)}
              className="px-4 py-2 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              title="Reset budget to selected tier estimates"
            >
              <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
              <span>Recalibrate Preset</span>
            </button>
          </div>
        </div>

        {/* 2. Budget Tier Preset Options for Normal People & Everyday Travelers */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Select Price Range Tier for Everyday People:</span>
            </span>
            <span className="text-[11px] text-sky-300 font-medium">
              Click any tier below to auto-calibrate realistic, accessible travel expenses
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BUDGET_TIER_OPTIONS.map((tier) => {
              const isSelected = selectedTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => handleSelectTierPreset(tier.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-b from-sky-500/25 to-slate-900 border-sky-400 shadow-xl shadow-sky-500/15 ring-2 ring-sky-400'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 font-poppins">
                        <span className="text-base">{tier.icon}</span>
                        <span>{tier.label.split('/')[0]}</span>
                      </span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-400 text-slate-950 uppercase tracking-wider shadow-xs">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-sky-200/90 font-medium line-clamp-2 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-300">{tier.priceRangeBDT}</span>
                    <span className="text-slate-400 font-normal text-[11px]">{tier.priceRangeUSD}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Metric Cards Grid: Target Budget, Planned Expenses, Remaining Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Card 1: Target Budget */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3 min-w-0 relative group">
            <div className="flex items-center justify-between text-xs text-sky-200 font-semibold">
              <span>Target Budget Ceiling</span>
              <button
                onClick={() => {
                  setTempTotalInput(budget.totalBudget.toString());
                  setIsEditingTotal(!isEditingTotal);
                }}
                className="text-sky-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Edit Target Budget"
                aria-label="Edit Target Budget"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {isEditingTotal ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={tempTotalInput}
                  onChange={(e) => setTempTotalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTotalBudget();
                  }}
                  className="w-full bg-slate-900 border border-sky-400 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTotalBudget}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 cursor-pointer shadow-md"
                >
                  Save
                </button>
              </div>
            ) : (
              <p
                className="font-poppins text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate cursor-pointer"
                onClick={() => {
                  setTempTotalInput(budget.totalBudget.toString());
                  setIsEditingTotal(true);
                }}
                title="Click to edit budget ceiling"
              >
                {formatMoney(budget.totalBudget)}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Tier: <strong className="text-sky-300 uppercase">{selectedTier}</strong></span>
              <span className="italic">Click value to edit</span>
            </div>
          </div>

          {/* Card 2: Total Planned Expenses */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3 min-w-0">
            <div className="flex items-center justify-between text-xs text-sky-200 font-semibold">
              <span>Total Planned Expenses</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700">
                {budget.items.length} items
              </span>
            </div>

            <p
              className="font-poppins text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight truncate"
              title={formatMoney(totalEstimatedCost)}
            >
              {formatMoney(totalEstimatedCost)}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 gap-2 flex-wrap">
              <span>
                Paid: <strong className="text-emerald-400 font-bold">{formatMoney(totalPaidCost)}</strong>
              </span>
              <span>
                Pending:{' '}
                <strong className="text-slate-200 font-bold">
                  {formatMoney(Math.max(0, totalEstimatedCost - totalPaidCost))}
                </strong>
              </span>
            </div>
          </div>

          {/* Card 3: Remaining Balance */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between gap-3 min-w-0 sm:col-span-2 lg:col-span-1 ${
              remainingBudget < 0
                ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{remainingBudget < 0 ? 'Budget Deficit' : 'Remaining Balance'}</span>
              {remainingBudget < 0 ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </div>

            <p
              className={`font-poppins text-2xl sm:text-3xl font-extrabold tracking-tight truncate ${
                remainingBudget < 0 ? 'text-rose-300' : 'text-emerald-300'
              }`}
              title={
                remainingBudget < 0
                  ? `-${formatMoney(Math.abs(remainingBudget))}`
                  : formatMoney(remainingBudget)
              }
            >
              {remainingBudget < 0
                ? `-${formatMoney(Math.abs(remainingBudget))}`
                : formatMoney(remainingBudget)}
            </p>

            <span className="text-[11px] font-bold text-slate-300">
              {percentUsed}% of budget ceiling allocated
            </span>
          </div>
        </div>

        {/* Progress Bar & Status Pill */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-sky-200 font-bold">Budget Allocation Progress</span>
            <div>
              {percentUsed > 100 ? (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Over Budget by {percentUsed - 100}%
                </span>
              ) : percentUsed >= 85 ? (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Near Budget Ceiling ({percentUsed}%)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Healthy & On Track ({percentUsed}%)
                </span>
              )}
            </div>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 100
                  ? 'bg-rose-500 shadow-md shadow-rose-500/50'
                  : percentUsed >= 85
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-400 to-sky-400'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Money-Saving Pro-Tips for Everyday Travelers (Accordion) */}
      <div className="bg-gradient-to-r from-sky-950/50 via-slate-900 to-emerald-950/40 rounded-3xl p-5 border border-sky-500/30 shadow-xl">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowTips(!showTips)}
        >
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Lightbulb className="w-5 h-5 text-amber-300 animate-pulse" />
            </span>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2.5 font-poppins">
                <span>Everyday Traveler Money-Saving Pro-Tips</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Save 30%–45%
                </span>
              </h4>
              <p className="text-xs text-sky-200/80">
                Insider advice on flights, boutique stays, street dining & transit passes
              </p>
            </div>
          </div>
          <button
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle money saving tips"
          >
            {showTips ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showTips && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4 pt-4 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-sky-400" /> 1. Flights
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Book 4–6 weeks ahead on Tuesday/Wednesday nights. Fly mid-week departures to save up to ৳8,000.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-purple-400" /> 2. Stays
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pick boutique guesthouses or studio apartments 2–3 subway stations outside tourist squares for 50% lower rates.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" /> 3. Food
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dine where local families eat. Explore evening street food markets for authentic ৳150–৳400 ($1–$3.50) feasts.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400" /> 4. Local Transit
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Buy unlimited tourist metro cards and use official express trains rather than expensive airport taxis.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. One-Click Quick Add Essentials Bar */}
      <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-sky-200 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400" />
            <span>One-Click Quick Add Common Trip Essentials:</span>
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click to instantly add recommended essentials
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              name: 'Tourist eSIM / Local 5G SIM Card',
              category: 'Miscellaneous' as ExpenseCategory,
              costInUSD: 10,
              icon: Smartphone,
              notes: 'Unlimited local data & hotspot for travel navigation',
            },
            {
              name: 'Airport Express Train / Rail Link',
              category: 'Transport' as ExpenseCategory,
              costInUSD: 12,
              icon: Car,
              notes: 'Fast airport to downtown transit pass',
            },
            {
              name: 'Night Market Street Food Feast',
              category: 'Food & Dining' as ExpenseCategory,
              costInUSD: 7,
              icon: Utensils,
              notes: 'Local culinary tasting & refreshments',
            },
            {
              name: 'Travel Medical & Baggage Insurance',
              category: 'Visa & Insurance' as ExpenseCategory,
              costInUSD: 20,
              icon: ShieldCheck,
              notes: 'Comprehensive travel health & delay protection',
            },
            {
              name: 'Souvenirs & Cultural Handicrafts',
              category: 'Shopping' as ExpenseCategory,
              costInUSD: 25,
              icon: Gift,
              notes: 'Local gifts, tea, spices & keepsakes',
            },
            {
              name: 'Heritage Landmark / Museum Pass',
              category: 'Activities' as ExpenseCategory,
              costInUSD: 15,
              icon: Ticket,
              notes: 'Iconic temple, palace or gallery admission',
            },
          ].map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddQuickEssential(preset)}
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-sky-200 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Icon className="w-3.5 h-3.5 text-sky-400" />
                <span>+ {preset.name.split('/')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Category Spending Breakdown Badges */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-sky-200 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              <span>Category Spending Breakdown (Click to filter)</span>
            </h4>
            {selectedCategoryFilter !== 'All' && (
              <button
                onClick={() => setSelectedCategoryFilter('All')}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
              >
                Clear Category Filter ({selectedCategoryFilter})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categoryBreakdown.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategoryFilter === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() =>
                    setSelectedCategoryFilter(isSelected ? 'All' : cat.name)
                  }
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-500/25 border-sky-400 shadow-md ring-1 ring-sky-400'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border ${cat.accentBg} ${cat.borderColor} ${cat.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate font-poppins">{cat.name}</p>
                    <div className="flex items-center justify-between text-[11px] text-sky-200 font-medium">
                      <span>{formatMoney(cat.total)}</span>
                      <span className="text-slate-400">{cat.percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Controls Bar: Status Tabs, Search, Day Filter, Bulk Action, Add & Export */}
      <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3.5">
          {/* Status Tabs: All | Pending | Paid */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 self-start">
            {[
              { id: 'all', label: 'All Expenses', count: budget.items.length },
              {
                id: 'pending',
                label: 'Pending',
                count: budget.items.filter((i) => !i.isPaid).length,
              },
              {
                id: 'paid',
                label: 'Paid / Booked',
                count: budget.items.filter((i) => i.isPaid).length,
              },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Bulk Toggle, Export CSV, Add Expense */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mark all toggle */}
            <button
              onClick={() => {
                const allPaid = budget.items.every((it) => it.isPaid);
                handleToggleAllPaid(!allPaid);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Toggle all items as paid or pending"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {budget.items.every((it) => it.isPaid) ? 'Mark All Pending' : 'Mark All Paid'}
              </span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-200 hover:text-white border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download CSV formatted budget sheet"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Add Custom Expense */}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold transition-all shadow-lg shadow-sky-500/25 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs: Search, Category & Day */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses, spots, notes..."
              className="w-full py-2 pl-9 pr-8 rounded-xl text-xs text-white bg-slate-950 border border-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              aria-label="Filter expenses by category"
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORY_DEFINITIONS.map((c) => (
                <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Day Number Filter */}
          <div>
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              aria-label="Filter expenses by day"
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="all">All Days & Timeline</option>
              <option value="general">General / Pre-Trip</option>
              {itinerary.days?.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber.toString()} className="bg-slate-900 text-white">
                  Day {d.dayNumber}: {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 8. Expenses Items List */}
      <div className="flex flex-col gap-3">
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900/90 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3.5 border border-slate-800 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h5 className="text-base font-bold text-white font-poppins">No expenses found</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchTerm || selectedCategoryFilter !== 'All' || statusFilter !== 'all' || selectedDayFilter !== 'all'
                  ? 'No expense items matched your current filters. Try resetting the search or category filter.'
                  : 'Get started by adding your first expense or picking a tier preset above.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {(searchTerm || selectedCategoryFilter !== 'All' || statusFilter !== 'all' || selectedDayFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategoryFilter('All');
                    setStatusFilter('all');
                    setSelectedDayFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                + Add Custom Expense
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const catObj =
              CATEGORY_DEFINITIONS.find((c) => c.name === item.category) || CATEGORY_DEFINITIONS[7];
            const Icon = catObj.icon;

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 sm:p-4.5 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-md ${
                  item.isPaid
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-slate-800/90 hover:border-slate-700 bg-slate-900/85 hover:bg-slate-900'
                }`}
              >
                {/* Left Info Group */}
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleTogglePaid(item.id)}
                    className="shrink-0 p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title={item.isPaid ? 'Mark as Pending / Unpaid' : 'Mark as Paid / Booked'}
                    aria-label={item.isPaid ? 'Mark as Pending' : 'Mark as Paid'}
                  >
                    {item.isPaid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div className={`p-2.5 rounded-xl border ${catObj.accentBg} ${catObj.borderColor} ${catObj.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5
                        className={`text-sm sm:text-base font-bold truncate font-poppins ${
                          item.isPaid ? 'text-emerald-200' : 'text-white'
                        }`}
                      >
                        {item.name}
                      </h5>
                      {item.dayNumber !== undefined && item.dayNumber !== null && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                          Day {item.dayNumber}
                        </span>
                      )}
                      {item.spotName && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[150px]">
                          📍 {item.spotName}
                        </span>
                      )}
                      {item.isPaid && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          PAID
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right Amount & Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-2.5 sm:pt-0">
                  <span
                    className={`font-poppins text-base sm:text-lg font-extrabold ${
                      item.isPaid ? 'text-emerald-300 line-through opacity-80' : 'text-amber-300'
                    }`}
                  >
                    {formatMoney(item.estimatedCost)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Item"
                      aria-label="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Item"
                      aria-label="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 9. Add / Edit Expense Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                  <DollarSign className="w-5 h-5" />
                </span>
                <h4 className="text-lg font-extrabold text-white font-poppins">
                  {editingItemId ? 'Edit Expense Item' : 'Add Custom Trip Expense'}
                </h4>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpenseForm} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Flight ticket, Boutique hotel, Metro pass, Heritage tour..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    {CATEGORY_DEFINITIONS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Estimated Cost ({budget.currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Day (Optional)
                  </label>
                  <select
                    value={formDayNumber || ''}
                    onChange={(e) =>
                      setFormDayNumber(e.target.value ? parseInt(e.target.value, 10) : undefined)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="">General / Pre-Trip</option>
                    {itinerary.days?.map((d) => (
                      <option key={d.dayNumber} value={d.dayNumber}>
                        Day {d.dayNumber}: {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Associated Spot (Optional)
                  </label>
                  <input
                    type="text"
                    value={formSpotName}
                    onChange={(e) => setFormSpotName(e.target.value)}
                    placeholder="e.g. Senso-ji Temple, Marina Bay..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Notes & Booking Details
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Non-refundable booking reference, paid with credit card, includes luggage..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="modalFormIsPaid"
                  checked={formIsPaid}
                  onChange={(e) => setFormIsPaid(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="modalFormIsPaid"
                  className="text-xs font-bold text-slate-300 cursor-pointer select-none"
                >
                  Mark as Already Paid / Booked
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  {editingItemId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
