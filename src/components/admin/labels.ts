import { ReportCategory } from '../../types';

const STATUS: Record<string, [string, string]> = {
  active: ['نشط', 'Active'],
  inactive: ['موقوف', 'Suspended'],
  dnd: ['عدم الإزعاج', 'Do not disturb'],
  maintenance: ['صيانة', 'Maintenance'],
  new: ['جديد', 'New'],
  in_progress: ['قيد المتابعة', 'In progress'],
  resolved: ['محلول', 'Resolved'],
  open: ['مفتوحة', 'Open']
};

const CATEGORY: Record<ReportCategory, [string, string]> = {
  blocking: ['إعاقة الطريق', 'Blocking the road'],
  lights: ['أضواء', 'Lights'],
  accident: ['حادث', 'Accident'],
  lost_item: ['غرض ضائع', 'Lost item'],
  contact: ['طلب تواصل', 'Contact request'],
  other: ['ملاحظة أخرى', 'Other note']
};

const EVENT: Record<string, [string, string]> = {
  report_received: ['بلاغ وصل', 'Report received'],
  lights_warning: ['بلاغ وصل', 'Report received'],
  vehicle_added: ['سيارة أُضيفت', 'Vehicle added'],
  account_registered: ['تسجيل جديد', 'New account'],
  report_resolved: ['بلاغ تم حلّه', 'Report resolved'],
  qr_scanned: ['مسح رمز', 'Code scanned'],
  chat_started: ['محادثة بدأت', 'Chat started']
};

export const arabicPair = (pair: [string, string] | undefined, arabic: boolean, fallback: string) =>
  pair ? (arabic ? pair[0] : pair[1]) : fallback;

export const statusLabel = (status: string, arabic: boolean) =>
  arabicPair(STATUS[status], arabic, status);

export const categoryLabel = (category: ReportCategory, arabic: boolean) =>
  arabicPair(CATEGORY[category], arabic, category);

export const eventLabel = (type: string, arabic: boolean) =>
  arabicPair(EVENT[type], arabic, arabic ? 'حدث' : 'Event');

export const hideContact = (value: string) =>
  value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '')
    .replace(/\+?\d[\d\s-]{7,}\d/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

export const formatWhen = (value: string, arabic: boolean) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(arabic ? 'ar' : 'en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const compactPlate = (plate: string) => plate.toLowerCase().replace(/[\s-]+/g, '');
