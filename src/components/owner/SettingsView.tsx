import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Lock,
  Bell,
  Globe,
  ShieldCheck,
  Info,
  LogOut,
  ChevronRight,
  Check,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    language,
    setLanguage,
    logout,
    showToast,
    t
  } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Ahmed Al-Masri');
  const [email, setEmail] = useState(currentUser?.email || 'ahmed@carsila.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [privateMode, setPrivateMode] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      setCurrentUser({ ...currentUser, name, email });
      showToast(language === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Settings saved successfully', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-start max-w-3xl">
      {/* Header (Screen 16 top) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('settings')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          {language === 'ar' ? 'إدارة بيانات الحساب والخصوصية وتفضيلات الإشعارات.' : 'Manage account details, privacy controls, and preferences.'}
        </p>
      </div>

      {/* Profile & Account Settings Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>{t('account')}</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Preferences & Notifications Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>{language === 'ar' ? 'التفضيلات والإشعارات' : 'Preferences & Notifications'}</span>
        </h3>

        <div className="space-y-4 divide-y divide-slate-100 text-sm">
          {/* Email Notifications */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">{t('emailNotifications')}</h4>
              <p className="text-xs text-slate-500">{language === 'ar' ? 'استلام بريد عند ورود بلاغ عاجل' : 'Receive instant email alert on new reports'}</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Language Switcher */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">{t('language')}</h4>
              <p className="text-xs text-slate-500">{language === 'ar' ? 'اللغة الحالية: العربية' : 'Current Language: English'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                English 🇬🇧
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'ar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                العربية 🇵🇸
              </button>
            </div>
          </div>

          {/* Privacy Level */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('privacySettings')}</span>
              </h4>
              <p className="text-xs text-slate-500">{language === 'ar' ? 'إخفاء رقم الهاتف والمعلومات الشخصية دائماً' : 'Enforce zero-phone disclosure mode'}</p>
            </div>
            <input
              type="checkbox"
              checked={privateMode}
              onChange={(e) => setPrivateMode(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* About & System Version */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            CS
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">CAR-SILA Platform</h4>
            <p className="text-[11px] text-slate-500">v1.0.0 • Smart Vehicle Communication</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{t('logout')}</span>
        </button>
      </div>

    </div>
  );
};