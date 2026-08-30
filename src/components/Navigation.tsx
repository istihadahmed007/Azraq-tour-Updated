import React, { useState, useEffect, useRef } from 'react';
import { NavView } from '../types';
import { useAuth } from '../context/AuthContext';
import { AzraqLogo } from './AzraqLogo';
import {
  Plane,
  Building2,
  FileCheck2,
  Package,
  Compass,
  Users,
  Sparkles,
  Tag,
  Bell,
  User,
  LogOut,
  Heart,
  Search,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Globe,
  Home,
  CheckCheck,
  Clock,
  Ticket,
  Percent,
} from 'lucide-react';

interface NavigationProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  brandTheme?: string;
  onToggleBrand?: () => void;
  onNewTripClick: () => void;
  savedTripsCount: number;
  onOpenQuote?: () => void;
  onOpenLocationFinder?: () => void;
  onOpenVoiceModal?: (initialTranscript?: string) => void;
}

interface TravelNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'flight' | 'visa' | 'buddy' | 'deal' | 'ai';
}

export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  (
    {
      currentView,
      onViewChange,
      savedTripsCount,
      onOpenVoiceModal,
    },
    ref
  ) => {
    const { user, isGuest, openAuthModal, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

    // Initial realistic notification list
    const [notifications, setNotifications] = useState<TravelNotification[]>([
      {
        id: 'n1',
        title: 'Price Drop Alert ✈️',
        message: 'Dhaka (DAC) → Bangkok (BKK) roundtrip dropped to ৳28,500 on US-Bangla.',
        time: '15m ago',
        unread: true,
        type: 'flight',
      },
      {
        id: 'n2',
        title: 'Visa Requirement Update',
        message: 'Thailand 60-day visa exemption confirmed for valid Bangladeshi passports.',
        time: '2h ago',
        unread: true,
        type: 'visa',
      },
      {
        id: 'n3',
        title: 'Travel Buddy Match',
        message: 'Afsana & 2 others are planning a Bali group tour in October.',
        time: '5h ago',
        unread: false,
        type: 'buddy',
      },
      {
        id: 'n4',
        title: 'Special Eid Holiday Offer',
        message: 'Save ৳8,000 on 5D4N Premium Kashmir Autumn packages.',
        time: '1d ago',
        unread: false,
        type: 'deal',
      },
    ]);

    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Handle scroll state for transparent-to-solid transition
    useEffect(() => {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        setIsScrolled(scrollPosition > 24);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check

      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle outside clicks for dropdowns
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
          setNotifDropdownOpen(false);
        }
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
          setUserDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut for Smart Search (Cmd+K / Ctrl+K)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          handleNavigate('search');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const unreadCount = notifications.filter((n) => n.unread).length;

    const handleNavigate = (view: NavView, extra?: { scrollToSection?: string }) => {
      onViewChange(view);
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
      setNotifDropdownOpen(false);

      if (extra?.scrollToSection) {
        setTimeout(() => {
          const el = document.getElementById(extra.scrollToSection!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const markAllNotifsRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    // Desktop Primary Navigation Items
    const desktopNavItems = [
      {
        id: 'flights',
        label: 'Flights',
        icon: <Plane className="w-4 h-4" />,
        isExternal: true,
        href: 'https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt',
        badge: 'Live',
      },
      {
        id: 'hotels',
        label: 'Hotels',
        icon: <Building2 className="w-4 h-4" />,
        view: 'hotels' as NavView,
        isActive: currentView === 'hotels',
      },
      {
        id: 'visa',
        label: 'Visa',
        icon: <FileCheck2 className="w-4 h-4" />,
        view: 'visa' as NavView,
        isActive: currentView === 'visa' || currentView === 'visa-detail',
      },
      {
        id: 'packages',
        label: 'Packages',
        icon: <Package className="w-4 h-4" />,
        view: 'packages' as NavView,
        isActive: currentView === 'packages',
      },
      {
        id: 'activities',
        label: 'Activities',
        icon: <Ticket className="w-4 h-4" />,
        view: 'activities' as NavView,
        isActive: currentView === 'activities',
      },
      {
        id: 'feed',
        label: 'Travel Buddies',
        icon: <Users className="w-4 h-4" />,
        view: 'feed' as NavView,
        isActive: currentView === 'feed',
      },
      {
        id: 'deals',
        label: 'Deals',
        icon: <Tag className="w-4 h-4" />,
        badge: 'Hot',
        onClick: () => {
          handleNavigate('discover', { scrollToSection: 'deals-section' });
        },
      },
    ];

    // Mobile Bottom Navigation Items (5 items)
    const mobileBottomTabs = [
      {
        id: 'home',
        label: 'Home',
        icon: <Home className="w-5 h-5" />,
        view: 'discover' as NavView,
        isActive: currentView === 'discover',
      },
      {
        id: 'explore',
        label: 'Explore',
        icon: <Compass className="w-5 h-5" />,
        view: 'destinations' as NavView,
        isActive:
          currentView === 'destinations' ||
          currentView === 'destination-detail' ||
          currentView === 'guides' ||
          currentView === 'guide-detail' ||
          currentView === 'itineraries' ||
          currentView === 'itinerary-detail',
      },
      {
        id: 'buddies',
        label: 'Buddies',
        icon: <Users className="w-5 h-5" />,
        view: 'feed' as NavView,
        isActive: currentView === 'feed',
      },
      {
        id: 'ai',
        label: 'AI',
        icon: <Sparkles className="w-5 h-5" />,
        view: 'planner' as NavView,
        isActive: currentView === 'planner' || currentView === 'ai-planner',
        isProminent: true,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <User className="w-5 h-5" />,
        view: 'profile' as NavView,
        isActive: currentView === 'profile',
        requiresAuth: true,
      },
    ];

    return (
      <>
        {/* ========================================================================= */}
        {/* DESKTOP & TOP NAVBAR */}
        {/* ========================================================================= */}
        <header
          ref={ref}
          id="main-navigation-header"
          className={`sticky top-0 left-0 right-0 w-full z-50 transition-all duration-200 bg-white/95 backdrop-blur-md text-[#073B4C] border-b overflow-x-clip ${
            isScrolled ? 'border-slate-200 shadow-sm' : 'border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <div className="h-16 lg:h-18 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
              
              {/* BRAND AREA */}
              <button
                type="button"
                onClick={() => handleNavigate('discover')}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer text-left group shrink-0 focus:outline-none py-1 select-none"
                aria-label="Azraq Trips Home"
              >
                {/* Official Azraq Tours & Travels Logo Emblem */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200 border border-[#0047BA]/20 shrink-0">
                  <AzraqLogo size={40} className="w-full h-full p-0.5" />
                </div>

                {/* Brand Name & Slogan */}
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg 2xl:text-xl font-extrabold tracking-tight leading-none uppercase font-sans text-[#073B4C] group-hover:text-[#0047BA] transition-colors">
                    AZRAQ TRIPS
                  </span>
                  <span className="text-[9px] sm:text-[10px] 2xl:text-[11px] text-[#0047BA] tracking-wider uppercase font-bold mt-0.5">
                    Tours &amp; Travels
                  </span>
                </div>
              </button>

              {/* DESKTOP NAVIGATION LINKS */}
              <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 2xl:gap-2">
                {desktopNavItems.map((item) => {
                  const isActive = !!item.isActive;

                  if (item.isExternal && item.href) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-xl text-xs 2xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer text-slate-700 hover:text-[#073B4C] hover:bg-slate-100/90"
                      >
                        <span className="text-slate-400 group-hover:text-[#17BEBB] transition-colors">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="hidden 2xl:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#17BEBB] text-[#073B4C] ml-0.5 shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick();
                        } else if (item.view) {
                          handleNavigate(item.view);
                        }
                      }}
                      className={`group relative flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-xl text-xs 2xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#EAF7F8] text-[#073B4C] font-bold'
                          : 'text-slate-700 hover:text-[#073B4C] hover:bg-slate-100/90'
                      }`}
                    >
                      <span
                        className={`transition-colors ${
                          isActive
                            ? 'text-[#17BEBB]'
                            : 'text-slate-400 group-hover:text-[#17BEBB]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>

                      {/* Hot / Special Badge */}
                      {item.badge && !isActive && (
                        <span className="hidden 2xl:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF6B5A] to-[#ff8577] text-white ml-0.5 shadow-xs animate-pulse">
                          {item.badge}
                        </span>
                      )}

                      {/* Active Aqua Indicator (#17BEBB) */}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-[#17BEBB] rounded-full shadow-[0_0_8px_rgba(23,190,187,0.8)]"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* RIGHT SIDE UTILITIES */}
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0 ml-auto">
                
                {/* Search Quick Action (Desktop & Tablet) */}
                <button
                  type="button"
                  onClick={() => handleNavigate('search')}
                  className={`hidden sm:flex items-center gap-1.5 p-2 2xl:px-3 2xl:py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    currentView === 'search'
                      ? 'bg-[#17BEBB] text-[#073B4C] border-[#17BEBB] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Search flights, packages, visas (⌘K)"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-[#17BEBB]" />
                  <span className="hidden 2xl:inline">Search</span>
                  <kbd className="hidden 2xl:inline-flex items-center px-1 py-0.2 text-[9px] font-mono rounded bg-slate-200 text-slate-600">
                    ⌘K
                  </kbd>
                </button>

                {/* NOTIFICATION BELL */}
                <div className="relative shrink-0" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className={`relative p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      notifDropdownOpen
                        ? 'bg-[#17BEBB]/20 text-[#17BEBB] border-[#17BEBB]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    aria-label="View notifications"
                    title="Travel Alerts & Notifications"
                  >
                    <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B5A] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse border border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* NOTIFICATION POPOVER */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 py-3 z-50 animate-fadeIn">
                      <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#17BEBB]" />
                          <span className="text-sm font-bold text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#17BEBB]/20 text-[#073B4C]">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotifsRead}
                            className="text-[11px] font-semibold text-[#086788] hover:text-[#17BEBB] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                              notif.unread ? 'bg-sky-50/50' : ''
                            }`}
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((n) =>
                                  n.id === notif.id ? { ...n, unread: false } : n
                                )
                              );
                              if (notif.type === 'flight') {
                                window.open(
                                  'https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt',
                                  '_blank'
                                );
                              } else if (notif.type === 'visa') {
                                handleNavigate('visa');
                              } else if (notif.type === 'buddy') {
                                handleNavigate('feed');
                              } else if (notif.type === 'deal') {
                                handleNavigate('packages');
                              }
                              setNotifDropdownOpen(false);
                            }}
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                notif.type === 'flight'
                                  ? 'bg-sky-100 text-sky-600'
                                  : notif.type === 'visa'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : notif.type === 'buddy'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {notif.type === 'flight' && <Plane className="w-4 h-4" />}
                              {notif.type === 'visa' && <FileCheck2 className="w-4 h-4" />}
                              {notif.type === 'buddy' && <Users className="w-4 h-4" />}
                              {notif.type === 'deal' && <Tag className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                                  <Clock className="w-2.5 h-2.5" />
                                  {notif.time}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            handleNavigate('discover');
                            setNotifDropdownOpen(false);
                          }}
                          className="text-xs font-bold text-[#086788] hover:text-[#17BEBB] transition-colors"
                        >
                          View all travel deals & updates
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* USER PROFILE OR SIGN IN CTA */}
                {!isGuest && user ? (
                  /* AUTHENTICATED USER AVATAR & DROPDOWN */
                  <div className="relative shrink-0" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(!userDropdownOpen);
                        setNotifDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl border transition-all cursor-pointer select-none ${
                        userDropdownOpen || currentView === 'profile'
                          ? 'bg-[#17BEBB] text-[#073B4C] border-[#17BEBB] font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#073B4C]'
                      }`}
                      title="User Account"
                    >
                      <img
                        src={
                          user?.photoURL ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            user?.fullName || user?.email || 'traveler'
                          )}`
                        }
                        alt={user?.fullName || 'Traveler'}
                        className="w-7 h-7 rounded-lg object-cover border border-white/40 shrink-0 shadow-xs"
                      />
                      <span className="text-xs font-bold max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">
                        {user?.fullName?.split(' ')[0] || 'Traveler'}
                      </span>
                    </button>

                    {/* Account Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 py-2 z-50 animate-fadeIn">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {user?.fullName || 'VIP Traveler'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1.5">
                          <button
                            type="button"
                            onClick={() => handleNavigate('profile')}
                            className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#086788] flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                          >
                            <User className="w-4 h-4 text-[#17BEBB]" />
                            <span>My Profile & Bookings</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNavigate('profile')}
                            className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#086788] flex items-center justify-between cursor-pointer text-left transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Heart className="w-4 h-4 text-[#FF6B5A]" />
                              <span>Saved Trips</span>
                            </div>
                            {savedTripsCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full">
                                {savedTripsCount}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNavigate('planner')}
                            className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#086788] flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>AI Travel Concierge</span>
                          </button>
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* SIGN IN CTA BUTTONS */
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-[#073B4C] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B5A] to-[#ff8577] hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                    >
                      Register
                    </button>
                  </div>
                )}

                {/* Mobile Drawer Toggle (Secondary items on small screens) */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="xl:hidden p-2 rounded-xl text-[#073B4C] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* SECONDARY MOBILE / TABLET DRAWER */}
          {mobileMenuOpen && (
            <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fadeIn text-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {desktopNavItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.isExternal && item.href) {
                        window.open(item.href, '_blank');
                      } else if (item.onClick) {
                        item.onClick();
                      } else if (item.view) {
                        handleNavigate(item.view);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left border ${
                      item.isActive
                        ? 'bg-[#EAF7F8] text-[#073B4C] border-[#17BEBB]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className={item.isActive ? 'text-[#17BEBB]' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#17BEBB] text-[#073B4C] ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Trust Badge Strip */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1 font-semibold text-[#073B4C]">
                  <Globe className="w-3.5 h-3.5 text-[#17BEBB]" />
                  BDT (৳) Currency
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Govt. Approved
                </span>
              </div>
            </div>
          )}
        </header>

        {/* ========================================================================= */}
        {/* MOBILE BOTTOM NAVIGATION (Fixed bottom, safe area, touch friendly)        */}
        {/* ========================================================================= */}
        <nav
          id="mobile-bottom-nav"
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        >
          {mobileBottomTabs.map((tab) => {
            const isActive = tab.isActive;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.requiresAuth && isGuest) {
                    openAuthModal('login');
                  } else {
                    handleNavigate(tab.view);
                  }
                }}
                className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer touch-manipulation select-none ${
                  isActive
                    ? 'text-[#073B4C] font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Aqua active indicator (#17BEBB) */}
                {isActive && (
                  <span
                    className="absolute -top-2 w-8 h-1 bg-[#17BEBB] rounded-full shadow-[0_0_8px_rgba(23,190,187,0.9)]"
                    aria-hidden="true"
                  />
                )}

                {/* AI Prominent Icon Styling */}
                {tab.isProminent ? (
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#17BEBB] text-[#073B4C] shadow-md scale-110'
                        : 'bg-gradient-to-tr from-[#086788] to-[#17BEBB] text-white shadow-xs'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                ) : (
                  <div
                    className={`transition-transform duration-200 ${
                      isActive ? 'text-[#17BEBB] scale-110' : 'text-slate-500'
                    }`}
                  >
                    {tab.icon}
                  </div>
                )}

                <span
                  className={`text-[10px] tracking-tight mt-1 transition-colors ${
                    isActive ? 'text-[#073B4C] font-extrabold' : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </>
    );
  }
);

Navigation.displayName = 'Navigation';
export default Navigation;
