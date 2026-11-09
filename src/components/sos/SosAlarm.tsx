import React, { useEffect, useRef, useState } from 'react';
import { Siren } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type SosKind = 'battery' | 'air' | 'tow';

type NearbyCall = {
  id: string;
  kind: SosKind;
  note: string;
  range: string;
  status: string;
};

const HEARD_KEY = 'carsila_sos_heard';

const readHeard = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(HEARD_KEY) || '[]');
    return new Set<string>(Array.isArray(saved) ? saved.filter((item) => typeof item === 'string') : []);
  } catch {
    return new Set<string>();
  }
};

const remember = (heard: Set<string>, id: string) => {
  heard.add(id);
  sessionStorage.setItem(HEARD_KEY, JSON.stringify([...heard].slice(-40)));
};

export const SosAlarm: React.FC = () => {
  const { currentUser, language, setCurrentView } = useApp();
  const arabic = language === 'ar';
  const [call, setCall] = useState<NearbyCall | null>(null);
  const heard = useRef(readHeard());
  const sound = useRef<(() => void) | null>(null);
  const owner = currentUser?.role === 'owner' && currentUser.status === 'active';

  const labels: Record<string, string> = arabic
    ? {
        title: 'نداء مساعدة عاجل',
        battery: 'اشتراك بطارية',
        air: 'منفاخ',
        tow: 'سحب',
        under_1: 'أقل من 1 كم',
        about_2: 'حوالي 2 كم',
        about_5: 'حوالي 5 كم',
        about_10: 'حوالي 10 كم',
        within_15: 'ضمن 15 كم',
        open: 'أساعد',
        stop: 'ما بدي أساعد'
      }
    : {
        title: 'Urgent help call',
        battery: 'Jump start',
        air: 'Air pump',
        tow: 'Tow',
        under_1: 'Under 1 km',
        about_2: 'About 2 km',
        about_5: 'About 5 km',
        about_10: 'About 10 km',
        within_15: 'Within 15 km',
        open: 'I can help',
        stop: 'Not this time'
      };

  const stopSound = () => {
    sound.current?.();
    sound.current = null;
  };

  const startSound = () => {
    stopSound();
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.value = 0.035;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    let high = false;
    const timer = window.setInterval(() => {
      high = !high;
      osc.frequency.setValueAtTime(high ? 880 : 540, ctx.currentTime);
    }, 280);
    sound.current = () => {
      window.clearInterval(timer);
      osc.stop();
      ctx.close().catch(() => undefined);
    };
  };

  useEffect(() => {
    if (!owner) {
      setCall(null);
      stopSound();
      return;
    }
    let stop = false;
    const look = () => {
      fetch('/api/sos', { credentials: 'include' })
        .then((response) => response.ok ? response.json() : null)
        .then((body) => {
          if (stop || !body?.ready || !Array.isArray(body.nearby)) return;
          const fresh = (body.nearby as NearbyCall[]).find((item) => item?.id && item.status === 'open' && !heard.current.has(item.id));
          if (!fresh) return;
          remember(heard.current, fresh.id);
          setCall(fresh);
          startSound();
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            const distance = labels[fresh.range] || '';
            const note = new Notification(labels.title, {
              body: [labels[fresh.kind] || fresh.kind, distance].filter(Boolean).join(' · '),
              tag: fresh.id,
              requireInteraction: true
            });
            note.onclick = () => {
              window.focus();
              setCurrentView('sos');
              note.close();
            };
          }
        })
        .catch(() => undefined);
    };
    look();
    const timer = window.setInterval(look, 8000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [owner, language]);

  useEffect(() => {
    if (!call) return;
    const previous = document.title;
    let on = false;
    const timer = window.setInterval(() => {
      on = !on;
      document.title = on ? labels.title : previous;
    }, 700);
    return () => {
      window.clearInterval(timer);
      document.title = previous;
    };
  }, [call, labels.title]);

  useEffect(() => () => stopSound(), []);

  if (!call) return null;

  const distance = labels[call.range] || '';
  const dismiss = () => {
    stopSound();
    setCall(null);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
      <section className="w-full max-w-md rounded-[28px] border-4 border-rose-500 bg-[#3a0610] px-6 py-7 text-center text-white shadow-[0_0_50px_rgba(244,63,94,0.55)]">
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/70" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-600">
            <Siren className="h-10 w-10" />
          </span>
        </div>
        <h2 className="text-2xl font-black">{labels.title}</h2>
        <p className="mt-2 text-lg font-bold text-rose-100">
          {labels[call.kind] || call.kind}
          {distance ? ` · ${distance}` : ''}
        </p>
        {call.note && <p className="mt-3 text-sm text-rose-50/90">{call.note}</p>}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              const id = call.id;
              dismiss();
              void fetch('/api/sos/accept', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
              }).catch(() => undefined);
              setCurrentView('sos');
            }}
            className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-black text-white hover:bg-rose-400"
          >
            {labels.open}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-2xl border border-rose-300/40 py-3 text-sm font-bold text-rose-100"
          >
            {labels.stop}
          </button>
        </div>
      </section>
    </div>
  );
};
