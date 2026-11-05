import React, { useEffect, useState } from 'react';
import { AlertTriangle, Car, CheckCircle2, Eye, LifeBuoy, MessageSquare, ShieldCheck, UserPlus, UserX, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityEvent, AppView } from '../../types';
import { eventLabel, formatWhen, hideContact } from './labels';

const parseWhen = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const withinDays = (value: string, days: number) => {
  const date = parseWhen(value);
  if (!date) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return date.getTime() >= start.getTime();
};

const dailyCounts = (days: number, values: string[]) => {
  const counts = Array.from({ length: days }, () => 0);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  values.forEach((value) => {
    const date = parseWhen(value);
    if (!date) return;
    const index = Math.floor((date.getTime() - start.getTime()) / 86400000);
    if (index >= 0 && index < days) counts[index] += 1;
  });
  return counts;
};

const Sparkline: React.FC<{ points: number[] }> = ({ points }) => {
  const width = 140;
  const height = 32;
  const max = Math.max(...points, 1);
  const line = points.map((value, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - 4 - (value / max) * (height - 8);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-8 w-full" aria-hidden>
      <polyline fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={line} />
    </svg>
  );
};

const ActivityChart: React.FC<{ points: number[]; labels: string[] }> = ({ points, labels }) => {
  const width = 640;
  const height = 190;
  const max = Math.max(...points, 1);
  const coords = points.map((value, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - 18 - (value / max) * (height - 36);
    return { x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(' ');
  const labelStep = Math.max(1, Math.ceil(labels.length / 7));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full" role="img">
      {[0, 1, 2, 3].map((row) => (
        <line key={row} x1="0" x2={width} y1={18 + row * 42} y2={18 + row * 42} stroke="rgba(34,211,238,0.12)" />
      ))}
      <polyline fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={line} />
      {coords.map((point, index) => (
        <circle key={labels[index] + index} cx={point.x} cy={point.y} r="4" fill="#041018" stroke="#22d3ee" strokeWidth="2" />
      ))}
      {labels.map((label, index) => index % labelStep === 0 ? (
        <text key={label + index} x={coords[index].x} y={height - 2} textAnchor="middle" fill="#94a3b8" fontSize="11">
          {label}
        </text>
      ) : null)}
    </svg>
  );
};

export const AdminOverviewView: React.FC = () => {
  const { currentUser, vehicles, reports, users, conversations, activities, visitors, setCurrentView, language } = useApp();
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [openCalls, setOpenCalls] = useState(0);
  useEffect(() => {
    let stop = false;
    const load = () => {
      fetch('/api/sos/summary', { credentials: 'include' })
        .then((response) => response.ok ? response.json() : { open: 0 })
        .then((body) => {
          if (!stop) setOpenCalls(Number(body.open) || 0);
        })
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, 15000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);
  const arabic = language === 'ar';
  const owners = users.filter((user) => user.role === 'owner');
  const activeOwners = owners.filter((user) => user.status !== 'inactive');
  const suspendedOwners = owners.filter((user) => user.status === 'inactive');
  const freshReports = reports.filter((report) => report.status === 'new');
  const openChats = conversations.filter((conversation) => conversation.status === 'open');
  const liveEvents = activities.filter((item) => item.type !== 'login_failed');
  const events = [...liveEvents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const visibleEvents = events.slice(0, showAllEvents ? 40 : 10);
  const name = (currentUser?.name || '').trim().split(/\s+/).filter(Boolean).at(-1) || (arabic ? 'الإدارة' : 'Admin');

  const cards: {
    label: string;
    value: number;
    week: number;
    icon: React.ComponentType<{ className?: string }>;
    view: AppView;
    points: number[];
  }[] = [
    {
      label: arabic ? 'الزوار' : 'Visitors',
      value: visitors.total,
      week: visitors.week,
      icon: Eye,
      view: 'admin-overview',
      points: visitors.points.length === 7 ? visitors.points : [0, 0, 0, 0, 0, 0, 0]
    },
    {
      label: arabic ? 'الحسابات' : 'Accounts',
      value: owners.length,
      week: owners.filter((user) => withinDays(user.createdAt, 7)).length,
      icon: Users,
      view: 'admin-users',
      points: dailyCounts(7, owners.map((user) => user.createdAt))
    },
    {
      label: arabic ? 'السيارات' : 'Vehicles',
      value: vehicles.length,
      week: vehicles.filter((vehicle) => withinDays(vehicle.createdAt, 7)).length,
      icon: Car,
      view: 'admin-vehicles',
      points: dailyCounts(7, vehicles.map((vehicle) => vehicle.createdAt))
    },
    {
      label: arabic ? 'البلاغات الجديدة' : 'New reports',
      value: freshReports.length,
      week: freshReports.filter((report) => withinDays(report.createdAt, 7)).length,
      icon: AlertTriangle,
      view: 'admin-reports',
      points: dailyCounts(7, reports.map((report) => report.createdAt))
    },
    {
      label: arabic ? 'المحادثات المفتوحة' : 'Open chats',
      value: openChats.length,
      week: openChats.filter((conversation) => conversation.messages.some((message) => withinDays(message.createdAt, 7))).length,
      icon: MessageSquare,
      view: 'admin-reports',
      points: dailyCounts(7, openChats.flatMap((conversation) => conversation.messages.slice(0, 1).map((message) => message.createdAt)))
    },
    {
      label: arabic ? 'الحسابات الموقوفة' : 'Suspended accounts',
      value: suspendedOwners.length,
      week: 0,
      icon: UserX,
      view: 'admin-users',
      points: dailyCounts(7, [])
    },
    {
      label: arabic ? 'نداءات المساعدة' : 'Help calls',
      value: openCalls,
      week: 0,
      icon: LifeBuoy,
      view: 'admin-overview',
      points: [0, 0, 0, 0, 0, 0, 0]
    }
  ];

  const chartCounts = dailyCounts(range, liveEvents.map((event) => event.createdAt));
  const chartLabels = chartCounts.map((_, index) => {
    const day = new Date();
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() - (range - 1 - index));
    return day.toLocaleDateString(arabic ? 'ar' : 'en', range === 7
      ? { weekday: 'short' }
      : { month: 'short', day: 'numeric' });
  });
  const totalOwners = owners.length;
  const ring = 2 * Math.PI * 42;
  const activeLength = totalOwners ? (activeOwners.length / totalOwners) * ring : 0;
  const suspendedLength = totalOwners ? (suspendedOwners.length / totalOwners) * ring : 0;

  const openEvent = (event: ActivityEvent) => {
    if (event.type === 'vehicle_added') setCurrentView('admin-vehicles');
    else if (event.type === 'account_registered') setCurrentView('admin-users');
    else setCurrentView('admin-reports');
  };

  const eventIcon = (type: ActivityEvent['type']) => {
    if (type === 'vehicle_added') return Car;
    if (type === 'account_registered') return UserPlus;
    if (type === 'report_resolved') return CheckCircle2;
    if (type === 'chat_started') return MessageSquare;
    return AlertTriangle;
  };

  return (
    <div className="space-y-5 text-start text-white">
      <section className="relative min-h-[168px] overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-r from-[#042028] via-[#063040] to-[#041820]">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
          alt=""
          className="pointer-events-none absolute inset-y-0 end-0 h-full w-[42%] object-cover object-center [mask-image:linear-gradient(to_left,black_55%,transparent)] rtl:[mask-image:linear-gradient(to_right,black_55%,transparent)]"
        />
        <div className="relative z-10 max-w-xl p-5 sm:p-8">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            {arabic ? 'إدارة المنصة' : 'Platform administration'}
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">
            {arabic ? `أهلاً بعودتك، ${name}` : `Welcome back, ${name}`}
          </h1>
          <p className="mt-2 max-w-md border-s-2 border-cyan-400 ps-3 text-sm text-slate-300">
            {arabic ? 'هذا ما يحدث على المنصة اليوم.' : "Here's what's happening with your platform today."}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => setCurrentView(card.view)}
              className="rounded-2xl border border-cyan-500/15 bg-[#061820] p-4 text-start transition hover:border-cyan-400"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                  <Icon className="h-4 w-4" />
                </span>
                {card.week > 0 && (
                  <span title={arabic ? 'خلال آخر 7 أيام' : 'In the last 7 days'} className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-200">
                    +{card.week}
                  </span>
                )}
              </div>
              <div className="mt-3 text-2xl font-black">{card.value}</div>
              <div className="text-xs font-bold text-slate-400">{card.label}</div>
              <Sparkline points={card.points} />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <section className="rounded-3xl border border-cyan-500/15 bg-[#061820] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black">{arabic ? 'حركة المنصة' : 'Platform activity'}</h2>
            <div className="flex rounded-full bg-[#041018] p-1">
              {([7, 30, 90] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRange(days)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${range === days ? 'bg-cyan-500 text-[#041018]' : 'text-slate-400'}`}
                >
                  {days}{arabic ? 'ي' : 'd'}
                </button>
              ))}
            </div>
          </div>
          <ActivityChart points={chartCounts} labels={chartLabels} />
        </section>

        <section className="rounded-3xl border border-cyan-500/15 bg-[#061820] p-5">
          <h2 className="text-base font-black">{arabic ? 'ملخص الحسابات' : 'Accounts overview'}</h2>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative h-36 w-36 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
                <circle cx="60" cy="60" r="42" fill="none" stroke="#0a2430" strokeWidth="12" />
                <circle cx="60" cy="60" r="42" fill="none" stroke="#22d3ee" strokeWidth="12" strokeDasharray={`${activeLength} ${ring - activeLength}`} />
                <circle cx="60" cy="60" r="42" fill="none" stroke="#fb7185" strokeWidth="12" strokeDasharray={`${suspendedLength} ${ring - suspendedLength}`} strokeDashoffset={-activeLength} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{totalOwners}</span>
                <span className="text-[11px] text-slate-400">{arabic ? 'المجموع' : 'Total'}</span>
              </div>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                {arabic ? 'نشط' : 'Active'}
                <span className="font-black">{activeOwners.length}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                {arabic ? 'موقوف' : 'Suspended'}
                <span className="font-black">{suspendedOwners.length}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-[#061820]">
        <div className="flex items-center justify-between gap-3 border-b border-cyan-500/10 px-5 py-4">
          <h2 className="text-base font-black">{arabic ? 'آخر عشرة أحداث' : 'Latest ten events'}</h2>
          {events.length > 10 && (
            <button type="button" onClick={() => setShowAllEvents((current) => !current)} className="text-xs font-bold text-cyan-300">
              {showAllEvents ? (arabic ? 'عرض أقل' : 'Show less') : (arabic ? 'عرض كل الأحداث' : 'View all events')}
            </button>
          )}
        </div>
        {visibleEvents.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400">
            {arabic ? 'أي حساب جديد أو سيارة أو بلاغ رح يظهر هنا.' : 'A new account, vehicle, or report will show up here.'}
          </p>
        ) : (
          <ul className="divide-y divide-cyan-500/10">
            {visibleEvents.map((event) => {
              const Icon = eventIcon(event.type);
              return (
                <li key={event.id}>
                  <button type="button" onClick={() => openEvent(event)} className="flex w-full items-center gap-3 px-5 py-3 text-start hover:bg-cyan-500/5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black">{eventLabel(event.type, arabic)}</span>
                      <span className="block truncate text-xs text-slate-400">{hideContact(event.subtitle || event.vehicleName || '')}</span>
                    </span>
                    <time className="shrink-0 text-xs text-slate-500">{formatWhen(event.createdAt, arabic)}</time>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
