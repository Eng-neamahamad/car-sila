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
  ArrowUpRight,
  Clock
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

  return (
    <div className="space-y-8 animate-fadeIn text-start">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ar' 
              ? `مرحباً بك، ${currentUser?.name || 'نعمة'}! 👋` 
              : `Welcome back, ${currentUser?.name || 'User'}! 👋`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {t('dashboardSubhead')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddVehicleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addVehicle')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div 
          onClick={() => setCurrentView('my-vehicles')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {vehicles.length}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-slate-900">{t('vehicles')}</h4>
          <p className="text-[11px] text-slate-500">{t('totalVehicles')}</p>
        </div>

        <div 
          onClick={() => setCurrentView('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {newCount}
            </span>
            {newCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                {t('new')}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                0
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-900">{t('reports')}</h4>
          <p className="text-[11px] text-slate-500">{t('newReports')}</p>
        </div>

        <div 
          onClick={() => setCurrentView('notifications')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {unreadAlertsCount}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Alerts</h4>
          <p className="text-[11px] text-slate-500">{t('unreadAlerts')}</p>
        </div>

        <div 
          onClick={() => setCurrentView('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {resolvedCount}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-slate-900">{t('resolved')}</h4>
          <p className="text-[11px] text-slate-500">{t('allTime')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-extrabold text-slate-900">
                {t('recentActivity')}
              </h3>
              {activities.length > 0 && (
                <button
                  onClick={() => setCurrentView('activity')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('viewAllActivity')}</span>
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              )}
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Car className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {language === 'ar' ? 'لا توجد نشاطات أو بلاغات حالياً' : 'No activities or reports yet'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  {language === 'ar' 
                    ? 'أضف مركبتك الأولى لتوليد ملصق QR ذكي والبدء باستقبال البلاغات بخصوصية تامة.'
                    : 'Register your first vehicle and generate your smart QR sticker to start receiving reports.'}
                </p>
                <button
                  onClick={() => setAddVehicleModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {language === 'ar' ? '+ إضافة مركبة جديدة' : '+ Add First Vehicle'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        act.tagType === 'new'
                          ? 'bg-rose-100 text-rose-600'
                          : act.tagType === 'resolved'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {act.type === 'qr_scanned' ? <QrCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
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
                          ? 'bg-rose-100 text-rose-700'
                          : act.tagType === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {act.tagText}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {language === 'ar' ? 'يتم التحديث بشكل فوري ومباشر' : 'Live updates active'}
            </span>
            {vehicles.length > 0 && (
              <button
                onClick={() => setCurrentView('reports')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'عرض البلاغات' : 'View Reports'}
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-6">
              {t('reportsOverview')}
            </h3>

            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#F1F5F9"
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

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {totalReports}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-600 font-medium">{t('new')}</span>
                  <span className="font-bold text-slate-900">{newCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-600 font-medium">{t('inProgress')}</span>
                  <span className="font-bold text-slate-900">{inProgressCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 font-medium">{t('resolved')}</span>
                  <span className="font-bold text-slate-900">{resolvedCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentView('reports')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 w-full cursor-pointer"
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