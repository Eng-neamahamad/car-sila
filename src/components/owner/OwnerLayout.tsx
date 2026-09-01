import React from 'react';
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
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { AppView } from '../../types';

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
    language,
    setLanguage,
    theme,
    setTheme,
    t,
    setAddVehicleModalOpen
  } = useApp();

  const unreadNotifsCount = notifications ? notifications.filter((n: any) => !n.read).length : 0;
  const newReportsCount = reports ? reports.filter((r: any) => r.status === 'new').length : 0;

  const navItems: { id: AppView; label: string; icon: any; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'my-vehicles', label: t('myVehicles'), icon: Car },
    { id: 'reports', label: t('reports'), icon: FileText, badge: newReportsCount, badgeColor: 'bg-rose-500' },
    { id: 'messages', label: t('messages'), icon: MessageSquare },
    { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-amber-500' },
    { id: 'activity', label: t('activity'), icon: ActivityIcon },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 border-e transition-colors duration-300 shrink-0 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Brand Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-blue-500">CAR-SILA</span>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
              }`}>
                {language === 'ar' ? 'بوابة المالك' : 'Owner Portal'}
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className={`p-4 mx-4 my-4 rounded-2xl border flex items-center gap-3 ${
          theme === 'dark' ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            {currentUser?.name?.substring(0, 2) || 'CS'}
          </div>
          <div className="overflow-hidden">
            <p className={`text-xs font-bold truncate ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {currentUser?.name || 'Ahmed'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
          </div>
        </div>

        {/* Quick Add Vehicle Button */}
        <div className="px-4 pt-1 pb-2">
          <button
            type="button"
            onClick={() => setAddVehicleModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02]"
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-blue-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-4 border-t space-y-2 ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
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
        {/* Top Header */}
        <header className={`h-16 border-b px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
        }`}>
          {/* Mobile Brand */}
          <div className="flex items-center gap-2 md:hidden">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-sm">CAR-SILA</span>
          </div>

          {/* Page Indicator */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500">
              {t(currentView)}
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddVehicleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إضافة سيارة' : 'Add Vehicle'}</span>
            </button>
            <button
              onClick={() => setCurrentView('qr-scan-flow')}
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

        {/* View Children */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};