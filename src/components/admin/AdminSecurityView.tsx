import React from 'react';
import { Database, LogOut, Mail, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatWhen } from './labels';

export const AdminSecurityView: React.FC = () => {
  const { language, mailReady, reports, activities, logout } = useApp();
  const arabic = language === 'ar';
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const reportsToday = reports.filter((report) => new Date(report.createdAt).getTime() >= start.getTime()).length;
  const attempts = [...activities]
    .filter((item) => item.type === 'login_failed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  const attemptLabel = (subtitle: string) => {
    if (subtitle === 'دخول الإدارة') return arabic ? 'دخول الإدارة' : 'Admin entry';
    if (subtitle === 'حساب موقوف') return arabic ? 'حساب موقوف' : 'Suspended account';
    return arabic ? 'دخول الحساب' : 'Account sign-in';
  };

  const cards = [
    {
      label: arabic ? 'قاعدة البيانات' : 'Database',
      value: arabic ? 'متصلة' : 'Connected',
      icon: Database
    },
    {
      label: arabic ? 'إرسال البريد' : 'Email delivery',
      value: mailReady === null ? (arabic ? 'غير معروف' : 'Unknown') : mailReady ? (arabic ? 'جاهز' : 'Ready') : (arabic ? 'غير مُعد' : 'Not configured'),
      icon: Mail
    },
    {
      label: arabic ? 'بلاغات اليوم' : 'Reports today',
      value: String(reportsToday),
      icon: ShieldAlert
    }
  ];

  return (
    <div className="space-y-6 text-start text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black sm:text-3xl">{arabic ? 'التشغيل' : 'Operations'}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {arabic
              ? 'حالة الخدمات وآخر محاولات الدخول الفاشلة، من غير كلمات سر.'
              : 'Service status and recent failed sign-in attempts, without passwords.'}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 px-4 py-2.5 text-sm font-bold text-rose-200 hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4 rtl:rotate-180" />
          {arabic ? 'تسجيل الخروج' : 'Log out'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-3xl border border-cyan-500/15 bg-[#061820] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{card.label}</span>
                <Icon className="h-4 w-4 text-cyan-300" />
              </div>
              <p className="text-2xl font-black">{card.value}</p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-[#061820]">
        <h2 className="border-b border-cyan-500/10 px-5 py-4 text-base font-black">
          {arabic ? 'محاولات الدخول الفاشلة' : 'Failed sign-in attempts'}
        </h2>
        {attempts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400">{arabic ? 'لا توجد محاولات فاشلة.' : 'No failed attempts.'}</p>
        ) : (
          <ul className="divide-y divide-cyan-500/10">
            {attempts.map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="text-sm font-bold">{attemptLabel(attempt.subtitle)}</span>
                <time className="text-xs text-slate-400">{formatWhen(attempt.createdAt, arabic)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
