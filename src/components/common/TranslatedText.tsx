import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { api } from '../../data/api';
import { Language } from '../../types';

export const TranslateControl: React.FC<{
  text: string;
  language: Language;
  className: string;
  alignEnd?: boolean;
  full?: boolean;
}> = ({ text, language, className, alignEnd = false, full = false }) => {
  const [open, setOpen] = useState(false);
  const [translation, setTranslation] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const showing = open && Boolean(translation);
  const label = showing
    ? (language === 'ar' ? 'الأصل' : 'Original')
    : (language === 'ar' ? 'ترجم' : 'Translate');

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (translation) {
      setOpen(true);
      return;
    }
    setBusy(true);
    setFailed(false);
    try {
      const data = await api<{ translation: string }>('/api/translate', {
        text,
        to: language === 'ar' ? 'ar' : 'en'
      });
      setTranslation(data.translation);
      setOpen(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex items-end gap-1.5 ${full ? 'w-full' : 'w-fit max-w-full'} ${alignEnd ? 'flex-row-reverse' : ''} ${full ? '' : alignEnd ? 'ms-auto' : 'me-auto'}`}>
      <div className={`${className} ${full ? 'min-w-0 flex-1' : ''}`}>
        <span className="block">{showing ? translation : text}</span>
        {failed && (
          <span className="mt-1 block text-[10px] font-semibold opacity-80">
            {language === 'ar' ? 'تعذرت الترجمة' : 'Translation failed'}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy || !text.trim()}
        aria-label={label}
        title={label}
        className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
      >
        <Languages className={`h-3.5 w-3.5 ${busy ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
};
