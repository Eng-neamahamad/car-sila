import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  FileText,
  Bell,
  CheckCircle2,
  ChevronRight,
  Plus,
  QrCode,
  ArrowUpRight
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    vehicles,
    reports,
    notifications,
    activities,
    setCurrentView,
    setAddVehicleModalOpen,
    t,
    language
  } = useApp();

  const newReports = reports.filter((r) => r.status === 'new');
  const inProgressReports = reports.filter((r) => r.status === 'in_progress');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const unreadAlertsCount = notifications.filter((n) => !n.isRead).length;

  const totalReports = reports.length;
  const newCount = newReports.length;
  const inProgressCount = inProgressReports.length;
  const resolvedCount = resolvedReports.length;

  const statCards = [
    {
      value: vehicles.length,
      label: t('vehicles'),
      hint: t('totalVehicles'),
      icon: Car,
      iconClass: 'bg-cyan-500/20 text-cyan-300',
      view: 'my-vehicles' as const
    },
    {
      value: newCount,
      label: t('reports'),
      hint: t('newReports'),
      icon: FileText,
      iconClass: 'bg-sky-500/20 text-sky-300',
      view: 'reports' as const
    },
    {
      value: unreadAlertsCount,
      label: language === 'ar' ? 'التنبيهات' : 'Alerts',
      hint: t('unreadAlerts'),
      icon: Bell,
      iconClass: 'bg-sky-500/20 text-sky-300',
      view: 'notifications' as const
    },
    {
      value: resolvedCount,
      label: t('resolved'),
      hint: t('allTime'),
      icon: CheckCircle2,
      iconClass: 'bg-emerald-500/20 text-emerald-300',
      view: 'reports' as const
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-start">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-r from-[#042028] via-[#063040] to-[#041820] min-h-[168px]">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
          alt=""
          className="pointer-events-none absolute inset-y-0 end-0 h-full w-[42%] object-cover object-center [mask-image:linear-gradient(to_left,black_62%,transparent)] rtl:[mask-image:linear-gradient(to_right,black_62%,transparent)]"
        />
        <div className="relative z-10 max-w-xl p-4 sm:p-8">
          <h1 className="text-xl sm:text-4xl font-black text-white tracking-tight leading-snug">
            {language === 'ar'
              ? <>مرحباً بعودتك، <span className="text-cyan-300">{currentUser?.name || 'صديقنا'}</span>! 👋</>
              : <>Welcome back, <span className="text-cyan-300">{currentUser?.name || 'User'}</span>! 👋</>}
          </h1>
          <div className="mt-3 h-1 w-16 rounded-full bg-cyan-400" />
          <p className="text-sm text-cyan-100/80 mt-4 font-medium">{t('dashboardSubhead')}</p>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => setCurrentView(card.view)}
              className="text-start rounded-2xl border border-cyan-500/15 bg-[#0a2430] p-3 sm:p-4 shadow-lg shadow-black/20 hover:border-cyan-400/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <div className={`h-9 w-9 shrink-0 rounded-2xl flex items-center justify-center sm:h-11 sm:w-11 ${card.iconClass}`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-black text-white leading-none sm:text-2xl">{card.value}</p>
                    <p className="mt-1 truncate text-[11px] font-bold text-white sm:text-xs">{card.label}</p>
                    <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">{card.hint}</p>
                  </div>
                </div>
                <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-500 sm:block rtl:rotate-180" />
              </div>
            </button>
          );
        })}
      </div>

      {/* TWO COLUMN LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-7 bg-[#0a2430] p-6 rounded-3xl border border-cyan-500/15 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span className="text-cyan-300">⌁</span>
                {t('recentActivity')}
              </h3>
              {activities.length > 0 && (
                <button
                  onClick={() => setCurrentView('activity')}
                  className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('viewAllActivity')}</span>
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              )}
            </div>

            {/* Activity List or Clean Empty State */}
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-dashed border-cyan-400/30 bg-white/5 p-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-cyan-200 flex items-center justify-center mb-3 relative">
                  <Car className="w-7 h-7" />
                  <Plus className="w-3.5 h-3.5 absolute -top-1 -end-1" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {language === 'ar' ? 'لا توجد نشاطات أو بلاغات حالياً' : 'No activities or reports yet'}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  {language === 'ar' 
                    ? 'أضف مركبتك الأولى لتوليد ملصق QR ذكي والبدء باستقبال البلاغات بخصوصية تامة.'
                    : 'Register your first vehicle and generate your smart QR sticker to start receiving reports.'}
                </p>
                <button
                  onClick={() => setAddVehicleModalOpen(true)}
                  className="mt-4 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 text-white text-xs font-bold rounded-full shadow-md shadow-cyan-700/30 cursor-pointer flex items-center gap-1.5"
                >
                  {language === 'ar' ? '+ إضافة مركبة جديدة' : '+ Add First Vehicle'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-cyan-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        act.tagType === 'new'
                          ? 'bg-rose-500/15 text-rose-300'
                          : act.tagType === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-cyan-500/15 text-cyan-300'
                      }`}>
                        {act.type === 'qr_scanned' ? <QrCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {act.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {act.timeStr} • {act.subtitle}
                        </p>
                      </div>
                    </div>

                    {act.tagText && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        act.tagType === 'new'
                          ? 'bg-rose-500/15 text-rose-300'
                          : act.tagType === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-cyan-500/15 text-cyan-300'
                      }`}>
                        {act.tagText}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-cyan-500/15 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {language === 'ar' ? 'التحديث المباشر شغّال' : 'Live updates active'}
            </span>
            {vehicles.length > 0 && (
              <button
                onClick={() => setCurrentView('reports')}
                className="text-cyan-300 font-bold hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'عرض البلاغات' : 'View Reports'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Reports Overview Doughnut Chart */}
        <div className="lg:col-span-5 bg-[#0a2430] p-6 rounded-3xl border border-cyan-500/15 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-extrabold text-white">
                {t('reportsOverview')}
              </h3>
              <span className="text-[11px] font-bold text-slate-300 bg-white/5 border border-cyan-500/20 rounded-full px-3 py-1">
                {language === 'ar' ? 'آخر 30 يوماً' : 'Last 30 Days'}
              </span>
            </div>

            {/* Custom SVG Doughnut Chart */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <defs>
                    <linearGradient id="reportsRing" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="55%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke={totalReports > 0 ? '#0c3040' : 'url(#reportsRing)'}
                    strokeWidth="12"
                    fill="none"
                  />
                  {totalReports > 0 && (
                    <>
                      {resolvedCount > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#10B981"
                          strokeWidth="12"
                          strokeDasharray="238.7"
                          strokeDashoffset={238.7 - (resolvedCount / totalReports) * 238.7}
                          fill="none"
                          strokeLinecap="round"
                        />
                      )}
                      {inProgressCount > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#F59E0B"
                          strokeWidth="12"
                          strokeDasharray="238.7"
                          strokeDashoffset={238.7 - (inProgressCount / totalReports) * 238.7}
                          fill="none"
                          strokeLinecap="round"
                        />
                      )}
                      {newCount > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#F43F5E"
                          strokeWidth="12"
                          strokeDasharray="238.7"
                          strokeDashoffset={238.7 - (newCount / totalReports) * 238.7}
                          fill="none"
                          strokeLinecap="round"
                        />
                      )}
                    </>
                  )}
                </svg>

                {/* Center text: Total Reports */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {totalReports}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === 'ar' ? 'المجموع' : 'Total'}
                  </span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:mt-6 sm:gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-300 font-medium">{t('new')}</span>
                  <span className="font-bold text-white">{newCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-300 font-medium">{t('inProgress')}</span>
                  <span className="font-bold text-white">{inProgressCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300 font-medium">{t('resolved')}</span>
                  <span className="font-bold text-white">{resolvedCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-cyan-500/15 text-center">
            <button
              onClick={() => setCurrentView('reports')}
              className="text-xs font-bold text-cyan-100 hover:text-white flex items-center justify-center gap-1.5 w-full rounded-2xl border border-cyan-500/20 bg-white/5 py-3 cursor-pointer"
            >
              <span>{language === 'ar' ? 'إدارة كل البلاغات' : 'Manage Reports'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};