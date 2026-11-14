import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { useApp } from '../../context/AppContext';
import { TranslateControl } from '../common/TranslatedText';
import { EmergencyCall } from '../call/EmergencyCall';
import { ReturnCountdown } from '../common/QuickReturn';
import { compressPhoto } from '../../lib/photo';
import { ChatPhoto, readChatPhoto } from '../common/ChatPhoto';
import { ReportCategory, VehicleStatus } from '../../types';
import {
  Car,
  Lightbulb,
  TriangleAlert,
  Package,
  Lock,
  Send,
  CheckCircle2,
  ChevronRight,
  Globe,
  ArrowLeft,
  Camera,
  CameraOff,
} from 'lucide-react';
import logo from '../../assets/logo.png';

type Step = 'code' | 'welcome' | 'reasons' | 'details' | 'success';

const compact = (value: string) => value.trim().toLowerCase().replace(/[\s\-_.]/g, '');

const codeFromScan = (raw: string) => {
  const text = raw.trim();
  const embedded = text.match(/scan=([^&#\s]+)/);
  if (embedded) {
    try {
      return decodeURIComponent(embedded[1]);
    } catch {
      return embedded[1];
    }
  }
  return text;
};

export const QRScanFlow: React.FC = () => {
  const {
    activeScanVehicle,
    setActiveScanVehicle,
    findVehicleByCode,
    submitVisitorReport,
    setCurrentView,
    conversations,
    activeConversationId,
    sendMessage,
    language,
    setLanguage,
    currentUser,
    t,
  } = useApp();

  const [step, setStep] = useState<Step>(activeScanVehicle ? 'welcome' : 'code');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<'required' | 'notFound' | ''>('');
  const [scanning, setScanning] = useState(false);
  const [looking, setLooking] = useState(false);
  const [cameraError, setCameraError] = useState<'blocked' | 'missing' | ''>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lookupRef = useRef<(raw: string) => void>(() => undefined);
  const [category, setCategory] = useState<ReportCategory>('blocking');
  const [note, setNote] = useState('');
  const [chatText, setChatText] = useState('');
  const [sending, setSending] = useState(false);
  const [photo, setPhoto] = useState('');
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const leave = () => {
    setActiveScanVehicle(null);
    if (window.location.hash.includes('scan=')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (currentUser?.role === 'owner') setCurrentView('dashboard');
    else if (currentUser?.role === 'admin') setCurrentView('admin-overview');
    else setCurrentView('landing');
  };

  const plate = activeScanVehicle?.plateNumber || '';
  const conversation = conversations.find((item) => item.id === activeConversationId);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (step !== 'success') return;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length, step]);

  const lookupVehicle = useRef(findVehicleByCode);
  lookupVehicle.current = findVehicleByCode;
  useEffect(() => {
    const token = activeScanVehicle?.qrToken;
    if (!token || step === 'code') return;
    const timer = window.setInterval(() => {
      void lookupVehicle.current(token).then((found) => {
        if (found) setActiveScanVehicle(found);
      });
    }, 8000);
    return () => window.clearInterval(timer);
  }, [activeScanVehicle?.qrToken, setActiveScanVehicle, step]);

  const reasons: {
    category: ReportCategory;
    title: string;
    hint: string;
    icon: React.ReactNode;
    tone: string;
    image: string;
    iconClass: string;
    borderClass: string;
  }[] = [
    {
      category: 'blocking',
      title: t('visitorBlocking'),
      hint: t('visitorBlockingHint'),
      icon: <Car className="h-5 w-5" />,
      tone: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
      image: '/scan-blocking.webp',
      iconClass: 'bg-cyan-500 text-white',
      borderClass: 'border-cyan-400/60 shadow-cyan-500/10',
    },
    {
      category: 'lights',
      title: t('visitorLights'),
      hint: t('visitorLightsHint'),
      icon: <Lightbulb className="h-5 w-5" />,
      tone: 'border-amber-400/40 text-amber-300 bg-amber-500/10',
      image: '/scan-lights.webp',
      iconClass: 'bg-amber-500 text-white',
      borderClass: 'border-amber-400/60 shadow-amber-500/10',
    },
    {
      category: 'accident',
      title: t('visitorAccident'),
      hint: t('visitorAccidentHint'),
      icon: <TriangleAlert className="h-5 w-5" />,
      tone: 'border-rose-400/40 text-rose-300 bg-rose-500/10',
      image: '/hero.webp',
      iconClass: 'bg-rose-500 text-white',
      borderClass: 'border-rose-400/60 shadow-rose-500/10',
    },
    {
      category: 'other',
      title: t('visitorOther'),
      hint: t('visitorOtherHint'),
      icon: <Package className="h-5 w-5" />,
      tone: 'border-sky-400/40 text-sky-300 bg-sky-500/10',
      image: '/scan-other.webp',
      iconClass: 'bg-sky-500 text-white',
      borderClass: 'border-sky-400/60 shadow-sky-500/10',
    },
  ];

  const selected = reasons.find((item) => item.category === category) || reasons[0];

  const statusLabel = (status: VehicleStatus) => {
    if (status === 'dnd') return t('visitorStatusDnd');
    if (status === 'maintenance') return t('visitorStatusMaintenance');
    if (status === 'inactive') return t('visitorStatusInactive');
    return t('active');
  };

  const lookup = async (raw: string) => {
    const value = codeFromScan(raw);
    if (!compact(value)) {
      setCodeError('required');
      return;
    }
    setLooking(true);
    setCodeError('');
    const found = await findVehicleByCode(value);
    setLooking(false);
    if (!found) {
      setCodeError('notFound');
      return;
    }
    setCode('');
    setScanning(false);
    setActiveScanVehicle(found);
    setStep('welcome');
  };

  lookupRef.current = (raw: string) => {
    void lookup(raw);
  };

  useEffect(() => {
    if (!scanning) return;
    const video = videoRef.current;
    if (!video) return;
    let active = true;
    const reader = new BrowserQRCodeReader();
    const controlsPromise = reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } } },
      video,
      (result) => {
        if (!active || !result) return;
        active = false;
        const text = result.getText();
        void controlsPromise.then((controls) => controls.stop()).catch(() => undefined);
        setScanning(false);
        lookupRef.current(text);
      }
    );
    controlsPromise.catch((error: unknown) => {
      if (!active) return;
      active = false;
      setScanning(false);
      const name = error instanceof DOMException ? error.name : '';
      setCameraError(name === 'NotAllowedError' || name === 'SecurityError' ? 'blocked' : 'missing');
    });
    return () => {
      active = false;
      void controlsPromise.then((controls) => controls.stop()).catch(() => undefined);
    };
  }, [scanning]);

  const findCar = () => {
    void lookup(code);
  };

  const sendReport = async () => {
    if (sending || !activeScanVehicle) return;
    setSending(true);
    const report = await submitVisitorReport({
      category,
      title: selected.title,
      description: note.trim() || selected.title,
      hasLocation: false,
      photo: photo || undefined,
    });
    setSending(false);
    if (report.id) setStep('success');
  };

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[#041018] text-slate-100">
      <div className={`mx-auto flex min-h-full w-full flex-col px-3 py-4 sm:px-4 sm:py-6 ${step === 'reasons' ? 'max-w-6xl justify-start' : 'max-w-md justify-center'}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={leave} className="flex items-center gap-2 cursor-pointer">
            <img src={logo} alt="CAR-SILA" className="h-7 w-auto shrink-0 object-contain sm:h-8" />
            <span className="text-base font-black tracking-tight sm:text-lg">CAR-SILA</span>
          </button>
          <button
            type="button"
            onClick={leave}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold text-slate-200 hover:border-[#38BDF8] hover:text-white"
          >
            <ArrowLeft className={`h-3.5 w-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            {currentUser?.role === 'owner' ? t('dashboard') : currentUser?.role === 'admin' ? t('adminPanel') : t('home')}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-200"
            >
              <Globe className="h-3.5 w-3.5 text-[#38BDF8]" />
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-bold text-[#10B981]">
              <Lock className="w-3.5 h-3.5" />
              {t('visitorSecure')}
            </span>
          </div>
        </div>

        {step === 'code' && (
          <section className="rounded-3xl border border-white/10 bg-[#101626] p-4 sm:p-6">
            <h1 className="text-lg font-black leading-relaxed">{t('visitorScanTitle')}</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{t('visitorScanHint')}</p>
            {scanning ? (
              <div className="mt-5 space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-[#38BDF8]/40 bg-black">
                  <video ref={videoRef} className="aspect-square w-full object-cover" muted autoPlay playsInline />
                  <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-[#38BDF8]" />
                </div>
                <p className="text-center text-xs font-bold text-[#38BDF8]">{t('visitorScanning')}</p>
                <button
                  type="button"
                  onClick={() => setScanning(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-sm font-bold text-slate-200"
                >
                  <CameraOff className="h-4 w-4" />
                  {t('visitorStopScan')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCameraError('');
                  setCodeError('');
                  setScanning(true);
                }}
                disabled={looking}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#38BDF8] py-3.5 text-sm font-black text-[#0A0E1A] disabled:opacity-60"
              >
                <Camera className="h-4 w-4" />
                {t('visitorOpenCamera')}
              </button>
            )}
            {cameraError && (
              <p className="mt-3 text-xs font-bold text-[#EF4444]">
                {cameraError === 'blocked' ? t('visitorCameraBlocked') : t('visitorNoCamera')}
              </p>
            )}
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                findCar();
              }}
            >
              <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('visitorOrType')}</p>
              <input
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setCodeError('');
                }}
                placeholder={t('visitorCodePlaceholder')}
                className="w-full rounded-2xl border border-white/10 bg-[#0A0E1A] px-4 py-3 text-sm outline-none focus:border-[#38BDF8]"
              />
              {codeError && (
                <p className="mt-2 text-xs font-bold text-[#EF4444]">
                  {codeError === 'required' ? t('visitorCodeRequired') : t('visitorCodeNotFound')}
                </p>
              )}
              <button
                type="submit"
                disabled={looking}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#38BDF8]/40 py-3.5 text-sm font-black text-[#38BDF8] disabled:opacity-60"
              >
                {t('visitorFindCar')}
                <ChevronRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </form>
          </section>
        )}

        {activeScanVehicle && activeScanVehicle.status !== 'inactive' && step !== 'code' && (
          <div className="mb-4 space-y-3">
            <ReturnCountdown returnAt={activeScanVehicle.returnAt} language={language} />
            <EmergencyCall token={activeScanVehicle.qrToken} language={language} />
          </div>
        )}

        {step === 'welcome' && activeScanVehicle && (
          <section className="rounded-3xl border border-white/10 bg-[#101626] p-4 text-center sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">{t('visitorCarDetails')}</p>
            <h2 className="mt-2 text-lg font-black sm:text-xl">
              {activeScanVehicle.brand} {activeScanVehicle.model}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {activeScanVehicle.year} • {activeScanVehicle.color}
            </p>
            <div className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#0A0E1A] px-4 py-2.5 font-mono text-base font-bold tracking-widest sm:px-5 sm:py-3 sm:text-lg">
              {plate}
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="mt-3 text-xs font-bold text-slate-300">
              {t('status')}: {statusLabel(activeScanVehicle.status)}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {activeScanVehicle.status === 'inactive'
                ? t('visitorInactive')
                : t('visitorWelcome').replace('{plate}', plate)}
            </p>
            {activeScanVehicle.status !== 'inactive' && (
              <button
                type="button"
                onClick={() => setStep('reasons')}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#38BDF8] py-3.5 text-sm font-black text-[#0A0E1A]"
              >
                {t('visitorContinue')}
                <ChevronRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            )}
          </section>
        )}

        {step === 'reasons' && activeScanVehicle && (
          <section className="space-y-4 sm:space-y-8">
            <div className="grid items-center gap-3 sm:gap-6 lg:grid-cols-[1.15fr_1fr_auto]">
              <div className="relative h-32 overflow-hidden rounded-2xl border border-cyan-400/25 sm:h-52 sm:rounded-[2rem]">
                <img
                  src="/hero.webp"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#041018] via-[#041018]/35 to-cyan-500/20" />
              </div>
              <div className="text-start">
                <h1 className="text-xl font-black tracking-tight sm:text-3xl">
                  {t('visitorHello').replace('{name}', currentUser?.name || (language === 'ar' ? 'زائر' : 'Visitor'))} <span aria-hidden="true">👋</span>
                </h1>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:mt-3 sm:text-sm">{t('visitorReasonLead')}</p>
                <p className="mt-1 text-xs font-bold text-cyan-300 sm:mt-2 sm:text-sm">
                  {activeScanVehicle.brand} {activeScanVehicle.model} • {plate}
                </p>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-500/20 bg-[#0a2430] px-3 py-2 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-xs font-black text-[#041018] sm:h-12 sm:w-12 sm:text-sm">
                  {(currentUser?.name || 'ز').slice(0, 2)}
                </div>
                <div className="min-w-0 text-start">
                  <p className="truncate text-xs font-black sm:text-sm">{currentUser?.name || (language === 'ar' ? 'زائر' : 'Visitor')}</p>
                  {currentUser?.email && <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">{currentUser.email}</p>}
                  {currentUser && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-emerald-300 sm:mt-1 sm:text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {t('visitorOnline')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-center text-lg font-black sm:text-2xl">{t('visitorChooseReason')}</h2>
            <div className="grid grid-cols-1 gap-2.5 sm:gap-4 md:grid-cols-2">
              {reasons.map((item) => (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => {
                    setCategory(item.category);
                    setStep('details');
                  }}
                  className={`relative overflow-hidden rounded-2xl border-2 bg-[#071820] text-start shadow-lg sm:min-h-32 sm:rounded-3xl ${item.borderClass}`}
                >
                  <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                  <div className="absolute inset-0 bg-gradient-to-l from-[#041018] via-[#041018]/85 to-[#041018]/35" />
                  <div className="relative flex items-center gap-3 p-3 sm:gap-4 sm:p-5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${item.iconClass}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-snug text-white sm:text-base sm:font-black">{item.title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-300 sm:mt-1 sm:text-xs">{item.hint}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-200 sm:h-5 sm:w-5 rtl:rotate-180" />
                  </div>
                </button>
              ))}
            </div>
            <p className="pt-2 text-center text-[11px] italic tracking-wide text-cyan-200/70 sm:pt-4 sm:text-xs">Together for a safer road</p>
          </section>
        )}

        {step === 'details' && (
          <section className="rounded-3xl border border-white/10 bg-[#101626] p-5">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold ${selected.tone}`}>
              {selected.icon}
              <span className="text-white">{selected.title}</span>
            </div>
            <label className="mb-2 block text-sm font-bold" htmlFor="visitor-note">
              {t('visitorOptionalNote')}
            </label>
            <textarea
              id="visitor-note"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('visitorNotePlaceholder')}
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#0A0E1A] p-3 text-sm outline-none focus:border-[#38BDF8]"
            />
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) return;
                setPhotoError('');
                void compressPhoto(file).then((data) => {
                  if (data.length > 520000) {
                    setPhoto('');
                    setPhotoError(language === 'ar' ? 'الصورة كبيرة. قرّبها أكثر أو التقط صورة أوضح وأصغر.' : 'That photo is too large. Move closer or take a smaller one.');
                    return;
                  }
                  setPhoto(data);
                }).catch(() => {
                  setPhotoError(language === 'ar' ? 'تعذر قراءة الصورة.' : 'The photo could not be read.');
                });
              }}
            />
            {photo ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <img src={photo} alt="" className="max-h-56 w-full object-cover" />
                <button type="button" onClick={() => setPhoto('')} className="w-full py-2 text-xs font-bold text-slate-300 cursor-pointer">
                  {language === 'ar' ? 'حذف الصورة' : 'Remove photo'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 py-3 text-sm font-bold text-white cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                {language === 'ar' ? 'إرفاق صورة الحادثة' : 'Attach a photo of the incident'}
              </button>
            )}
            {photoError && <p className="mt-2 text-xs font-bold text-[#EF4444]">{photoError}</p>}
            <button
              type="button"
              onClick={sendReport}
              disabled={sending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#38BDF8] py-3.5 text-sm font-black text-[#0A0E1A] disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {t('visitorSendNow')}
            </button>
          </section>
        )}

        {step === 'success' && (
          <section className="space-y-4">
            <div className="rounded-3xl border border-[#10B981]/30 bg-[#10B981]/10 p-4 text-center sm:p-6">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-[#10B981]" />
              <h2 className="text-lg font-black text-[#10B981]">{t('visitorSent')}</h2>
              <p className="mt-2 text-sm text-slate-200">
                {t('visitorSentAbout').replace('{car}', `${activeScanVehicle?.brand || ''} ${plate}`.trim())}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#101626] p-4">
              <p className="mb-3 text-xs font-bold text-slate-400">{t('visitorChatHint')}</p>
              <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
                {(conversation?.messages || []).map((message) => {
                  const shown = readChatPhoto(message.text, message.photoReportId);
                  return (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                      message.senderRole === 'reporter'
                        ? 'ms-auto bg-[#38BDF8]/15 text-[#38BDF8]'
                        : 'me-auto bg-white/10 text-white'
                    }`}
                  >
                    {shown.text && (
                      <TranslateControl
                        text={shown.text}
                        language={language}
                        alignEnd={message.senderRole !== 'reporter'}
                        className=""
                      />
                    )}
                    <ChatPhoto reportId={shown.reportId} />
                  </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!conversation || !chatText.trim()) return;
                  sendMessage(conversation.id, chatText, 'reporter');
                  setChatText('');
                }}
              >
                <input
                  value={chatText}
                  onChange={(event) => setChatText(event.target.value)}
                  placeholder={t('visitorChatPlaceholder')}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0A0E1A] px-3 py-2 text-sm outline-none focus:border-[#38BDF8]"
                />
                <button type="submit" className="rounded-xl bg-[#38BDF8] px-3 py-2 text-[#0A0E1A]" aria-label={t('visitorSendMessage')}>
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className="w-full rounded-2xl border border-white/10 py-3 text-sm font-bold text-slate-300"
            >
              {t('visitorEndSession')}
            </button>
          </section>
        )}
      </div>
    </div>
  );
};
