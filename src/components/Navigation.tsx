import React, { useState, useEffect } from 'react';
import { NavView } from '../types';
import { BRAND_LOGOS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Package,
  FileCheck2,
  Users,
  MapPin,
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  Send,
  Search,
  ChevronRight,
  ShieldCheck,
  Globe,
  Mic,
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Primary travel navigation items
    const navItems: { id: NavView; label: string; icon: React.ReactNode; badge?: string }[] = [
      { id: 'discover', label: 'Explore', icon: <Compass className="w-4 h-4" /> },
      { id: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
      { id: 'destinations', label: 'Destinations', icon: <MapPin className="w-4 h-4" /> },
      { id: 'visa', label: 'Visa Assistance', icon: <FileCheck2 className="w-4 h-4" /> },
      { id: 'planner', label: 'AI Planner', icon: <Sparkles className="w-4 h-4 text-amber-300" />, badge: 'AI' },
      { id: 'feed', label: 'Travel Buddies', icon: <Users className="w-4 h-4" /> },
    ];

    const handleNavigate = (view: NavView) => {
      onViewChange(view);
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    return (
      <header
        ref={ref}
        id="main-navigation-header"
        className="sticky top-0 left-0 right-0 w-full z-50 bg-[#003B80] bg-gradient-to-r from-[#002f6c] via-[#0759B8] to-[#003B80] text-white border-b border-white/15 shadow-md backdrop-blur-md transition-all duration-200"
      >
        {/* Main Navbar Container */}
        <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="h-16 flex items-center justify-between gap-1 sm:gap-2 md:gap-3">
            
            {/* Left: Brand Logo */}
            <button
              onClick={() => handleNavigate('discover')}
              className="flex items-center gap-2.5 cursor-pointer text-left group shrink-0 focus:outline-none py-1"
              aria-label="Azraq Home"
            >
              <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center group-hover:scale-105 transition-all overflow-hidden border border-white/60 p-1 shrink-0">
                <img
                  src={BRAND_LOGOS.azraq}
                  alt="Azraq Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-wider leading-none font-poppins drop-shadow-2xs">
                AZRAQ
              </span>
            </button>

            {/* Center Navigation Links (Visible on 2xl / Large Desktop screens) */}
            <nav className="hidden 2xl:flex items-center gap-1 shrink-0">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#0759B8] shadow-xs'
                        : 'text-white/90 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <span className={isActive ? 'text-[#0759B8]' : 'text-sky-200'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.badge && !isActive && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 ml-0.5">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Compact Navigation for Standard Desktops & Laptops (lg & xl) */}
            <nav className="hidden lg:flex 2xl:hidden items-center gap-0.5 shrink">
              {navItems.slice(0, 5).map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#0759B8] shadow-xs'
                        : 'text-white/90 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <span className={isActive ? 'text-[#0759B8]' : 'text-sky-200'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Utilities Container - ALWAYS visible with shrink-0 */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              
              {/* Voice AI Planner Button */}
              {onOpenVoiceModal && (
                <button
                  type="button"
                  onClick={() => onOpenVoiceModal()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 bg-gradient-to-r from-sky-400/25 to-blue-500/25 hover:from-sky-400/40 hover:to-blue-500/40 text-sky-100 border-sky-300/40 shadow-xs"
                  title="Voice AI Trip & Flight Planner"
                >
                  <Mic className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                  <span className="hidden md:inline font-bold">Voice AI</span>
                </button>
              )}

              {/* Smart Search Button */}
              <button
                type="button"
                onClick={() => handleNavigate('search')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  currentView === 'search'
                    ? 'bg-white text-[#0759B8] border-white shadow-xs font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
                }`}
                title="Search packages, visas, flights (Press ⌘K)"
              >
                <Search className={`w-3.5 h-3.5 ${currentView === 'search' ? 'text-[#0759B8]' : 'text-sky-300'}`} />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden md:inline-flex items-center px-1 py-0.2 text-[9px] font-mono rounded bg-white/20 text-white/80">
                  ⌘K
                </kbd>
              </button>

              {/* Saved Trips Counter Pill */}
              <button
                type="button"
                onClick={() => handleNavigate('profile')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  currentView === 'profile'
                    ? 'bg-white/25 text-white border border-white/40'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
                title="Saved Trips & Wishlist"
              >
                <Heart className={`w-4 h-4 ${savedTripsCount > 0 ? 'text-rose-300 fill-rose-300' : 'text-sky-200'}`} />
                <span className="text-xs font-extrabold">{savedTripsCount}</span>
              </button>

              {/* Divider */}
              <div className="h-6 w-[1px] bg-white/20 hidden sm:block shrink-0" />

              {/* User Authentication / Profile Area */}
              {isGuest ? (
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black text-[#0759B8] bg-white hover:bg-sky-50 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      userDropdownOpen || currentView === 'profile'
                        ? 'bg-white text-[#0759B8] border-white font-bold shadow-xs'
                        : 'border-white/30 bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="User Account Menu"
                  >
                    <img
                      src={
                        user?.photoURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          user?.fullName || user?.email || 'traveler'
                        )}`
                      }
                      alt={user?.fullName || 'Traveler'}
                      className="w-6 h-6 rounded-lg object-cover border border-white/50 shrink-0"
                    />
                    <span className="text-xs font-bold max-w-[80px] sm:max-w-[110px] truncate">
                      {user?.fullName?.split(' ')[0] || 'Traveler'}
                    </span>
                  </button>

                  {/* Account Popover Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 py-2 z-50 animate-fadeIn">
                      <div className="px-3.5 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {user?.fullName || 'VIP Traveler'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => handleNavigate('profile')}
                          className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0759B8] flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile & Bookings</span>
                        </button>
                        <button
                          onClick={() => handleNavigate('planner')}
                          className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0759B8] flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>AI Travel Concierge</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile / Tablet Menu Toggle (Visible below 2xl) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="2xl:hidden p-1.5 sm:p-2 text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="2xl:hidden border-t border-white/15 bg-[#002f6c] px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fadeIn">
            {/* Navigation Grid (6 items = 2 cols mobile, 3 cols tablet) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-white text-[#0759B8] shadow-xs'
                        : 'bg-white/10 hover:bg-white/15 text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-[#0759B8]' : 'text-sky-300'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Smart Search Trigger */}
            <button
              type="button"
              onClick={() => handleNavigate('search')}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-300" />
                <span>Search packages, visas, and destinations</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50" />
            </button>

            {/* Quick Traveler Badges */}
            <div className="flex items-center justify-between text-[11px] text-sky-200 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-sky-300" />
                <strong>BDT (৳) Bangladesh</strong>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Govt. Approved Agency</span>
              </span>
            </div>

            {/* Mobile Auth Actions */}
            {isGuest ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs text-center cursor-pointer border border-white/20"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    openAuthModal('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-white text-[#0759B8] font-bold text-xs text-center cursor-pointer shadow-xs"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 border border-white/15">
                  <img
                    src={
                      user?.photoURL ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        user?.fullName || user?.email || 'traveler'
                      )}`
                    }
                    alt={user?.fullName || 'Traveler'}
                    className="w-10 h-10 rounded-xl object-cover border border-white/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {user?.fullName || 'VIP Traveler'}
                    </p>
                    <p className="text-[11px] text-sky-200 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleNavigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 rounded-xl bg-white text-[#0759B8] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Account</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 rounded-xl bg-rose-500/20 text-rose-100 border border-rose-300/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Bottom Navigation Bar (For screen sizes < 640px) */}
        <div
          id="mobile-bottom-nav"
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#002757]/95 backdrop-blur-xl border-t border-white/15 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
        >
          <button
            type="button"
            onClick={() => handleNavigate('discover')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'discover'
                ? 'text-white font-black'
                : 'text-sky-200/70 hover:text-white'
            }`}
          >
            <Compass className={`w-5 h-5 mb-0.5 ${currentView === 'discover' ? 'text-white' : 'text-sky-300'}`} />
            <span className="text-[10px] tracking-tight">Explore</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('packages')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'packages'
                ? 'text-white font-black'
                : 'text-sky-200/70 hover:text-white'
            }`}
          >
            <Package className={`w-5 h-5 mb-0.5 ${currentView === 'packages' ? 'text-white' : 'text-sky-300'}`} />
            <span className="text-[10px] tracking-tight">Packages</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('search')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'search'
                ? 'text-white font-black'
                : 'text-sky-200/70 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 -mt-3 rounded-full bg-white text-[#0759B8] flex items-center justify-center shadow-md">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Search</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('visa')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'visa'
                ? 'text-white font-black'
                : 'text-sky-200/70 hover:text-white'
            }`}
          >
            <FileCheck2 className={`w-5 h-5 mb-0.5 ${currentView === 'visa' ? 'text-white' : 'text-sky-300'}`} />
            <span className="text-[10px] tracking-tight">Visa</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('profile')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'profile'
                ? 'text-white font-black'
                : 'text-sky-200/70 hover:text-white'
            }`}
          >
            <User className={`w-5 h-5 mb-0.5 ${currentView === 'profile' ? 'text-white' : 'text-sky-300'}`} />
            <span className="text-[10px] tracking-tight">Account</span>
          </button>
        </div>
      </header>
    );
  }
);

Navigation.displayName = 'Navigation';
