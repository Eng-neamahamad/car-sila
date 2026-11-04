import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Car,
  Package,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { ReportStatus } from '../../types';

export const AdminReportsView: React.FC = () => {
  const { reports, updateReportStatus, t, language, showToast } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredReports = reports.filter((r) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchCat = filterCategory === 'all' || r.category === filterCategory;
    return matchStatus && matchCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-start text-slate-100">
      {/* Header (Screen 20 top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('adminReports')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            {language === 'ar' ? 'الرقابة الشاملة على كافة البلاغات والملاحظات عبر النظام.' : 'Oversight, triage, and resolution controls for all vehicle incidents.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">{language === 'ar' ? 'كل الحالات (All Status)' : 'All Statuses'}</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">{language === 'ar' ? 'كل الفئات (All Categories)' : 'All Categories'}</option>
            <option value="blocking">Blocking</option>
            <option value="lights">Lights</option>
            <option value="accident">Accident</option>
            <option value="lost_item">Lost Item</option>
          </select>
        </div>
      </div>

      {/* REPORTS TABLE (Screen 20) */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/80">
              <tr>
                <th className="px-5 py-4">Report Details</th>
                <th className="px-5 py-4">Vehicle</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-end">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <h4 className="font-extrabold text-white text-xs">{rep.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm line-clamp-1">
                        "{rep.description}"
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-300">
                    {rep.vehiclePlate}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {rep.hasLocation ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                        <MapPin className="w-3 h-3" />
                        {rep.location?.addressName || 'Provided'}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Not shared</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {rep.timestamp}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.status === 'new'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : rep.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {rep.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      {rep.status !== 'resolved' ? (
                        <button
                          onClick={() => {
                            updateReportStatus(rep.id, 'resolved');
                            showToast(`Report #${rep.id} marked as resolved`, 'success');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateReportStatus(rep.id, 'in_progress');
                            showToast(`Report #${rep.id} reopened`, 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}
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