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
import { PhoneAlertButton } from './PhoneAlertButton';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    language,
    setLanguage,
    logout,
    t
  } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Ahmed Al-Masri');
  const [email, setEmail] = useState(currentUser?.email || 'ahmed@carsila.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [privateMode, setPrivateMode] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) updateProfile(name, email);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-start max-w-3xl">
      {/* Header (Screen 16 top) */}
      <div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('settings')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          {language === 'ar' ? 'إدارة بيانات الحساب والخصوصية وتفضيلات الإشعارات.' : 'Manage account details, privacy controls, and preferences.'}
        </p>
      </div>

      {/* Profile & Account Settings Form */}
      <div className="bg-[#0a2430] rounded-3xl p-6 sm:p-8 border border-cyan-500/20 shadow-sm space-y-6">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-300" />
          <span>{t('account')}</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-[#041820] border border-cyan-500/20 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-[#041820] border border-cyan-500/20 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Preferences & Notifications Section */}
      <div className="bg-[#0a2430] rounded-3xl p-6 sm:p-8 border border-cyan-500/20 shadow-sm space-y-5">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>{language === 'ar' ? 'التفضيلات والإشعارات' : 'Preferences & Notifications'}</span>
        </h3>

        <div className="space-y-4 divide-y divide-cyan-500/10 text-sm">
          <div className="pt-3">
            <h4 className="font-bold text-white">{language === 'ar' ? 'رنين الجوال' : 'Phone ring'}</h4>
            <div className="mt-2">
              <PhoneAlertButton />
            </div>
          </div>

          {/* Email Notifications */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">{t('emailNotifications')}</h4>
              <p className="text-xs text-slate-500">{language === 'ar' ? 'استلام بريد عند ورود بلاغ عاجل' : 'Receive instant email alert on new reports'}</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-5 h-5 text-cyan-400 rounded border-cyan-500/30 focus:ring-cyan-400 cursor-pointer"
            />
          </div>

          {/* Language Switcher */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">{t('language')}</h4>
              <p className="text-xs text-slate-500">{language === 'ar' ? 'اللغة الحالية: العربية' : 'Current Language: English'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'bg-[#041820] text-slate-300 hover:bg-white/10'
                }`}
              >
                English 🇬🇧
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'ar'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'bg-[#041820] text-slate-300 hover:bg-white/10'
                }`}
              >
                العربية 🇵🇸
              </button>
            </div>
          </div>

          {/* Privacy Level */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white flex items-center gap-1.5">
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
      <div className="flex flex-col gap-3 rounded-3xl border border-cyan-500/20 bg-[#0a2430] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center font-bold text-xs">
            CS
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">CAR-SILA Platform</h4>
            <p className="text-[11px] text-slate-500">v1.0.0 • Smart Vehicle Communication</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{t('logout')}</span>
        </button>
      </div>

    </div>
  );
};