import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportStatus } from '../../types';
import { categoryLabel, formatWhen, hideContact, statusLabel } from './labels';

export const AdminReportsView: React.FC = () => {
  const { reports, language } = useApp();
  const [filter, setFilter] = useState<'all' | ReportStatus>('all');
  const arabic = language === 'ar';
  const visible = [...reports]
    .filter((report) => filter === 'all' || report.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 text-start text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black sm:text-3xl">{arabic ? 'البلاغات' : 'Reports'}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {arabic
              ? 'للمراقبة فقط. الرد يبقى بين المالك والمرسل.'
              : 'Monitoring only. Replies stay between the owner and the sender.'}
          </p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as 'all' | ReportStatus)}
          className="rounded-xl border border-cyan-500/20 bg-[#0a2430] px-3 py-2.5 text-sm outline-none"
        >
          <option value="all">{arabic ? 'كل الحالات' : 'All statuses'}</option>
          <option value="new">{statusLabel('new', arabic)}</option>
          <option value="in_progress">{statusLabel('in_progress', arabic)}</option>
          <option value="resolved">{statusLabel('resolved', arabic)}</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-[#061820]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-start text-sm">
            <thead className="bg-[#041018] text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-bold">{arabic ? 'السيارة' : 'Vehicle'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'اللوحة' : 'Plate'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'السبب' : 'Reason'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'الملاحظة' : 'Note'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'الوقت' : 'Time'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    {arabic ? 'لا توجد بلاغات في هذا التصنيف.' : 'No reports in this filter.'}
                  </td>
                </tr>
              ) : visible.map((report) => (
                <tr key={report.id}>
                  <td className="px-4 py-3 font-bold">{report.vehicleName}</td>
                  <td className="px-4 py-3 font-mono">{report.vehiclePlate}</td>
                  <td className="px-4 py-3">{categoryLabel(report.category, arabic)}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-300">{hideContact(report.description || report.title)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatWhen(report.createdAt, arabic)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      report.status === 'new'
                        ? 'bg-rose-500/15 text-rose-300'
                        : report.status === 'in_progress'
                        ? 'bg-amber-500/15 text-amber-200'
                        : 'bg-cyan-500/15 text-cyan-200'
                    }`}>
                      {statusLabel(report.status, arabic)}
                    </span>
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
