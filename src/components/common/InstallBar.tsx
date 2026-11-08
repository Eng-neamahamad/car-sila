import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const installedAlready = () =>
  window.matchMedia('(display-mode: standalone)').matches
  || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

const applePhone = () => {
  const agent = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(agent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const InstallBar: React.FC = () => {
  const { language } = useApp();
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [closed, setClosed] = useState(false);
  const [phone, setPhone] = useState(false);
  const [help, setHelp] = useState(false);
  const arabic = language === 'ar';

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
    if (installedAlready()) return;
    const media = window.matchMedia('(max-width: 768px) and (pointer: coarse)');
    const sync = () => setPhone(media.matches);
    sync();
    media.addEventListener('change', sync);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => {
      setPrompt(null);
      setClosed(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const visible = phone && !closed && !installedAlready();

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.paddingBottom;
    document.body.style.paddingBottom = help ? '8.5rem' : '3.25rem';
    return () => {
      document.body.style.paddingBottom = previous;
    };
  }, [visible, help]);

  if (!visible) return null;

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      if (choice.outcome === 'accepted') setClosed(true);
      return;
    }
    setHelp(true);
  };

  const steps = applePhone()
    ? (arabic
      ? 'من سفاري أو كروم اضغط زر المشاركة، ثم «إضافة إلى الشاشة الرئيسية»، ثم إضافة. أيقونة CAR-SILA بتظهر على الشاشة والتطبيق بيفتح منها.'
      : 'In Safari or Chrome, tap Share, then Add to Home Screen, then Add. The CAR-SILA icon appears on your screen and the app opens from it.')
    : (arabic
      ? 'من قائمة كروم اختَر «تثبيت التطبيق». لا تختار إضافة اختصار، لأن الاختصار يظهر بسهم صغير وكأنه صورة.'
      : 'If the install window did not open, open this link in Chrome and tap Install again. Tecno and other Android phones install from Chrome.');

  return (
    <div className="fixed inset-x-0 bottom-0 z-[45] flex justify-center px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
      <div className="flex w-max max-w-[92vw] flex-col items-center gap-2">
        {help && (
          <p className="max-w-[16rem] rounded-2xl border border-cyan-300/30 bg-[#041018]/95 px-3 py-2 text-center text-[11px] leading-relaxed text-slate-200">
            {steps}
          </p>
        )}
        <div className="flex items-center gap-1 rounded-full border border-cyan-300/40 bg-[#041018]/95 p-1 shadow-lg shadow-cyan-500/20">
          <button
            type="button"
            onClick={install}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-cyan-500 py-1 pe-3 ps-1 text-[11px] font-black text-[#041018] hover:bg-cyan-400"
          >
            <img src="/apple-touch-icon.png" alt="" className="h-6 w-6 rounded-full" />
            {arabic ? 'ثبّت' : 'Install'}
          </button>
          <button
            type="button"
            onClick={() => setClosed(true)}
            aria-label={arabic ? 'إغلاق' : 'Close'}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-sm font-bold text-slate-300"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
