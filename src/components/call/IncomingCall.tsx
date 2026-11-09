import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { api } from '../../data/api';
import { useApp } from '../../context/AppContext';
import { addIce, AudioPeer, CallView, startPeer } from './peer';

export const IncomingCall: React.FC = () => {
  const { currentUser, language } = useApp();
  const [call, setCall] = useState<CallView | null>(null);
  const [phase, setPhase] = useState<'incoming' | 'live' | 'error'>('incoming');
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [note, setNote] = useState('');
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
        if (!stopped) setCall(next);
      } catch {
        if (!stopped && phaseRef.current === 'incoming') setCall(null);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 2000);
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'carsila-open') void load();
    };
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      navigator.serviceWorker?.removeEventListener('message', onMessage);
    };
  }, [currentUser?.role]);

  useEffect(() => {
    if (phase !== 'live') return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => () => {
    peerRef.current?.stop();
  }, []);

  if (!call || currentUser?.role !== 'owner') return null;

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
      const data = await api<{ call: CallView }>('/api/calls/signal', { id: call.id, action: 'accept', answer: answer.sdp });
      peer.flush();
      await addIce(peer.pc, seenRef.current, data.call.ice);
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
