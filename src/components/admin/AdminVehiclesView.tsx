import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { compactPlate, statusLabel } from './labels';

export const AdminVehiclesView: React.FC = () => {
  const { vehicles, language } = useApp();
  const [search, setSearch] = useState('');
  const arabic = language === 'ar';
  const query = compactPlate(search.trim());
  const counts = vehicles.reduce<Record<string, number>>((total, vehicle) => {
    const key = compactPlate(vehicle.plateNumber);
    total[key] = (total[key] || 0) + 1;
    return total;
  }, {});
  const visible = vehicles.filter((vehicle) => !query || compactPlate(vehicle.plateNumber).includes(query));

  return (
    <div className="space-y-6 text-start text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black sm:text-3xl">{arabic ? 'السيارات' : 'Vehicles'}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {arabic ? 'كل السيارات المسجّلة. البحث برقم اللوحة.' : 'Every registered vehicle. Search by plate.'}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={arabic ? 'رقم اللوحة' : 'Plate number'}
            className="w-full rounded-xl border border-cyan-500/20 bg-[#0a2430] py-2.5 pe-3 ps-10 text-sm outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-[#061820]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-start text-sm">
            <thead className="bg-[#041018] text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-bold">{arabic ? 'المالك' : 'Owner'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'الماركة' : 'Brand'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'الموديل' : 'Model'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'السنة' : 'Year'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'اللون' : 'Color'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'اللوحة' : 'Plate'}</th>
                <th className="px-4 py-3 font-bold">{arabic ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {arabic ? 'لا توجد سيارة بهذا الرقم.' : 'No vehicle matches this plate.'}
                  </td>
                </tr>
              ) : visible.map((vehicle) => {
                const duplicate = counts[compactPlate(vehicle.plateNumber)] > 1;
                return (
                  <tr key={vehicle.id}>
                    <td className="px-4 py-3 font-bold">{vehicle.ownerName}</td>
                    <td className="px-4 py-3">{vehicle.brand}</td>
                    <td className="px-4 py-3">{vehicle.model}</td>
                    <td className="px-4 py-3">{vehicle.year}</td>
                    <td className="px-4 py-3">{vehicle.color}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold">{vehicle.plateNumber}</span>
                      {duplicate && (
                        <span className="ms-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                          {arabic ? 'مكررة' : 'Duplicate'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        vehicle.status === 'inactive' ? 'bg-rose-500/15 text-rose-300' : 'bg-cyan-500/15 text-cyan-200'
                      }`}>
                        {statusLabel(vehicle.status, arabic)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
