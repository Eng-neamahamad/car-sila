import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, QrCode, User, Globe, LayoutDashboard, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, language, setLanguage, theme, toggleTheme, t, logout, setActiveScanVehicle, vehicles } = useApp();

  const isOwnerView = [
    'dashboard',
    'my-vehicles',
    'vehicle-details',
    'reports',
    'report-details',
    'messages',
    'notifications',
    'activity',
    'settings'
  ].includes(currentView);

  const isAdminView = [
    'admin-overview',
    'admin-users',
    'admin-vehicles',
    'admin-reports',
    'admin-analytics'
  ].includes(currentView);

  const isQRVisitorView = [
    'qr-scan',
    'qr-report-form',
    'qr-submitted'
  ].includes(currentView);

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-slate-950/90 border-slate-800/80 text-white'
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-lg text-white tracking-wider">CS</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              CAR-SILA
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            </span>
          </div>
        </div>

        {/* Public Desktop Nav Links */}
        {!isOwnerView && !isAdminView && (
          <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <button
              onClick={() => {
                if (currentView !== 'landing') {
                  setCurrentView('landing');
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`hover:text-blue-500 transition-colors cursor-pointer ${currentView === 'landing' ? 'text-blue-500 font-bold' : ''}`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => {
                const scrollToSection = () => {
                  const el = document.getElementById('how-it-works-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                };
                if (currentView !== 'landing') {
                  setCurrentView('landing');
                  setTimeout(scrollToSection, 100);
                } else {
                  scrollToSection();
                }
              }}
              className="hover:text-blue-500 transition-colors cursor-pointer"
            >
              {t('howItWorks')}
            </button>
            <button
              onClick={() => {
                const scrollToSection = () => {
                  const el = document.getElementById('features-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                };
                if (currentView !== 'landing') {
                  setCurrentView('landing');
                  setTimeout(scrollToSection, 100);
                } else {
                  scrollToSection();
                }
              }}
              className="hover:text-blue-500 transition-colors cursor-pointer"
            >
              {t('features')}
            </button>
            <button
              onClick={() => {
                const scrollToSection = () => {
                  const el = document.getElementById('pricing-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                };
                if (currentView !== 'landing') {
                  setCurrentView('landing');
                  setTimeout(scrollToSection, 100);
                } else {
                  scrollToSection();
                }
              }}
              className="hover:text-blue-500 transition-colors cursor-pointer"
            >
              {t('pricing')}
            </button>
            <button
              onClick={() => {
                const scrollToSection = () => {
                  const el = document.getElementById('contact-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                };
                if (currentView !== 'landing') {
                  setCurrentView('landing');
                  setTimeout(scrollToSection, 100);
                } else {
                  scrollToSection();
                }
              }}
              className="hover:text-blue-500 transition-colors cursor-pointer"
            >
              {t('contact')}
            </button>
          </nav>
        )}

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Switcher Button (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800 hover:text-amber-300 shadow-sm'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm'
            }`}
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Quick Simulator Buttons */}
          <button
            onClick={() => {
              setActiveScanVehicle(vehicles[0]);
              setCurrentView('qr-scan');
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isQRVisitorView
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ar' ? 'مسح QR (زائر)' : 'QR Visitor Mode'}</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={() => setCurrentView('admin-overview')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs font-semibold hover:bg-purple-600/30 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>{t('adminPanel')}</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('dashboard')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('login')}
                className={`text-sm font-medium px-3 py-1.5 transition-colors ${
                  theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {t('login')}
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all"
              >
                {t('getStarted')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};