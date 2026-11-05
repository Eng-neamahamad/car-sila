import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../data/api';
import logo from '../../assets/logo.png';

export const AdminLoginView: React.FC = () => {
  const { language, loginAdmin } = useApp();
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const arabic = language === 'ar';

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setError('');
    loginAdmin(password)
      .catch((reason) => {
        const code = reason instanceof ApiError ? reason.code : '';
        setError(
          code === 'rate_limited'
            ? (arabic ? 'محاولات كثيرة. انتظري قليلاً ثم حاولي مرة ثانية.' : 'Too many attempts. Wait a moment and try again.')
            : (arabic ? 'كلمة المرور غير صحيحة.' : 'The password is incorrect.')
        );
        setPassword('');
      })
      .finally(() => setBusy(false));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#041018] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_42%)]" />
      <form
        onSubmit={submit}
        className="relative w-full max-w-[420px] rounded-[28px] border border-cyan-400/25 bg-[#061820]/95 p-7 shadow-[0_0_80px_rgba(34,211,238,0.12)] sm:p-8"
      >
        <div className="mb-6 text-center">
          <img src={logo} alt="" className="mx-auto h-16 w-auto object-contain" />
          <h1 className="mt-4 text-3xl font-black tracking-wide">CAR-SILA</h1>
          <p className="mt-1 text-sm font-bold text-cyan-300">{arabic ? 'دخول الإدارة' : 'Admin entry'}</p>
          <p className="mt-3 text-balance text-sm text-slate-200">{arabic ? 'هذه الصفحة للإدارة فقط' : 'This page is for administration only'}</p>
        </div>

        <label className="mb-2 block text-sm font-bold text-slate-200" htmlFor="admin-password">
          {arabic ? 'كلمة المرور' : 'Password'}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" />
          <input
            id="admin-password"
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="w-full rounded-xl border border-cyan-500/30 bg-[#0a2430] py-3 pe-12 ps-10 text-sm text-white outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-300"
            aria-label={arabic ? 'إظهار كلمة المرور' : 'Show password'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-2 text-balance text-sm font-bold text-rose-300">{error}</p>}

        <button
          type="submit"
          disabled={busy || !password.trim()}
          className="mt-4 w-full rounded-xl bg-cyan-500 py-3 text-sm font-black text-[#041018] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (arabic ? 'جارٍ التحقق' : 'Checking') : (arabic ? 'دخول' : 'Enter')}
        </button>
        <p className="mt-4 text-balance text-center text-xs text-slate-400">
          {arabic ? 'الجلسة تُغلق تلقائياً بعد 8 ساعات' : 'The session closes automatically after 8 hours'}
        </p>
      </form>
    </div>
  );
};
