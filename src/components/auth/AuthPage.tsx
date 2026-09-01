import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Phone } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { currentView, setCurrentView, login, register, t, language, theme, showToast } = useApp();
  const isRegister = currentView === 'register' || initialMode === 'register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isRegister) {
      if (!name.trim()) {
        showToast(language === 'ar' ? 'يرجى إدخال الاسم الكامل' : 'Please enter full name', 'warning');
        return;
      }
      if (!email.trim()) {
        showToast(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email', 'warning');
        return;
      }
      if (!password.trim()) {
        showToast(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        showToast(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'warning');
        return;
      }
      register(name.trim(), email.trim());
    } else {
      if (!email.trim()) {
        showToast(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email', 'warning');
        return;
      }
      if (!password.trim()) {
        showToast(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password', 'warning');
        return;
      }
      login(email.trim(), email.toLowerCase().includes('admin') ? 'admin' : 'owner');
    }
  };

  return (
    <div className={`min-h-[90vh] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      <div className={`w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border transition-colors ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* LEFT COLUMN: AUTH FORM */}
        <div className={`lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between text-start ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
        }`}>
          <div>
            {/* Header Title */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isRegister ? (language === 'ar' ? 'إنشاء حساب مالك مركبة' : 'Create Owner Account') : t('welcomeBack')}
              </h2>
              <p className={`text-xs sm:text-sm mt-1.5 font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isRegister 
                  ? (language === 'ar' ? 'ابدأ بحماية سيارتك وتوليد ملصقات QR المشفرة' : 'Start protecting your vehicle with encrypted QR') 
                  : t('loginToAccount')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (if register) */}
              {isRegister && (
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {t('fullName')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      className={`w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Phone (Optional for emergencies if register) */}
              {isRegister && (
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {language === 'ar' ? 'رقم الجوال (لإشعارات الطوارئ)' : 'Phone Number (Emergency Alerts)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: 059XXXXXXXX' : '+970 59 XXX XXXX'}
                      className={`w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'ar' ? 'user@example.com' : 'name@example.com'}
                    className={`w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      theme === 'dark' 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-bold ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {t('password')}
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => showToast(language === 'ar' ? 'تم إرسال رابط إعادة التعيين لبريدك' : 'Reset link sent to your email', 'info')}
                      className="text-[11px] text-blue-500 hover:underline font-semibold cursor-pointer"
                    >
                      {t('forgotPassword')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 rtl:pl-4 rtl:pr-10 pr-10 rtl:pr-4 rtl:pl-10 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      theme === 'dark' 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (if register) */}
              {isRegister && (
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {t('confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              {isRegister && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight cursor-pointer">
                    {t('agreeTerms')}
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                onClick={() => handleSubmit()}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-xl transition-all cursor-pointer mt-3 flex items-center justify-center gap-2 ${
                  isRegister
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                }`}
              >
                <span>{isRegister ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account') : t('login')}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}></div>
              </div>
              <span className={`relative px-3 text-xs font-semibold uppercase ${
                theme === 'dark' ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'
              }`}>
                {t('or')}
              </span>
            </div>

            {/* Google OAuth button */}
            <button
              type="button"
              onClick={() => {
                const userEmail = email.trim() || 'user@gmail.com';
                const userName = name.trim() || (language === 'ar' ? 'مستخدم جديد' : 'New User');
                register(userName, userEmail);
              }}
              className={`w-full py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{t('continueWithGoogle')}</span>
            </button>
          </div>

          {/* Bottom Switch Link */}
          <div className={`mt-8 text-center text-xs pt-4 border-t ${
            theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            {isRegister ? (
              <span>
                {language === 'ar' ? 'لديك حساب بالفعل؟ ' : t('alreadyHaveAccount') + ' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="font-bold text-emerald-500 hover:underline cursor-pointer"
                >
                  {language === 'ar' ? 'سجل دخولك' : t('login')}
                </button>
              </span>
            ) : (
              <span>
                {language === 'ar' ? 'ليس لديك حساب؟ ' : t('dontHaveAccount') + ' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('register')}
                  className="font-bold text-blue-500 hover:underline cursor-pointer"
                >
                  {language === 'ar' ? 'أنشئ حسابك الآن' : t('register')}
                </button>
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LUXURY VEHICLE VISUAL */}
        <div className="hidden lg:flex lg:col-span-6 relative bg-slate-950 items-center justify-center p-8 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80"
            alt="Luxury Car Taillights"
            className="absolute inset-0 w-full h-full object-cover opacity-80 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

          {/* Floating Feature Card */}
          <div className="relative z-10 max-w-sm bg-slate-900/85 backdrop-blur-md border border-slate-800 p-6 rounded-2xl text-white shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-extrabold text-sm tracking-wide">CAR-SILA SECURE</span>
            </div>
            <h4 className="text-lg font-bold">
              {language === 'ar' ? 'هوية رقمية مشفرة لسيارتك' : 'Smart Digital Identity for Your Car'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'ar'
                ? 'استقبل تنبيهات المواقف، الأنوار، والطوارئ بشكل فوري ومجهول تماماً دون الحاجة لمشاركة رقم هاتفك مع أي شخص.'
                : 'Connect with other drivers anonymously. Get real-time alerts without disclosing personal contact numbers.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;