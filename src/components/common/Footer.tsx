import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Facebook, Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react';

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
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              CS
            </div>
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
              <button onClick={() => handleNavClick()} className="hover:text-blue-400 transition-colors cursor-pointer">
                {t('home')}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('how-it-works-section')} className="hover:text-blue-400 transition-colors cursor-pointer">
                {t('howItWorks')}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('features-section')} className="hover:text-blue-400 transition-colors cursor-pointer">
                {t('features')}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('pricing-section')} className="hover:text-blue-400 transition-colors cursor-pointer">
                {t('pricing')}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('contact-section')} className="hover:text-blue-400 transition-colors cursor-pointer">
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
              <button onClick={() => handleNavClick('faq-section')} className="hover:text-blue-400 transition-colors cursor-pointer">
                {language === 'ar' ? 'مركز المساعدة والأسئلة' : 'FAQ & Help Center'}
              </button>
            </li>
            <li>
              <span className="hover:text-blue-400 cursor-pointer transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'ar' ? 'سياسة الخصوصية المشفرة' : 'Privacy Policy'}</span>
              </span>
            </li>
            <li>
              <span className="hover:text-blue-400 cursor-pointer transition-colors">
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
                href="https://www.instagram.com/neama.2003?igsi=c2R2a3JkYWkwcTV0" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2.5 text-pink-400 hover:text-pink-300 transition-colors group"
              >
                <Instagram className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
                <span>Instagram (neama.2003)</span>
              </a>
            </li>
            <li>
              <a 
                href="https://www.facebook.com/share/1EkY2rrv5e/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2.5 text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <Facebook className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>Facebook Profile</span>
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
                <span>LinkedIn (Neama Hamad)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
