import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Phone } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

type GoogleIdClient = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    ux_mode?: 'popup' | 'redirect';
    context?: 'signin' | 'signup' | 'use';
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};

function loadGoogleId(): Promise<GoogleIdClient> {
  const ready = () => (window as Window & { google?: { accounts?: { id?: GoogleIdClient } } }).google?.accounts?.id;
  const existing = ready();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const finish = () => {
      const googleId = ready();
      if (googleId) resolve(googleId);
      else reject(new Error('google-missing'));
    };
    const current = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');
    if (current) {
      if (ready()) finish();
      else {
        current.addEventListener('load', finish, { once: true });
        current.addEventListener('error', () => reject(new Error('google-script')), { once: true });
      }
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.googleIdentity = 'true';
    script.onload = finish;
    script.onerror = () => reject(new Error('google-script'));
    document.head.appendChild(script);
  });
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { currentView, setCurrentView, login, register, loginWithGoogle, t, language, theme, showToast } = useApp();
  const isRegister = currentView === 'register' || initialMode === 'register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleAuthRef = useRef({ loginWithGoogle, showToast, language });
  googleAuthRef.current = { loginWithGoogle, showToast, language };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
    const parent = googleButtonRef.current;
    if (!clientId || !parent) return;
    let cancelled = false;

    loadGoogleId()
      .then((googleId) => {
        if (cancelled || !googleButtonRef.current) return;
        googleId.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          callback: (response) => {
            const actions = googleAuthRef.current;
            if (!response.credential) {
              actions.showToast(
                actions.language === 'ar' ? 'تعذر قراءة حساب Google المختار' : 'Could not read the selected Google account',
                'error'
              );
              return;
            }
            actions.loginWithGoogle(response.credential);
          },
        });
        parent.replaceChildren();
        const width = Math.min(Math.max(parent.clientWidth, 280), 400);
        googleId.renderButton(parent, {
          type: 'standard',
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width,
          logo_alignment: 'center',
        });
      })
      .catch(() => {
        if (cancelled) return;
        googleAuthRef.current.showToast(
          googleAuthRef.current.language === 'ar'
            ? 'تعذر فتح زر حسابات Google'
            : 'Could not open the Google account button',
          'error'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [theme]);

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
      if (!phone.trim()) {
        showToast(language === 'ar' ? 'يرجى إدخال رقم الجوال' : 'Please enter your phone number', 'warning');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        showToast(
          language === 'ar' ? 'البريد لازم يكون فيه @ مثل name@gmail.com' : 'The email needs an @ sign, like name@gmail.com',
          'warning'
        );
        return;
      }
      if (password.trim().length < 6) {
        showToast(
          language === 'ar' ? 'كلمة المرور لازم تكون 6 أحرف على الأقل' : 'The password must be at least 6 characters',
          'warning'
        );
        return;
      }
      if (password !== confirmPassword) {
        showToast(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'warning');
        return;
      }
      register(name.trim(), email.trim(), password, phone.trim());
    } else {
      if (!email.trim()) {
        showToast(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email', 'warning');
        return;
      }
      if (!password.trim()) {
        showToast(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password', 'warning');
        return;
      }
      login(email.trim(), password);
    }
  };

  return (
    <div className={`min-h-[90vh] w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      <div className={`w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border transition-colors ${
        theme === 'dark' ? 'bg-[#0a2430] border-cyan-500/20' : 'bg-white border-slate-200'
      }`}>
        
        {/* LEFT COLUMN: AUTH FORM */}
        <div className={`lg:col-span-6 p-4 sm:p-10 flex flex-col justify-between text-start ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
        }`}>
          <div>
            {/* Header Title */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black tracking-tight sm:text-3xl">
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
                          ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {isRegister && (
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {language === 'ar' ? 'رقم الجوال' : 'Phone number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: 059XXXXXXXX' : '+970 59 XXX XXXX'}
                      className={`w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        theme === 'dark' 
                          ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500' 
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
                        ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500' 
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
                      className="text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer"
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
                        ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500' 
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
                          ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500' 
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
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-xl transition-all cursor-pointer mt-3 flex items-center justify-center gap-2 ${
                  isRegister
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-600/30'
                }`}
              >
                <span>{isRegister ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account') : t('login')}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-cyan-500/15' : 'border-slate-200'}`}></div>
              </div>
              <span className={`relative px-3 text-xs font-semibold uppercase ${
                theme === 'dark' ? 'bg-[#0a2430] text-slate-500' : 'bg-white text-slate-400'
              }`}>
                {t('or')}
              </span>
            </div>

            <div ref={googleButtonRef} className="flex min-h-11 w-full justify-center"></div>
          </div>

          {/* Bottom Switch Link */}
          <div className={`mt-8 text-center text-xs pt-4 border-t ${
            theme === 'dark' ? 'border-cyan-500/15 text-slate-400' : 'border-slate-100 text-slate-500'
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
                  className="font-bold text-cyan-400 hover:underline cursor-pointer"
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
            src="/demo-car.webp"
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