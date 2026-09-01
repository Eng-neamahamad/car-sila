import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Server,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AdminSecurityView: React.FC = () => {
  const { language, t, showToast } = useApp();

  const auditLogs = [
    { id: 'log-1', action: 'QR_SCAN_RESOLVE', target: 'Toyota Corolla (22-12345)', ip: '192.168.1.42', status: 'SUCCESS', time: '2 mins ago' },
    { id: 'log-2', action: 'ANONYMOUS_CHAT_INIT', target: 'Conv #c-1', ip: '172.56.21.90', status: 'SUCCESS', time: '12 mins ago' },
    { id: 'log-3', action: 'RATE_LIMIT_PREVENT', target: 'Spam Scan Detection', ip: '45.33.12.11', status: 'BLOCKED', time: '45 mins ago' },
    { id: 'log-4', action: 'TOKEN_SALT_ROTATE', target: 'System Auto-Rotation', ip: 'internal-vault', status: 'SUCCESS', time: '2 hours ago' },
    { id: 'log-5', action: 'USER_LOGIN', target: 'ahmed@carsila.com', ip: '82.102.24.1', status: 'SUCCESS', time: '4 hours ago' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-start text-slate-100">
      {/* Header (Screen 21 top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('adminSecurity')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            {language === 'ar' ? 'سجلات الأمان والتشفير وحماية الخصوصية ومنع الاحتيال.' : 'Cryptographic key management, zero-leak routing, and firewall telemetry.'}
          </p>
        </div>

        <button
          onClick={() => showToast('Cryptographic salts re-synchronized', 'success')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{language === 'ar' ? 'مزامنة مفاتيح التشفير' : 'Rotate Cryptographic Salts'}</span>
        </button>
      </div>

      {/* 3 SECURITY STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zero-Leak Guard</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white">100% Enforced</h3>
          <p className="text-xs text-slate-400">
            Direct phone numbers are never stored in plain text or rendered on public DOM.
          </p>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QR Token Expiry</span>
            <Key className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black text-white">Dynamic Salt</h3>
          <p className="text-xs text-slate-400">
            Vehicles can regenerate new tokens at any time, instantly invalidating stolen copies.
          </p>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spam Shield</span>
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-2xl font-black text-white">Rate-Limited</h3>
          <p className="text-xs text-slate-400">
            Max 3 reports per IP/hour per car to prevent spamming vehicle owners.
          </p>
        </div>
      </div>

      {/* SECURITY AUDIT LOGS */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 shadow-lg overflow-hidden space-y-4 p-6">
        <h3 className="text-base font-extrabold text-white">
          {language === 'ar' ? 'سجل العمليات والتدقيق الأمني' : 'Real-time Security Audit Log'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/80">
              <tr>
                <th className="px-4 py-3">Event Action</th>
                <th className="px-4 py-3">Target Context</th>
                <th className="px-4 py-3">Origin IP</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-end">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/30 transition-colors font-mono">
                  <td className="px-4 py-3 font-bold text-white">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-sans">
                    {log.target}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {log.ip}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-sans">
                    {log.time}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {log.status}
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