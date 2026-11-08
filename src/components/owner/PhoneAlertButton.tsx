import React, { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../data/api';
import { enablePhoneAlert, phoneAlertReady } from '../../lib/phoneAlert';

export const PhoneAlertButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language } = useApp();
  const ar = language === 'ar';
  const [state, setState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    let gone = false;
    void phoneAlertReady().then((next) => {
      if (!gone) setState(next);
    });
    return () => {
      gone = true;
    };
  }, []);

  const enable = async () => {
    setBusy(true);
    setProblem('');
    try {
      setState(await enablePhoneAlert());
    } catch (error) {
      setState('default');
      const unavailable = error instanceof ApiError && error.code === 'push_unavailable';
      setProblem(unavailable
        ? (ar ? 'الرنين غير جاهز على السيرفر. مفاتيح التنبيه غير مضبوطة بعد.' : 'Phone alerts are not ready on the server yet. The alert keys are missing.')
        : (ar ? 'تعذر تفعيل الرنين. اسمح بالإشعارات ثم أعد المحاولة.' : 'The alert could not be turned on. Allow notifications and try again.'));
    } finally {
      setBusy(false);
    }
  };

  if (state === 'granted') {
    return (
      <p className="text-[11px] font-bold text-emerald-300">
        {ar ? 'رنين الجوال مفعّل. الاتصال يظهر حتى والموقع مغلق.' : 'Phone alerts are on, even when the site is closed.'}
      </p>
    );
  }

  const note = state === 'unsupported'
    ? (ar ? 'هذا المتصفح لا يدعم تنبيه الجوال.' : 'This browser cannot show phone alerts.')
    : state === 'denied'
    ? (ar ? 'التنبيه مرفوض من إعدادات المتصفح. اسمح بالإشعارات ثم أعد المحاولة.' : 'Notifications are blocked in the browser settings. Allow them and try again.')
    : (ar
      ? 'فعّل الرنين مرة واحدة. بعدها الجوال يطلع التنبيه ويصدر صوتاً حتى وأنت خارج الموقع. على آيفون أضف الموقع إلى الشاشة الرئيسية.'
      : 'Turn this on once. The phone then shows the alert and plays a sound even when the site is closed. On iPhone, add the site to the Home Screen.');

  return (
    <div className={compact ? 'flex flex-col gap-2 sm:flex-row sm:items-center' : 'space-y-3'}>
      <p className="text-[11px] leading-relaxed text-slate-300">{note}</p>
      {problem && <p className="text-[11px] font-bold text-rose-300">{problem}</p>}
      {state !== 'unsupported' && state !== 'denied' && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void enable()}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white cursor-pointer disabled:opacity-60"
        >
          <BellRing className="h-3.5 w-3.5" />
          {busy ? (ar ? 'جارٍ التفعيل...' : 'Turning on...') : (ar ? 'تفعيل رنين الجوال' : 'Turn on phone alerts')}
        </button>
      )}
    </div>
  );
};
