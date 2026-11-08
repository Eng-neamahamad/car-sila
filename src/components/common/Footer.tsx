import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Linkedin, Mail } from 'lucide-react';
import logo from '../../assets/logo.png';

export const Footer: React.FC = () => {
  const { setCurrentView, currentView, t, language } = useApp();

  const handleNavClick = (sectionId?: string) => {
    if (!sectionId) {
      if (currentView !== 'landing') {
        setCurrentView('landing');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const scrollToSection = () => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(scrollToSection, 100);
    } else {
      scrollToSection();
    }
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand & Slogan */}
        <div className="space-y-4">
          <div 
            onClick={() => handleNavClick()}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <img src={logo} alt="" className="h-11 w-auto object-contain group-hover:scale-105 transition-transform" />
            <span className="text-xl font-extrabold text-white tracking-tight">CAR-SILA</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            {language === 'ar' 
              ? 'المنصة الذكية الأولى لربط السائقين وأصحاب السيارات بخصوصية تامة ودون الحاجة للكشف عن رقم هاتفك.' 
              : 'The leading smart platform connecting drivers and vehicle owners with complete privacy.'}
          </p>
          <p className="text-xs text-slate-500">
            {t('allRightsReserved')}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <button onClick={() => handleNavClick()} className="hover:text-cyan-300 transition-colors cursor-pointer">
                {t('home')}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('how-it-works-section')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                {t('howItWorks')}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('features-section')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                {t('features')}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('contact-section')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                {t('contact')}
              </button>
            </li>
          </ul>
        </div>

        {/* Support & Privacy */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            {language === 'ar' ? 'الأمان والخصوصية' : 'Trust & Security'}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <button onClick={() => handleNavClick('faq-section')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                {language === 'ar' ? 'مركز المساعدة والأسئلة' : 'FAQ & Help Center'}
              </button>
            </li>
            <li>
              <span className="hover:text-cyan-300 cursor-pointer transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'ar' ? 'سياسة الخصوصية المشفرة' : 'Privacy Policy'}</span>
              </span>
            </li>
            <li>
              <span className="hover:text-cyan-300 cursor-pointer transition-colors">
                {language === 'ar' ? 'شروط الخدمة والضمان' : 'Terms of Service'}
              </span>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            {language === 'ar' ? 'تابعنا وتواصل معنا' : 'Social Channels'}
          </h4>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li>
              <a
                href="https://wa.me/970597112357"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" fill="currentColor" aria-hidden="true">
                  <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5zM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 21zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.2-.4a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.6 4c.5.2 1 .4 1.5.5a3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.3z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/neama-hamad-9a3482392?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sky-400 hover:text-sky-300 transition-colors group"
              >
                <Linkedin className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
                <span>LinkedIn</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:neamahamad2003@gmail.com"
                className="flex items-center gap-2.5 text-rose-400 hover:text-rose-300 transition-colors group"
              >
                <Mail className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                <span>Gmail</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
