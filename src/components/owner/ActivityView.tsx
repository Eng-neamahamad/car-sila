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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {list.map((act) => (
            <div
              key={act.id}
              className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-end min-w-[70px]">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {act.timeStr}
                  </span>
                </div>

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  act.tagType === 'new'
                    ? 'bg-rose-100 text-rose-600'
                    : act.tagType === 'resolved'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {act.type === 'qr_scanned' ? <QrCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {act.subtitle} {act.vehicleName && `• ${act.vehicleName}`}
                  </p>
                </div>
              </div>

              {act.tagText && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn text-start">
      {/* Header (Screen 15 top) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
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