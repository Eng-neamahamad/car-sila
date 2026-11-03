import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  QrCode,
  CheckCheck,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentView,
    setSelectedReportId,
    t,
    language
  } = useApp();

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'new_report':
        return { icon: AlertTriangle, color: 'bg-rose-500/15 text-rose-300' };
      case 'lights_warning':
        return { icon: Lightbulb, color: 'bg-amber-500/15 text-amber-300' };
      case 'report_resolved':
        return { icon: CheckCircle2, color: 'bg-emerald-500/15 text-emerald-300' };
      case 'chat_message':
        return { icon: MessageSquare, color: 'bg-cyan-500/15 text-cyan-300' };
      default:
        return { icon: QrCode, color: 'bg-sky-500/15 text-sky-300' };
    }
  };

  const handleClickNotif = (notif: any) => {
    markNotificationAsRead(notif.id);
    if (notif.reportId) {
      setSelectedReportId(notif.reportId);
      setCurrentView('reports');
    } else if (notif.type === 'chat_message') {
      setCurrentView('messages');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-start">
      {/* Header (Screen 14 top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('notifications')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {language === 'ar' ? 'سجل التنبيهات والإشعارات الفورية الواردة.' : 'Real-time alert logs and instant updates.'}
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a2430] border border-cyan-500/20 hover:bg-white/5 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
          <span>{t('markAllRead')}</span>
        </button>
      </div>

      {/* Notifications List (Screen 14) */}
      <div className="bg-[#0a2430] rounded-3xl border border-cyan-500/20 shadow-sm overflow-hidden divide-y divide-cyan-500/10">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">
              {language === 'ar' ? 'لا توجد إشعارات جديدة.' : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const { icon: Icon, color } = getNotifIcon(notif.type);

            return (
              <div
                key={notif.id}
                onClick={() => handleClickNotif(notif)}
                className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-white/5 ${
                  !notif.isRead ? 'bg-cyan-500/10' : 'bg-transparent'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-extrabold text-white">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                      {notif.timeAgo}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 rtl:rotate-180 mt-2" />
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
