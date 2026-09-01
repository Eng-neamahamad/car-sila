import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  Search,
  QrCode,
  Eye,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Printer
} from 'lucide-react';

export const AdminVehiclesView: React.FC = () => {
  const { vehicles, setPrintModalVehicle, t, language, showToast } = useApp();
  const [search, setSearch] = useState('');

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn text-start text-slate-100">
      {/* Header (Screen 19 top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('adminVehicles')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            {language === 'ar' ? 'سجل كافة المركبات المسجلة وأكواد QR الخاصة بها.' : 'Global fleet directory and cryptographic token monitoring.'}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث برقم اللوحة أو الموديل...' : 'Search plate or model...'}
            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* VEHICLES DIRECTORY TABLE (Screen 19) */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/80">
              <tr>
                <th className="px-5 py-4">Vehicle</th>
                <th className="px-5 py-4">Plate Number</th>
                <th className="px-5 py-4">Owner ID</th>
                <th className="px-5 py-4">Total Scans</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-end">QR Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-purple-400">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-xs">
                          {v.brand} {v.model}
                        </h4>
                        <p className="text-[11px] text-slate-400">{v.year} • {v.color}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-white text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                      {v.plateNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                    {v.ownerId}
                  </td>
                  <td className="px-5 py-4 font-bold text-purple-400">
                    {v.scansCount} scans
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPrintModalVehicle(v)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Print QR</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};