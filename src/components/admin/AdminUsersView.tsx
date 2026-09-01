import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Car,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Mail
} from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const { users, t, language, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'admin'>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-start text-slate-100">
      {/* Header (Screen 18 top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('adminUsers')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            {language === 'ar' ? 'إدارة حسابات المستخدمين وصلاحياتهم ومركباتهم المسجلة.' : 'Manage all registered owners, admins, and scanner accounts.'}
          </p>
        </div>

        <button
          onClick={() => showToast(language === 'ar' ? 'نموذج إضافة مستخدم جاهز' : 'Add user dialog opened', 'info')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة مستخدم' : 'Add New User'}</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">{language === 'ar' ? 'كل الأدوار (All Roles)' : 'All Roles'}</option>
            <option value="owner">{language === 'ar' ? 'أصحاب سيارات (Owners)' : 'Vehicle Owners'}</option>
            <option value="admin">{language === 'ar' ? 'مسؤولين (Admins)' : 'Admins'}</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE (Screen 18) */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/80">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Vehicles</th>
                <th className="px-5 py-4">Joined Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center font-bold text-purple-300 text-xs">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-xs">{u.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      {u.vehiclesCount}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {u.createdAt}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </td>
                  <td className="px-5 py-4 text-end">
                    <button
                      onClick={() => showToast(`Selected user ${u.name}`, 'info')}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
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