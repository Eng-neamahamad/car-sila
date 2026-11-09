import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { readLocationChoice, saveLocationChoice } from '../../lib/locationChoice';

const locate = () => new Promise<{ lat: number; lng: number }>((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('unsupported'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
    () => reject(new Error('denied')),
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 }
  );
});

const savePoint = (where: { lat: number; lng: number }) => fetch('/api/sos/help', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ active: true, ...where })
});

export const LocationConsent: React.FC = () => {
  const { currentUser, language } = useApp();
  const arabic = language === 'ar';
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const owner = currentUser?.role === 'owner' && currentUser.status === 'active';

  useEffect(() => {
    if (!owner || !currentUser?.id) return;
    const choice = readLocationChoice();
    if (!choice) {
      setOpen(true);
      return;
    }
    if (choice !== 'yes') return;
    locate().then((where) => savePoint(where)).catch(() => undefined);
  }, [owner, currentUser?.id]);

  if (!open) return null;

  const answer = async (yes: boolean) => {
    if (!yes) {
      saveLocationChoice('no');
      setOpen(false);
      return;
    }
    try {
      const where = await locate();
      const saved = await savePoint(where);
      if (!saved.ok) throw new Error('save');
      saveLocationChoice('yes');
      setOpen(false);
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => undefined);
      }
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <section className="w-full max-w-md rounded-3xl border border-cyan-400/30 bg-[#041820] p-5 text-start text-white shadow-2xl">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-[#041018]">
          <MapPin className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-black">{arabic ? 'تفعيل الموقع لمرة واحدة' : 'Enable location once'}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {arabic
            ? 'موقعك بيضل مخفي، وما بيظهر لأي شخص إنك قريب. بنستخدمه فقط إذا سيارة قريبة طلبت مساعدة، وبوصلك إشعار تختار فيه تساعد أو لا.'
            : 'Your location stays hidden, and nobody is told that you are nearby. It is used only when a nearby car asks for help, and you get a notice to help or decline.'}
        </p>
        {failed && (
          <p className="mt-3 text-xs font-bold text-rose-200">
            {arabic ? 'المتصفح ما سمح بالموقع. اسمح له من إعدادات الجوال، أو اختَر لا شكراً.' : 'The browser did not allow location. Allow it in the phone settings, or choose no thanks.'}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => void answer(true)} className="flex-1 rounded-2xl bg-cyan-500 py-3 text-sm font-black text-[#041018]">
            {arabic ? 'فعّل موقعي' : 'Enable my location'}
          </button>
          <button type="button" onClick={() => void answer(false)} className="flex-1 rounded-2xl border border-white/15 py-3 text-sm font-bold text-slate-200">
            {arabic ? 'لا، شكراً' : 'No thanks'}
          </button>
        </div>
      </section>
    </div>
  );
};
