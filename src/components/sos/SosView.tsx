import React, { useEffect, useState } from 'react';
import { BatteryCharging, LifeBuoy, MapPin, Wind } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type SosKind = 'battery' | 'air' | 'tow';

type SosMessage = { id: string; mine: boolean; text: string; createdAt: string };

type SosCard = {
  id: string;
  kind: SosKind;
  note: string;
  status: string;
  range: string;
  createdAt: string;
  expiresAt: string;
  mine: boolean;
  helping: boolean;
  messages: SosMessage[];
  mapUrl: string;
};

type SosPayload = {
  ready: boolean;
  mine: SosCard | null;
  nearby: SosCard[];
  accepted: SosCard[];
};

const empty: SosPayload = { ready: false, mine: null, nearby: [], accepted: [] };

const locate = () => new Promise<{ lat: number; lng: number }>((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('unsupported'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
    () => reject(new Error('denied')),
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
  );
});

export const SosView: React.FC = () => {
  const { language } = useApp();
  const arabic = language === 'ar';
  const [data, setData] = useState<SosPayload>(empty);
  const [kind, setKind] = useState<SosKind>('battery');
  const [note, setNote] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const text: Record<string, string> = arabic
    ? {
        title: 'طلب مساعدة',
        intro: 'إذا تعطلت البطارية أو فرغ الإطار أو احتجت سحباً، أرسل نداءً للسائقين القريبين. المكان يظهر تقريبياً، ومن غير اسم أو هاتف.',
        caution: 'هذه المساعدة بين السائقين. في حالة الخطر على الحياة اتصل بالدفاع المدني أو الإسعاف.',
        ready: 'أنا جاهز أساعد',
        readyOn: 'وضع المساعدة شغّال',
        battery: 'اشتراك بطارية',
        air: 'منفاخ',
        tow: 'سحب',
        note: 'ملاحظة قصيرة',
        send: 'إرسال النداء',
        mine: 'نداؤك',
        nearby: 'نداءات قريبة',
        accepted: 'مساعدة قبلتها',
        none: 'لا يوجد نداء قريب الآن.',
        cancel: 'إغلاق النداء',
        accept: 'أقبل المساعدة',
        reply: 'اكتب رسالة',
        post: 'إرسال',
        map: 'الموقع التقريبي',
        open: 'بانتظار مساعد',
        helping: 'تم القبول',
        location: 'اسمح بالموقع من المتصفح حتى نحدد المسافة التقريبية.',
        openAlready: 'عندك نداء مفتوح. أغلقه قبل إرسال نداء جديد.',
        unavailable: 'تعذر حفظ النداء الآن.',
        under_1: 'أقل من 1 كم',
        about_2: 'حوالي 2 كم',
        about_5: 'حوالي 5 كم',
        about_10: 'حوالي 10 كم',
        within_15: 'ضمن 15 كم'
      }
    : {
        title: 'Roadside help',
        intro: 'If the battery dies, a tire is flat, or you need a tow, send a call to nearby drivers. The place stays approximate, with no name or phone number.',
        caution: 'This is help between drivers. If someone is in danger, contact emergency services.',
        ready: 'I can help nearby',
        readyOn: 'Help mode is on',
        battery: 'Jump start',
        air: 'Air pump',
        tow: 'Tow',
        note: 'Short note',
        send: 'Send call',
        mine: 'Your call',
        nearby: 'Nearby calls',
        accepted: 'Help you accepted',
        none: 'No nearby call right now.',
        cancel: 'Close call',
        accept: 'I can help',
        reply: 'Write a message',
        post: 'Send',
        map: 'Approximate place',
        open: 'Waiting for help',
        helping: 'Accepted',
        location: 'Allow location in the browser so the distance can stay approximate.',
        openAlready: 'You already have an open call. Close it before sending another.',
        unavailable: 'The call could not be saved right now.',
        under_1: 'Under 1 km',
        about_2: 'About 2 km',
        about_5: 'About 5 km',
        about_10: 'About 10 km',
        within_15: 'Within 15 km'
      };

  const explain = (code: string) => {
    if (code === 'sos_location') return text.location;
    if (code === 'sos_open') return text.openAlready;
    if (code === 'sos_unavailable') return text.unavailable;
    return text.unavailable;
  };

  const load = async () => {
    const response = await fetch('/api/sos', { credentials: 'include' });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'sos_unavailable');
    setData(body);
    if (body.mine) setError('');
  };

  useEffect(() => {
    let stop = false;
    const run = () => {
      load().catch((reason) => {
        if (!stop) setError(explain(reason instanceof Error ? reason.message : ''));
      });
    };
    run();
    const timer = window.setInterval(run, 8000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [language]);

  const post = async (path: string, body: unknown) => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(explain(payload.error));
        return false;
      }
      setData(payload);
      setError('');
      return true;
    } catch {
      setError(text.unavailable);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const toggleReady = async () => {
    if (data.ready) {
      await post('/api/sos/help', { active: false });
      return;
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
    try {
      const where = await locate();
      await post('/api/sos/help', { active: true, ...where });
    } catch {
      setError(text.location);
    }
  };

  const sendCall = async () => {
    let where;
    try {
      where = await locate();
    } catch {
      setError(text.location);
      return;
    }
    const saved = await post('/api/sos/request', { kind, note, ...where })
      || await post('/api/sos/request', { kind, note, ...where });
    if (saved) setNote('');
  };

  const sendMessage = async (id: string) => {
    const value = (drafts[id] || '').trim();
    if (!value) return;
    await post('/api/sos/message', { id, text: value });
    setDrafts((current) => ({ ...current, [id]: '' }));
  };

  const kindLabel = (value: string) => text[value] || value;
  const rangeLabel = (value: string) => text[value] || '';

  const card = (item: SosCard, actions: React.ReactNode) => (
    <article key={item.id} className="rounded-3xl border border-cyan-500/15 bg-[#061820] p-4 text-start">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white">{kindLabel(item.kind)}</h3>
          <p className="mt-1 text-xs text-slate-400">
            {item.status === 'accepted' ? text.helping : text.open}
            {item.range ? ` · ${rangeLabel(item.range)}` : ''}
          </p>
        </div>
        {actions}
      </div>
      {item.note && <p className="mt-3 text-sm text-slate-200">{item.note}</p>}
      {item.mapUrl && (
        <a href={item.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-300">
          <MapPin className="h-3.5 w-3.5" />
          {text.map}
        </a>
      )}
      {item.messages.length > 0 && (
        <ul className="mt-3 space-y-2">
          {item.messages.map((message) => (
            <li key={message.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.mine ? 'ms-auto bg-cyan-500 text-[#041018]' : 'bg-[#0a2430] text-white'}`}>
              {message.text}
            </li>
          ))}
        </ul>
      )}
      {(item.mine || item.helping) && item.status === 'accepted' && (
        <div className="mt-3 flex gap-2">
          <input
            value={drafts[item.id] || ''}
            onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
            placeholder={text.reply}
            className="min-w-0 flex-1 rounded-xl border border-cyan-500/20 bg-[#0a2430] px-3 py-2 text-sm text-white outline-none"
          />
          <button type="button" disabled={busy} onClick={() => sendMessage(item.id)} className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-[#041018]">
            {text.post}
          </button>
        </div>
      )}
    </article>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4 text-start">
      <section className="rounded-3xl border border-cyan-400/25 bg-[#061820] p-5">
        <div className="mb-2 inline-flex items-center gap-2 text-cyan-300">
          <LifeBuoy className="h-5 w-5" />
          <h1 className="text-xl font-black text-white">{text.title}</h1>
        </div>
        <p className="text-sm text-slate-300">{text.intro}</p>
        <p className="mt-2 text-xs font-bold text-amber-200">{text.caution}</p>
      </section>

      {error && <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">{error}</p>}

      <button
        type="button"
        disabled={busy}
        onClick={toggleReady}
        className={`w-full rounded-2xl px-4 py-3 text-sm font-black ${data.ready ? 'bg-cyan-500 text-[#041018]' : 'border border-cyan-500/30 text-cyan-200'}`}
      >
        {data.ready ? text.readyOn : text.ready}
      </button>

      {!data.mine && (
        <section className="space-y-3 rounded-3xl border border-cyan-500/15 bg-[#061820] p-4">
          <div className="grid grid-cols-3 gap-2">
            {([
              ['battery', BatteryCharging],
              ['air', Wind],
              ['tow', LifeBuoy]
            ] as const).map(([value, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={`rounded-2xl px-2 py-3 text-xs font-bold ${kind === value ? 'bg-cyan-500 text-[#041018]' : 'bg-[#0a2430] text-slate-300'}`}
              >
                <Icon className="mx-auto mb-1 h-4 w-4" />
                {kindLabel(value)}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={160}
            placeholder={text.note}
            className="w-full rounded-xl border border-cyan-500/20 bg-[#0a2430] px-3 py-2 text-sm text-white outline-none"
          />
          <button type="button" disabled={busy} onClick={sendCall} className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-black text-[#041018]">
            {text.send}
          </button>
        </section>
      )}

      {data.mine && (
        <section className="space-y-2">
          <h2 className="text-sm font-black text-cyan-200">{text.mine}</h2>
          {card(data.mine, (
            <button type="button" disabled={busy} onClick={() => post('/api/sos/close', { id: data.mine?.id })} className="rounded-xl border border-rose-400/30 px-3 py-1.5 text-xs font-bold text-rose-200">
              {text.cancel}
            </button>
          ))}
        </section>
      )}

      {data.accepted.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-black text-cyan-200">{text.accepted}</h2>
          {data.accepted.map((item) => card(item, (
            <button type="button" disabled={busy} onClick={() => post('/api/sos/close', { id: item.id })} className="rounded-xl border border-rose-400/30 px-3 py-1.5 text-xs font-bold text-rose-200">
              {text.cancel}
            </button>
          )))}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-black text-cyan-200">{text.nearby}</h2>
        {data.nearby.length === 0 ? <p className="text-sm text-slate-400">{text.none}</p> : data.nearby.map((item) => card(item, (
          <button type="button" disabled={busy} onClick={() => post('/api/sos/accept', { id: item.id })} className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-black text-[#041018]">
            {text.accept}
          </button>
        )))}
      </section>
    </div>
  );
};
