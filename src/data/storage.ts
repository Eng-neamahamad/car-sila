import { ActivityEvent, AppNotification, AppView, Conversation, Report, User, Vehicle } from '../types';

export const DB_KEY = 'carsila_db';
export const SESSION_KEY = 'carsila_session';
export const VIEW_KEY = 'carsila_view';
export const ADMIN_EMAIL = 'admin@carsila.com';
const ADMIN_PASSWORD = 'Admin@2026';

export type StoredAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  avatar?: string;
  phone?: string;
};

export type AppDatabase = {
  accounts: StoredAccount[];
  vehicles: Vehicle[];
  reports: Report[];
  conversations: Conversation[];
  notifications: AppNotification[];
  activities: ActivityEvent[];
};

const OWNER_VIEWS: AppView[] = [
  'dashboard',
  'my-vehicles',
  'vehicle-details',
  'reports',
  'report-details',
  'messages',
  'notifications',
  'activity',
  'settings',
  'sos'
];

const ADMIN_VIEWS: AppView[] = [
  'admin-overview',
  'admin-users',
  'admin-vehicles',
  'admin-reports',
  'admin-analytics',
  'admin-security'
];

const ALL_VIEWS: AppView[] = [
  'landing',
  'how-it-works',
  'features',
  'pricing',
  'contact',
  'login',
  'register',
  'admin-login',
  'qr-scan',
  'qr-scan-flow',
  'qr-report-form',
  'qr-submitted',
  ...OWNER_VIEWS,
  ...ADMIN_VIEWS
];

export const isOwnerView = (view: AppView) => OWNER_VIEWS.includes(view);
export const isAdminView = (view: AppView) => ADMIN_VIEWS.includes(view);

export const isAppView = (value: string | null): value is AppView =>
  !!value && ALL_VIEWS.includes(value as AppView);

export const toPublicUser = (account: StoredAccount): User => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role,
  avatar: account.avatar,
  createdAt: account.createdAt,
  status: account.status,
  vehiclesCount: 0
});

const seedAdmin = (): StoredAccount => ({
  id: 'usr_admin_1',
  name: 'CAR-SILA Admin',
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  role: 'admin',
  status: 'active',
  createdAt: '2025-01-01',
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
});

const emptyDatabase = (): AppDatabase => ({
  accounts: [seedAdmin()],
  vehicles: [],
  reports: [],
  conversations: [],
  notifications: [],
  activities: []
});

const uniqueById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
};

const normalize = (db: AppDatabase): AppDatabase => {
  const seenEmails = new Set<string>();
  const accounts = (Array.isArray(db.accounts) ? db.accounts : [])
    .filter((account) => account && account.id && account.email)
    .map((account) => ({
      ...account,
      email: account.email.trim(),
      role: account.email.trim().toLowerCase() === ADMIN_EMAIL ? 'admin' as const : 'owner' as const,
      status: account.status === 'inactive' ? 'inactive' as const : 'active' as const,
      password: account.password || ''
    }))
    .filter((account) => {
      const key = account.email.toLowerCase();
      if (seenEmails.has(key)) return false;
      seenEmails.add(key);
      return true;
    });

  if (!accounts.some((account) => account.email.toLowerCase() === ADMIN_EMAIL)) {
    accounts.unshift(seedAdmin());
  }

  return {
    accounts,
    vehicles: uniqueById(Array.isArray(db.vehicles) ? db.vehicles : []),
    reports: uniqueById(Array.isArray(db.reports) ? db.reports : []),
    conversations: uniqueById(Array.isArray(db.conversations) ? db.conversations : []),
    notifications: uniqueById(Array.isArray(db.notifications) ? db.notifications : []),
    activities: uniqueById(Array.isArray(db.activities) ? db.activities : [])
  };
};

let cached: AppDatabase | null = null;

export const readDatabase = (): AppDatabase => {
  if (cached) return cached;
  localStorage.removeItem('carsila_auth_user');
  try {
    const raw = localStorage.getItem(DB_KEY);
    cached = raw ? normalize(JSON.parse(raw) as AppDatabase) : emptyDatabase();
  } catch {
    cached = emptyDatabase();
  }
  return cached;
};

export const saveDatabase = (db: AppDatabase) => {
  const safe = normalize(db);
  cached = safe;
  localStorage.setItem(DB_KEY, JSON.stringify(safe));
};

export const readSessionUser = (accounts: StoredAccount[]): User | null => {
  const id = localStorage.getItem(SESSION_KEY);
  const account = accounts.find((item) => item.id === id && item.status === 'active');
  return account ? toPublicUser(account) : null;
};

export const readSavedView = (user: User | null): AppView => {
  const saved = localStorage.getItem(VIEW_KEY);
  const view = isAppView(saved) ? saved : 'landing';
  if (isAdminView(view)) return user?.role === 'admin' ? view : 'landing';
  if (isOwnerView(view)) return user?.role === 'owner' ? view : 'landing';
  return view;
};
