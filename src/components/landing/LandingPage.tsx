import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, MessageSquare, LayoutGrid, Lock, UserPlus, QrCode, Car, MessageCircle, 
  ArrowRight, ShieldCheck, CheckCircle2, Zap, Mail, Phone, MapPin, Send, 
  Linkedin, HelpCircle, Sparkles, ChevronDown
} from 'lucide-react';
import { QRStickerCard } from '../common/QRStickerCard';

export const LandingPage: React.FC = () => {
  const { setCurrentView, t, language, theme, setActiveScanVehicle, showToast } = useApp();
  const demoVehicle = {
    id: 'veh_demo_qr',
    ownerId: 'usr_owner_demo',
    ownerName: language === 'ar' ? 'مالك المركبة' : 'Vehicle Owner',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    color: language === 'ar' ? 'فضي معدني' : 'Metallic Silver',
    plateNumber: '77-99882',
    qrToken: 'SILA-DEMO-77998',
    status: 'active' as const,
    scansCount: 1,
    reportsCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01'
  };

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleTestScan = () => {
    setActiveScanVehicle(demoVehicle);
    setCurrentView('qr-scan');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast(language === 'ar' ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields', 'warning');
      return;
    }
    
    // Create mailto link for direct sending as developer email
    const subject = encodeURIComponent(`CAR-SILA Inquiry from ${contactName}`);
    const body = encodeURIComponent(`Sender Name: ${contactName}\nSender Email: ${contactEmail}\n\nMessage:\n${contactMessage}`);
    const mailtoUrl = `mailto:neamahamad2003@gmail.com?subject=${subject}&body=${body}`;
    
    // Open user's email client as an option
    window.open(mailtoUrl, '_blank');

    showToast(
      language === 'ar' 
        ? 'تم إرسال رسالتك بنجاح إلى مطورة المنصة نعمة حمد (neamahamad2003@gmail.com)!' 
        : 'Message sent successfully to developer Neama Hamad (neamahamad2003@gmail.com)!',
      'success'
    );
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  const faqs = [
    {
      qAr: 'كيف يحمي CAR-SILA رقم هاتفي وخصوصيتي؟',
      qEn: 'How does CAR-SILA protect my phone number and privacy?',
      aAr: 'عندما يقوم أي شخص بمسح ملصق الـ QR الموجود على سيارتك، يفتح له نظام دردشة وإشعارات ذكي ومشفر. لا يرى الماسح رقم هاتفك أو اسمك الحقيقي، بل يتواصل معك بشكل مجهول وآمن تماماً وتصلك الإشعارات والرسائل مباشرة على هاتفك.',
      aEn: 'When anyone scans the QR sticker on your car, a secure, anonymous alert interface opens. The scanner never sees your phone number or identity; alerts and messages reach you safely and privately in real-time.'
    },
    {
      qAr: 'هل يحتاج الشخص الذي يمسح الـ QR إلى تثبيت أي تطبيق؟',
      qEn: 'Does the scanner need to download or install an app?',
      aAr: 'لا على الإطلاق! أي شخص يمر بجانب سيارتك يمكنه مسح رمز الـ QR بكاميرا الهاتف العادية لأي جوال (آيفون أو أندرويد)، وسيفتح له الموقع فوراً خلال ثانية واحدة بدون تسجيل وبدون تحميل أي تطبيق.',
      aEn: 'No app needed! Anyone can scan the QR code using their regular smartphone camera (iPhone or Android), and the web interface opens instantly in 1 second without downloading anything.'
    },
    {
      qAr: 'ما هي أنواع البلاغات التي يمكن إرسالها؟',
      qEn: 'What types of alerts can be sent?',
      aAr: 'تتوفر بلاغات سريعة جاهزة بضغطة زر واحدة (مثل: السيارة تغلق الطريق، نسيت الأنوار مضاءة، نافذة مفتوحة، حادث بسيط، شيء سقط)، بالإضافة إلى إمكانية كتابة رسالة مخصصة أو إرسال صورة أو موقع السيارة.',
      aEn: 'Pre-set instant one-tap reports are available (e.g. Car is blocking, Lights left on, Window open, Minor accident, Lost item), plus custom chat messaging, photos, and live location.'
    },
    {
      qAr: 'كيف أحصل على ملصق الـ QR لسيارتي؟',
      qEn: 'How do I get the physical QR sticker for my car?',
      aAr: 'بمجرد تسجيل حسابك وإضافة بيانات سيارتك، يمكنك تحميل الرمز بدقة فائقة للطباعة الفورية (PDF / PNG)، أو طلب ملصق فاخر مقاوم للماء والحرارة والشمس من قسم الأسعار وسيصلك حتى باب منزلك.',
      aEn: 'Once registered, you can download high-resolution print-ready stickers (PDF/PNG) instantly, or order premium weatherproof vinyl stickers delivered directly to your door.'
    },
    {
      qAr: 'هل يمكنني إضافة أكثر من سيارة في حساب واحد؟',
      qEn: 'Can I manage multiple cars in one account?',
      aAr: 'نعم بكل تأكيد! يمكنك إدارة أسطول سياراتك أو سيارات العائلة بالكامل من لوحة تحكم واحدة، وتخصيص رمز QR فريد وإعدادات إشعارات مستقلة لكل سيارة.',
      aEn: 'Yes! You can manage your entire fleet or family cars from a single centralized dashboard, with unique QR codes and custom alert settings for each vehicle.'
    }
  ];

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    } overflow-hidden`}>
      {/* HERO SECTION (Screen 1 - Matching Exact Reference Mockup) */}
      <section className={`relative min-h-0 sm:min-h-[90vh] flex items-start sm:items-center justify-center px-4 sm:px-6 lg:px-8 pt-[340px] pb-8 sm:py-12 lg:py-20 transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-900 text-white'
      }`}>
        {/* Dark Ambient Background with Sleek Dark Sedan Rear View */}
        <div className="absolute inset-x-0 top-0 z-0 h-80 overflow-hidden select-none pointer-events-none sm:inset-0 sm:h-auto">
          <img
            src="/hero.webp"
            alt="Dark Luxury Car Rear"
            width={1280}
            height={853}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[28%_center] sm:object-right-bottom sm:scale-105 lg:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 via-transparent to-slate-950/30 sm:from-slate-950/80 sm:via-slate-950/35 sm:to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20 sm:from-slate-950/70 sm:to-slate-950/25"></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-start">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.2] sm:leading-[1.15] [text-shadow:0_2px_18px_rgba(2,6,23,0.85)]">
              {language === 'ar' ? (
                <>
                  <span>سيارتك. هويتك.</span> <br />
                  <span className="text-cyan-400 font-black">خصوصيتك.</span>
                </>
              ) : (
                <>
                  <span>Your Car. Your Identity.</span> <br />
                  <span className="text-cyan-400 font-black">Your Privacy.</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-100 max-w-xl leading-relaxed font-normal [text-shadow:0_2px_14px_rgba(2,6,23,0.9)]">
              {language === 'ar' ? (
                <>
                  تواصل ذكي وفوري بين السائقين وأصحاب السيارات.<br />
                  بدون أرقام هواتف. بدون أجهزة تتبع. خصوصية تامة فقط.
                </>
              ) : (
                <>
                  Smart communication between drivers and car owners.<br />
                  No phone numbers. No trackers. Just privacy.
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setCurrentView('register')}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-600/40 hover:shadow-cyan-600/60 transition-all cursor-pointer"
              >
                <span>{t('getStarted')}</span>
              </button>

              <button
                onClick={() => {
                  const element = document.getElementById('how-it-works-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setCurrentView('how-it-works');
                  }
                }}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition-colors cursor-pointer"
              >
                <span>{t('howItWorks')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Floating QR Sticker Card with Car (Exact Mockup Layout) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center relative">
            <div className="relative">
              {/* Subtle ambient light aura */}
              <div className="absolute -inset-2 bg-cyan-500/20 rounded-3xl blur-2xl pointer-events-none"></div>

              {/* Minimal White QR Sticker Matching Mockup */}
              <div className="relative bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 max-w-[280px] sm:max-w-[300px] w-full flex flex-col items-center text-center border border-slate-100 transition-transform duration-300 hover:scale-[1.02]">
                <div className="w-full flex items-center justify-center p-2 bg-white rounded-2xl">
                  <QRStickerCard vehicle={demoVehicle} size={210} compactQrOnly={true} />
                </div>
                <div className="mt-4 w-full">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-wider uppercase">
                    {t('scanToConnect')}
                  </p>
                </div>
              </div>
            </div>

            {/* Test Scan interactive button */}
            <button
              onClick={handleTestScan}
              className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 text-xs font-semibold transition-all shadow-md cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-cyan-300" />
              <span>{t('testScanBtn')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 FEATURE HIGHLIGHTS (Exact Bottom Row from Reference Mockup) */}
      <section className={`border-t py-8 px-4 sm:px-6 md:py-12 lg:px-8 transition-colors ${
        theme === 'dark' 
          ? 'border-slate-900/90 bg-slate-950' 
          : 'border-slate-200 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {/* Card 1: Instant Notifications */}
          <div className={`flex flex-row items-center gap-3 p-4 md:flex-col md:items-start md:gap-0 md:p-6 rounded-2xl border transition-all text-start ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
          }`}>
            <div className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center md:mb-4 md:h-12 md:w-12 text-cyan-400 shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700/70' : 'bg-white border-slate-200'
            }`}>
              <Bell className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className={`font-bold text-sm md:text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('instantNotifications')}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('instantNotificationsDesc')}
              </p>
            </div>
          </div>

          {/* Card 2: Anonymous Communication */}
          <div className={`flex flex-row items-center gap-3 p-4 md:flex-col md:items-start md:gap-0 md:p-6 rounded-2xl border transition-all text-start ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
          }`}>
            <div className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center md:mb-4 md:h-12 md:w-12 text-cyan-400 shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700/70' : 'bg-white border-slate-200'
            }`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className={`font-bold text-sm md:text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('anonymousCommunication')}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('anonymousCommunicationDesc')}
              </p>
            </div>
          </div>

          {/* Card 3: Smart Reports */}
          <div className={`flex flex-row items-center gap-3 p-4 md:flex-col md:items-start md:gap-0 md:p-6 rounded-2xl border transition-all text-start ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
          }`}>
            <div className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center md:mb-4 md:h-12 md:w-12 text-cyan-400 shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700/70' : 'bg-white border-slate-200'
            }`}>
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className={`font-bold text-sm md:text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('smartReports')}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('smartReportsDesc')}
              </p>
            </div>
          </div>

          {/* Card 4: Privacy First */}
          <div className={`flex flex-row items-center gap-3 p-4 md:flex-col md:items-start md:gap-0 md:p-6 rounded-2xl border transition-all text-start ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
          }`}>
            <div className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center md:mb-4 md:h-12 md:w-12 text-cyan-400 shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700/70' : 'bg-white border-slate-200'
            }`}>
              <Lock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className={`font-bold text-sm md:text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('privacyFirst')}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('privacyFirstDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (Screen 2) */}
      <section id="how-it-works-section" className={`py-8 md:py-20 px-4 sm:px-6 lg:px-8 transition-colors ${
        theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto text-center space-y-6 md:space-y-12">
          <div>
            <h2 className={`text-2xl md:text-4xl font-extrabold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {t('howItWorks')}
            </h2>
            <p className={`text-sm sm:text-base mt-2 font-medium ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {t('howItWorksSubtitle')}
            </p>
          </div>

          {/* 4 Step Numbered Cards (Screen 2 exact cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {/* Step 01 */}
            <div className={`flex flex-row items-center gap-3 p-4 text-start md:flex-col md:gap-0 md:p-8 md:text-center rounded-3xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 hover:border-cyan-400/50 hover:shadow-xl'
                : 'bg-slate-50 border-slate-200/80 hover:shadow-xl hover:border-cyan-300'
            }`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 md:mb-6 md:h-14 md:w-14">
                <UserPlus className="w-7 h-7" />
              </div>
              <div className="min-w-0 md:w-full">
                <span className="text-xl font-extrabold text-cyan-500 tracking-tight md:mb-2 md:block md:text-3xl">
                  01
                </span>
                <h3 className={`text-base font-bold md:mb-2 md:text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('step1Title')}
                </h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('step1Desc')}
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className={`flex flex-row items-center gap-3 p-4 text-start md:flex-col md:gap-0 md:p-8 md:text-center rounded-3xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 hover:border-cyan-400/50 hover:shadow-xl'
                : 'bg-slate-50 border-slate-200/80 hover:shadow-xl hover:border-cyan-300'
            }`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 md:mb-6 md:h-14 md:w-14">
                <QrCode className="w-7 h-7" />
              </div>
              <div className="min-w-0 md:w-full">
                <span className="text-xl font-extrabold text-cyan-500 tracking-tight md:mb-2 md:block md:text-3xl">
                  02
                </span>
                <h3 className={`text-base font-bold md:mb-2 md:text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('step2Title')}
                </h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('step2Desc')}
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className={`flex flex-row items-center gap-3 p-4 text-start md:flex-col md:gap-0 md:p-8 md:text-center rounded-3xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 hover:border-cyan-400/50 hover:shadow-xl'
                : 'bg-slate-50 border-slate-200/80 hover:shadow-xl hover:border-cyan-300'
            }`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 md:mb-6 md:h-14 md:w-14">
                <Car className="w-7 h-7" />
              </div>
              <div className="min-w-0 md:w-full">
                <span className="text-xl font-extrabold text-cyan-500 tracking-tight md:mb-2 md:block md:text-3xl">
                  03
                </span>
                <h3 className={`text-base font-bold md:mb-2 md:text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('step3Title')}
                </h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('step3Desc')}
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className={`flex flex-row items-center gap-3 p-4 text-start md:flex-col md:gap-0 md:p-8 md:text-center rounded-3xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 hover:border-cyan-400/50 hover:shadow-xl'
                : 'bg-slate-50 border-slate-200/80 hover:shadow-xl hover:border-cyan-300'
            }`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 md:mb-6 md:h-14 md:w-14">
                <Bell className="w-7 h-7" />
              </div>
              <div className="min-w-0 md:w-full">
                <span className="text-xl font-extrabold text-cyan-500 tracking-tight md:mb-2 md:block md:text-3xl">
                  04
                </span>
                <h3 className={`text-base font-bold md:mb-2 md:text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('step4Title')}
                </h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('step4Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA on section */}
          <div className="pt-6">
            <button
              onClick={() => setCurrentView('register')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <span>{language === 'ar' ? 'ابدأ الآن مجاناً' : 'Get Your Vehicle QR Now'}</span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES DEEP-DIVE SECTION (id="features-section") */}
      <section id="features-section" className={`py-8 md:py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        theme === 'dark' ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مميزات منصة CAR-SILA' : 'Powerful Core Capabilities'}</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">
              {language === 'ar' ? 'حلول ذكية مصممة لحماية خصوصيتك وسهولة التواصل' : 'Smart Solutions Designed for Privacy & Connectivity'}
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'ar' 
                ? 'استمتع بتجربة متكاملة تربط بينك وبين المارة والسائقين دون الكشف عن أي معلومة شخصية حساسة.' 
                : 'Experience seamless connection between drivers and pedestrians without revealing sensitive contact info.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {/* Feature 1 */}
            <div className={`p-4 md:p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-400/50' : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-lg'
            }`}>
              <div className="h-10 w-10 shrink-0 rounded-2xl md:h-12 md:w-12 bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 flex items-center justify-center mb-3 md:mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold mb-1.5 md:mb-2 md:text-lg">
                {language === 'ar' ? 'إخفاء رقم الهاتف بنسبة 100%' : '100% Phone Number Shield'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'لا داعي لكتابة رقم هاتفك على ورقة خلف الزجاج. ماسح الـ QR يتواصل معك داخل نظام محمي بالكامل دون معرفة رقمك أو حساباتك.'
                  : 'No need to leave handwritten phone numbers on your windshield. Scanners reach you through a completely secure relay.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-4 md:p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-400/50' : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-lg'
            }`}>
              <div className="h-10 w-10 shrink-0 rounded-2xl md:h-12 md:w-12 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3 md:mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold mb-1.5 md:mb-2 md:text-lg">
                {language === 'ar' ? 'بلاغات سريعة بضغطة زر' : 'Instant One-Tap Reports'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'خيارات جاهزة ومخصصة مثل: سيارتك تغلق الموقف، نسيت الأنوار مشتعلة، نافذة مفتوحة، أو حادث خفيف، ترسل فوراً دون إضاعة الوقت.'
                  : 'Pre-set quick alerts (blocking exit, lights on, window open, minor touch) can be dispatched with a single tap.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-4 md:p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-400/50' : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-lg'
            }`}>
              <div className="h-10 w-10 shrink-0 rounded-2xl md:h-12 md:w-12 bg-amber-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-3 md:mb-5">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold mb-1.5 md:mb-2 md:text-lg">
                {language === 'ar' ? 'محادثة مباشرة مشفرة' : 'Encrypted Live Chat'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'إمكانية تبادل الرسائل الفورية والصور مع الطرف الآخر في الوقت الفعلي مع سجل كامل للمحادثات محفوظ في لوحة تحكمك.'
                  : 'Real-time text messaging and photo sharing with full message history archived securely in your private portal.'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`p-4 md:p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-400/50' : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-lg'
            }`}>
              <div className="h-10 w-10 shrink-0 rounded-2xl md:h-12 md:w-12 bg-purple-600/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-3 md:mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold mb-1.5 md:mb-2 md:text-lg">
                {language === 'ar' ? 'ملصقات QR عالية الدقة' : 'Ultra-HD Weatherproof QR'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'توليد فوري لرموز QR جاهزة للطباعة المنزلية أو طلب ملصقات فاخرة مقاومة لأشعة الشمس والحرارة والغسيل المتكرر.'
                  : 'Instantly download print-ready vector stickers or order heavy-duty weatherproof vinyl stickers for your vehicle.'}
              </p>
            </div>

            {/* Feature 5 */}
            <div className={`p-4 md:p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-400/50' : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-lg'
            }`}>
              <div className="h-10 w-10 shrink-0 rounded-2xl md:h-12 md:w-12 bg-sky-600/10 border border-sky-500/20 text-sky-500 flex items-center justify-center mb-3 md:mb-5">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold mb-1.5 md:mb-2 md:text-lg">
                {language === 'ar' ? 'إدارة أسطول وسيارات متعددة' : 'Multi-Vehicle Fleet Manager'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'أضف سيارتك الشخصية، سيارات العائلة، أو سيارات شركتك في حساب واحد مع إمكانية تخصيص اسم ولون ورمز منفصل لكل سيارة.'
                  : 'Manage multiple personal or family cars or company fleet vehicles seamlessly from a centralized dashboard.'}
              </p>
            </div>

            {/* Feature 6 */}
            <div className={`p-4 md:p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-400/50' : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-lg'
            }`}>
              <div className="h-10 w-10 shrink-0 rounded-2xl md:h-12 md:w-12 bg-rose-600/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-3 md:mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold mb-1.5 md:mb-2 md:text-lg">
                {language === 'ar' ? 'بدون تطبيقات أو تعقيد' : 'Zero App Installation Needed'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'يعمل مباشرة عبر كاميرا الهاتف والمتصفح لأي شخص بالشارع في أقل من ثانيتين بدون تحميل تطبيقات أو إنشاء حسابات.'
                  : 'Works out-of-the-box using the phone camera and web browser in under 2 seconds without downloading any app.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION (id="faq-section") */}
      <section id="faq-section" className={`py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        theme === 'dark' ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === 'ar' ? 'كل ما تحتاج معرفته عن CAR-SILA' : 'Everything You Need to Know'}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'ar' ? 'إجابات واضحة ومباشرة لأبرز التساؤلات' : 'Direct and transparent answers to key questions'}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-start font-bold text-sm sm:text-base cursor-pointer gap-4"
                  >
                    <span>{language === 'ar' ? faq.qAr : faq.qEn}</span>
                    <ChevronDown className={`w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className={`px-5 sm:px-6 pb-6 text-xs sm:text-sm leading-relaxed border-t pt-4 ${
                      theme === 'dark' ? 'border-slate-800/80 text-slate-300' : 'border-slate-100 text-slate-600'
                    }`}>
                      {language === 'ar' ? faq.aAr : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT & SOCIAL SECTION (id="contact-section") */}
      <section id="contact-section" className={`py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
              <Mail className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تواصل معنا' : 'Get in Touch'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === 'ar' ? 'نحن هنا لمساعدتك والإجابة على استفساراتك' : "We're Here to Help You"}
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'ar' 
                ? 'أرسل لنا رسالتك أو تواصل معنا عبر قنواتنا الرسمية على وسائل التواصل الاجتماعي.' 
                : 'Send us a message or connect through our verified social channels.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Contact Form */}
            <div className={`lg:col-span-7 p-8 sm:p-10 rounded-3xl border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                <span>{language === 'ar' ? 'أرسل رسالة مباشرة' : 'Send Direct Message'}</span>
              </h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: نعمة حمد' : 'e.g. Namah Hamad'}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    {language === 'ar' ? 'رسالتك أو استفسارك' : 'Your Message'}
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب ما تود السؤال عنه هنا بالتفصيل...' : 'Type your inquiry here in detail...'}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{language === 'ar' ? 'إرسال الرسالة الآن' : 'Submit Message'}</span>
                  <Send className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </form>
            </div>

            {/* Right: Contact Information & Official Social Accounts */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Info Card */}
              <div className={`p-5 sm:p-8 rounded-3xl border space-y-6 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-lg font-bold">
                    {language === 'ar' ? 'معلومات التواصل' : 'Contact Channels'}
                  </h4>
                  <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
                    {language === 'ar' ? 'المطورة: نعمة حمد' : 'Dev: Neama Hamad'}
                  </span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'البريد الإلكتروني المباشر' : 'Direct Developer Email'}</p>
                      <a href="mailto:neamahamad2003@gmail.com" className="font-bold text-cyan-400 hover:underline select-all">
                        neamahamad2003@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'الهاتف / واتساب' : 'Phone & WhatsApp'}</p>
                      <a href="https://wa.me/970597112357" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-500 hover:underline select-all">
                        +970597112357
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'الموقع' : 'Location'}</p>
                      <p className="font-bold">{language === 'ar' ? 'غزة، فلسطين' : 'Gaza, Palestine'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels Card (Direct Links) */}
              <div className={`p-5 sm:p-8 rounded-3xl border space-y-5 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className="text-lg font-bold mb-1">
                    {language === 'ar' ? 'حساباتنا على وسائل التواصل' : 'Follow Our Social Channels'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? 'تابع آخر التحديثات والعروض والتطويرات' : 'Stay connected for latest features & news'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <a
                    href="https://wa.me/970597112357"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-3 rounded-2xl border px-2 py-4 transition-all group ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/80 hover:border-emerald-500/40'
                        : 'border-slate-200 bg-white hover:border-emerald-500/40'
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
                        <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5zM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 21zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.2-.4a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.6 4c.5.2 1 .4 1.5.5a3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.3z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold">WhatsApp</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/neama-hamad-9a3482392?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-3 rounded-2xl border px-2 py-4 transition-all group ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/80 hover:border-sky-500/40'
                        : 'border-slate-200 bg-white hover:border-sky-500/40'
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2] text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
                      <Linkedin className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold">LinkedIn</span>
                  </a>

                  <a
                    href="mailto:neamahamad2003@gmail.com"
                    className={`flex flex-col items-center gap-3 rounded-2xl border px-2 py-4 transition-all group ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/80 hover:border-rose-500/40'
                        : 'border-slate-200 bg-white hover:border-rose-500/40'
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EA4335] text-white shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
                      <Mail className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold">Gmail</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};