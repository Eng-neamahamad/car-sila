# CAR-SILA

هوية رقمية للسيارة، من غير ما ينكشف رقم الهاتف.

CAR-SILA منصة ويب تربط السائق المار بصاحب السيارة عبر رمز QR. المار يمسح الملصق، يرسل بلاغاً، ويكمل المحادثة. صاحب السيارة يستقبل التنبيه والرسالة داخل حسابه، ورقمه يبقى مخفياً.

النسخة المنشورة: [car-sila-sand.vercel.app](https://car-sila-sand.vercel.app)

---

## المشكلة

كتابة رقم الجوال على زجاج السيارة تنشر وسيلة تواصل شخصية مع أي شخص في الشارع. الاتصال العشوائي، والرسائل المجهولة، وحفظ الرقم خارج سياق الموقف، كلها نتيجة مباشرة لهذا الأسلوب.

CAR-SILA تفصل بين «أحتاج أتواصل مع صاحب هذه السيارة» وبين «أريد رقمه».

## ماذا يحدث عند المسح

1. صاحب السيارة ينشئ حساباً ويضيف المركبة.
2. المنصة تولّد رمزاً فريداً لكل سيارة، جاهزاً للطباعة على ملصق.
3. المار يمسح الرمز بكاميرا الهاتف، أو يكتب رقم اللوحة. لا تطبيق، ولا حساب إلزامي.
4. تظهر له بيانات السيارة العامة فقط: الماركة، الطراز، السنة، اللون، واللوحة.
5. يختار سبب البلاغ ويكتب ملاحظة. تصل الرسالة لصاحب السيارة داخل المنصة، وبريداً إذا كان الإرسال مضبوطاً.
6. الطرفان يكملان في محادثة مرتبطة بهذا البلاغ. صاحب السيارة يرى كل المحادثات. المُرسِل يرى رده في نفس الجلسة.

## ماذا يرى كل طرف

| الطرف | ما يصل إليه | ما لا يصل إليه |
| --- | --- | --- |
| المار | السيارة العامة، إرسال بلاغ، محادثة هذه الجلسة | هاتف المالك، بريده، وباقي سياراته |
| المالك | مركباته، البلاغات، المحادثات، التنبيه داخل الصفحة | هاتف المار |
| الإدارة | لوحة متابعة الحسابات والمركبات والبلاغات | الدخول بحساب Google |

التنبيه داخل الموقع يظهر أعلى الصفحة لثوانٍ ثم يختفي، مع صوت قصير، عندما يصل بلاغ أو رسالة جديدة. الرقم بجانب المحادثات يبقى حتى تُفتح المحادثة نفسها.

## الخصوصية والأمان

- قاعدة البيانات لا تُفتح من المتصفح. الخادم وحده يستخدم مفتاح Supabase، والصفوف محمية بسياسات الوصول.
- جلسة المستخدم كوكي HttpOnly. الزائر يُعرف بجلسة زيارة، لا بحساب.
- البحث العام عن سيارة لا يُرجع الهاتف ولا البريد ولا معرّف المالك.
- رسائل البريد لا تضع بريد المُرسِل في نص الرسالة.
- تسجيل الدخول بكلمة المرور أو Google. حساب الإدارة لا يدخل عبر Google.
- الطلبات الحساسة عليها حد للمحاولات، والخادم يضيف ترويسات حماية أساسية.

## التقنية

- الواجهة: React 19، TypeScript، Vite
- الخادم: Node.js و Express، نفس عملية التطوير مع الواجهة
- البيانات: Supabase
- الدخول: بريد وكلمة مرور، أو Google Identity Services
- البريد: SMTP عبر Nodemailer، ويُتخطى بصمت إذا لم تُضبط بياناته
- الاستضافة: Vercel، والواجهة والـ API على نفس النطاق
- مسح الرمز: كاميرا الهاتف عبر المتصفح

## تشغيل المشروع

```bash
npm install
npm run dev
```

الواجهة على `http://localhost:5173` والخادم على `http://127.0.0.1:8787`.

انسخ `.env.example` إلى `.env` واملأ القيم على جهازك. لا ترفع ملف `.env`.

| المتغير | الاستخدام |
| --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | زر الدخول بحساب Google |
| `SUPABASE_URL` | عنوان مشروع قاعدة البيانات |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الخادم فقط |
| `SMTP_USER` و `SMTP_PASS` | إرسال بريد البلاغ، اختياري |
| `SMTP_HOST` و `SMTP_PORT` | الافتراضي Gmail على المنفذ 587 |
| `APP_URL` | رابط الموقع داخل رسالة البريد |

لزر Google، أضف نطاق الموقع ضمن Authorized JavaScript origins في Google Cloud. محلياً: `http://localhost:5173`.

```bash
npm run build
```

يبني الواجهة إلى `dist`. على Vercel يُوجَّه كل مسار `/api` إلى خادم Express.

## التواصل

نعمة حمد، غزة

- البريد: [neamahamad2003@gmail.com](mailto:neamahamad2003@gmail.com)
- واتساب: [+970597112357](https://wa.me/970597112357)
- لينكدإن: [neama-hamad-9a3482392](https://www.linkedin.com/in/neama-hamad-9a3482392)

---

## English

CAR-SILA is a web platform that gives a car a digital identity without exposing the owner's phone number.

A passerby scans a QR sticker, or types the plate, and sends a report. The owner receives it in the dashboard and by email. The two sides continue in a private thread. The public vehicle response contains only brand, model, year, color, plate, and status.

Accounts, reports, and messages live in Supabase and are reached only through the Express API. Sessions are HttpOnly cookies. Google sign-in is available for owners. The administrator signs in with email and password. Secrets stay in `.env` and are never committed.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.
