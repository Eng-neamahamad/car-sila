import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { api, ApiError } from '../../data/api';
import { addIce, AudioPeer, CallView, startPeer, unlockCallAudio, waitForIce } from './peer';
import { startPhoneRing } from '../../lib/phoneRing';

const text = (language: 'ar' | 'en', ar: string, en: string) => (language === 'ar' ? ar : en);

const reason = (language: 'ar' | 'en', code: string) => {
  if (code === 'mic_blocked') return text(language, 'اسمح للمتصفح باستخدام الميكروفون حتى يتم الاتصال.', 'Allow the microphone so the call can start.');
  if (code === 'mic_missing') return text(language, 'هذا المتصفح لا يدعم المكالمة الصوتية.', 'This browser cannot make the voice call.');
  if (code === 'own_vehicle') return text(language, 'ما بتقدر تتصل بسيارتك من نفس الحساب.', 'You cannot call your own car from this account.');
  if (code === 'call_busy') return text(language, 'في اتصال طارئ قائم على هذه السيارة.', 'An emergency call is already open for this car.');
  if (code === 'declined') return text(language, 'صاحب السيارة رفض الاتصال.', 'The owner declined the call.');
  if (code === 'missed') return text(language, 'لم يتم الرد على الاتصال.', 'The call was not answered.');
  if (code === 'ended') return text(language, 'انتهت المكالمة.', 'The call ended.');
  return text(language, 'تعذر بدء الاتصال. حاول مرة أخرى.', 'The call could not start. Try again.');
};

export const EmergencyCall: React.FC<{
  token: string;
  language: 'ar' | 'en';
}> = ({ token, language }) => {
  const [phase, setPhase] = useState<'idle' | 'ringing' | 'live' | 'done'>('idle');
  const [note, setNote] = useState('');
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const peerRef = useRef<AudioPeer | null>(null);
  const callRef = useRef('');
  const seenRef = useRef(new Set<string>());
  const answerRef = useRef(false);

  const stop = () => {
    peerRef.current?.stop();
    peerRef.current = null;
  };

  useEffect(() => () => {
    const id = callRef.current;
    stop();
    if (id) void api('/api/public/calls/end', { id }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (phase !== 'ringing') return;
    return startPhoneRing('outgoing');
  }, [phase]);

  useEffect(() => {
    if (phase !== 'live') return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const finish = (code: string) => {
    stop();
    callRef.current = '';
    setPhase('done');
    setNote(reason(language, code));
  };

  const poll = async (id: string, peer: AudioPeer) => {
    const data = await api<{ call: CallView }>(`/api/public/calls?id=${encodeURIComponent(id)}`);
    const call = data.call;
    if (call.status === 'declined' || call.status === 'missed' || call.status === 'ended') {
      finish(call.status);
      return;
    }
    if (call.answer && !answerRef.current) {
      await peer.pc.setRemoteDescription({ type: 'answer', sdp: call.answer });
      answerRef.current = true;
      setPhase('live');
      setSeconds(0);
    }
    await addIce(peer.pc, seenRef.current, call.ice);
  };

  const begin = async () => {
    unlockCallAudio();
    setNote('');
    setMuted(false);
    answerRef.current = false;
    seenRef.current = new Set();
    try {
      const peer = await startPeer((candidate) => {
        const id = callRef.current;
        if (!id) return;
        void api('/api/public/calls/ice', { id, candidate }).catch(() => undefined);
      });
      peerRef.current = peer;
      const offer = await peer.pc.createOffer();
      await peer.pc.setLocalDescription(offer);
      await waitForIce(peer.pc);
      const data = await api<{ call: CallView }>('/api/public/calls', { token, offer: peer.pc.localDescription?.sdp || offer.sdp || '' });
      callRef.current = data.call.id;
      peer.flush();
      setPhase('ringing');
      const timer = window.setInterval(() => {
        const id = callRef.current;
        const current = peerRef.current;
        if (!id || !current) {
          window.clearInterval(timer);
          return;
        }
        void poll(id, current).catch(() => undefined);
      }, 1000);
      peer.pc.onconnectionstatechange = () => {
        if (peer.pc.connectionState === 'failed') finish('ended');
      };
      peer.pc.oniceconnectionstatechange = () => {
        if (peer.pc.iceConnectionState === 'failed') {
          setNote(text(language, 'الاتصال فتح بس الصوت ما وصل للطرف الثاني. الجهازين على نت مختلف.', 'The call opened, but the voice did not reach the other phone. The two devices are on different networks.'));
        }
      };
    } catch (error) {
      stop();
      setPhase('done');
      setNote(reason(language, error instanceof ApiError ? error.code : error instanceof Error ? error.message : 'failed'));
    }
  };

  const hangup = () => {
    const id = callRef.current;
    finish('ended');
    if (id) void api('/api/public/calls/end', { id }).catch(() => undefined);
  };

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (phase === 'idle') {
    return (
      <button
        type="button"
        onClick={() => void begin()}
        className="flex w-full items-center gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-start cursor-pointer"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
          <Phone className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-white">{text(language, 'اتصال صوتي طارئ', 'Emergency voice call')}</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-rose-100">
            {text(language, 'اتصال مباشر من المتصفح. رقم هاتفك ورقم المالك يبقيان مخفيين.', 'A browser call. Your number and the owner’s number stay hidden.')}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-400/40 bg-[#3a1018] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${phase === 'live' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          <Phone className={`h-5 w-5 ${phase === 'ringing' ? 'animate-pulse' : ''}`} />
        </span>
        <div className="min-w-0 flex-1 text-start">
          <p className="text-sm font-black text-white">
            {phase === 'ringing'
              ? text(language, 'يتم الاتصال بصاحب السيارة...', 'Calling the owner...')
              : phase === 'live'
              ? text(language, `متصل • ${clock}`, `Connected • ${clock}`)
              : text(language, 'المكالمة', 'Call')}
          </p>
          <p className="text-[11px] leading-relaxed text-rose-100">
            {note || text(language, 'المكالمة عبر الإنترنت، بدون إظهار أي رقم.', 'The call stays on the internet, with no phone number shown.')}
          </p>
        </div>
      </div>
      {phase === 'done' ? (
        <button type="button" onClick={() => { setPhase('idle'); setNote(''); }} className="mt-3 w-full rounded-xl border border-white/15 py-2 text-xs font-bold text-white cursor-pointer">
          {text(language, 'إغلاق', 'Close')}
        </button>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              peerRef.current?.mute(next);
            }}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/15 py-2 text-xs font-bold text-white cursor-pointer"
          >
            {muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {muted ? text(language, 'صوت مغلق', 'Muted') : text(language, 'كتم', 'Mute')}
          </button>
          <button type="button" onClick={hangup} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white cursor-pointer">
            <PhoneOff className="h-3.5 w-3.5" />
            {text(language, 'إنهاء', 'End')}
          </button>
        </div>
      )}
    </div>
  );
};
