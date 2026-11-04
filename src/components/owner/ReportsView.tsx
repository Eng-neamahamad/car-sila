import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  AlertTriangle,
  Lightbulb,
  Car,
  Package,
  PhoneCall,
  MapPin,
  CheckCircle2,
  Clock,
  MessageSquare,
  X,
  ChevronRight,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { Report, ReportStatus } from '../../types';

export const ReportsView: React.FC = () => {
  const {
    reports,
    selectedReportId,
    setSelectedReportId,
    updateReportStatus,
    setActiveConversationId,
    setCurrentView,
    conversations,
    t,
    language
  } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');

  const filteredReports = reports.filter((r) => {
    if (filterTab === 'all') return true;
    return r.status === filterTab;
  });

  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blocking':
        return { icon: Car, color: 'bg-rose-500/15 text-rose-300 border-rose-500/20' };
      case 'lights':
        return { icon: Lightbulb, color: 'bg-amber-500/15 text-amber-300 border-amber-500/20' };
      case 'accident':
        return { icon: AlertTriangle, color: 'bg-red-500/15 text-red-300 border-red-500/20' };
      case 'lost_item':
        return { icon: Package, color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' };
      default:
        return { icon: PhoneCall, color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' };
    }
  };

  const handleOpenChat = (rep: Report) => {
    const conv = conversations.find((c) => c.reportId === rep.id);
    if (conv) {
      setActiveConversationId(conv.id);
    }
    setSelectedReportId(null);
    setCurrentView('messages');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-start">
      {/* Header (Screen 11 top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('reports')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {language === 'ar' ? 'البلاغات والتنبيهات الواردة من الماسحين حول سياراتك.' : 'Incoming notifications and alerts from scanners.'}
          </p>
        </div>
      </div>

      {/* TABS (Screen 11: All, New, In Progress, Resolved) */}
      <div className="flex w-full items-center gap-1 overflow-x-auto p-1.5 bg-[#0a2430] rounded-2xl sm:w-fit sm:gap-2">
        {(['all', 'new', 'in_progress', 'resolved'] as const).map((tab) => {
          const isActive = filterTab === tab;
          const count = reports.filter((r) => tab === 'all' || r.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 sm:px-4 sm:text-xs ${
                isActive
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>
                {tab === 'all'
                  ? t('all')
                  : tab === 'new'
                  ? t('new')
                  : tab === 'in_progress'
                  ? t('inProgress')
                  : t('resolved')}
              </span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* REPORTS LIST (Screen 11) */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-[#0a2430] rounded-3xl p-12 text-center border border-cyan-500/20">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">
              {language === 'ar' ? 'لا توجد بلاغات في هذا القسم حالياً.' : 'No reports found in this tab.'}
            </p>
          </div>
        ) : (
          filteredReports.map((rep) => {
            const { icon: CatIcon, color: iconColor } = getCategoryIcon(rep.category);

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className="bg-[#0a2430] p-5 rounded-3xl border border-cyan-500/20 shadow-sm hover:shadow-md hover:border-cyan-400 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconColor} group-hover:scale-105 transition-transform`}>
                    <CatIcon className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {rep.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        • {rep.vehiclePlate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                      {rep.description}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                      {rep.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rep.status === 'new'
                      ? 'bg-rose-500/15 text-rose-300'
                      : rep.status === 'in_progress'
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                  }`}>
                    {rep.status === 'new' ? t('new') : rep.status === 'in_progress' ? t('inProgress') : t('resolved')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REPORT DETAILS MODAL (Screen 12) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0a2430] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cyan-500/20 relative overflow-hidden text-start">
            {/* Close Button */}
            <button
              onClick={() => setSelectedReportId(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedReport.status === 'new'
                    ? 'bg-rose-500/15 text-rose-300'
                    : selectedReport.status === 'in_progress'
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-emerald-500/15 text-emerald-300'
                }`}>
                  {selectedReport.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedReport.timestamp}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {selectedReport.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedReport.vehicleName} • {selectedReport.vehiclePlate}
              </p>
            </div>

            {/* Description Box (Screen 12) */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {t('description')}
              </label>
              <div className="p-4 rounded-2xl bg-[#041820] border border-cyan-500/20 text-slate-100 text-sm leading-relaxed">
                "{selectedReport.description}"
              </div>
            </div>

            {/* Location Map View if available (Screen 12) */}
            {selectedReport.hasLocation && (
              <div className="space-y-1.5 mb-5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('location')}</span>
                </label>
                <div className="h-28 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div className="flex flex-col items-center animate-bounce">
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 mt-1 rounded bg-slate-900 text-white font-bold text-[10px]">
                      {selectedReport.location?.addressName || 'University Parking Block B'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reporter Footnote */}
            <div className="p-3 bg-[#041820] rounded-2xl border border-cyan-500/10 flex items-center justify-between text-xs text-slate-300 mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{t('reporter')}: {selectedReport.reporterName || t('anonymous')}</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-200">{selectedReport.vehiclePlate}</span>
            </div>

            {/* Action Buttons (Screen 12: Reply, Mark as Resolved) */}
            <div className="flex items-center gap-3 pt-3 border-t border-cyan-500/10">
              <button
                onClick={() => handleOpenChat(selectedReport)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('reply')}</span>
              </button>

              {selectedReport.status !== 'resolved' ? (
                <button
                  onClick={() => {
                    updateReportStatus(selectedReport.id, 'resolved');
                    setSelectedReportId(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('markAsResolved')}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    updateReportStatus(selectedReport.id, 'in_progress');
                    setSelectedReportId(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-cyan-500/30 text-slate-200 font-bold text-xs hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span>{t('markAsInProgress')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};