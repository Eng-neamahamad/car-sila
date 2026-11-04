import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, QrCode, Globe, LayoutDashboard, Sun, Moon, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, language, setLanguage, theme, toggleTheme, t, setActiveScanVehicle } = useApp();

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
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (view: 'landing' | 'login' | 'register' | 'dashboard' | 'admin-overview' | 'qr-scan') => {
    if (view === 'qr-scan') setActiveScanVehicle(null);
    setCurrentView(view);
    setMenuOpen(false);
    if (view === 'landing') {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
  };

  const scrollTo = (sectionId?: string) => {
    const run = () => {
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };
    setMenuOpen(false);
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(run, 100);
    } else {
      run();
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-slate-950/90 border-slate-800/80 text-white'
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div 
          onClick={() => goTo('landing')}
          className="flex min-w-0 items-center gap-2 cursor-pointer group select-none"
        >
          <img
            src={logo}
            alt="CAR-SILA"
            className="h-8 w-auto shrink-0 object-contain md:h-12 group-hover:scale-105 transition-transform"
          />
          <span className={`truncate text-lg font-black tracking-tight md:text-2xl ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            CAR-SILA
          </span>
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
              className={`hover:text-cyan-400 transition-colors cursor-pointer ${currentView === 'landing' ? 'text-cyan-400 font-bold' : ''}`}
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
              className="hover:text-cyan-400 transition-colors cursor-pointer"
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
              className="hover:text-cyan-400 transition-colors cursor-pointer"
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
              className="hover:text-cyan-400 transition-colors cursor-pointer"
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
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {t('contact')}
            </button>
          </nav>
        )}

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-2.5 sm:gap-3">
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
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Quick Simulator Buttons */}
          <button
            onClick={() => goTo('qr-scan')}
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
                  onClick={() => goTo('admin-overview')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs font-semibold hover:bg-purple-600/30 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>{t('adminPanel')}</span>
                </button>
              ) : (
                <button
                  onClick={() => goTo('dashboard')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 hover:bg-cyan-400 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('dashboard')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => goTo('login')}
                className={`text-sm font-medium px-3 py-1.5 transition-colors ${
                  theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {t('login')}
              </button>
              <button
                onClick={() => goTo('register')}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/50 transition-all"
              >
                {t('getStarted')}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={`md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            theme === 'dark' ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-100 text-slate-800'
          }`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && !isOwnerView && !isAdminView && (
        <div className={`md:hidden border-t px-3 py-3 space-y-1 ${
          theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
        }`}>
          {[
            { label: t('home'), run: () => scrollTo() },
            { label: t('howItWorks'), run: () => scrollTo('how-it-works-section') },
            { label: t('features'), run: () => scrollTo('features-section') },
            { label: t('pricing'), run: () => scrollTo('pricing-section') },
            { label: t('contact'), run: () => scrollTo('contact-section') },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.run}
              className={`block w-full rounded-xl px-3 py-3 text-start text-sm font-bold ${
                theme === 'dark' ? 'text-slate-100 hover:bg-slate-900' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                theme === 'dark' ? 'border-slate-700 text-amber-400' : 'border-slate-300 text-slate-700'
              }`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-bold ${
                theme === 'dark' ? 'border-slate-700 text-slate-100' : 'border-slate-300 text-slate-800'
              }`}
            >
              <Globe className="h-4 w-4 text-cyan-400" />
              {language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => goTo('qr-scan')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 py-3 text-sm font-bold text-amber-400"
          >
            <QrCode className="h-4 w-4" />
            {language === 'ar' ? 'مسح QR (زائر)' : 'QR Visitor Mode'}
          </button>
          {currentUser ? (
            <button
              type="button"
              onClick={() => goTo(currentUser.role === 'admin' ? 'admin-overview' : 'dashboard')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white"
            >
              {currentUser.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
              {currentUser.role === 'admin' ? t('adminPanel') : t('dashboard')}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => goTo('login')} className="rounded-xl border border-slate-600 py-3 text-sm font-bold">
                {t('login')}
              </button>
              <button type="button" onClick={() => goTo('register')} className="rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white">
                {t('getStarted')}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};