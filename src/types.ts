export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light';

export type AppView = 
  | 'landing'
  | 'how-it-works'
  | 'features'
  | 'pricing'
  | 'contact'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'my-vehicles'
  | 'vehicle-details'
  | 'reports'
  | 'report-details'
  | 'messages'
  | 'notifications'
  | 'activity'
  | 'settings'
  | 'sos'
  | 'qr-scan'
  | 'qr-scan-flow'
  | 'qr-report-form'
  | 'qr-submitted'
  | 'admin-login'
  | 'admin-overview'
  | 'admin-users'
  | 'admin-vehicles'
  | 'admin-reports'
  | 'admin-analytics'
  | 'admin-security';

export type UserRole = 'owner' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'inactive';
  vehiclesCount: number;
}

export type VehicleStatus = 'active' | 'dnd' | 'maintenance' | 'inactive';

export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  qrToken: string;
  status: VehicleStatus;
  scansCount: number;
  reportsCount: number;
  imageUrl?: string;
  createdAt: string;
}

export type ReportCategory = 
  | 'blocking'
  | 'lights'
  | 'accident'
  | 'lost_item'
  | 'contact'
  | 'other';

export type ReportStatus = 'new' | 'in_progress' | 'resolved';

export interface ReportLocation {
  lat: number;
  lng: number;
  addressName: string;
}

export interface Report {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  category: ReportCategory;
  title: string;
  description: string;
  location?: ReportLocation;
  hasLocation: boolean;
  status: ReportStatus;
  reporterName: string;
  reporterSessionId: string;
  createdAt: string;
  timestamp: string;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: 'owner' | 'reporter';
  senderName: string;
  text: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  reportId: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  side?: 'owner' | 'reporter';
  reporterSessionId: string;
  status: 'open' | 'closed';
  messages: ChatMessage[];
}

export interface AppNotification {
  id: string;
  userId: string;
  vehicleId?: string;
  reportId?: string;
  type: 'new_report' | 'lights_warning' | 'report_resolved' | 'qr_scanned' | 'chat_message' | 'system';
  title: string;
  message: string;
  timeAgo: string;
  createdAt: string;
  isRead: boolean;
  severity: 'info' | 'warning' | 'urgent' | 'success';
}

export interface ActivityEvent {
  id: string;
  vehicleId?: string;
  vehicleName?: string;
  type: 'report_received' | 'qr_scanned' | 'lights_warning' | 'report_resolved' | 'vehicle_added' | 'chat_started';
  title: string;
  subtitle: string;
  timeStr: string;
  dateGroup: 'today' | 'yesterday' | 'earlier';
  tagText?: string;
  tagType?: 'new' | 'info' | 'resolved' | 'warning';
  createdAt: string;
}












