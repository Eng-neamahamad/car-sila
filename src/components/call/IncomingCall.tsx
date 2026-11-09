import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { api } from '../../data/api';
import { useApp } from '../../context/AppContext';
import { addIce, AudioPeer, CallView, startPeer, unlockCallAudio, waitForIce } from './peer';
import { showPhoneNotice } from '../../lib/phoneAlert';
import { startPhoneRing } from '../../lib/phoneRing';

export const IncomingCall: React.FC = () => {
  const { currentUser, language } = useApp();
  const [call, setCall] = useState<CallView | null>(null);
  const [phase, setPhase] = useState<'incoming' | 'live' | 'error'>('incoming');
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');
  const peerRef = useRef<AudioPeer | null>(null);
  const seenRef = useRef(new Set<string>());
  const activeId = useRef('');
  const dismissed = useRef(new Set<string>());
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const ar = language === 'ar';

  useEffect(() => {
    if (currentUser?.role !== 'owner') return;
    let stopped = false;
    const load = async () => {
      if (activeId.current || phaseRef.current !== 'incoming') return;
      try {
        const data = await api<{ calls: CallView[] }>('/api/calls/incoming');
        const next = data.calls.find((item) => !dismissed.current.has(item.id)) || null;
        if (!stopped) {
          setCall(next);
          if (next) setNotice('');
        }
      } catch {
        if (!stopped && phaseRef.current === 'incoming') setCall(null);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 2000);
    const openSaved = async (id: string) => {
      try {
        const data = await api<{ call: CallView }>(`/api/calls/live?id=${encodeURIComponent(id)}`);
        window.dispatchEvent(new CustomEvent('carsila-show-call', { detail: data.call }));
      } catch {
        window.dispatchEvent(new CustomEvent('carsila-show-call', { detail: { id, status: 'ended', plate: '', car: '', createdAt: '' } }));
      }
    };
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'carsila-open') return;
      try {
        const id = new URL(event.data.url || '/', window.location.origin).searchParams.get('call');
        if (id) void openSaved(id);
      } catch {
        void load();
      }
    };
    const onShow = (event: Event) => {
      const next = (event as CustomEvent<CallView>).detail;
      if (!next) return;
      if (next.status === 'ringing' || (next.status === 'active' && phaseRef.current === 'live')) {
        dismissed.current.delete(next.id);
        setNotice('');
        setCall(next);
        if (next.status === 'ringing' && phaseRef.current !== 'live') setPhase('incoming');
        return;
      }
      setCall(null);
      setNotice(ar
        ? 'هالمكالمة خلصت، لهيك ما في زر رد. خلي الشخص الثاني يضغط اتصال مرة ثانية، وبتطلع شاشة فيها زر رد.'
        : 'This call already ended, so there is no answer button. Ask them to call again and the answer screen will appear.');
    };
    window.addEventListener('carsila-show-call', onShow);
    navigator.serviceWorker?.addEventListener('message', onMessage);
    const initial = new URLSearchParams(window.location.search).get('call');
    if (initial) void openSaved(initial);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener('carsila-show-call', onShow);
      navigator.serviceWorker?.removeEventListener('message', onMessage);
    };
  }, [ar, currentUser?.role]);

  useEffect(() => {
    if (!call?.id || phase !== 'incoming') return;
    const id = call.id;
    const car = call.car;
    void showPhoneNotice(
      ar ? 'اتصال صوتي' : 'Voice call',
      ar ? `${car} يطلب التحدث معك. الإشعار يبقى لحد ما تشيله.` : `${car} wants to talk. The alert stays until you dismiss it.`,
      `/?call=${encodeURIComponent(id)}`,
      `call-${id}`
    );
    return startPhoneRing('incoming');
  }, [ar, call?.id, call?.car, phase]);

  useEffect(() => {
    if (phase !== 'live') return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => () => {
    peerRef.current?.stop();
  }, []);

  if (currentUser?.role !== 'owner') return null;

  if (!call) {
    if (!notice) return null;
    return (
      <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/70 p-4 sm:items-center">
        <div className="w-full max-w-md rounded-3xl border border-rose-400/40 bg-[#1a0c12] p-5 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-200">
            {ar ? 'اتصال صوتي طارئ' : 'Emergency voice call'}
          </p>
          <h2 className="mt-2 text-lg font-black text-white">{ar ? 'المكالمة انتهت' : 'The call ended'}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="mt-5 w-full rounded-2xl bg-cyan-500 py-3 text-sm font-black text-[#041018] cursor-pointer"
          >
            {ar ? 'تمام' : 'OK'}
          </button>
        </div>
      </div>
    );
  }

  const stopPeer = () => {
    peerRef.current?.stop();
    peerRef.current = null;
    activeId.current = '';
  };

  const decline = async () => {
    const id = call.id;
    dismissed.current.add(id);
    setCall(null);
    stopPeer();
    setPhase('incoming');
    await api('/api/calls/signal', { id, action: 'decline' }).catch(() => undefined);
  };

  const hangup = async () => {
    const id = call.id;
    setCall(null);
    stopPeer();
    setPhase('incoming');
    await api('/api/calls/signal', { id, action: 'hangup' }).catch(() => undefined);
  };

  const accept = async () => {
    unlockCallAudio();
    setNote('');
    seenRef.current = new Set();
    try {
      const peer = await startPeer((candidate) => {
        void api('/api/calls/signal', { id: call.id, candidate }).catch(() => undefined);
      });
      peerRef.current = peer;
      activeId.current = call.id;
      await peer.pc.setRemoteDescription({ type: 'offer', sdp: call.offer || '' });
      const answer = await peer.pc.createAnswer();
      await peer.pc.setLocalDescription(answer);
      await waitForIce(peer.pc);
      const data = await api<{ call: CallView }>('/api/calls/signal', { id: call.id, action: 'accept', answer: peer.pc.localDescription?.sdp || answer.sdp || '' });
      peer.flush();
      await addIce(peer.pc, seenRef.current, data.call.ice);
      peer.pc.oniceconnectionstatechange = () => {
        if (peer.pc.iceConnectionState === 'failed') {
          setNote(ar
            ? 'الشاشة فتحت بس صوت الطرف الثاني ما وصل. الجهازين على نت مختلف، والصوت محتاج خادم تحويل.'
            : 'The screen opened, but the other voice did not arrive. The two phones are on different networks and the voice needs a relay.');
        }
      };
      setPhase('live');
      setSeconds(0);
      const timer = window.setInterval(() => {
        if (activeId.current !== call.id) {
          window.clearInterval(timer);
          return;
        }
        void api<{ call: CallView }>(`/api/calls/live?id=${encodeURIComponent(call.id)}`).then(async (next) => {
          if (next.call.status !== 'active') {
            window.clearInterval(timer);
            stopPeer();
            setCall(null);
            setPhase('incoming');
            return;
          }
          await addIce(peer.pc, seenRef.current, next.call.ice);
        }).catch(() => undefined);
      }, 1000);
    } catch (error) {
      stopPeer();
      setPhase('error');
      setNote(error instanceof Error && error.message === 'mic_blocked'
        ? (ar ? 'اسمح باستخدام الميكروفون للرد على الاتصال.' : 'Allow the microphone to answer.')
        : (ar ? 'تعذر وصل المكالمة.' : 'The call could not be connected.'));
    }
  };

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/70 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-rose-400/40 bg-[#1a0c12] p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${phase === 'live' ? 'bg-emerald-500' : 'animate-pulse bg-rose-500'}`}>
            <Phone className="h-6 w-6" />
          </span>
          <div className="min-w-0 text-start">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-200">
              {ar ? 'اتصال صوتي طارئ' : 'Emergency voice call'}
            </p>
            <h2 className="truncate text-lg font-black text-white">{call.car}</h2>
            <p className="font-mono text-sm font-bold text-rose-100">{call.plate}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-200">
          {phase === 'live'
            ? (ar ? `المكالمة متصلة • ${clock}. لا يظهر رقم أي طرف.` : `Connected • ${clock}. No phone number is shown.`)
            : (ar ? 'شخص بجانب سيارتك يطلب التحدث معك عبر المتصفح. رقم هاتفك ورقمه يبقيان مخفيين.' : 'Someone beside your car wants to talk through the browser. Neither phone number is shown.')}
        </p>
        {note && <p className="mt-2 text-xs font-bold text-rose-200">{note}</p>}
        {phase === 'live' ? (
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                peerRef.current?.mute(next);
              }}
              className="flex flex-1 items-center justify-center gap-1 rounded-2xl border border-white/15 py-3 text-sm font-bold text-white cursor-pointer"
            >
              {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {muted ? (ar ? 'صوت مغلق' : 'Muted') : (ar ? 'كتم' : 'Mute')}
            </button>
            <button type="button" onClick={() => void hangup()} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white cursor-pointer">
              <PhoneOff className="h-4 w-4" />
              {ar ? 'إنهاء' : 'End'}
            </button>
          </div>
        ) : (
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => void decline()} className="flex-1 rounded-2xl border border-white/15 py-3 text-sm font-bold text-white cursor-pointer">
              {ar ? 'رفض' : 'Decline'}
            </button>
            <button type="button" onClick={() => void accept()} className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-[#041018] cursor-pointer">
              {ar ? 'رد' : 'Answer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
