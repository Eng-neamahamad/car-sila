import React, { useEffect, useState } from 'react';
import { Timer, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';

const choices = [5, 10, 15, 30];

const remaining = (iso?: string) => {
  if (!iso) return 0;
  return Math.max(0, new Date(iso).getTime() - Date.now());
};

const clock = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const QuickReturn: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const { language, setQuickReturn } = useApp();
  const ar = language === 'ar';
  const [left, setLeft] = useState(() => remaining(vehicle.returnAt));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLeft(remaining(vehicle.returnAt));
    if (!vehicle.returnAt) return;
    const timer = window.setInterval(() => setLeft(remaining(vehicle.returnAt)), 1000);
    return () => window.clearInterval(timer);
  }, [vehicle.returnAt]);

  const choose = async (minutes: number) => {
    setBusy(true);
    await setQuickReturn(vehicle.id, minutes);
    setBusy(false);
  };

  const active = left > 0;

  return (
    <div className="rounded-3xl border border-amber-400/30 bg-[#1a1408] p-4 text-start">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-[#1a1408]">
          <Timer className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-white">{ar ? 'سأعود قريباً' : 'Back shortly'}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-100">
            {ar
              ? 'إذا وقفت في مكان ضيق، فعّل العدّاد. من يمسح الرمز يرى الوقت المتبقي مع اعتذار لطيف.'
              : 'If you stop in a tight spot, start the timer. Anyone who scans the code sees the remaining time and a short apology.'}
          </p>
        </div>
      </div>
      {active && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/25 px-3 py-2">
          <span className="font-mono text-2xl font-black text-amber-300">{clock(left)}</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void choose(0)}
            className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white cursor-pointer disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            {ar ? 'إيقاف' : 'Stop'}
          </button>
        </div>
      )}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {choices.map((minutes) => (
          <button
            key={minutes}
            type="button"
            disabled={busy}
            onClick={() => void choose(minutes)}
            className={`rounded-xl py-2 text-xs font-black cursor-pointer disabled:opacity-50 ${
              minutes === 15 ? 'bg-amber-400 text-[#1a1408]' : 'border border-amber-400/30 text-amber-100'
            }`}
          >
            {minutes}{ar ? ' د' : 'm'}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ReturnCountdown: React.FC<{
  returnAt?: string;
  language: 'ar' | 'en';
}> = ({ returnAt, language }) => {
  const [left, setLeft] = useState(() => remaining(returnAt));

  useEffect(() => {
    setLeft(remaining(returnAt));
    if (!returnAt) return;
    const timer = window.setInterval(() => setLeft(remaining(returnAt)), 1000);
    return () => window.clearInterval(timer);
  }, [returnAt]);

  if (left <= 0) return null;
  const ar = language === 'ar';

  return (
    <div className="rounded-3xl border border-amber-400/40 bg-[#1a1408] p-4 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
        {ar ? 'السائق سيعود قريباً' : 'The driver will be back shortly'}
      </p>
      <p className="mt-2 font-mono text-4xl font-black text-amber-300">{clock(left)}</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-50">
        {ar
          ? 'عذراً على الإزعاج. التوقف قصير، والسيّارة ستتحرك بانتهاء العدّاد. شكراً لصبرك.'
          : 'Sorry for the inconvenience. This stop is short, and the car will move when the timer ends. Thank you for waiting.'}
      </p>
    </div>
  );
};
