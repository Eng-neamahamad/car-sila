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
  const car = `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`;
  await transport.sendMail({
    from: process.env.MAIL_FROM || `CAR-SILA <${user}>`,
    to,
    subject: `بلاغ جديد عن سيارتك ${vehicle.plateNumber}`,
    text: [
      ownerName ? `مرحباً ${ownerName}` : 'مرحباً',
      `${reporterLabel} أرسل بلاغاً عن سيارتك ${car}.`,
      `السبب: ${title}`,
      description ? `التفاصيل: ${description}` : '',
      'افتح منصة CAR-SILA لمراجعة البلاغ والرد عليه.'
    ].filter(Boolean).join('\n')
  });
  return true;
};
