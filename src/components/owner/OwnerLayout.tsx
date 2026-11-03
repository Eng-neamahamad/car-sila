import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Car,
  FileText,
  MessageSquare,
  Bell,
  Activity as ActivityIcon,
  Settings,
  LogOut,
  Globe,
  Plus,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { AppView } from '../../types';
import logo from '../../assets/logo.png';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    logout,
    notifications,
    reports,
    conversations,
    language,
    setLanguage,
    theme,
    setTheme,
    t,
    setAddVehicleModalOpen,
    setActiveScanVehicle
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const unreadNotifsCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;
  const unreadMessages = conversations ? conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0) : 0;
  const newReportsCount = reports ? reports.filter((r) => r.status === 'new').length : 0;

  const navItems: { id: AppView; label: string; icon: any; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'my-vehicles', label: t('myVehicles'), icon: Car },
    { id: 'reports', label: t('reports'), icon: FileText, badge: newReportsCount, badgeColor: 'bg-rose-500' },
    { id: 'messages', label: t('messages'), icon: MessageSquare, badge: unreadMessages, badgeColor: 'bg-rose-500' },
    { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-rose-500' },
    { id: 'activity', label: t('activity'), icon: ActivityIcon },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#041018] text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 border-e transition-colors duration-300 shrink-0 relative overflow-hidden ${
        theme === 'dark' ? 'bg-[#061820] border-cyan-950' : 'bg-white border-slate-200'
      }`}>
        {/* Brand Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img src={logo} alt="" className="h-11 w-auto object-contain group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-lg font-black tracking-tight text-cyan-400">CAR-SILA</span>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
              }`}>
                {language === 'ar' ? 'بوابة المالك' : 'Owner Portal'}
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-cyan-600/40 ring-2 ring-cyan-300/40">
              {(currentUser?.name || 'CS').slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#061820]" />
          </div>
          <div className="overflow-hidden">
            <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {currentUser?.name || 'Owner'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {language === 'ar' ? 'متصل' : 'Online'}
            </p>
          </div>
        </div>

        {/* Quick Add Vehicle Button */}
        <div className="px-4 pt-1 pb-2">
          <button
            type="button"
            onClick={() => setAddVehicleModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-white font-bold text-xs shadow-lg shadow-cyan-700/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة مركبة جديدة' : 'Add New Vehicle'}</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 pt-1 space-y-1.5 text-sm font-semibold flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'my-vehicles' && currentView === 'vehicle-details');
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-700/40'
                    : theme === 'dark'
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-cyan-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`relative p-4 border-t space-y-2 ${
          theme === 'dark' ? 'border-cyan-950' : 'border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setCurrentView('contact')}
            className={`w-full text-start rounded-2xl p-3 cursor-pointer ${
              theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <p className="text-xs font-bold">{language === 'ar' ? 'تحتاج مساعدة؟' : 'Need Help?'}</p>
            <p className="text-[11px] text-cyan-300">{language === 'ar' ? 'تواصل مع الدعم' : 'Contact Support'}</p>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/80 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={logout}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-500 transition-colors cursor-pointer ${
              theme === 'dark' ? 'hover:bg-rose-950/30' : 'hover:bg-rose-50'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="sticky top-0 z-30">
        {/* Top Header */}
        <header className={`h-16 border-b px-4 sm:px-8 flex items-center justify-between backdrop-blur-md transition-colors ${
          theme === 'dark' ? 'bg-[#041018]/95 border-cyan-950' : 'bg-white/95 border-slate-200'
        }`}>
          {/* Mobile Brand */}
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <img src={logo} alt="" className="h-8 w-auto shrink-0 object-contain" />
            <span className="truncate text-lg font-black">CAR-SILA</span>
          </div>

          {/* Page Indicator */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300">
              {t(currentView)}
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`md:hidden flex h-9 w-9 items-center justify-center rounded-xl border cursor-pointer ${
                theme === 'dark' ? 'border-cyan-500/30 text-cyan-200' : 'border-slate-200 text-slate-700'
              }`}
              aria-label={language === 'ar' ? 'القائمة' : 'Menu'}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setAddVehicleModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-700/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'ar' ? 'إضافة سيارة' : 'Add Vehicle'}</span>
            </button>
            <button
              onClick={() => {
                setActiveScanVehicle(null);
                setCurrentView('qr-scan-flow');
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-amber-500">🏁</span>
              <span>{language === 'ar' ? 'مسح QR (زائر)' : 'Scan QR (Visitor)'}</span>
            </button>
          </div>
        </header>
        {menuOpen && (
          <nav className={`md:hidden border-b px-3 py-2 space-y-1 ${
            theme === 'dark' ? 'bg-[#061820] border-cyan-950' : 'bg-white border-slate-200'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'my-vehicles' && currentView === 'vehicle-details');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentView(item.id);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300'
                      : theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-start">{item.label}</span>
                  {item.badge ? (
                    <span className={`min-w-5 rounded-full px-1.5 text-center text-[10px] text-white ${item.badgeColor || 'bg-rose-500'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        )}
        </div>

        {/* View Children */}
        <div className={`p-4 sm:p-6 lg:p-8 flex-1 ${theme === 'dark' ? 'bg-[#041018]' : ''}`}>
          {children}
        </div>
      </main>

      {menuOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 top-16 z-20 bg-black/45"
          aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
};