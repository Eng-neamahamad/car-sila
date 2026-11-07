import { lookup as dnsLookup } from 'node:dns';
import { isIP } from 'node:net';
import nodemailer from 'nodemailer';

const smtpAddress = async (hostname) => {
  if (isIP(hostname)) return hostname;
  try {
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('dns timeout')), 2500);
      dnsLookup(hostname, { family: 4 }, (error, address) => {
        clearTimeout(timer);
        error ? reject(error) : resolve(address);
      });
    });
  } catch {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`);
    const data = await response.json();
    const ip = data.Answer?.find((record) => record.type === 1)?.data;
    if (!ip) throw new Error('smtp dns failed');
    return ip;
  }
};

export const sendReportEmail = async ({ to, ownerName, reporterLabel, vehicle, title, description }) => {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!to || !user || !pass) return false;

  const port = Number(process.env.SMTP_PORT || 587);
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const transport = nodemailer.createTransport({
    host: await smtpAddress(host),
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000,
    tls: { servername: host }
  });
  const senderName = String(reporterLabel || '')
    .replace(/\s*\([^)]*@[^)]*\)/g, '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '')
    .trim() || 'أحد السائقين';
  const car = [vehicle.brand, vehicle.model].filter(Boolean).join(' ');
  const plate = vehicle.plateNumber;
  const configured = process.env.APP_URL || '';
  const appUrl = configured.startsWith('https://') && !configured.includes('MY_APP_URL')
    ? configured.replace(/\/$/, '')
    : 'https://car-sila-sand.vercel.app';
  const escape = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const greeting = ownerName ? `مرحباً ${ownerName}،` : 'مرحباً،';
  const text = [
    greeting,
    '',
    `${senderName} أرسل بلاغاً عن سيارتك ${car}، رقم اللوحة ${plate}.`,
    `السبب: ${title}`,
    description ? `التفاصيل: ${description}` : '',
    '',
    'افتح CAR-SILA لمراجعة البلاغ والرد عليه:',
    appUrl
  ].join('\n');
  const html = `
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f4f7f8;padding:24px">
      <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:16px;padding:24px;color:#102028">
        <p style="margin:0 0 8px;color:#0891b2;font-weight:bold">CAR-SILA</p>
        <h1 style="margin:0 0 16px;font-size:20px">بلاغ جديد عن سيارتك</h1>
        <p>${escape(greeting)}</p>
        <p>${escape(senderName)} أرسل بلاغاً عن سيارتك ${escape(car)}، رقم اللوحة <strong>${escape(plate)}</strong>.</p>
        <p>السبب: ${escape(title)}</p>
        ${description ? `<p>التفاصيل: ${escape(description)}</p>` : ''}
        <p style="margin-top:24px">
          <a href="${appUrl}" style="background:#06b6d4;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;display:inline-block">فتح البلاغ</a>
        </p>
      </div>
    </div>`;
  await transport.sendMail({
    from: process.env.MAIL_FROM || `CAR-SILA <${user}>`,
    to,
    subject: `بلاغ جديد عن السيارة ${plate}`,
    text,
    html
  });
  return true;
};
