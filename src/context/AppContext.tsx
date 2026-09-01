import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  ChatMessage,
  ReportStatus
} from '../types';
import { translations } from '../data/translations';

// Initial Empty/Clean Defaults for real fresh accounts
const DEFAULT_USER: User = {
  id: 'usr_owner_1',
  name: 'نعمة',
  email: 'user@carsila.com',
  role: 'owner',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString().split('T')[0],
  status: 'active',
  vehiclesCount: 0
};

const DEFAULT_ADMIN: User = {
  id: 'usr_admin_1',
  name: 'CAR-SILA Admin',
  email: 'admin@carsila.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  createdAt: '2025-01-01',
  status: 'active',
  vehiclesCount: 0
};

const DEFAULT_VEHICLES: Vehicle[] = [];
const DEFAULT_REPORTS: Report[] = [];
const DEFAULT_CONVERSATIONS: Conversation[] = [];
const DEFAULT_NOTIFICATIONS: AppNotification[] = [];
const DEFAULT_ACTIVITIES: ActivityEvent[] = [];

const DEFAULT_USERS_LIST: User[] = [
  DEFAULT_USER,
  { id: 'usr_admin_1', name: 'Admin', email: 'admin@carsila.com', role: 'admin', status: 'active', vehiclesCount: 0, createdAt: '2025-01-01' }
];

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
  login: (email: string, role?: 'owner' | 'admin') => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  allUsers: User[];
  toggleUserStatus: (userId: string) => void;

  // Vehicles
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'qrToken' | 'scansCount' | 'reportsCount' | 'createdAt' | 'ownerId' | 'ownerName'>) => Vehicle;
  deleteVehicle: (id: string) => void;
  clearAllVehicles: () => void;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => void;
  regenerateQRToken: (id: string) => void;

  // Visitor QR Scan flow
  activeScanVehicle: Vehicle | null;
  setActiveScanVehicle: (v: Vehicle | null) => void;
  submitVisitorReport: (data: {
    category: ReportCategory;
    title: string;
    description: string;
    hasLocation: boolean;
    locationName?: string;
  }) => Report;
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('carsila_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_USER);
  const [allUsers, setAllUsers] = useState<User[]>(DEFAULT_USERS_LIST);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('veh_toyota_1');

  // Reports
  const [reports, setReports] = useState<Report[]>(DEFAULT_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>(DEFAULT_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv_1');

  // Notifications & Activity
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [activities, setActivities] = useState<ActivityEvent[]>(DEFAULT_ACTIVITIES);

  // Visitor Flow
  const [activeScanVehicle, setActiveScanVehicle] = useState<Vehicle | null>(DEFAULT_VEHICLES[0]);
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
    // Check if URL contains scan parameter (e.g. #scan=SILA-TOY-22123 or ?scan=SILA-TOY-22123)
    const handleUrlScan = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      let token = '';

      if (hash.includes('scan=')) {
        token = hash.split('scan=')[1]?.split('&')[0];
      } else if (search.includes('scan=')) {
        const params = new URLSearchParams(search);
        token = params.get('scan') || '';
      }

      if (token) {
        const found = vehicles.find((v) => v?.qrToken && v.qrToken.toLowerCase() === token.toLowerCase()) || vehicles[0] || {
          id: 'veh_scanned_' + token,
          ownerId: 'usr_owner_scanned',
          ownerName: 'CAR-SILA Member',
          brand: 'Vehicle',
          model: 'Registered',
          year: 2024,
          color: 'Standard',
          plateNumber: token.replace('SILA-', ''),
          qrToken: token,
          status: 'active',
          scansCount: 1,
          reportsCount: 0,
          createdAt: new Date().toISOString()
        };
        if (found) {
          setActiveScanVehicle(found);
          setCurrentView('qr-scan-flow');
        }
      }
    };

    handleUrlScan();
    window.addEventListener('hashchange', handleUrlScan);
    return () => window.removeEventListener('hashchange', handleUrlScan);
  }, [vehicles]);

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

  // Auth actions
  const login = (email: string, role: 'owner' | 'admin' = 'owner') => {
    if (role === 'admin' || email.includes('admin')) {
      setCurrentUser(DEFAULT_ADMIN);
      setCurrentView('admin-overview');
      showToast(language === 'ar' ? 'تم تسجيل الدخول كمسؤول للنظام' : 'Logged in as CAR-SILA Administrator', 'info');
    } else {
      const user: User = {
        ...DEFAULT_USER,
        email: email || DEFAULT_USER.email
      };
      setCurrentUser(user);
      setCurrentView('dashboard');
      showToast(language === 'ar' ? `مرحباً بعودتك، ${user.name}` : `Welcome back, ${user.name}!`, 'success');
    }
  };

  const register = (name: string, email: string) => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: name || 'Ahmed Al-Masri',
      email: email || 'user@carsila.com',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      vehiclesCount: 0
    };
    setCurrentUser(newUser);
    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentView('dashboard');
    showToast(language === 'ar' ? 'تم إنشاء الحساب بنجاح! مرحباً بك' : 'Account created successfully! Welcome to CAR-SILA', 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully', 'info');
  };

  const toggleUserStatus = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
    showToast(language === 'ar' ? 'تم تحديث حالة المستخدم' : 'User status updated', 'info');
  };

  // Vehicles Actions
  const addVehicle = (data: Omit<Vehicle, 'id' | 'qrToken' | 'scansCount' | 'reportsCount' | 'createdAt' | 'ownerId' | 'ownerName'>) => {
    const token = 'SILA-' + data.brand.substring(0, 3).toUpperCase() + '-' + Math.floor(10000 + Math.random() * 90000);
    const newVeh: Vehicle = {
      ...data,
      id: 'veh_' + Date.now(),
      ownerId: currentUser?.id || 'usr_ahmed_1',
      ownerName: currentUser?.name || 'Ahmed Al-Masri',
      qrToken: token,
      scansCount: 0,
      reportsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'
    };

    setVehicles((prev) => [newVeh, ...prev]);
    setSelectedVehicleId(newVeh.id);

    // Add activity
    const newAct: ActivityEvent = {
      id: 'act_' + Date.now(),
      vehicleId: newVeh.id,
      vehicleName: `${newVeh.brand} ${newVeh.model}`,
      type: 'vehicle_added',
      title: language === 'ar' ? 'تمت إضافة مركبة جديدة' : 'New Vehicle Added',
      subtitle: `${newVeh.brand} ${newVeh.model} (${newVeh.plateNumber})`,
      timeStr: 'Just now',
      dateGroup: 'today',
      tagText: 'Info',
      tagType: 'info',
      createdAt: new Date().toISOString()
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast(
      language === 'ar'
        ? `تمت إضافة ${newVeh.brand} ${newVeh.model} وتوليد رمز QR!`
        : `${newVeh.brand} ${newVeh.model} registered with QR Code!`,
      'success'
    );
    return newVeh;
  };

  const deleteVehicle = (id: string) => {
    const target = vehicles.find((v) => v.id === id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (selectedVehicleId === id) {
      setSelectedVehicleId(null);
    }
    showToast(
      language === 'ar'
        ? `تم حذف ${target?.brand || ''} ${target?.model || 'السيارة'} بنجاح`
        : 'Vehicle removed successfully',
      'info'
    );
  };

  const clearAllVehicles = () => {
    setVehicles([]);
    setSelectedVehicleId(null);
    showToast(
      language === 'ar'
        ? 'تم حذف جميع المركبات التجريبية بنجاح! يمكنك الآن إضافة سيارتك.'
        : 'All demo vehicles removed! You can now add your own vehicle.',
      'success'
    );
  };

  const updateVehicleStatus = (id: string, status: Vehicle['status']) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
    showToast(language === 'ar' ? 'تم تحديث حالة السيارة' : 'Vehicle status updated', 'info');
  };

  const regenerateQRToken = (id: string) => {
    const targetVeh = vehicles.find((v) => v.id === id);
    if (!targetVeh) return;
    const newToken = 'SILA-' + targetVeh.brand.substring(0, 3).toUpperCase() + '-' + Math.floor(10000 + Math.random() * 90000);
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, qrToken: newToken } : v))
    );
    showToast(language === 'ar' ? 'تم تجديد رمز QR بنجاح' : 'New secure QR token generated!', 'success');
  };

  // Visitor Report Submission
  const submitVisitorReport = (data: {
    category: ReportCategory;
    title: string;
    description: string;
    hasLocation: boolean;
    locationName?: string;
  }): Report => {
    const targetVeh: Vehicle = activeScanVehicle || vehicles[0] || {
      id: 'veh_demo_qr',
      ownerId: 'usr_owner_demo',
      ownerName: 'Vehicle Owner',
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2024,
      color: 'Silver',
      plateNumber: '77-99882',
      qrToken: 'SILA-DEMO-77998',
      status: 'active',
      scansCount: 1,
      reportsCount: 0,
      createdAt: new Date().toISOString()
    };
    const reportId = 'rep_' + Date.now();
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 8);

    const newReport: Report = {
      id: reportId,
      vehicleId: targetVeh.id,
      vehicleName: `${targetVeh.brand} ${targetVeh.model} (${targetVeh.year} • ${targetVeh.color})`,
      vehiclePlate: targetVeh.plateNumber,
      category: data.category,
      title: data.title,
      description: data.description,
      hasLocation: data.hasLocation,
      location: data.hasLocation
        ? {
            lat: 31.9522 + (Math.random() - 0.5) * 0.005,
            lng: 35.2332 + (Math.random() - 0.5) * 0.005,
            addressName: data.locationName || (language === 'ar' ? 'موقف الجامعة الغربي - البوابة 2' : 'University Parking West, Gate 2')
          }
        : undefined,
      status: 'new',
      reporterName: 'Anonymous',
      reporterSessionId: sessionId,
      createdAt: new Date().toISOString(),
      timestamp: 'Today • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setReports((prev) => [newReport, ...prev]);
    setLastSubmittedReport(newReport);

    // Update vehicle counts
    setVehicles((prev) =>
      prev.map((v) => (v.id === targetVeh.id ? { ...v, reportsCount: v.reportsCount + 1, scansCount: v.scansCount + 1 } : v))
    );

    // Add In-App Notification for Owner
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      userId: targetVeh.ownerId,
      vehicleId: targetVeh.id,
      reportId: newReport.id,
      type: data.category === 'lights' ? 'lights_warning' : 'new_report',
      title: data.category === 'lights' ? (language === 'ar' ? 'تنبيه أنوار' : 'Lights Warning') : (language === 'ar' ? 'بلاغ جديد عاجل' : 'New Report Alert'),
      message: `${newReport.title}: ${newReport.description.substring(0, 60)}...`,
      timeAgo: 'Just now',
      createdAt: new Date().toISOString(),
      isRead: false,
      severity: data.category === 'blocking' ? 'urgent' : 'warning'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Add Activity
    const newAct: ActivityEvent = {
      id: 'act_' + Date.now(),
      vehicleId: targetVeh.id,
      vehicleName: `${targetVeh.brand} ${targetVeh.model}`,
      type: data.category === 'lights' ? 'lights_warning' : 'report_received',
      title: newReport.title,
      subtitle: newReport.description.substring(0, 45) + '...',
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateGroup: 'today',
      tagText: 'New',
      tagType: 'new',
      createdAt: new Date().toISOString()
    };
    setActivities((prev) => [newAct, ...prev]);

    // Initialize an empty conversation for this report
    const newConv: Conversation = {
      id: 'conv_' + reportId,
      reportId: reportId,
      vehicleId: targetVeh.id,
      vehicleName: `${targetVeh.brand} ${targetVeh.model}`,
      vehiclePlate: targetVeh.plateNumber,
      lastMessage: data.description,
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
      reporterSessionId: sessionId,
      status: 'open',
      messages: [
        {
          id: 'msg_' + Date.now(),
          conversationId: 'conv_' + reportId,
          senderRole: 'reporter',
          senderName: 'Anonymous Reporter',
          text: data.description,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
          isRead: true
        }
      ]
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);

    return newReport;
  };

  // Report status updates
  const updateReportStatus = (reportId: string, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );

    if (status === 'resolved') {
      const rep = reports.find((r) => r.id === reportId);
      const newAct: ActivityEvent = {
        id: 'act_' + Date.now(),
        vehicleId: rep?.vehicleId,
        vehicleName: rep?.vehicleName,
        type: 'report_resolved',
        title: language === 'ar' ? 'تم حل البلاغ' : 'Report Resolved',
        subtitle: rep ? `${rep.title} - ${rep.vehiclePlate}` : 'Marked resolved by owner',
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateGroup: 'today',
        tagText: 'Resolved',
        tagType: 'resolved',
        createdAt: new Date().toISOString()
      };
      setActivities((prev) => [newAct, ...prev]);
    }

    showToast(
      language === 'ar'
        ? status === 'resolved'
          ? 'تم تحديد البلاغ كـ "تم الحل" ✓'
          : 'تم تحديث حالة البلاغ'
        : status === 'resolved'
        ? 'Report marked as Resolved ✓'
        : `Report status updated to ${status}`,
      'success'
    );
  };

  // Chat message sending
  const sendMessage = (conversationId: string, text: string, senderRole: 'owner' | 'reporter') => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 4),
      conversationId,
      senderRole,
      senderName: senderRole === 'owner' ? 'Ahmed (Owner)' : 'Anonymous Reporter',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      isRead: true
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text.trim(),
            lastMessageTime: newMsg.timestamp,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    // If owner replied, optionally simulate an anonymous visitor response after 2.5 seconds to show rich interaction!
    if (senderRole === 'owner') {
      setTimeout(() => {
        const autoResponses = [
          language === 'ar' ? 'شكراً جزيلاً لتعاونك وسرعة الرد! 👍' : 'Thank you so much for the quick response! 👍',
          language === 'ar' ? 'تمام يعطيك العافية، بانتظارك.' : 'Great, thank you! Standing by.',
          language === 'ar' ? 'تم الاستلام، شكراً لك.' : 'Got it, thank you!'
        ];
        const randomResp = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        const autoMsg: ChatMessage = {
          id: 'msg_auto_' + Date.now(),
          conversationId,
          senderRole: 'reporter',
          senderName: 'Anonymous Reporter',
          text: randomResp,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
          isRead: false
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                lastMessage: randomResp,
                lastMessageTime: autoMsg.timestamp,
                messages: [...c.messages, autoMsg]
              };
            }
            return c;
          })
        );

        // Notify owner of new chat message
        setNotifications((prev) => [
          {
            id: 'notif_msg_' + Date.now(),
            userId: 'usr_ahmed_1',
            type: 'chat_message',
            title: language === 'ar' ? 'رسالة جديدة من المُبلّغ' : 'New message from reporter',
            message: randomResp,
            timeAgo: 'Just now',
            createdAt: new Date().toISOString(),
            isRead: false,
            severity: 'info'
          },
          ...prev
        ]);
      }, 2500);
    }
  };

  // Notifications helpers
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast(language === 'ar' ? 'تم تحديد كل الإشعارات كمقروءة' : 'All notifications marked as read', 'info');
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
        register,
        logout,
        allUsers,
        toggleUserStatus,

        vehicles,
        selectedVehicleId,
        setSelectedVehicleId,
        addVehicle,
        deleteVehicle,
        clearAllVehicles,
        updateVehicleStatus,
        regenerateQRToken,

        activeScanVehicle,
        setActiveScanVehicle,
        submitVisitorReport,
        lastSubmittedReport,

        reports,
        selectedReportId,
        setSelectedReportId,
        updateReportStatus,

        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,

        notifications,
        unreadNotifsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        activities,

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
