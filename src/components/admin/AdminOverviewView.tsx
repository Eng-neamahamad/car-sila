import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Users, Car, QrCode, AlertTriangle } from 'lucide-react';

export const AdminOverviewView: React.FC = () => {
  const { adminStats, vehicles, reports, users, setCurrentView } = useApp();

  return (
    <div className="space-y-8 p-4 sm:p-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 to-slate-900 p-6 sm:p-8 rounded-3xl border border-purple-500/20 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>بوابة الإشراف والرقابة المركزية</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">لوحة المراقبة العامة للمنصة</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          متابعة النشاط الكلي، المركبات المضافة، وسرعة الاستجابة للبلاغات والملصقات في الوقت الفعلي.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setCurrentView('admin-users')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">المستخدمين المسجلين</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{users.length || adminStats.totalUsers}</div>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">نشط وموثق</span>
        </div>

        <div 
          onClick={() => setCurrentView('admin-vehicles')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">المركبات والملصقات</span>
            <Car className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500">{vehicles.length || adminStats.totalVehicles}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">ملصق QR نشط</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">إجمالي عمليات المسح</span>
            <QrCode className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{adminStats.totalScans}</div>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">+15% تفاعل مرتفع</span>
        </div>

        <div 
          onClick={() => setCurrentView('admin-reports')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">البلاغات الواردة</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-500">{reports.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">نسبة الحل {adminStats.resolvedReportsRate}%</span>
        </div>

      </div>

    </div>
  );
};