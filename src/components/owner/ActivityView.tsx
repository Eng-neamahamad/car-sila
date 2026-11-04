import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  QrCode,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Car,
  Calendar
} from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { activities, t, language } = useApp();

  const todayActivities = activities.filter((a) => a.dateGroup === 'today');
  const yesterdayActivities = activities.filter((a) => a.dateGroup === 'yesterday');
  const earlierActivities = activities.filter((a) => a.dateGroup === 'earlier');

  const renderGroup = (title: string, list: typeof activities) => {
    if (list.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          {title}
        </h3>
        <div className="bg-[#0a2430] rounded-3xl border border-cyan-500/20 shadow-sm overflow-hidden divide-y divide-cyan-500/10">
          {list.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between gap-3 p-3 hover:bg-white/5 transition-colors sm:gap-4 sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="text-end min-w-[70px]">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {act.timeStr}
                  </span>
                </div>

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  act.tagType === 'new'
                    ? 'bg-rose-500/15 text-rose-300'
                    : act.tagType === 'resolved'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-cyan-500/15 text-cyan-300'
                }`}>
                  {act.type === 'qr_scanned' ? <QrCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-sm font-extrabold text-white">
                    {act.title}
                  </h4>
                  <p className="truncate text-xs text-slate-500 font-medium">
                    {act.subtitle} {act.vehicleName && `• ${act.vehicleName}`}
                  </p>
                </div>
              </div>

              {act.tagText && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn text-start">
      {/* Header (Screen 15 top) */}
      <div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('activity')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          {language === 'ar' ? 'سجل زمني متكامل لكل التفاعلات والمسح والبلاغات.' : 'Comprehensive chronological activity timeline.'}
        </p>
      </div>

      {/* Activity Timeline Groups (Screen 15) */}
      <div className="space-y-6">
        {renderGroup(language === 'ar' ? 'اليوم (Today)' : 'Today', todayActivities)}
        {renderGroup(language === 'ar' ? 'أمس (Yesterday)' : 'Yesterday', yesterdayActivities)}
        {renderGroup(language === 'ar' ? 'سابقاً (Earlier)' : 'Earlier', earlierActivities)}
      </div>
    </div>
  );
};