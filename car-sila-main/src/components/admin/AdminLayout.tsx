import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  ShieldAlert,
  LogOut,
  Globe,
  Sliders,
  Sun,
  Moon
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { AppView } from '../../types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    logout,
    language,
    setLanguage,
    theme,
    toggleTheme,
    t,
    reports
  } = useApp();

  const navItems: { id: AppView; label: string; icon: any; badge?: number }[] = [
    { id: 'admin-overview', label: t('adminOverview'), icon: LayoutDashboard },
    { id: 'admin-users', label: t('adminUsers'), icon: Users },
    { id: 'admin-vehicles', label: t('adminVehicles'), icon: Car },
    { id: 'admin-reports', label: t('adminReports'), icon: FileText, badge: reports.length },
    { id: 'admin-security', label: t('adminSecurity'), icon: ShieldAlert }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* ADMIN SIDEBAR */}
      <aside className={`hidden md:flex md:w-64 flex-col justify-between shrink-0 border-r z-30 transition-colors ${
        theme === 'dark'
          ? 'bg-slate-950 text-slate-300 border-slate-800'
          : 'bg-white text-slate-700 border-slate-200 shadow-sm'
      }`}>
        <div>
          {/* Admin Header */}
          <div className={`p-6 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div 
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <img src={logo} alt="" className="h-8 w-auto object-contain lg:h-10" />
              <div className="text-start">
                <span className={`font-extrabold text-base block leading-none ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  CAR-SILA
                </span>
                <span className="text-[10px] text-purple-500 font-bold tracking-wider uppercase">
                  ADMIN CONTROL
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title={theme === 'dark' ? t('lightMode') : t('darkMode')}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-purple-500" />
              </button>
            </div>
          </div>

          {/* Admin Navigation Links */}
          <nav className="p-4 space-y-1.5 text-sm font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-900 text-purple-200">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Snippet & Switch back to Owner view */}
        <div className={`p-4 border-t space-y-3 ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3 px-2">
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs ${
              theme === 'dark'
                ? 'bg-purple-950 border-purple-800 text-purple-300'
                : 'bg-purple-100 border-purple-300 text-purple-700'
            }`}>
              AD
            </div>
            <div className="flex-1 min-w-0 text-start">
              <p className={`text-xs font-bold truncate ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {currentUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Super Admin
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut className="w-4 h-4 rtl:rotate-180" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* ADMIN CONTENT */}
      <div className={`md:hidden sticky top-0 z-30 border-b ${
        theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex h-14 items-center justify-between gap-2 px-3">
          <button type="button" onClick={() => setCurrentView('landing')} className="flex min-w-0 items-center gap-2">
            <img src={logo} alt="" className="h-8 w-auto shrink-0 object-contain" />
            <span className="truncate text-lg font-black">CAR-SILA</span>
          </button>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700" aria-label="Toggle Language">
              <Globe className="h-4 w-4 text-purple-400" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-3 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentView(item.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${
                  isActive ? 'bg-purple-600 text-white' : theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className={`flex-1 flex flex-col min-w-0 overflow-y-auto md:max-h-screen transition-colors ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'
      }`}>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};