import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { DemoSwitcher } from './components/common/DemoSwitcher';
import { PrintQRModal } from './components/common/PrintQRModal';
import { AddVehicleModal } from './components/common/AddVehicleModal';

// Landing & Auth & Visitor
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { QRScanFlow } from './components/visitor/QRScanFlow';

// Owner Portal
import { OwnerLayout } from './components/owner/OwnerLayout';
import { DashboardView } from './components/owner/DashboardView';
import { MyVehiclesView } from './components/owner/MyVehiclesView';
import { VehicleDetailsView } from './components/owner/VehicleDetailsView';
import { ReportsView } from './components/owner/ReportsView';
import { MessagesView } from './components/owner/MessagesView';
import { NotificationsView } from './components/owner/NotificationsView';
import { ActivityView } from './components/owner/ActivityView';
import { SettingsView } from './components/owner/SettingsView';

// Admin Portal
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewView } from './components/admin/AdminOverviewView';
import { AdminUsersView } from './components/admin/AdminUsersView';
import { AdminVehiclesView } from './components/admin/AdminVehiclesView';
import { AdminReportsView } from './components/admin/AdminReportsView';
import { AdminSecurityView } from './components/admin/AdminSecurityView';

const AppContent: React.FC = () => {
  const { currentView, toasts, language, theme } = useApp();

  const renderContent = () => {
    switch (currentView) {
      // 1. Landing Page
      case 'landing':
        return (
          <>
            <Navbar />
            <LandingPage />
            <Footer />
          </>
        );

      // 2. Auth Page (Login & Register)
      case 'login':
      case 'register':
        return (
          <>
            <Navbar />
            <AuthPage initialMode={currentView} />
            <Footer />
          </>
        );

      // 3. Visitor QR Flow (Screens 5, 6, 7)
      case 'qr-scan-flow':
      case 'qr-submitted':
        return (
          <>
            <Navbar />
            <QRScanFlow />
            <Footer />
          </>
        );

      // 4. Owner Portal (Screens 8 - 16)
      case 'dashboard':
        return (
          <OwnerLayout>
            <DashboardView />
          </OwnerLayout>
        );

      case 'my-vehicles':
        return (
          <OwnerLayout>
            <MyVehiclesView />
          </OwnerLayout>
        );

      case 'vehicle-details':
        return (
          <OwnerLayout>
            <VehicleDetailsView />
          </OwnerLayout>
        );

      case 'reports':
        return (
          <OwnerLayout>
            <ReportsView />
          </OwnerLayout>
        );

      case 'messages':
        return (
          <OwnerLayout>
            <MessagesView />
          </OwnerLayout>
        );

      case 'notifications':
        return (
          <OwnerLayout>
            <NotificationsView />
          </OwnerLayout>
        );

      case 'activity':
        return (
          <OwnerLayout>
            <ActivityView />
          </OwnerLayout>
        );

      case 'settings':
        return (
          <OwnerLayout>
            <SettingsView />
          </OwnerLayout>
        );

      // 5. Admin Portal (Screens 17 - 21)
      case 'admin-overview':
        return (
          <AdminLayout>
            <AdminOverviewView />
          </AdminLayout>
        );

      case 'admin-users':
        return (
          <AdminLayout>
            <AdminUsersView />
          </AdminLayout>
        );

      case 'admin-vehicles':
        return (
          <AdminLayout>
            <AdminVehiclesView />
          </AdminLayout>
        );

      case 'admin-reports':
        return (
          <AdminLayout>
            <AdminReportsView />
          </AdminLayout>
        );

      case 'admin-security':
        return (
          <AdminLayout>
            <AdminSecurityView />
          </AdminLayout>
        );

      default:
        return (
          <>
            <Navbar />
            <LandingPage />
            <Footer />
          </>
        );
    }
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Dynamic View Component */}
      {renderContent()}

      {/* Global Print QR Sticker Modal */}
      <PrintQRModal />

      {/* Global Add Vehicle Modal */}
      <AddVehicleModal />

      {/* Global Interactive Demo Navigation Switcher */}
      <DemoSwitcher />

      {/* Global Notification Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 border pointer-events-auto transition-all animate-bounce ${
                toast.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30'
                  : toast.type === 'error'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-rose-900/30'
                  : toast.type === 'warning'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-amber-900/30'
                  : 'bg-slate-900 text-white border-slate-700 shadow-black/40'
              }`}
            >
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

