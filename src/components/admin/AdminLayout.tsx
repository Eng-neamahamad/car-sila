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
  const arabic = language === 'ar';
  const freshReports = reports.filter((report) => report.status === 'new').length;

  const navItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'admin-overview', label: arabic ? 'نظرة عامة' : 'Overview', icon: LayoutDashboard },
    { id: 'admin-users', label: arabic ? 'الحسابات' : 'Accounts', icon: Users },
    { id: 'admin-vehicles', label: arabic ? 'السيارات' : 'Vehicles', icon: Car },
    { id: 'admin-reports', label: arabic ? 'البلاغات' : 'Reports', icon: FileText, badge: freshReports },
    { id: 'admin-security', label: arabic ? 'التشغيل' : 'Operations', icon: ShieldAlert }
  ];

  const controlClass = theme === 'dark'
    ? 'border-cyan-500/20 bg-[#0a2430] text-slate-300 hover:text-white'
    : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900';

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 md:flex-row ${
      theme === 'dark' ? 'bg-[#041018] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <aside className={`z-30 hidden w-64 shrink-0 flex-col justify-between border-e md:flex ${
        theme === 'dark'
          ? 'border-cyan-500/15 bg-[#061820] text-slate-300'
          : 'border-slate-200 bg-white text-slate-700 shadow-sm'
      }`}>
        <div>
          <div className={`border-b p-6 ${theme === 'dark' ? 'border-cyan-500/15' : 'border-slate-100'}`}>
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2.5"
            >
              <img src={logo} alt="" className="h-10 w-auto object-contain" />
              <span className="text-start">
                <span className={`block text-base font-extrabold leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  CAR-SILA
                </span>
                <span className="text-[10px] font-bold tracking-wider text-cyan-400">
                  {arabic ? 'الإدارة' : 'ADMIN'}
                </span>
              </span>
            </button>
          </div>

          <nav className="space-y-1.5 p-4 text-sm font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500 font-bold text-[#041018]'
                      : theme === 'dark'
                      ? 'text-slate-300 hover:bg-[#0a2430] hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-[#041018] text-cyan-200' : 'bg-cyan-500/15 text-cyan-200'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`space-y-3 border-t p-4 ${theme === 'dark' ? 'border-cyan-500/15' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-bold text-cyan-200">
              AD
            </div>
            <div className="min-w-0 flex-1 text-start">
              <p className={`truncate text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {currentUser?.name || 'CAR-SILA'}
              </p>
              <p className="text-[10px] text-slate-500">{arabic ? 'إدارة المنصة' : 'Platform admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2">
            <button type="button" onClick={toggleTheme} className={`rounded-lg border p-1.5 ${controlClass}`} title={theme === 'dark' ? t('lightMode') : t('darkMode')}>
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className={`rounded-lg border p-1.5 ${controlClass}`} title={arabic ? 'English' : 'العربية'}>
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
            </button>
          </div>
          <button
            type="button"
            onClick={logout}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
              theme === 'dark' ? 'text-slate-300 hover:bg-rose-950/30 hover:text-rose-300' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            <LogOut className="h-4 w-4 rtl:rotate-180" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <div className={`sticky top-0 z-30 border-b md:hidden ${
        theme === 'dark' ? 'border-cyan-500/15 bg-[#061820]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex h-14 items-center justify-between gap-2 px-3">
          <button type="button" onClick={() => setCurrentView('landing')} className="flex min-w-0 items-center gap-2">
            <img src={logo} alt="" className="h-8 w-auto shrink-0 object-contain" />
            <span className="truncate text-lg font-black">CAR-SILA</span>
          </button>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={toggleTheme} className={`flex h-9 w-9 items-center justify-center rounded-lg border ${controlClass}`} aria-label={t('toggleTheme')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className={`flex h-9 w-9 items-center justify-center rounded-lg border ${controlClass}`} aria-label="Language">
              <Globe className="h-4 w-4 text-cyan-400" />
            </button>
            <button type="button" onClick={logout} className={`flex h-9 w-9 items-center justify-center rounded-lg border ${controlClass}`} aria-label={t('logout')}>
              <LogOut className="h-4 w-4" />
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
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${
                  isActive ? 'bg-cyan-500 text-[#041018]' : theme === 'dark' ? 'bg-[#0a2430] text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
                {item.badge ? <span>{item.badge}</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <main className={`flex min-w-0 flex-1 flex-col overflow-y-auto md:max-h-screen ${
        theme === 'dark' ? 'bg-[#041018]' : 'bg-slate-100'
      }`}>
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
