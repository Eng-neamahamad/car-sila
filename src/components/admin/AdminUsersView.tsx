import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatWhen, statusLabel } from './labels';

export const AdminUsersView: React.FC = () => {
  const { users, language, toggleUserStatus } = useApp();
  const [search, setSearch] = useState('');
  const arabic = language === 'ar';
  const owners = users.filter((user) => user.role === 'owner');
  const query = search.trim().toLowerCase();
  const visible = owners.filter((user) =>
    !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6 text-start text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black sm:text-3xl">{arabic ? 'الحسابات' : 'Accounts'}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {arabic
              ? 'إيقاف الحساب يمنع دخوله ولا يحذف سياراته.'
              : 'Suspending an account blocks sign-in and keeps its vehicles.'}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={arabic ? 'بحث بالاسم أو البريد' : 'Search by name or email'}
            className="w-full rounded-xl border border-cyan-500/20 bg-[#0a2430] py-2.5 pe-3 ps-10 text-sm outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-[#061820]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead className="bg-[#041018] text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-bold">{arabic ? 'الاسم' : 'Name'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'البريد' : 'Email'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'السيارات' : 'Vehicles'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'تاريخ التسجيل' : 'Joined'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-end font-bold">{arabic ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    {arabic ? 'لا توجد حسابات مطابقة.' : 'No matching accounts.'}
                  </td>
                </tr>
              ) : visible.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-bold">{user.name}</td>
                  <td className="px-4 py-3 text-slate-300">{user.email}</td>
                  <td className="px-4 py-3">{user.vehiclesCount}</td>
                  <td className="px-4 py-3 text-slate-300">{formatWhen(user.createdAt, arabic)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      user.status === 'inactive'
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-cyan-500/15 text-cyan-200'
                    }`}>
                      {statusLabel(user.status, arabic)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(user.id)}
                      className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-black text-[#041018] hover:bg-cyan-400"
                    >
                      {user.status === 'inactive'
                        ? (arabic ? 'تشغيل' : 'Restore')
                        : (arabic ? 'إيقاف' : 'Suspend')}
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
