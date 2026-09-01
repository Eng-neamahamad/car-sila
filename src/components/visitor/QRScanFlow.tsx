import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportIssueType } from '../../types';
import { 
  Shield, 
  Send, 
  CheckCircle2, 
  Car, 
  AlertTriangle, 
  Lightbulb, 
  Lock, 
  Sparkles, 
  MapPin, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const QRScanFlow: React.FC = () => {
  const { vehicles, addReport, setCurrentView, activeScanVehicle } = useApp();
  const targetVehicle = activeScanVehicle || vehicles[0];

  const [step, setStep] = useState<'options' | 'success'>('options');
  const [selectedIssue, setSelectedIssue] = useState<ReportIssueType>('blocking');
  const [customText, setCustomText] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const issuePresets = [
    { type: 'blocking' as ReportIssueType, label: 'إغلاق موقف أو ممر', icon: '🚗', desc: 'السيارة تغلق مدخل كراج أو موقف خاص' },
    { type: 'lights_on' as ReportIssueType, label: 'الأنوار مضاءة', icon: '💡', desc: 'أضواء السيارة الأمامية أو الداخلية مضاءة' },
    { type: 'open_window' as ReportIssueType, label: 'النافذة مفتوحة', icon: '🪟', desc: 'إحدى النوافذ مفتوحة جزئياً أو كلياً' },
    { type: 'flat_tire' as ReportIssueType, label: 'إطار مفرغ من الهواء', icon: '🛞', desc: 'بنشر أو تسريب هواء في أحد الإطارات' },
    { type: 'accident' as ReportIssueType, label: 'صدمة أو احتكاك بسيط', icon: '⚠️', desc: 'احتكاك بسيط أثناء الركن' },
    { type: 'emergency' as ReportIssueType, label: 'حالة طوارئ قصوى', icon: '🚨', desc: 'حاجة ماسة لتحريك السيارة فوراً' },
    { type: 'other' as ReportIssueType, label: 'ملاحظة أخرى', icon: '📝', desc: 'رسالة خاصة لمالك المركبة' },
  ];

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVehicle) return;

    setIsSubmitting(true);

    setTimeout(() => {
      addReport({
        vehicleId: targetVehicle.id,
        vehiclePlate: targetVehicle.plateNumber,
        vehicleName: `${targetVehicle.brand} ${targetVehicle.model}`,
        issueType: selectedIssue,
        customMessage: customText || issuePresets.find(p => p.type === selectedIssue)?.label,
        reporterContact: isAnonymous ? undefined : reporterPhone,
        isAnonymous,
        locationName: 'موقع السيارة الممسوحة',
      });

      setIsSubmitting(false);
      setStep('success');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }
    }, 400);
  };

  if (!targetVehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-md">
          <Car className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-900 dark:text-white">لم يتم العثور على مركبة</h3>
          <p className="text-xs text-slate-500 mt-1">الرجاء مسح ملصق QR صالح لمركبة مسجلة.</p>
          <button
            onClick={() => setCurrentView('landing')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header Card */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 p-6 text-white text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>تواصل محمي ومشفر عبر CAR-SILA</span>
          </div>
          <h2 className="text-xl font-black">{targetVehicle.brand} {targetVehicle.model} ({targetVehicle.year})</h2>
          
          <div className="inline-block mt-2 px-4 py-1.5 rounded-xl bg-slate-950/80 text-white font-mono text-sm font-bold tracking-wider border border-white/10 shadow-inner">
            {targetVehicle.plateNumber}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {step === 'options' && (
            <form onSubmit={handleSendReport} className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>حدد نوع البلاغ لإخطار المالك فوراً:</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {issuePresets.map(preset => (
                    <button
                      key={preset.type}
                      type="button"
                      onClick={() => setSelectedIssue(preset.type)}
                      className={`p-3 rounded-2xl text-right text-xs font-bold border transition-all flex items-start gap-2.5 cursor-pointer ${
                        selectedIssue === preset.type
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{preset.icon}</span>
                      <div>
                        <div className="font-extrabold">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{preset.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رسالة توضيحية إضافية (اختياري):
                </label>
                <textarea
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="مثال: لو سمحت سيارتك مقفلة عليّ، أنا مستعجل وبانتظارك..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500 dark:text-white resize-none"
                />
              </div>

              {/* Privacy Shield Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>إرسال البلاغ بهوية مجهولة (تشفير رقمك وبياناتك)</span>
                </label>

                {!isAnonymous && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      رقم هاتفك للتواصل المباشر في حال رغبتك:
                    </label>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="+966 5x xxx xxxx"
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs dark:text-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الإرسال الفوري...' : 'إرسال التنبيه الفوري لمالك السيارة'}</span>
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                تم إرسال التنبيه لصاحب السيارة بنجاح!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                وصل إشعار فوري لهاتف مالك السيارة. سيتمكن المالك من قراءة البلاغ والرد عليك مباشرة في غضون لحظات.
              </p>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>الانتقال للوحة تحكم المالك لمشاهدة وصول البلاغ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setStep('options'); setCustomText(''); }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  إرسال بلاغ آخر
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};