import { AppNotification, ActivityEvent, Conversation, Report, User, Vehicle, VehicleStatus } from '../types';

export class ApiError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export type Workspace = {
  user: User | null;
  vehicles: Vehicle[];
  reports: Report[];
  conversations: Conversation[];
  notifications: AppNotification[];
  activities: ActivityEvent[];
  users: User[];
  mailReady?: boolean;
  visitors?: { total: number; week: number; points: number[] };
  visitId?: string;
};

const VISIT_KEY = 'carsila_visit';

const readVisitId = () => {
  try {
    return localStorage.getItem(VISIT_KEY) || '';
  } catch {
    return '';
  }
};

export const rememberVisitId = (id?: string) => {
  if (!id) return;
  try {
    localStorage.setItem(VISIT_KEY, id);
  } catch {
    // Private browsing can block localStorage.
  }
};

export type PublicVehicle = {
  qrToken: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  status: VehicleStatus;
  returnAt?: string;
};

export const toVisitorVehicle = (vehicle: PublicVehicle): Vehicle => ({
  id: vehicle.qrToken,
  ownerId: '',
  ownerName: '',
  brand: vehicle.brand,
  model: vehicle.model,
  year: vehicle.year,
  color: vehicle.color,
  plateNumber: vehicle.plateNumber,
  qrToken: vehicle.qrToken,
  status: vehicle.status,
  scansCount: 0,
  reportsCount: 0,
  createdAt: '',
  returnAt: vehicle.returnAt
});

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const visitId = readVisitId();
  const headers: Record<string, string> = {};
  if (visitId) headers['X-Car-Sila-Visit'] = visitId;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = typeof data.error === 'string' ? data.error : 'request_failed';
    throw new ApiError(code);
  }
  if (data && typeof data === 'object' && typeof (data as Workspace).visitId === 'string') {
    rememberVisitId((data as Workspace).visitId);
  }
  return data as T;
}
