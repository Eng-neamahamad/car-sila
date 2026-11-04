import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  Car,
  Printer,
  RefreshCw,
  Clock,
  Trash2
} from 'lucide-react';
import { QRStickerCard } from '../common/QRStickerCard';

export const VehicleDetailsView: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    setCurrentView,
    updateVehicleStatus,
    regenerateQRToken,
    deleteVehicle,
    setPrintModalVehicle,
    activities,
    language
  } = useApp();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  if (!vehicle) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500 font-bold">{language === 'ar' ? 'لم يتم العثور على المركبة' : 'Vehicle not found'}</p>
        <button
          onClick={() => setCurrentView('my-vehicles')}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs"
        >
          {language === 'ar' ? 'الرجوع إلى مركباتي' : 'Back to My Vehicles'}
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteVehicle(vehicle.id);
    setCurrentView('my-vehicles');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-start">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('my-vehicles')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-300 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{language === 'ar' ? 'الرجوع إلى مركباتي' : 'Back to My Vehicles'}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {language === 'ar' ? 'الحالة:' : 'Status:'}
            </span>
            <select
              value={vehicle.status}
              onChange={(e) => updateVehicleStatus(vehicle.id, e.target.value as any)}
              className="text-xs font-bold bg-[#041820] border border-cyan-500/20 rounded-lg px-2.5 py-1 text-white focus:outline-none"
            >
              <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="dnd">{language === 'ar' ? 'عدم الإزعاج' : 'Do Not Disturb'}</option>
              <option value="maintenance">{language === 'ar' ? 'في الصيانة' : 'In Maintenance'}</option>
            </select>
          </div>

          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'حذف المركبة' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0a2430] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-cyan-500/20 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-500/15 text-rose-300 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {language === 'ar' ? 'تأكيد حذف المركبة' : 'Delete Vehicle?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ar' 
                  ? `هل أنت متأكد من حذف ${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})؟`
                  : `Are you sure you want to delete this vehicle?`}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-cyan-500/20 text-slate-300 text-xs font-bold hover:bg-white/5 cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                {language === 'ar' ? 'نعم، حذف' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0a2430] rounded-3xl p-6 sm:p-7 border border-cyan-500/20 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 px-2.5 py-1 rounded-md">
                  {vehicle.brand}
                </span>
                <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {vehicle.year} • {vehicle.color}
                </p>
              </div>

              <div className="p-3 bg-cyan-500/15 text-white rounded-2xl">
                <Car className="w-6 h-6 text-cyan-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#041820] rounded-2xl border border-cyan-500/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'رقم اللوحة' : 'Plate Number'}
                </span>
                <span className="text-sm font-mono font-black text-white mt-1 block">
                  {vehicle.plateNumber}
                </span>
              </div>

              <div className="p-3.5 bg-[#041820] rounded-2xl border border-cyan-500/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'إجمالي المسحات' : 'Total Scans'}
                </span>
                <span className="text-sm font-extrabold text-cyan-300 mt-1 block">
                  {vehicle.scansCount}
                </span>
              </div>

              <div className="p-3.5 bg-[#041820] rounded-2xl border border-cyan-500/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'البلاغات' : 'Reports'}
                </span>
                <span className="text-sm font-extrabold text-amber-300 mt-1 block">
                  {vehicle.reportsCount}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  {language === 'ar' ? 'ملصق QR الذكي' : 'Smart QR Sticker'}
                </h4>
                <button
                  onClick={() => regenerateQRToken(vehicle.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-cyan-300 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'ar' ? 'تجديد الرمز' : 'Regenerate'}</span>
                </button>
              </div>

              <QRStickerCard vehicle={vehicle} />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setPrintModalVehicle(vehicle)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'ar' ? 'طباعة الملصق' : 'Print Sticker'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a2430] rounded-3xl p-6 border border-cyan-500/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-white">
                {language === 'ar' ? 'سجل النشاط للمركبة' : 'Vehicle Activity Log'}
              </h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {activities
                .filter((a) => !a.vehicleId || a.vehicleId === vehicle.id)
                .slice(0, 5)
                .map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-[#041820] border border-cyan-500/10 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">{act.title}</p>
                      <p className="text-[11px] text-slate-500">{act.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                      {act.timeStr}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};