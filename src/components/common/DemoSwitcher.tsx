import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  LayoutDashboard,
  QrCode,
  ShieldAlert,
  Car,
  FileText,
  MessageSquare,
  Globe,
  Lock,
  ChevronDown,
  Layers,
  UserCheck,
  Eye,
  Shield,
  X
} from 'lucide-react';
import { AppView } from '../../types';

export const DemoSwitcher: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    language,
    setLanguage,
    vehicles,
    setActiveScanVehicle,
    login,
    showToast
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  const isAdminView = currentView.startsWith('admin-');
  const isVisitorView = currentView === 'qr-scan-flow' || currentView === 'qr-submitted' || currentView === 'landing' || currentView === 'how-it-works';
  const isOwnerView = !isAdminView && !isVisitorView && currentView !== 'login' && currentView !== 'register';

  const screenOptions: { id: AppView; label: string; group: string; icon: any }[] = [
    { id: 'landing', label: '1. Landing Page (Hero + QR Car)', group: 'Public Website', icon: Car },
    { id: 'how-it-works', label: '2. How It Works (4 Steps)', group: 'Public Website', icon: Layers },
    { id: 'login', label: '3. Login Split Screen', group: 'Auth', icon: Lock },
    { id: 'register', label: '4. Register Split Screen', group: 'Auth', icon: Lock },
    { id: 'qr-scan-flow', label: '5. QR - Issue Picker (Visitor)', group: 'Visitor QR Flow', icon: QrCode },
    { id: 'qr-submitted', label: '6. QR - Report Sent & Chat', group: 'Visitor QR Flow', icon: MessageSquare },
    { id: 'dashboard', label: '7. Owner Dashboard & Stats', group: 'Owner Portal', icon: LayoutDashboard },
    { id: 'my-vehicles', label: '8. My Vehicles List', group: 'Owner Portal', icon: Car },
    { id: 'vehicle-details', label: '9. Vehicle Details & QR', group: 'Owner Portal', icon: QrCode },
    { id: 'reports', label: '10. Reports List (Tabs)', group: 'Owner Portal', icon: FileText },
    { id: 'messages', label: '11. Anonymous Chat', group: 'Owner Portal', icon: MessageSquare },
    { id: 'notifications', label: '12. Notification Center', group: 'Owner Portal', icon: ShieldAlert },
    { id: 'activity', label: '13. Activity Timeline', group: 'Owner Portal', icon: Layers },
    { id: 'settings', label: '14. Settings & Profile', group: 'Owner Portal', icon: Lock },
    { id: 'admin-overview', label: '15. Admin Overview & Analytics', group: 'Admin Panel', icon: ShieldAlert },
    { id: 'admin-users', label: '16. Admin Users Table', group: 'Admin Panel', icon: FileText },
    { id: 'admin-vehicles', label: '17. Admin All Vehicles', group: 'Admin Panel', icon: Car },
    { id: 'admin-reports', label: '18. Admin System Reports', group: 'Admin Panel', icon: FileText }
  ];

  return (
    <div className="fixed bottom-4 left-4 z-50 no-print flex flex-col items-start gap-2">
      {isOpen && (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl w-80 max-h-[75vh] overflow-y-auto mb-2 text-white animate-slideUp">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-xs text-blue-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'جميع شاشات التطبيق (1-18)' : 'CAR-SILA Screens (1-18)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-semibold hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3 h-3 text-blue-400" />
                {language === 'en' ? 'العربية' : 'EN'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {['Public Website', 'Auth', 'Visitor QR Flow', 'Owner Portal', 'Admin Panel'].map((grp) => (
              <div key={grp}>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2">
                  {grp}
                </span>
                <div className="space-y-1 mt-1.5">
                  {screenOptions
                    .filter((item) => item.group === grp)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.group === 'Admin Panel') {
                              login('admin@carsila.com', 'admin');
                            } else if (item.group === 'Owner Portal') {
                              login('user@carsila.com', 'owner');
                            } else if (item.id === 'qr-scan-flow' && vehicles.length > 0) {
                              setActiveScanVehicle(vehicles[0]);
                            }
                            setCurrentView(item.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left rtl:text-right transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الشريط العائم */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl text-white">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isOpen
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'ar' ? 'كل الشاشات' : 'All Screens'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        <button
          onClick={() => {
            login('user@carsila.com', 'owner');
            setCurrentView('dashboard');
            showToast(language === 'ar' ? 'تم التبديل إلى لوحة تحكم المالك 🚗' : 'Switched to Owner Portal', 'success');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isOwnerView
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'ar' ? 'المالك' : 'Owner'}</span>
        </button>

        <button
          onClick={() => {
            if (vehicles.length > 0) setActiveScanVehicle(vehicles[0]);
            setCurrentView('qr-scan-flow');
            showToast(language === 'ar' ? 'تم التبديل إلى شاشة مسح الرمز (وضع الزائر) 🔍' : 'Switched to Visitor Flow', 'info');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isVisitorView
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'ar' ? 'الزائر' : 'Visitor'}</span>
        </button>

        <button
          onClick={() => {
            login('admin@carsila.com', 'admin');
            setCurrentView('admin-overview');
            showToast(language === 'ar' ? 'تم التبديل إلى لوحة إدارة المشرف 🛡️' : 'Switched to Admin Panel', 'info');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isAdminView
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>{language === 'ar' ? 'المشرف' : 'Admin'}</span>
        </button>
      </div>
    </div>
  );
};