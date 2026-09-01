import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, MessageSquare, LayoutGrid, Lock, UserPlus, QrCode, Car, MessageCircle, 
  ArrowRight, ShieldCheck, CheckCircle2, Zap, Mail, Phone, MapPin, Send, 
  Instagram, Facebook, Linkedin, Twitter, HelpCircle, Sparkles, Check, ChevronDown
} from 'lucide-react';
import { QRStickerCard } from '../common/QRStickerCard';

export const LandingPage: React.FC = () => {
  const { setCurrentView, t, language, theme, vehicles, setActiveScanVehicle, showToast } = useApp();
  const demoVehicle = vehicles[0] || {
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
      <section className={`relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-20 transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-900 text-white'
      }`}>
        {/* Dark Ambient Background with Sleek Dark Sedan Rear View */}
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2000&auto=format&fit=crop&q=85"
            alt="Dark Luxury Car Rear"
            className={`w-full h-full object-cover object-right-bottom lg:object-center ${
              theme === 'dark' ? 'opacity-65' : 'opacity-75'
            } scale-105`}
          />
          {/* Subtle directional dark gradients for maximum contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/70"></div>
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[0.5px]"></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-start">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              {language === 'ar' ? (
                <>
                  <span>سيارتك. هويتك.</span> <br />
                  <span className="text-blue-500 font-black">خصوصيتك.</span>
                </>
              ) : (
                <>
                  <span>Your Car. Your Identity.</span> <br />
                  <span className="text-blue-500 font-black">Your Privacy.</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
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
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 transition-all cursor-pointer"
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
              <div className="absolute -inset-2 bg-blue-500/20 rounded-3xl blur-2xl pointer-events-none"></div>

              {/* Minimal White QR Sticker Matching Mockup */}
              <div className="relative bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 max-w-[280px] sm:max-w-[300px] w-full flex flex-col items-center text-center border border-slate-100 transition-transform duration-300 hover:scale-[1.02]">
                <div className="w-full flex items-center justify-center p-2 bg-white rounded-2xl">
                  <QRStickerCard vehicle={demoVehicle} size={210} compactQrOnly={true} />
                </div>
                <div className="mt-4 w-full">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-wider uppercase">
                    SCAN TO CONNECT
                  </p>
                </div>
              </div>
            </div>

            {/* Test Scan interactive button */}
            <button
              onClick={handleTestScan}
              className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all shadow-md cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>{t('testScanBtn')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 FEATURE HIGHLIGHTS (Exact Bottom Row from Reference Mockup) */}
      <section className={`border-t py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        theme === 'dark' 
          ? 'border-slate-900/90 bg-slate-950' 
          : 'border-slate-200 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Instant Notifications */}
          <div className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-start ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
          }`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 text-blue-500 shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700/70' : 'bg-white border-slate-200'
            }`}>
              <Bell className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base mb-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('instantNotifications')}
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('instantNotificationsDesc')}
            </p>
          </div>

          {/* Card 2: Anonymous Communication */}
          <div className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-start ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
          }`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 text-blue-500 shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700/70' : 'bg-white border-slate-200'
            }`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base mb-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('anonymousCommunication')}
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('anonymousCommunicationDesc')}
            </p>
          </div>

          {/* Card 3: Smart Reports */}
          <div className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-start ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
          }`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 text-blue-500 shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700/70' : 'bg-white border-slate-200'
            }`}>
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base mb-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('smartReports')}
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('smartReportsDesc')}
            </p>
          </div>

          {/* Card 4: Privacy First */}
          <div className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-start ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
          }`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 text-blue-500 shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700/70' : 'bg-white border-slate-200'
            }`}>
              <Lock className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-base mb-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('privacyFirst')}
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('privacyFirstDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (Screen 2) */}
      <section id="how-it-works-section" className={`py-20 px-4 sm:px-6 lg:px-8 transition-colors ${
        theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 01 */}
            <div className={`flex flex-col items-center p-8 rounded-3xl border transition-all text-center ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50 hover:shadow-xl'
                : 'bg-slate-50 border-slate-200/80 hover:shadow-xl hover:border-blue-300'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-6">
                <UserPlus className="w-7 h-7" />
              </div>
              <span className="text-3xl font-extrabold text-blue-600 tracking-tight mb-2">
                01
              </span>
              <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('step1Title')}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('step1Desc')}
              </p>
            </div>

            {/* Step 02 */}
            <div className={`flex flex-col items-center p-8 rounded-3xl border transition-all text-center ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50 hover:shadow-xl'
                : 'bg-slate-50 border-slate-200/80 hover:shadow-xl hover:border-blue-300'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7" />
              </div>
              <span className="text-3xl font-extrabold text-blue-600 tracking-tight mb-2">
                02
              </span>
              <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('step2Title')}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('step2Desc')}
              </p>
            </div>

            {/* Step 03 */}
            <div className={`flex flex-col items-center p-8 rounded-3xl border transition-all text-center ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50 hover:shadow-xl'
                : 'bg-slate-50 border-slate-200/80 hover:shadow-xl hover:border-blue-300'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-6">
                <Car className="w-7 h-7" />
              </div>
              <span className="text-3xl font-extrabold text-blue-600 tracking-tight mb-2">
                03
              </span>
              <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('step3Title')}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('step3Desc')}
              </p>
            </div>

            {/* Step 04 */}
            <div className={`flex flex-col items-center p-8 rounded-3xl border transition-all text-center ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50 hover:shadow-xl'
                : 'bg-slate-50 border-slate-200/80 hover:shadow-xl hover:border-blue-300'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-6">
                <Bell className="w-7 h-7" />
              </div>
              <span className="text-3xl font-extrabold text-blue-600 tracking-tight mb-2">
                04
              </span>
              <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('step4Title')}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('step4Desc')}
              </p>
            </div>
          </div>

          {/* Bottom CTA on section */}
          <div className="pt-6">
            <button
              onClick={() => setCurrentView('register')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>{language === 'ar' ? 'ابدأ الآن مجاناً' : 'Get Your Vehicle QR Now'}</span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES DEEP-DIVE SECTION (id="features-section") */}
      <section id="features-section" className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        theme === 'dark' ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مميزات منصة CAR-SILA' : 'Powerful Core Capabilities'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {language === 'ar' ? 'حلول ذكية مصممة لحماية خصوصيتك وسهولة التواصل' : 'Smart Solutions Designed for Privacy & Connectivity'}
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'ar' 
                ? 'استمتع بتجربة متكاملة تربط بينك وبين المارة والسائقين دون الكشف عن أي معلومة شخصية حساسة.' 
                : 'Experience seamless connection between drivers and pedestrians without revealing sensitive contact info.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {language === 'ar' ? 'إخفاء رقم الهاتف بنسبة 100%' : '100% Phone Number Shield'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'لا داعي لكتابة رقم هاتفك على ورقة خلف الزجاج. ماسح الـ QR يتواصل معك داخل نظام محمي بالكامل دون معرفة رقمك أو حساباتك.'
                  : 'No need to leave handwritten phone numbers on your windshield. Scanners reach you through a completely secure relay.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {language === 'ar' ? 'بلاغات سريعة بضغطة زر' : 'Instant One-Tap Reports'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'خيارات جاهزة ومخصصة مثل: سيارتك تغلق الموقف، نسيت الأنوار مشتعلة، نافذة مفتوحة، أو حادث خفيف، ترسل فوراً دون إضاعة الوقت.'
                  : 'Pre-set quick alerts (blocking exit, lights on, window open, minor touch) can be dispatched with a single tap.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-5">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {language === 'ar' ? 'محادثة مباشرة مشفرة' : 'Encrypted Live Chat'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'إمكانية تبادل الرسائل الفورية والصور مع الطرف الآخر في الوقت الفعلي مع سجل كامل للمحادثات محفوظ في لوحة تحكمك.'
                  : 'Real-time text messaging and photo sharing with full message history archived securely in your private portal.'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {language === 'ar' ? 'ملصقات QR عالية الدقة' : 'Ultra-HD Weatherproof QR'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'توليد فوري لرموز QR جاهزة للطباعة المنزلية أو طلب ملصقات فاخرة مقاومة لأشعة الشمس والحرارة والغسيل المتكرر.'
                  : 'Instantly download print-ready vector stickers or order heavy-duty weatherproof vinyl stickers for your vehicle.'}
              </p>
            </div>

            {/* Feature 5 */}
            <div className={`p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-sky-600/10 border border-sky-500/20 text-sky-500 flex items-center justify-center mb-5">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {language === 'ar' ? 'إدارة أسطول وسيارات متعددة' : 'Multi-Vehicle Fleet Manager'}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar'
                  ? 'أضف سيارتك الشخصية، سيارات العائلة، أو سيارات شركتك في حساب واحد مع إمكانية تخصيص اسم ولون ورمز منفصل لكل سيارة.'
                  : 'Manage multiple personal or family cars or company fleet vehicles seamlessly from a centralized dashboard.'}
              </p>
            </div>

            {/* Feature 6 */}
            <div className={`p-7 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">
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

      {/* PRICING SECTION (id="pricing-section") */}
      <section id="pricing-section" className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
              <span>{language === 'ar' ? 'باقات تناسب الجميع' : 'Simple Transparent Pricing'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {language === 'ar' ? 'اختر الباقة المناسبة لسيارتك' : 'Choose the Perfect Plan for Your Vehicle'}
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'ar' 
                ? 'ابدأ مجاناً تماماً أو اطلب الملصق الفاخر المقاوم للعوامل الجوية ليصلك لباب منزلك.' 
                : 'Start 100% free or order premium weatherproof physical stickers delivered straight to your door.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Free Starter */}
            <div className={`p-8 rounded-3xl border flex flex-col justify-between transition-all ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {language === 'ar' ? 'الباقة الرقمية المجانية' : 'Free Digital Starter'}
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {language === 'ar' ? 'مثالية للطباعة المنزلية الفورية' : 'Ideal for instant self-printing'}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">0</span>
                  <span className="text-sm font-semibold text-slate-400">
                    {language === 'ar' ? 'د.أ / مجاناً مدى الحياة' : 'JOD / Free Forever'}
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{language === 'ar' ? 'توليد رمز QR فريد لسيارة واحدة' : 'Unique QR code for 1 vehicle'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{language === 'ar' ? 'تحميل الملصق بدقة عالية (PNG / PDF)' : 'High-res download (PNG/PDF)'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{language === 'ar' ? 'بلاغات وإشعارات فورية غير محدودة' : 'Unlimited instant reports & alerts'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{language === 'ar' ? 'لوحة تحكم لإدارة السيارة والرسائل' : 'Full dashboard access'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setCurrentView('register')}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-sm'
                  }`}
                >
                  {language === 'ar' ? 'ابدأ الآن مجاناً' : 'Get Started Free'}
                </button>
              </div>
            </div>

            {/* Plan 2: Pro Sticker (Featured) */}
            <div className="p-8 rounded-3xl border-2 border-blue-500 bg-gradient-to-b from-blue-600/15 via-slate-900 to-slate-950 text-white flex flex-col justify-between relative shadow-2xl shadow-blue-500/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold tracking-wide uppercase shadow-md">
                {language === 'ar' ? 'الأكثر طلباً وموصى به ⭐' : 'Most Popular Choice ⭐'}
              </div>

              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-xl font-black mb-1 text-white">
                    {language === 'ar' ? 'ملصق السائق المتميز الفاخر' : 'Pro Weatherproof Sticker'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    {language === 'ar' ? 'ملصق فينيل عاكس مع التوصيل' : 'Reflective vinyl sticker + delivery'}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">5</span>
                  <span className="text-sm font-semibold text-slate-300">
                    {language === 'ar' ? 'د.أ / دفعة واحدة فقط' : 'JOD / One-time only'}
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{language === 'ar' ? 'ملصقان (2) فينيل فاخر عاكس للضوء' : '2x Premium reflective vinyl stickers'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{language === 'ar' ? 'مقاوم 100% للشمس الحارقة والمطر والغسيل' : '100% UV, heat & waterproof'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{language === 'ar' ? 'توصيل سريع حتى باب البيت' : 'Fast door-to-door delivery'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{language === 'ar' ? 'إشعارات SMS وواتساب فورية عند المسح' : 'SMS & WhatsApp alert integration'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{language === 'ar' ? 'ضمان استبدال لمدة سنة كاملة' : '1-year free replacement guarantee'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setCurrentView('register')}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/40 transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'اطلب الملصق الآن' : 'Order Sticker Pack'}
                </button>
              </div>
            </div>

            {/* Plan 3: Fleet & Business */}
            <div className={`p-8 rounded-3xl border flex flex-col justify-between transition-all ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {language === 'ar' ? 'باقة الأساطيل والشركات' : 'Fleet & Enterprise'}
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {language === 'ar' ? 'للشركات ومكاتب تأجير السيارات' : 'For rental agencies & corporate fleets'}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">19</span>
                  <span className="text-sm font-semibold text-slate-400">
                    {language === 'ar' ? 'د.أ / شهرياً (حتى 15 سيارة)' : 'JOD / month (up to 15 cars)'}
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{language === 'ar' ? 'لوحة تحكم مركزية لجميع السيارات' : 'Centralized multi-car dashboard'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{language === 'ar' ? 'شعار شركتك مخصص على رمز الـ QR' : 'Custom company branding & logo on QR'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{language === 'ar' ? 'تقارير أداء وبلاغات مفصلة بصيغة PDF' : 'Detailed analytics & PDF exports'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{language === 'ar' ? 'مدير حساب ودعم فني على مدار الساعة' : 'Dedicated 24/7 VIP support'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => {
                    const el = document.getElementById('contact-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-sm'
                  }`}
                >
                  {language === 'ar' ? 'تواصل مع فريق الأعمال' : 'Contact Sales'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION (id="faq-section") */}
      <section id="faq-section" className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        theme === 'dark' ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
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
                    <ChevronDown className={`w-5 h-5 text-blue-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
      <section id="contact-section" className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-xs font-bold">
              <Mail className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تواصل معنا' : 'Get in Touch'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
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
                <Send className="w-5 h-5 text-blue-500" />
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
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{language === 'ar' ? 'إرسال الرسالة الآن' : 'Submit Message'}</span>
                  <Send className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </form>
            </div>

            {/* Right: Contact Information & Official Social Accounts */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Info Card */}
              <div className={`p-8 rounded-3xl border space-y-6 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-lg font-bold">
                    {language === 'ar' ? 'معلومات التواصل' : 'Contact Channels'}
                  </h4>
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    {language === 'ar' ? 'المطورة: نعمة حمد' : 'Dev: Neama Hamad'}
                  </span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'البريد الإلكتروني المباشر' : 'Direct Developer Email'}</p>
                      <a href="mailto:neamahamad2003@gmail.com" className="font-bold text-blue-500 hover:underline select-all">
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
                      <p className="font-bold select-all">+962 7 9000 0000</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'الموقع' : 'Location'}</p>
                      <p className="font-bold">{language === 'ar' ? 'عمان، الأردن — الشرق الأوسط' : 'Amman, Jordan — Middle East'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels Card (Direct Links) */}
              <div className={`p-8 rounded-3xl border space-y-5 ${
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/neama.2003?igsi=c2R2a3JkYWkwcTV0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center sm:justify-start gap-3 p-3.5 rounded-2xl border border-pink-500/20 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 hover:scale-[1.02] transition-all font-semibold text-xs group"
                  >
                    <Instagram className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                    <span>Instagram / neama.2003</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/share/1EkY2rrv5e/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center sm:justify-start gap-3 p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:scale-[1.02] transition-all font-semibold text-xs group"
                  >
                    <Facebook className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span>Facebook Profile</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/neama-hamad-9a3482392?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center sm:justify-start gap-3 p-3.5 rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 hover:scale-[1.02] transition-all font-semibold text-xs group"
                  >
                    <Linkedin className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
                    <span>LinkedIn / Neama Hamad</span>
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