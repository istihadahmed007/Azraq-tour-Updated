import React, { useState, useEffect, useRef } from 'react';
import { NavView } from '../types';
import { useAuth } from '../context/AuthContext';
import { AzraqLogo } from './AzraqLogo';
import { UserAvatar } from './UserAvatar';
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

    // Keyboard shortcut for Smart Search (Cmd+K / Ctrl+K) and Escape to close dropdowns
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setNotifDropdownOpen(false);
          setUserDropdownOpen(false);
          setMobileMenuOpen(false);
        }
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

    interface DesktopNavItem {
      id: string;
      label: string;
      icon: React.ReactNode;
      view?: NavView;
      isActive?: boolean;
      isExternal?: boolean;
      href?: string;
      onClick?: () => void;
    }

    // Primary Travel Service Navigation Categories (Inspired by reference sub-header)
    const categoryNavItems = [
      {
        id: 'home',
        label: 'Home',
        view: 'discover' as NavView,
        isActive: currentView === 'discover',
      },
      {
        id: 'flights',
        label: 'Flights',
        isExternal: true,
        href: 'https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt',
      },
      {
        id: 'packages',
        label: 'Holiday Packages',
        view: 'packages' as NavView,
        isActive: currentView === 'packages',
      },
      {
        id: 'visa',
        label: 'Visa Services',
        view: 'visa' as NavView,
        isActive: currentView === 'visa' || currentView === 'visa-detail',
      },
      {
        id: 'hotels',
        label: 'Hotels',
        view: 'hotels' as NavView,
        isActive: currentView === 'hotels',
      },
      {
        id: 'transfers',
        label: 'Airport Transfers',
        view: 'activities' as NavView,
        isActive: currentView === 'activities',
      },
      {
        id: 'guides',
        label: 'Travel Guides',
        view: 'guides' as NavView,
        isActive: currentView === 'guides' || currentView === 'guide-detail',
      },
      {
        id: 'community',
        label: 'Travel Community',
        view: 'feed' as NavView,
        isActive: currentView === 'feed',
      },
      {
        id: 'planner',
        label: 'AI Trip Planner',
        view: 'planner' as NavView,
        isActive: currentView === 'planner' || currentView === 'ai-planner',
      },
    ];

    // All items for the mobile drawer
    const allNavItems = categoryNavItems;

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
        {/* DESKTOP & TOP NAVBAR (Premium Ice-Blue Neumorphic Layout)                 */}
        {/* ========================================================================= */}
        <header
          ref={ref}
          id="main-navigation-header"
          className={`sticky top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-[#DCEAF3]/95 hover:bg-[#DCEAF3] backdrop-blur-xl text-[#263B55] border-b border-white/70 overflow-x-clip ${
            isScrolled ? 'shadow-[0_4px_24px_rgba(166,185,204,0.35)]' : 'shadow-[0_2px_12px_rgba(166,185,204,0.2)]'
          }`}
        >
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <div className="h-16 lg:h-[4.5rem] flex items-center justify-between gap-2 sm:gap-3 xl:gap-4">
              
              {/* BRAND AREA */}
              <button
                type="button"
                onClick={() => handleNavigate('discover')}
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer text-left group shrink-0 focus:outline-none py-1 select-none"
                aria-label="Azraq Trips Home"
              >
                {/* Official Azraq Tours & Travels Logo Emblem */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white shadow-[2px_2px_8px_rgba(166,185,204,0.3)] flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200 border border-white/80 shrink-0">
                  <AzraqLogo size={40} className="w-full h-full p-0.5" />
                </div>

                {/* Brand Name & Slogan */}
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg 2xl:text-xl font-extrabold tracking-tight leading-none uppercase font-sans text-[#263B55] group-hover:text-[#73A9D2] transition-colors">
                    AZRAQ TRIPS
                  </span>
                  <span className="text-[9px] sm:text-[10px] 2xl:text-[11px] text-[#73A9D2] tracking-wider uppercase font-bold mt-0.5">
                    Tours &amp; Travels
                  </span>
                </div>
              </button>

              {/* CENTER SEARCH PILL (Matching reference top search pill) */}
              <div
                onClick={() => handleNavigate('search')}
                className="hidden md:flex items-center justify-between flex-1 max-w-sm lg:max-w-md xl:max-w-lg px-4 py-2 rounded-full bg-[#EAF2F8] border border-white/80 shadow-[inset_2px_2px_5px_rgba(166,185,204,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] cursor-pointer text-[#63778D] hover:text-[#263B55] hover:border-[#73A9D2]/70 transition-all select-none mx-2 lg:mx-4"
                title="Search destinations, flights, packages, visas (⌘K)"
              >
                <span className="text-xs font-medium tracking-wide truncate">
                  Search destinations, flights, packages...
                </span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/70 text-[#63778D] border border-white/60">
                    ⌘K
                  </kbd>
                  <Search className="w-4 h-4 text-[#73A9D2]" />
                </div>
              </div>

              {/* RIGHT SIDE UTILITIES */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0 ml-auto md:ml-0">
                
                {/* Search Quick Action for Mobile / Tablet */}
                <button
                  type="button"
                  onClick={() => handleNavigate('search')}
                  className="md:hidden w-10 h-10 rounded-full bg-[#E7F0F8] border border-white/80 shadow-[3px_3px_8px_rgba(166,185,204,0.35),-3px_-3px_8px_rgba(255,255,255,0.85)] flex items-center justify-center text-[#263B55] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Search (⌘K)"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-[#73A9D2]" />
                </button>

                {/* SAVED TRIPS / WISHLIST (Circular Neumorphic Button with Badge) */}
                <button
                  type="button"
                  onClick={() => handleNavigate('packages')}
                  className="relative w-10 h-10 rounded-full bg-[#E7F0F8] border border-white/80 shadow-[3px_3px_8px_rgba(166,185,204,0.35),-3px_-3px_8px_rgba(255,255,255,0.85)] flex items-center justify-center text-[#263B55] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Saved Trips & Wishlist"
                  aria-label="Saved Trips"
                >
                  <Heart className={`w-4 h-4 ${savedTripsCount > 0 ? 'text-[#E67A60] fill-[#E67A60]' : 'text-[#63778D]'}`} />
                  {savedTripsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E67A60] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs border border-white">
                      {savedTripsCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION BELL */}
                <div className="relative shrink-0" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className={`relative p-2 sm:p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all cursor-pointer shrink-0 ${
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

                {/* Primary CTA: Plan a Trip */}
                <button
                  type="button"
                  onClick={() => handleNavigate('planner')}
                  className="hidden lg:inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold text-white bg-[#071A33] hover:bg-[#073B4C] transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#17BEBB]" />
                  <span>Plan a Trip</span>
                </button>

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
                      className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl border transition-all cursor-pointer select-none min-h-[44px] ${
                        userDropdownOpen || currentView === 'profile'
                          ? 'bg-[#EAF7F8] text-[#071A33] border-[#17BEBB] font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#071A33]'
                      }`}
                      title="User Account"
                    >
                      <UserAvatar
                        photoURL={user?.photoURL}
                        name={user?.fullName}
                        email={user?.email}
                        size="sm"
                        className="rounded-lg border border-white/40 shadow-xs"
                      />
                      <span className="text-xs font-bold max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">
                        {user?.fullName?.split(' ')[0] || 'Traveler'}
                      </span>
                    </button>

                    {/* Account Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 py-2 z-50 animate-fadeIn">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user?.fullName || 'Valued Traveler'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1.5">
                          <button
                            type="button"
                            onClick={() => handleNavigate('profile')}
                            className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#071A33] flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                          >
                            <User className="w-4 h-4 text-[#17BEBB]" />
                            <span>My Profile & Bookings</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNavigate('profile')}
                            className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#071A33] flex items-center justify-between cursor-pointer text-left transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Heart className="w-4 h-4 text-[#0D9488]" />
                              <span>Saved Trips</span>
                            </div>
                            {savedTripsCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">
                                {savedTripsCount}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNavigate('planner')}
                            className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#071A33] flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-teal-600" />
                            <span>AI Trip Planner</span>
                          </button>
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* SIGN IN & REGISTER */
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="px-2.5 sm:px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 hover:text-[#071A33] transition-colors cursor-pointer shrink-0 whitespace-nowrap flex items-center"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="hidden sm:inline-flex items-center px-3 sm:px-3.5 py-1.5 min-h-[44px] rounded-xl text-xs font-semibold text-[#071A33] border border-slate-300 hover:border-[#071A33] hover:bg-slate-50 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {/* Mobile Drawer Toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="xl:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#071A33] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* SUB-HEADER TRAVEL SERVICE CATEGORIES (Inspired by reference sub-navigation) */}
          <div className="border-t border-white/60 bg-[#DCEAF3]/80 backdrop-blur-md px-3 sm:px-4 lg:px-6 2xl:px-8 py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 min-w-max mx-auto">
              {categoryNavItems.map((item) => {
                const isActive = !!item.isActive;

                if (item.isExternal && item.href) {
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#63778D] hover:text-[#263B55] hover:bg-white/60 transition-all duration-200 whitespace-nowrap"
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => item.view && handleNavigate(item.view)}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer whitespace-nowrap select-none ${
                      isActive
                        ? 'bg-[#F7FAFD] text-[#263B55] font-extrabold shadow-[2px_2px_6px_rgba(166,185,204,0.35),-2px_-2px_6px_rgba(255,255,255,0.9)] border border-white/90'
                        : 'text-[#63778D] hover:text-[#263B55] hover:bg-white/50 font-medium'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* SECONDARY MOBILE / TABLET DRAWER (Ice-Blue Neumorphic Surface) */}
        {mobileMenuOpen && (
          <div className="xl:hidden fixed top-[108px] left-0 right-0 z-40 border-b border-white/70 bg-[#DCEAF3]/95 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-4 shadow-[0_16px_36px_rgba(166,185,204,0.5)] animate-fadeIn text-[#263B55] max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              {allNavItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.isExternal && item.href) {
                      window.open(item.href, '_blank');
                    } else if (item.view) {
                      handleNavigate(item.view);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl text-sm transition-all cursor-pointer text-left min-h-[44px] ${
                    item.isActive
                      ? 'bg-[#F7FAFD] text-[#263B55] font-extrabold border border-white/80 shadow-[2px_2px_8px_rgba(166,185,204,0.3)]'
                      : 'text-[#63778D] hover:bg-white/60 hover:text-[#263B55]'
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#73A9D2]" />
                </button>
              ))}
            </div>

            {/* Mobile Contact Desk */}
            <div className="flex items-center justify-between text-xs text-[#63778D] px-3.5 py-2.5 bg-[#E7F0F8] rounded-xl border border-white/70 shadow-[inset_1px_1px_3px_rgba(166,185,204,0.3)]">
              <span className="flex items-center gap-1.5 font-medium text-[#263B55]">
                <Globe className="w-3.5 h-3.5 text-[#73A9D2]" />
                BDT (৳) · Dhaka Desk
              </span>
              <span className="flex items-center gap-1 text-[#263B55] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#73A9D2]" />
                Verified Agency
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MOBILE BOTTOM NAVIGATION (Fixed bottom, safe area, touch friendly)        */}
        {/* ========================================================================= */}
        <nav
          id="mobile-bottom-nav"
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-2xl border-t border-white/60 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_30px_rgba(0,0,0,0.06)]"
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
