import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  Plus,
  QrCode,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Vehicle } from '../../types';
import { QuickReturn } from '../common/QuickReturn';

export const MyVehiclesView: React.FC = () => {
  const {
    vehicles,
    setSelectedVehicleId,
    setCurrentView,
    setPrintModalVehicle,
    deleteVehicle,
    setAddVehicleModalOpen,
    t,
    language,
    theme
  } = useApp();

  // State for delete confirmation modal
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete.id);
      setVehicleToDelete(null);
    }
  };

  const handleOpenDetails = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setCurrentView('vehicle-details');
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {t('myVehicles')}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {language === 'ar'
              ? 'إدارة مركباتك، توليد وتحميل ملصقات QR الذكية لطباعتها ولصقها على الزجاج.'
              : 'Manage registered vehicles, generate and print encrypted QR stickers.'}
          </p>
        </div>

        <button
          onClick={() => setAddVehicleModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addVehicle')}</span>
        </button>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          theme === 'dark' ? 'bg-[#0a2430] border-cyan-500/20 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <Car className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-lg">{language === 'ar' ? 'لا توجد مركبات مسجلة' : 'No Vehicles Found'}</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {language === 'ar' ? 'أضف أول سيارة للبدء بتوليد ملصق QR الذكي فوراً.' : 'Register your first vehicle to generate its secure QR identity.'}
          </p>
          <button
            onClick={() => setAddVehicleModalOpen(true)}
            className="mt-5 px-4 py-2.5 rounded-xl bg-cyan-500 text-white text-xs font-bold cursor-pointer"
          >
            {t('addVehicle')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={`rounded-3xl border p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group ${
                theme === 'dark' ? 'bg-[#0a2430] border-cyan-500/20' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                {/* Card Top: Brand & Plate & Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center font-black text-lg">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base tracking-tight">{v.brand} {v.model}</h4>
                      <p className="text-xs text-slate-400 font-mono font-medium">{v.year} • {v.color}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    v.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {v.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'صيانة' : 'Maintenance')}
                  </span>
                </div>

                {/* Plate Badge Display */}
                <div className={`p-3 rounded-2xl border text-center font-mono font-bold tracking-widest text-base mb-5 ${
                  theme === 'dark' ? 'bg-[#041820] border-cyan-500/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  {v.plateNumber}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 mb-5 text-center">
                  <div className={`p-2.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-[#041820]/70 border-cyan-500/10' : 'bg-slate-50/60 border-slate-100'
                  }`}>
                    <p className="text-[11px] text-slate-400">{language === 'ar' ? 'عمليات المسح' : 'QR Scans'}</p>
                    <p className="text-base font-extrabold mt-0.5">{v.scansCount || 0}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-[#041820]/70 border-cyan-500/10' : 'bg-slate-50/60 border-slate-100'
                  }`}>
                    <p className="text-[11px] text-slate-400">{language === 'ar' ? 'البلاغات المستلمة' : 'Reports'}</p>
                    <p className="text-base font-extrabold mt-0.5 text-cyan-300">{v.reportsCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <QuickReturn vehicle={v} />
              </div>

              {/* Actions Footer */}
              <div className={`pt-4 border-t flex items-center justify-between gap-2 ${
                theme === 'dark' ? 'border-cyan-500/15' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPrintModalVehicle(v)}
                    className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                    title={language === 'ar' ? 'طباعة ملصق QR' : 'Print QR'}
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setVehicleToDelete(v)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white transition-colors cursor-pointer"
                    title={language === 'ar' ? 'حذف السيارة' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenDetails(v.id)}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:underline cursor-pointer"
                >
                  <span>{language === 'ar' ? 'عرض التفاصيل' : 'Details'}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className={`rounded-3xl max-w-sm w-full p-6 shadow-2xl border text-center ${
            theme === 'dark' ? 'bg-[#0a2430] border-cyan-500/20 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg mb-1">{language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</h4>
            <p className="text-xs text-slate-400 mb-6">
              {language === 'ar'
                ? `هل أنت متأكد من رغبتك بحذف السيارة (${vehicleToDelete.brand} ${vehicleToDelete.model})؟ سيتم إبطال رمز QR الخاص بها.`
                : `Are you sure you want to delete ${vehicleToDelete.brand} ${vehicleToDelete.model}? Its QR code will be invalidated.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setVehicleToDelete(null)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  theme === 'dark' ? 'border-cyan-500/20 text-slate-300' : 'border-slate-200 text-slate-600'
                }`}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {language === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};