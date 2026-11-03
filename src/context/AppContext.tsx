import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  AppView,
  Language,
  Theme,
  User,
  Vehicle,
  Report,
  ReportCategory,
  AppNotification,
  ActivityEvent,
  Conversation,
  ReportStatus
} from '../types';
import { api, ApiError, toVisitorVehicle, Workspace } from '../data/api';
import { translations } from '../data/translations';
import {
  ADMIN_EMAIL,
  StoredAccount,
  isAdminView,
  isOwnerView,
  readSavedView,
  VIEW_KEY
} from '../data/storage';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Navigation & View
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: (key: string) => string;

  // Auth / Users
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => void;
  loginWithGoogle: (credential: string) => void;
  register: (name: string, email: string, password: string, phone?: string) => void;
  updateProfile: (name: string, email: string) => void;
  logout: () => void;
  allUsers: User[];
  users: User[];
  adminStats: {
    totalUsers: number;
    totalVehicles: number;
    totalScans: number;
    resolvedReportsRate: number;
  };
  toggleUserStatus: (userId: string) => void;

  // Vehicles
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'qrToken' | 'scansCount' | 'reportsCount' | 'createdAt' | 'ownerId' | 'ownerName'>) => Promise<boolean>;
  deleteVehicle: (id: string) => void;
  clearAllVehicles: () => void;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => void;
  regenerateQRToken: (id: string) => void;

  // Visitor QR Scan flow
  activeScanVehicle: Vehicle | null;
  setActiveScanVehicle: (v: Vehicle | null) => void;
  findVehicleByCode: (code: string) => Promise<Vehicle | null>;
  submitVisitorReport: (data: {
    category: ReportCategory;
    title: string;
    description: string;
    hasLocation: boolean;
    locationName?: string;
  }) => Promise<Report>;
  lastSubmittedReport: Report | null;

  // Reports
  reports: Report[];
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;

  // Chat / Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string, senderRole: 'owner' | 'reporter') => void;
  markMessagesRead: () => void;

  // Notifications & Activity
  notifications: AppNotification[];
  unreadNotifsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  activities: ActivityEvent[];

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Modals
  qrModalVehicle: Vehicle | null;
  setQrModalVehicle: (v: Vehicle | null) => void;
  printModalVehicle: Vehicle | null;
  setPrintModalVehicle: (v: Vehicle | null) => void;
  addVehicleModalOpen: boolean;
  setAddVehicleModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const emptyReport = (data: { category: ReportCategory; title: string; description: string }): Report => ({
  id: '',
  vehicleId: '',
  vehicleName: '',
  vehiclePlate: '',
  category: data.category,
  title: data.title,
  description: data.description,
  hasLocation: false,
  status: 'new',
  reporterName: 'Anonymous',
  reporterSessionId: '',
  createdAt: '',
  timestamp: ''
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setViewState] = useState<AppView>(() => readSavedView(null));
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('carsila_language');
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('carsila_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const knownEmails = useRef(new Set<string>());

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Notifications & Activity
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  // Visitor Flow
  const [activeScanVehicle, setActiveScanVehicle] = useState<Vehicle | null>(null);
  const [lastSubmittedReport, setLastSubmittedReport] = useState<Report | null>(null);

  // Modals
  const [qrModalVehicle, setQrModalVehicle] = useState<Vehicle | null>(null);
  const [printModalVehicle, setPrintModalVehicle] = useState<Vehicle | null>(null);
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Update HTML dir and lang on language change
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('carsila_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('carsila_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(
      language === 'ar' 
        ? (nextTheme === 'dark' ? 'تم التبديل إلى الوضع الداكن 🌙' : 'تم التبديل إلى الوضع النهاري ☀️')
        : (nextTheme === 'dark' ? 'Switched to Dark Mode 🌙' : 'Switched to Light Mode ☀️'),
      'info'
    );
  };

  useEffect(() => {
    localStorage.setItem('carsila_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    const handleUrlScan = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      let token = '';

      if (hash.includes('scan=')) {
        token = decodeURIComponent(hash.split('scan=')[1]?.split('&')[0] || '');
      } else if (search.includes('scan=')) {
        token = new URLSearchParams(search).get('scan') || '';
      }

      if (!token) return;
      api<{ vehicle: Parameters<typeof toVisitorVehicle>[0] }>(`/api/public/vehicle?code=${encodeURIComponent(token)}`)
        .then((data) => {
          setActiveScanVehicle(toVisitorVehicle(data.vehicle));
          setViewState('qr-scan-flow');
        })
        .catch(() => undefined);
    };

    handleUrlScan();
    window.addEventListener('hashchange', handleUrlScan);
    return () => window.removeEventListener('hashchange', handleUrlScan);
  }, []);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const applyWorkspace = (data: Workspace) => {
    setCurrentUser(data.user);
    setVehicles(data.vehicles);
    setReports(data.reports);
    setConversations(data.conversations);
    setNotifications(data.notifications);
    setActivities(data.activities);
    setAccounts(data.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role === 'admin' ? 'admin' : 'owner',
      status: user.status,
      createdAt: user.createdAt,
      avatar: user.avatar
    })));
    setViewState((view) => {
      if (!data.user && (isOwnerView(view) || isAdminView(view))) return 'landing';
      return view;
    });
  };

  const explain = (error: unknown) => {
    const code = error instanceof ApiError ? error.code : 'request_failed';
    const messages: Record<string, [string, string]> = {
      invalid_credentials: ['البريد أو كلمة المرور غير صحيحة', 'Email or password is incorrect'],
      suspended: ['هذا الحساب موقوف ولا يمكنه الدخول', 'This account is suspended'],
      reserved_email: ['هذا البريد مخصص لإدارة المنصة', 'This email is reserved for the administrator'],
      email_taken: ['هذا البريد مسجّل من قبل', 'This email is already registered'],
      rate_limited: ['يمكنك إرسال بلاغ واحد لنفس السيارة كل دقيقة', 'You can send one report for this car each minute'],
      not_found: ['لا توجد سيارة مسجّلة بهذا الرمز', 'No registered car matches this code'],
      forbidden: ['هذه الصلاحية غير متاحة لهذا الحساب', 'This account cannot do that'],
      invalid_input: ['البيانات المدخلة غير صالحة', 'The entered details are not valid'],
      invalid_email: ['البريد لازم يكون فيه @ مثل name@gmail.com', 'The email needs an @ sign, like name@gmail.com'],
      short_password: ['كلمة المرور لازم تكون 6 أحرف على الأقل', 'The password must be at least 6 characters'],
      google_failed: ['تعذر التحقق من حساب Google', 'Google could not be verified'],
      admin_google: ['حساب المسؤول يدخل من البريد وكلمة المرور فقط', 'The administrator signs in with email and password only'],
      plate_taken: ['رقم اللوحة مسجّل من قبل', 'This plate is already registered'],
      invalid_plate: ['رقم اللوحة لازم يكون من 3 إلى 15 حرفاً أو رقماً، بدون رموز مثل ! @ #', 'The plate must be 3 to 15 letters or numbers, without symbols such as ! @ #'],
      invalid_brand: ['اختَر ماركة من القائمة، أو اكتب الماركة في خيار أخرى', 'Choose a brand from the list, or type one under Other'],
      vehicle_limit: ['كل حساب يقدر يسجّل 10 سيارات كحد أقصى', 'Each account can register up to 10 vehicles']
    };
    const pair = messages[code] || ['تعذر حفظ العملية', 'The action could not be saved'];
    showToast(language === 'ar' ? pair[0] : pair[1], 'error');
  };

  useEffect(() => {
    localStorage.removeItem('carsila_db');
    localStorage.removeItem('carsila_session');
    localStorage.removeItem('carsila_auth_user');
    let stopped = false;
    const load = () => {
      api<Workspace>('/api/bootstrap')
        .then((data) => {
          if (!stopped) applyWorkspace(data);
        })
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, 20000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, currentView);
  }, [currentView]);

  useEffect(() => {
    knownEmails.current = new Set(accounts.map((account) => account.email.toLowerCase()));
  }, [accounts]);

  const setCurrentView = (view: AppView) => {
    const role = currentUser?.role;
    if (isAdminView(view) && role !== 'admin') {
      showToast(
        language === 'ar' ? 'لوحة الإدارة متاحة للمسؤول فقط' : 'The admin panel is only available to the administrator',
        'error'
      );
      setViewState(role === 'owner' ? 'dashboard' : 'login');
      return;
    }
    if (isOwnerView(view) && role !== 'owner') {
      showToast(
        language === 'ar' ? 'هذه الصفحة لصاحب المركبة فقط' : 'This page is only available to a vehicle owner',
        'error'
      );
      setViewState(role === 'admin' ? 'admin-overview' : 'login');
      return;
    }
    setViewState(view);
  };

  const openSession = (data: Workspace) => {
    applyWorkspace(data);
    setViewState(data.user?.role === 'admin' ? 'admin-overview' : 'dashboard');
    const name = data.user?.name || '';
    showToast(
      data.user?.role === 'admin'
        ? (language === 'ar' ? 'تم تسجيل الدخول كمسؤول للنظام' : 'Logged in as CAR-SILA Administrator')
        : (language === 'ar' ? `مرحباً بعودتك، ${name}` : `Welcome back, ${name}!`),
      'success'
    );
  };

  const login = (email: string, password: string) => {
    api<Workspace>('/api/auth/login', { email, password })
      .then(openSession)
      .catch(explain);
  };

  const loginWithGoogle = (credential: string) => {
    api<Workspace>('/api/auth/google', { credential })
      .then(openSession)
      .catch(explain);
  };

  const register = (name: string, email: string, password: string, phone?: string) => {
    const normalized = email.trim().toLowerCase();
    if (normalized === ADMIN_EMAIL || knownEmails.current.has(normalized)) {
      explain(new ApiError(normalized === ADMIN_EMAIL ? 'reserved_email' : 'email_taken'));
      return;
    }
    knownEmails.current.add(normalized);
    api<Workspace>('/api/auth/register', { name, email, password, phone })
      .then((data) => {
        applyWorkspace(data);
        setViewState('dashboard');
        showToast(
          language === 'ar'
            ? `تم إنشاء الحساب بنجاح! مرحباً بك ${data.user?.name || ''}`
            : `Account created successfully! Welcome ${data.user?.name || ''}`,
          'success'
        );
      })
      .catch((error) => {
        knownEmails.current.delete(normalized);
        explain(error);
      });
  };

  const updateProfile = (name: string, email: string) => {
    api<Workspace>('/api/profile', { name, email })
      .then((data) => {
        applyWorkspace(data);
        showToast(language === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Settings saved successfully', 'success');
      })
      .catch(explain);
  };

  const logout = () => {
    api<Workspace>('/api/auth/logout', {})
      .then((data) => {
        applyWorkspace(data);
        setSelectedVehicleId(null);
        setActiveConversationId(null);
        setViewState('landing');
        showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح. بياناتك محفوظة.' : 'Logged out. Your data is saved.', 'info');
      })
      .catch(explain);
  };

  const toggleUserStatus = (userId: string) => {
    api<Workspace>('/api/admin/users/status', { userId })
      .then((data) => {
        applyWorkspace(data);
        showToast(language === 'ar' ? 'تم تحديث حالة المستخدم' : 'User status updated', 'info');
      })
      .catch(explain);
  };

  const canManageVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle || !currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.role === 'owner' && vehicle.ownerId === currentUser.id;
  };

  const addVehicle = async (data: Omit<Vehicle, 'id' | 'qrToken' | 'scansCount' | 'reportsCount' | 'createdAt' | 'ownerId' | 'ownerName'>) => {
    if (!currentUser || currentUser.role !== 'owner' || currentUser.status !== 'active') {
      showToast(
        currentUser?.status === 'inactive'
          ? (language === 'ar' ? 'هذا الحساب موقوف ولا يمكنه إضافة سيارة' : 'This suspended account cannot add a vehicle')
          : (language === 'ar' ? 'إضافة المركبات متاحة لصاحب الحساب النشط فقط' : 'Only an active vehicle owner can add a vehicle'),
        'error'
      );
      return false;
    }
    try {
      const workspace = await api<Workspace>('/api/vehicles', {
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        plateNumber: data.plateNumber
      });
      applyWorkspace(workspace);
      showToast(
        language === 'ar'
          ? `تمت إضافة ${data.brand} ${data.model} وتوليد رمز QR خاص`
          : `${data.brand} ${data.model} registered with a private QR code`,
        'success'
      );
      return true;
    } catch (error) {
      explain(error);
      return false;
    }
  };

  const deleteVehicle = (id: string) => {
    api<Workspace>('/api/vehicles/delete', { id })
      .then((data) => {
        applyWorkspace(data);
        if (selectedVehicleId === id) setSelectedVehicleId(null);
        showToast(language === 'ar' ? 'تم حذف السيارة بنجاح' : 'Vehicle removed successfully', 'info');
      })
      .catch(explain);
  };

  const clearAllVehicles = () => {
    api<Workspace>('/api/vehicles/clear', {})
      .then((data) => {
        applyWorkspace(data);
        setSelectedVehicleId(null);
        showToast(language === 'ar' ? 'تم حذف مركبات هذا الحساب' : 'Your vehicles were removed', 'success');
      })
      .catch(explain);
  };

  const updateVehicleStatus = (id: string, status: Vehicle['status']) => {
    api<Workspace>('/api/vehicles/status', { id, status })
      .then((data) => {
        applyWorkspace(data);
        showToast(language === 'ar' ? 'تم تحديث حالة السيارة' : 'Vehicle status updated', 'info');
      })
      .catch(explain);
  };

  const regenerateQRToken = (id: string) => {
    api<Workspace>('/api/vehicles/token', { id })
      .then((data) => {
        applyWorkspace(data);
        showToast(language === 'ar' ? 'تم تجديد رمز QR برمز عشوائي جديد' : 'A new random QR token was created', 'success');
      })
      .catch(explain);
  };

  const submitVisitorReport = async (data: {
    category: ReportCategory;
    title: string;
    description: string;
    hasLocation: boolean;
    locationName?: string;
  }): Promise<Report> => {
    const token = activeScanVehicle?.qrToken;
    if (!token) {
      showToast(
        language === 'ar' ? 'اختر سيارة مسجّلة قبل إرسال التنبيه' : 'Choose a registered car before sending the alert',
        'error'
      );
      return emptyReport(data);
    }
    try {
      const created = await api<{ conversation: Conversation }>('/api/public/reports', {
        token,
        category: data.category,
        title: data.title,
        description: data.description
      });
      const workspace = await api<Workspace>('/api/bootstrap');
      applyWorkspace(workspace);
      setActiveConversationId(created.conversation.id);
      const report: Report = {
        ...emptyReport(data),
        id: created.conversation.reportId,
        vehiclePlate: activeScanVehicle?.plateNumber || '',
        status: 'new'
      };
      setLastSubmittedReport(report);
      return report;
    } catch (error) {
      explain(error);
      return emptyReport(data);
    }
  };

  const updateReportStatus = (reportId: string, status: ReportStatus) => {
    api<Workspace>('/api/reports/status', { id: reportId, status })
      .then((data) => {
        applyWorkspace(data);
        showToast(
          language === 'ar'
            ? status === 'resolved'
              ? 'تم تحديد البلاغ كـ "تم الحل"'
              : 'تم تحديث حالة البلاغ'
            : status === 'resolved'
            ? 'Report marked as resolved'
            : 'Report status updated',
          'success'
        );
      })
      .catch(explain);
  };

  const sendMessage = (conversationId: string, text: string, senderRole: 'owner' | 'reporter') => {
    if (!text.trim()) return;
    const path = senderRole === 'owner' ? '/api/messages' : '/api/public/messages';
    api<Workspace>(path, { conversationId, text })
      .then(applyWorkspace)
      .catch(explain);
  };


  // Notifications helpers
  const ownerVehicleIds = new Set(
    vehicles.filter((vehicle) => currentUser && vehicle.ownerId === currentUser.id).map((vehicle) => vehicle.id)
  );
  const visibleVehicles = currentUser?.role === 'owner'
    ? vehicles.filter((vehicle) => vehicle.ownerId === currentUser.id)
    : vehicles;
  const visibleReports = currentUser?.role === 'owner'
    ? reports.filter((report) => ownerVehicleIds.has(report.vehicleId))
    : reports;
  const visibleConversations = currentUser?.role === 'owner'
    ? conversations.filter((conversation) => ownerVehicleIds.has(conversation.vehicleId))
    : conversations;
  const visibleNotifications = currentUser?.role === 'admin'
    ? notifications
    : currentUser
    ? notifications.filter((item) => item.userId === currentUser.id)
    : [];
  const visibleActivities = currentUser?.role === 'admin'
    ? activities
    : currentUser
    ? activities.filter((item) => !!item.vehicleId && ownerVehicleIds.has(item.vehicleId))
    : [];
  const visibleUsers = currentUser?.role === 'admin'
    ? accounts.map((account) => ({
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        avatar: account.avatar,
        createdAt: account.createdAt,
        status: account.status,
        vehiclesCount: vehicles.filter((vehicle) => vehicle.ownerId === account.id).length
      }))
    : [];

  const findVehicleByCode = async (code: string): Promise<Vehicle | null> => {
    const typed = code.trim();
    if (!typed) return null;
    try {
      const data = await api<{ vehicle: Parameters<typeof toVisitorVehicle>[0] }>(
        `/api/public/vehicle?code=${encodeURIComponent(typed)}`
      );
      return toVisitorVehicle(data.vehicle);
    } catch {
      return null;
    }
  };

  const markMessagesRead = () => {
    api<Workspace>('/api/messages/read', {}).then(applyWorkspace).catch(() => undefined);
  };

  const unreadNotifsCount = visibleNotifications.filter((n) => !n.isRead).length;
  const adminStats = {
    totalUsers: currentUser?.role === 'admin' ? accounts.length : 0,
    totalVehicles: visibleVehicles.length,
    totalScans: visibleVehicles.reduce((sum, vehicle) => sum + (vehicle.scansCount || 0), 0),
    resolvedReportsRate: visibleReports.length
      ? Math.round((visibleReports.filter((report) => report.status === 'resolved').length / visibleReports.length) * 100)
      : 0
  };

  const markNotificationAsRead = (id: string) => {
    api<Workspace>('/api/notifications/read', { id }).then(applyWorkspace).catch(explain);
  };

  const markAllNotificationsAsRead = () => {
    api<Workspace>('/api/notifications/read', { all: true })
      .then((data) => {
        applyWorkspace(data);
        showToast(language === 'ar' ? 'تم تحديد كل الإشعارات كمقروءة' : 'All notifications marked as read', 'info');
      })
      .catch(explain);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        t,

        currentUser,
        setCurrentUser,
        login,
        loginWithGoogle,
        register,
        updateProfile,
        logout,
        allUsers: visibleUsers,
        users: visibleUsers,
        adminStats,
        toggleUserStatus,

        vehicles: visibleVehicles,
        selectedVehicleId,
        setSelectedVehicleId,
        addVehicle,
        deleteVehicle,
        clearAllVehicles,
        updateVehicleStatus,
        regenerateQRToken,

        activeScanVehicle,
        setActiveScanVehicle,
        findVehicleByCode,
        submitVisitorReport,
        lastSubmittedReport,

        reports: visibleReports,
        selectedReportId,
        setSelectedReportId,
        updateReportStatus,

        conversations: visibleConversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        markMessagesRead,

        notifications: visibleNotifications,
        unreadNotifsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        activities: visibleActivities,

        toasts,
        showToast,

        qrModalVehicle,
        setQrModalVehicle,
        printModalVehicle,
        setPrintModalVehicle,
        addVehicleModalOpen,
        setAddVehicleModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
