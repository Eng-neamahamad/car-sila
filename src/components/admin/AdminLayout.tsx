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
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
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
      <aside className={`w-full md:w-64 flex flex-col justify-between shrink-0 border-r z-30 transition-colors ${
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
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-purple-600/30">
                CS
              </div>
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
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 hover:bg-slate-800 text-purple-300 border-purple-900/50'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
            }`}
          >
            ← {language === 'ar' ? 'التبديل إلى واجهة المالك' : 'Switch to Owner View'}
          </button>

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
      <main className={`flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen transition-colors ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'
      }`}>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};